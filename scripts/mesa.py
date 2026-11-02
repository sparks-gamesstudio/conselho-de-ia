"""Conselho de IA: registra o debate e serve a mesa ao vivo no navegador.

O Claude chama estes comandos durante o conselho; a página em
http://localhost:4747 mostra cada fala no momento em que ela entra.

    python mesa.py abrir                                   # servidor + navegador
    python mesa.py nova --pergunta "..." --conselho rita,otavio,mauro [--contexto "..."]
    python mesa.py rodada --titulo "Primeiras impressões"
    python mesa.py fala --quem rita --texto "..." [--responde otavio]
    python mesa.py voto --quem rita --voto sim|nao|condicional --nota 8 --motivo "..." [--condicao "..."]
    python mesa.py veredito --arquivo veredito.json
    python mesa.py conselheiros                            # lista quem pode sentar à mesa
    python mesa.py demo                                    # abre um conselho de exemplo

Quem fala pode ser um conselheiro (id do arquivo em conselheiros/) ou "presidente".
"""

import argparse
import datetime
import http.server
import json
import os
import re
import sys
import threading
import time
import unicodedata
import webbrowser

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA_CONSELHEIROS = os.path.join(RAIZ, "conselheiros")
PASTA_MESA = os.path.join(RAIZ, "mesa")
PASTA_SESSOES = os.environ.get("CONSELHO_SESSOES") or os.path.join(RAIZ, "sessoes")
PORTA = 4747
VOTOS = ("sim", "nao", "condicional")


# ---------- conselheiros ----------

def _valor(texto: str):
    texto = texto.strip()
    if texto.startswith("{") and texto.endswith("}"):
        return {k.strip(): _valor(v) for k, v in (p.split(":", 1) for p in texto[1:-1].split(",") if ":" in p)}
    return texto.strip('"').strip("'")


def conselheiros() -> dict:
    todos = {}
    for arq in sorted(os.listdir(PASTA_CONSELHEIROS)):
        if not arq.endswith(".md"):
            continue
        bruto = open(os.path.join(PASTA_CONSELHEIROS, arq), encoding="utf-8").read()
        m = re.match(r"---\n(.*?)\n---\n(.*)", bruto, re.S)
        if not m:
            continue
        dados = {}
        for linha in m.group(1).splitlines():
            if ":" in linha:
                k, v = linha.split(":", 1)
                dados[k.strip()] = _valor(v)
        dados["perfil"] = m.group(2).strip()
        todos[dados["id"]] = dados
    return todos


# ---------- sessão ----------

def _slug(texto: str) -> str:
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:40] or "conselho"


def _caminho(sid: str) -> str:
    return os.path.join(PASTA_SESSOES, sid, "sessao.json")


def atual() -> str | None:
    if not os.path.isdir(PASTA_SESSOES):
        return None
    ids = [d for d in os.listdir(PASTA_SESSOES) if os.path.exists(_caminho(d))]
    return max(ids, key=lambda d: os.path.getmtime(_caminho(d)), default=None)


def ler(sid: str | None = None) -> dict:
    sid = sid or atual()
    if not sid:
        sys.exit("Nenhuma sessão aberta. Use: mesa.py nova --pergunta ...")
    return json.load(open(_caminho(sid), encoding="utf-8"))


def gravar(s: dict):
    s["atualizado"] = time.time()
    caminho = _caminho(s["id"])
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    tmp = caminho + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(s, f, ensure_ascii=False, indent=2)
    os.replace(tmp, caminho)


def evento(s: dict, **dados):
    dados["n"] = len(s["eventos"]) + 1
    dados["t"] = time.time()
    s["eventos"].append(dados)


def cmd_nova(a):
    todos = conselheiros()
    ids = [i.strip() for i in a.conselho.split(",") if i.strip()]
    faltando = [i for i in ids if i not in todos]
    if faltando:
        sys.exit(f"Conselheiro(s) não encontrado(s): {', '.join(faltando)}. Disponíveis: {', '.join(todos)}")
    if not 3 <= len(ids) <= 7:
        sys.exit("O conselho precisa de 3 a 7 conselheiros.")
    agora = datetime.datetime.now()
    s = {
        "id": f"{agora:%Y%m%d-%H%M%S}-{_slug(a.pergunta)}",
        "pergunta": a.pergunta, "contexto": a.contexto or "",
        "criado": agora.isoformat(timespec="seconds"),
        "conselho": ids, "estado": "aberto", "rodada": 0,
        "eventos": [], "votos": {}, "veredito": None,
    }
    gravar(s)
    print(f"ok: sessão {s['id']} com {', '.join(todos[i]['nome'] for i in ids)}")


def _quem(s: dict, quem: str) -> str:
    if quem != "presidente" and quem not in s["conselho"]:
        sys.exit(f"'{quem}' não está neste conselho. Na mesa: presidente, {', '.join(s['conselho'])}")
    return quem


def cmd_rodada(a):
    s = ler()
    s["rodada"] += 1
    s["estado"] = "debate"
    evento(s, tipo="rodada", numero=s["rodada"], titulo=a.titulo)
    gravar(s)
    print(f"ok: rodada {s['rodada']} · {a.titulo}")


def cmd_fala(a):
    s = ler()
    evento(s, tipo="fala", quem=_quem(s, a.quem), texto=a.texto.strip(), rodada=s["rodada"],
           responde=a.responde if a.responde in s["conselho"] + ["presidente"] else None)
    gravar(s)
    print(f"ok: fala {len(s['eventos'])} de {a.quem}")


def cmd_voto(a):
    s = ler()
    _quem(s, a.quem)
    if a.voto not in VOTOS:
        sys.exit(f"Voto deve ser: {', '.join(VOTOS)}")
    if not 0 <= a.nota <= 10:
        sys.exit("Nota de 0 a 10.")
    s["estado"] = "votacao"
    s["votos"][a.quem] = {"voto": a.voto, "nota": a.nota, "motivo": a.motivo.strip(), "condicao": (a.condicao or "").strip()}
    evento(s, tipo="voto", quem=a.quem)
    gravar(s)
    print(f"ok: voto de {a.quem} ({len(s['votos'])}/{len(s['conselho'])})")


def cmd_veredito(a):
    s = ler()
    v = json.load(open(a.arquivo, encoding="utf-8"))
    obrigatorios = ("decisao", "titulo", "resumo", "condicoes", "riscos", "proximos_passos")
    faltando = [k for k in obrigatorios if k not in v]
    if faltando:
        sys.exit(f"Faltam campos no veredito: {', '.join(faltando)}")
    if v["decisao"] not in VOTOS:
        sys.exit(f"decisao deve ser: {', '.join(VOTOS)}")
    notas = [x["nota"] for x in s["votos"].values()]
    v["nota"] = round(sum(notas) / len(notas), 1) if notas else None
    s["veredito"] = v
    s["estado"] = "encerrado"
    evento(s, tipo="veredito")
    gravar(s)
    print(f"ok: veredito '{v['decisao']}' · nota média {v['nota']}")


def cmd_demo(a):
    exemplo = json.load(open(os.path.join(RAIZ, "exemplos", "sessao-exemplo.json"), encoding="utf-8"))
    gravar(exemplo)
    print("ok: conselho de exemplo carregado. Clique em 'Reassistir o debate' para ver ao vivo.")
    a.porta, a.sem_navegador = PORTA, False
    cmd_abrir(a)


def cmd_conselheiros(a):
    for i, c in conselheiros().items():
        print(f"{i:8} {c['nome']} · {c['titulo']} · {c['pilar']}\n         \"{c['pergunta']}\"")


# ---------- servidor ----------

class Manipulador(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kw):
        super().__init__(*args, directory=PASTA_MESA, **kw)

    def log_message(self, *a):
        pass

    def _json(self, dados, codigo=200):
        corpo = json.dumps(dados, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def do_GET(self):
        caminho = self.path.split("?")[0]
        if caminho == "/api/conselheiros":
            return self._json(conselheiros())
        if caminho == "/api/sessao":
            pedido = re.search(r"id=([\w-]+)", self.path)
            sid = pedido.group(1) if pedido else atual()
            if not sid or not os.path.exists(_caminho(sid)):
                return self._json({"vazio": True})
            return self._json(json.load(open(_caminho(sid), encoding="utf-8")))
        if caminho == "/api/sessoes":
            ids = sorted(os.listdir(PASTA_SESSOES), reverse=True) if os.path.isdir(PASTA_SESSOES) else []
            return self._json([json.load(open(_caminho(i), encoding="utf-8")) | {"eventos": []} for i in ids if os.path.exists(_caminho(i))])
        return super().do_GET()


def servidor_ativo(porta: int) -> bool:
    import urllib.request
    try:
        urllib.request.urlopen(f"http://127.0.0.1:{porta}/api/conselheiros", timeout=1)
        return True
    except Exception:
        return False


def cmd_abrir(a):
    url = f"http://localhost:{a.porta}/"
    if servidor_ativo(a.porta):
        print(f"ok: a mesa já está aberta em {url}")
        if not a.sem_navegador:
            webbrowser.open(url)
        return
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", a.porta), Manipulador)
    print(f"ok: mesa aberta em {url}  (Ctrl+C para fechar)", flush=True)
    if not a.sem_navegador:
        threading.Timer(0.6, webbrowser.open, args=[url]).start()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("abrir"); p.add_argument("--porta", type=int, default=PORTA); p.add_argument("--sem-navegador", action="store_true")
    p = sub.add_parser("nova"); p.add_argument("--pergunta", required=True); p.add_argument("--conselho", required=True); p.add_argument("--contexto")
    p = sub.add_parser("rodada"); p.add_argument("--titulo", required=True)
    p = sub.add_parser("fala"); p.add_argument("--quem", required=True); p.add_argument("--texto", required=True); p.add_argument("--responde")
    p = sub.add_parser("voto"); p.add_argument("--quem", required=True); p.add_argument("--voto", required=True)
    p.add_argument("--nota", type=float, required=True); p.add_argument("--motivo", required=True); p.add_argument("--condicao")
    p = sub.add_parser("veredito"); p.add_argument("--arquivo", required=True)
    sub.add_parser("conselheiros")
    sub.add_parser("demo")
    a = ap.parse_args()
    {"abrir": cmd_abrir, "nova": cmd_nova, "rodada": cmd_rodada, "fala": cmd_fala, "voto": cmd_voto,
     "veredito": cmd_veredito, "conselheiros": cmd_conselheiros, "demo": cmd_demo}[a.cmd](a)


if __name__ == "__main__":
    main()
