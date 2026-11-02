<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B0A09,100:D97757&height=170&section=header&text=Conselho%20de%20IA&fontSize=50&fontColor=F3EDE6&fontAlignY=36&desc=10%20conselheiros%20debatem%20sua%20decis%C3%A3o%20%C2%B7%20gr%C3%A1tis%20da%20F%C3%A1brica%20de%20Canais&descAlignY=58&descSize=16" width="100%" alt="Conselho de IA" />

<a href="https://sparks-gamesstudio.github.io/fabrica-de-canais/"><img src="https://sparks-gamesstudio.github.io/fabrica-de-canais/marca/simbolo-1024.png" width="84" alt="Fábrica de Canais" /></a>

**Leve uma decisão difícil para um conselho de 10 especialistas de IA. Eles debatem ao vivo numa mesa, discordam de verdade, votam e entregam o veredito com plano de 7 dias.**

<p>
  <img src="https://img.shields.io/badge/roda%20no%20Claude%20Code-D97757?style=for-the-badge&logo=anthropic&logoColor=white" alt="Roda no Claude Code" />
  <img src="https://img.shields.io/badge/gr%C3%A1tis-0B0A09?style=for-the-badge" alt="Grátis" />
  <img src="https://img.shields.io/badge/sem%20chave%20de%20API-F3EDE6?style=for-the-badge" alt="Sem chave de API" />
  <img src="https://img.shields.io/badge/s%C3%B3%20Python-0B0A09?style=for-the-badge&logo=python&logoColor=D97757" alt="Só Python" />
</p>

<p>
  <a href="#instalacao"><img src="https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Como%20instalar-D97757?style=for-the-badge" alt="Como instalar" /></a>
  <a href="https://sparks-gamesstudio.github.io/fabrica-de-canais/github.html"><img src="https://img.shields.io/badge/Mais%20projetos%20gr%C3%A1tis-0B0A09?style=for-the-badge&logo=github&logoColor=D97757" alt="Mais projetos grátis" /></a>
  <img src="https://img.shields.io/github/stars/sparks-gamesstudio/conselho-de-ia?style=for-the-badge&color=D97757&label=%E2%AD%90" alt="Estrelas" />
</p>

<img src="docs/mesa-debate.jpg" width="100%" alt="A mesa do conselho no meio do debate" />

</div>

## 👋 O Rebite explica

<img align="right" src="https://raw.githubusercontent.com/sparks-gamesstudio/sparks-gamesstudio/main/assets/rebite/acenar.jpg" width="170" alt="Rebite, o mascote da Fábrica de Canais" />

> Sabe quando você pergunta pra uma IA e ela só concorda contigo? Aqui é o contrário. Dez conselheiros, cada um com a sua mania, brigam pela sua decisão até sair um veredito. É tipo ter uma diretoria inteira de bolso.

<br clear="right" />

## 🪑 Como funciona

No Claude Code, escreva:

```
/conselho devo largar meu emprego para viver do meu canal? hoje ganho 4 mil e o canal fatura 1.200 por mês
```

1. **O Presidente monta o conselho:** escolhe de 4 a 6 conselheiros que mais importam para a sua decisão e coloca na mesa pelo menos dois que vão discordar.
2. **A mesa abre no navegador** e o debate acontece ao vivo, uma fala por vez, em 3 rodadas: primeiras impressões, embate (um rebate o outro pelo nome) e proposta final.
3. **Cada um vota** sim, não ou "sim, com condições", com nota de 0 a 10 e o motivo.
4. **Sai o veredito:** decisão, nota média, condições, riscos, próximos 7 dias e um relatório em PDF.

<img src="docs/veredito.jpg" width="100%" alt="O veredito com nota, condições, riscos e próximos passos" />

## 🧑‍⚖️ Os 10 conselheiros

Personagens fictícios, cada um com uma prioridade, um jeito de falar e um viés assumido. É justamente o atrito entre eles que mostra o que você não estava vendo.

<img src="docs/conselheiros.jpg" width="100%" alt="Os 10 conselheiros" />

Quer outro conselheiro? Crie um arquivo em `conselheiros/` seguindo o modelo dos outros (nome, pergunta-chave, como pensa, como fala, cor e retrato). Ele já pode sentar à mesa na próxima sessão.

<a id="instalacao"></a>

## ⬇️ Instalação

Precisa do [Claude Code](https://claude.com/claude-code) e do Python 3.10+. Não precisa instalar nenhum pacote.

```bash
git clone https://github.com/sparks-gamesstudio/conselho-de-ia.git
```

Copie a pasta para `~/.claude/skills/conselho` (no Windows: `C:\Users\<você>\.claude\skills\conselho`) e peça `/conselho` seguido da sua decisão.

Quer ver antes de usar? Rode o conselho de exemplo e clique em **Reassistir o debate**:

```bash
python scripts/mesa.py demo
```

## 🎁 O que você leva

- **A ata completa** do debate, ao lado da mesa.
- **Um relatório em PDF** ([exemplo](docs/relatorio-exemplo.pdf)) com decisão, votos e plano, pronto para mostrar ao sócio ou guardar.
- **Reassistir:** o debate inteiro de novo, encenado, ótimo para gravar a tela e postar.

## 🔍 Por dentro

| Arquivo | O que faz |
|---|---|
| `SKILL.md` | como o Presidente conduz: escolha do conselho, regras de cada fala, votação e veredito |
| `conselheiros/*.md` | as 10 fichas: quem é, como pensa, como fala, que viés tem |
| `scripts/mesa.py` | registra cada fala e voto e serve a mesa em `localhost:4747` (só Python padrão) |
| `mesa/` | a sala: mesa, retratos ilustrados, ata, veredito e relatório para impressão |

## ⚠️ Aviso honesto

<table>
<tr>
<td width="110" align="center"><img src="https://raw.githubusercontent.com/sparks-gamesstudio/sparks-gamesstudio/main/assets/rebite/pensar.jpg" width="90" alt="Rebite pensando" /></td>
<td>

Os conselheiros são personagens criados por IA. São ótimos para enxergar ângulos, riscos e testes baratos, mas não substituem contador, advogado, médico ou planejador financeiro de verdade.

</td>
</tr>
</table>

## 🙏 Créditos

Inspirado no [Roast Room](https://github.com/nateherkai/roast-room), que traz conselheiros baseados em pessoas reais. Aqui os conselheiros são personagens originais, o código foi escrito do zero e tudo foi pensado para quem empreende no Brasil.

---

<div align="center">

<a href="https://sparks-gamesstudio.github.io/fabrica-de-canais/"><img src="https://sparks-gamesstudio.github.io/fabrica-de-canais/marca/simbolo-1024.png" width="56" alt="Fábrica de Canais" /></a>

Feito pela **[Fábrica de Canais](https://sparks-gamesstudio.github.io/fabrica-de-canais/)**, skills de Claude Code para canais de vídeo no piloto automático.

<a href="https://instagram.com/afabricadecanais"><img src="https://img.shields.io/badge/@afabricadecanais-E4405F?style=flat-square&logo=instagram&logoColor=white" alt="Instagram" /></a>
<a href="https://github.com/sparks-gamesstudio"><img src="https://img.shields.io/badge/mais%20projetos-0B0A09?style=flat-square&logo=github&logoColor=D97757" alt="Mais projetos" /></a>

<sub>Licença MIT · use, modifique e compartilhe. Se ajudou, deixa uma ⭐</sub>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:D97757,100:0B0A09&height=90&section=footer" width="100%" alt="" />

</div>
