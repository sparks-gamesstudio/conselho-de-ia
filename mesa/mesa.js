// Mesa ao vivo: lê a sessão do servidor local e encena cada fala no centro da mesa.

const $ = id => document.getElementById(id);
const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const VOTO_NOME = { sim: "Sim", nao: "Não", condicional: "Com condições" };
const PRESIDENTE = { id: "presidente", nome: "Presidente", titulo: "Conduz a sessão", cor: "#E9D8B4" };

let conselheiros = {};
let sessao = null;
let vistos = 0;          // eventos já colocados na fila
const fila = [];
let tocando = false;
let pularAnimacao = false;

const pessoa = id => (id === "presidente" ? PRESIDENTE : conselheiros[id]) || { nome: id, titulo: "", cor: "#999" };
const rosto = (id, t = 96) => (id === "presidente" ? retratoPresidente(t) : retrato(pessoa(id).avatar, t));

// ---------- montagem ----------
function montarMesa() {
  const ids = ["presidente", ...sessao.conselho];
  const caixa = $("assentos");
  caixa.innerHTML = "";
  ids.forEach((id, i) => {
    // presidente na cabeceira (topo); os outros espalhados em volta da mesa
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / ids.length;
    const x = 50 + Math.cos(ang) * 44, y = 50 + Math.sin(ang) * 36;
    const p = pessoa(id);
    const el = document.createElement("div");
    el.className = "assento";
    el.id = "assento-" + id;
    el.style.left = x + "%";
    el.style.top = y + "%";
    el.style.setProperty("--cor", p.cor);
    el.innerHTML = `<div class="foto">${rosto(id)}</div><b>${esc(p.nome)}</b><small>${esc(p.titulo)}</small>`;
    caixa.appendChild(el);
  });
  $("pergunta").textContent = sessao.pergunta;
  $("contexto").textContent = sessao.contexto || "";
  $("palcoVazio").hidden = true;
}

function fase(estado) {
  const ordem = ["aberto", "debate", "votacao", "encerrado"];
  const atual = ordem.indexOf(estado);
  document.querySelectorAll("#fases span").forEach(s => {
    const i = ordem.indexOf(s.dataset.fase);
    s.className = i < atual ? "feita" : i === atual ? "agora" : "";
  });
  $("aoVivo").classList.toggle("parado", estado === "encerrado");
  $("aoVivo").lastChild.textContent = estado === "encerrado" ? "Sessão encerrada" : "Em sessão";
}

// ---------- ata ----------
function naAta(ev) {
  const li = document.createElement("li");
  if (ev.tipo === "rodada") {
    li.className = "divisor";
    li.textContent = `Rodada ${ev.numero} · ${ev.titulo}`;
  } else {
    const p = pessoa(ev.quem);
    const resp = ev.responde ? `<em>→ ${esc(pessoa(ev.responde).nome)}</em>` : "";
    li.innerHTML = `<span class="mini">${rosto(ev.quem, 34)}</span><div><b style="color:${p.cor}">${esc(p.nome)}</b>${resp}<p>${esc(ev.texto)}</p></div>`;
  }
  document.querySelectorAll("#ata li.ativa").forEach(x => x.classList.remove("ativa"));
  if (ev.tipo === "fala") li.classList.add("ativa");
  $("ata").appendChild(li);
  $("ata").scrollTop = $("ata").scrollHeight;
  const n = document.querySelectorAll("#ata li:not(.divisor)").length;
  $("contador").textContent = `${n} fala${n === 1 ? "" : "s"}`;
}

// ---------- encenação ----------
const espera = ms => new Promise(r => setTimeout(r, pularAnimacao ? 0 : ms));

async function encenar(ev) {
  if (ev.tipo === "rodada") {
    fase(ev.numero === 1 ? "aberto" : "debate");
    $("rotuloPauta").textContent = `Rodada ${ev.numero} · ${ev.titulo}`;
    naAta(ev);
    return espera(600);
  }
  if (ev.tipo === "voto") {
    const v = sessao.votos[ev.quem];
    const assento = $("assento-" + ev.quem);
    if (v && assento && !assento.querySelector(".voto")) {
      const curto = { sim: "SIM", nao: "NÃO", condicional: "SE…" }[v.voto];
      assento.insertAdjacentHTML("beforeend", `<span class="voto ${v.voto}" title="${VOTO_NOME[v.voto]}">${curto} · ${v.nota}</span>`);
    }
    $("rotuloPauta").textContent = "Votação";
    fase("votacao");
    return espera(700);
  }
  if (ev.tipo === "veredito") {
    fase("encerrado");
    $("rotuloPauta").textContent = "Veredito";
    await espera(900);
    return abrirVeredito();
  }
  // fala
  const p = pessoa(ev.quem);
  document.querySelectorAll(".assento").forEach(a => {
    a.classList.toggle("falando", a.id === "assento-" + ev.quem);
    a.classList.toggle("calado", a.id !== "assento-" + ev.quem);
  });
  const caixa = $("falaAtual");
  caixa.hidden = false;
  caixa.style.setProperty("--cor", p.cor);
  $("falaRetrato").innerHTML = rosto(ev.quem, 36);
  $("falaNome").textContent = p.nome;
  $("falaTitulo").textContent = p.titulo;
  $("falaResponde").hidden = !ev.responde;
  if (ev.responde) $("falaResponde").textContent = `responde a ${pessoa(ev.responde).nome}`;
  naAta(ev);

  const alvo = $("falaTexto");
  if (pularAnimacao) {
    alvo.textContent = ev.texto;
    return;
  }
  const velocidade = fila.length > 3 ? 14 : 24;   // ms por letra; acelera se houver atraso
  alvo.innerHTML = "";
  const texto = document.createTextNode("");
  alvo.append(texto);
  alvo.insertAdjacentHTML("beforeend", '<span class="cursor"></span>');
  for (let i = 0; i < ev.texto.length; i += 2) {
    texto.data = ev.texto.slice(0, i + 2);
    await espera(velocidade * 2);
  }
  alvo.querySelector(".cursor")?.remove();
  await espera(Math.min(4000, 1200 + ev.texto.length * 12) / (fila.length > 3 ? 2 : 1));
}

async function tocar() {
  if (tocando) return;
  tocando = true;
  while (fila.length) await encenar(fila.shift());
  document.querySelectorAll(".assento").forEach(a => a.classList.remove("calado"));
  tocando = false;
}

// ---------- veredito ----------
function abrirVeredito() {
  const v = sessao.veredito;
  if (!v) return;
  $("vTitulo").textContent = v.titulo;
  $("vResumo").textContent = v.resumo;
  $("vNota").textContent = v.nota ?? "–";
  const dec = $("vDecisao");
  dec.className = "v-decisao " + v.decisao;
  dec.textContent = VOTO_NOME[v.decisao];
  const cont = { sim: 0, condicional: 0, nao: 0 };
  Object.values(sessao.votos).forEach(x => cont[x.voto]++);
  const total = Object.values(cont).reduce((a, b) => a + b, 0) || 1;
  $("vPlacar").innerHTML = Object.entries(cont).map(([k, n]) => `<i class="${k}" style="width:${(n / total) * 100}%" title="${VOTO_NOME[k]}: ${n}"></i>`).join("");
  const lista = (id, itens) => ($(id).innerHTML = (itens || []).map(t => `<li>${esc(t)}</li>`).join(""));
  lista("vCondicoes", v.condicoes);
  lista("vRiscos", v.riscos);
  lista("vPassos", v.proximos_passos);
  $("vVotos").innerHTML = sessao.conselho.filter(id => sessao.votos[id]).map(id => {
    const x = sessao.votos[id], p = pessoa(id);
    const cor = { sim: "#3FC89A", nao: "#E5484D", condicional: "#FFB347" }[x.voto];
    return `<div class="v-voto"><span class="mini">${rosto(id, 44)}</span><div>
      <header><b>${esc(p.nome)}</b><span style="color:${cor}">${VOTO_NOME[x.voto].toUpperCase()} · ${x.nota}</span></header>
      <p>${esc(x.motivo)}</p>${x.condicao ? `<p class="cond">Se: ${esc(x.condicao)}</p>` : ""}</div></div>`;
  }).join("");
  $("veredito").hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $("vArco").style.strokeDashoffset = 327 - (327 * (v.nota || 0)) / 10;
  }));
}

function relatorio() {
  const v = sessao.veredito;
  const falas = sessao.eventos.filter(e => e.tipo === "fala" || e.tipo === "rodada");
  const data = new Date(sessao.criado).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const li = arr => (arr || []).map(t => `<li>${esc(t)}</li>`).join("");
  $("relatorio").innerHTML = `
    <div class="r-rotulo">Conselho de IA · ${data}</div>
    <h1>${esc(sessao.pergunta)}</h1>
    ${sessao.contexto ? `<p>${esc(sessao.contexto)}</p>` : ""}
    <div class="r-decisao"><b>${v.nota}</b><div><div class="r-rotulo">${VOTO_NOME[v.decisao]}</div><strong>${esc(v.titulo)}</strong><p>${esc(v.resumo)}</p></div></div>
    <h2>Condições</h2><ul>${li(v.condicoes)}</ul>
    <h2>Riscos</h2><ul>${li(v.riscos)}</ul>
    <h2>Próximos 7 dias</h2><ol>${li(v.proximos_passos)}</ol>
    <h2>Votos</h2>
    ${sessao.conselho.filter(id => sessao.votos[id]).map(id => {
      const x = sessao.votos[id];
      return `<div class="r-fala"><b>${esc(pessoa(id).nome)}, ${esc(pessoa(id).titulo)}: ${VOTO_NOME[x.voto]} (${x.nota})</b><p>${esc(x.motivo)}${x.condicao ? " Condição: " + esc(x.condicao) : ""}</p></div>`;
    }).join("")}
    <h2>Ata do debate</h2>
    <div class="r-colunas">${falas.map(e => e.tipo === "rodada"
      ? `<p class="r-rotulo">Rodada ${e.numero} · ${esc(e.titulo)}</p>`
      : `<div class="r-fala"><b>${esc(pessoa(e.quem).nome)}</b><p>${esc(e.texto)}</p></div>`).join("")}</div>
    <p class="r-rotulo" style="margin-top:18pt">Conselheiros fictícios gerados por IA. Use como apoio à decisão, não como conselho profissional.</p>`;
}

// ---------- servidor ----------
async function atualizar() {
  try {
    const nova = await (await fetch("/api/sessao", { cache: "no-store" })).json();
    if (nova.vazio) return;
    const primeira = !sessao || nova.id !== sessao.id;
    sessao = nova;
    if (primeira) {
      vistos = 0;
      fila.length = 0;
      $("ata").innerHTML = "";
      $("veredito").hidden = true;
      montarMesa();
      fase("aberto");
      // sessão já em andamento: o que passou entra direto; só o novo é encenado
      if (sessao.eventos.length) {
        pularAnimacao = true;
        for (const ev of sessao.eventos) await encenar(ev);
        pularAnimacao = false;
        vistos = sessao.eventos.length;
        document.querySelectorAll(".assento").forEach(a => a.classList.remove("calado", "falando"));
      }
    }
    while (vistos < sessao.eventos.length) fila.push(sessao.eventos[vistos++]);
    tocar();
  } catch (e) {
    /* servidor fechado: tenta de novo no próximo ciclo */
  }
}

async function reassistir() {
  $("veredito").hidden = true;
  $("ata").innerHTML = "";
  document.querySelectorAll(".assento .voto").forEach(v => v.remove());
  fila.length = 0;
  fila.push(...sessao.eventos);
  tocar();
}

$("fecharVeredito").onclick = () => ($("veredito").hidden = true);
$("btnReassistir").onclick = reassistir;
$("btnPdf").onclick = () => { relatorio(); window.print(); };

(async () => {
  conselheiros = await (await fetch("/api/conselheiros")).json();
  await atualizar();
  setInterval(atualizar, 800);
})();
