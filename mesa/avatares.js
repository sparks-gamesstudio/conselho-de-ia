// Retratos ilustrados dos conselheiros, gerados a partir do campo `avatar` de cada ficha.
// Todos são personagens fictícios.

const CABELOS = {
  calvo: c => `<path d="M30 46c0-12 6-20 20-20s20 8 20 20c-2-6-6-9-8-9h-24c-2 0-6 3-8 9z" fill="${c}" opacity=".9"/>
               <path d="M29 50c-1-4 0-8 2-10M71 50c1-4 0-8-2-10" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
  curto: c => `<path d="M28 48c-1-16 9-26 22-26s24 9 22 26c-3-8-10-12-22-12s-19 4-22 12z" fill="${c}"/>`,
  lateral: c => `<path d="M28 50c-2-18 8-28 23-28 13 0 22 9 21 26-5-9-14-13-30-10-6 1-11 5-14 12z" fill="${c}"/>`,
  cacheado: c => `<g fill="${c}">${[[30,38,9],[40,28,10],[52,25,10],[63,30,10],[71,40,9],[27,50,8],[73,51,8],[35,32,7],[67,34,7]]
                  .map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
  rabo: c => `<path d="M28 50c-2-17 8-27 22-27s24 9 22 25c-5-7-13-11-24-11-9 0-15 5-20 13z" fill="${c}"/>
              <path d="M70 38c10 2 14 14 9 26-2-8-5-14-10-17z" fill="${c}"/>`,
  coque: c => `<circle cx="50" cy="19" r="9" fill="${c}"/><path d="M28 50c-2-17 8-27 22-27s24 10 22 27c-4-9-12-14-22-14s-18 5-22 14z" fill="${c}"/>`,
  tranca: c => `<path d="M27 52c-3-18 8-30 23-30s26 12 23 30c-4-11-12-16-23-16s-19 5-23 16z" fill="${c}"/>
                <g fill="${c}">${[60,68,76,84].map(y => `<ellipse cx="74" cy="${y}" rx="4.5" ry="5"/>`).join("")}</g>`,
  longo: c => `<path d="M26 54c-4-20 7-32 24-32s28 12 24 32l2 30H68l-1-30c-3-9-9-14-17-14s-14 5-17 14l-1 30H24z" fill="${c}"/>`,
  bone: c => `<path d="M28 44c0-13 9-21 22-21s22 8 22 21z" fill="#2A2A2E"/><path d="M50 44h30c0 3-3 5-6 5H50z" fill="#3A3A40"/>
              <path d="M29 50c0-3 1-5 2-6M71 50c0-3-1-5-2-6" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
  barba: c => `<path d="M29 48c-1-15 8-24 21-24s23 9 21 24c-4-7-11-10-21-10s-17 3-21 10z" fill="${c}"/>
               <path d="M33 58c2 14 9 20 17 20s15-6 17-20c-4 6-10 8-17 8s-13-2-17-8z" fill="${c}"/>`,
};

const ACESSORIOS = {
  nenhum: () => "",
  oculos: () => `<g fill="none" stroke="#111" stroke-width="2.2"><rect x="35" y="49" width="12" height="9" rx="3"/><rect x="53" y="49" width="12" height="9" rx="3"/><path d="M47 53h6"/></g>`,
  brincos: () => `<circle cx="31" cy="62" r="2.6" fill="#F2C14E"/><circle cx="69" cy="62" r="2.6" fill="#F2C14E"/>`,
  fone: () => `<path d="M27 54c0-16 10-26 23-26s23 10 23 26" fill="none" stroke="#1B1B1F" stroke-width="4"/>
               <rect x="23" y="50" width="8" height="13" rx="3" fill="#1B1B1F"/><rect x="69" y="50" width="8" height="13" rx="3" fill="#1B1B1F"/>`,
  gravata: () => `<path d="M47 84l3-4 3 4-2 16h-2z" fill="#7A1F24"/>`,
  colar: () => `<path d="M40 86c4 5 16 5 20 0" fill="none" stroke="#F2C14E" stroke-width="1.8"/><circle cx="50" cy="90" r="2" fill="#F2C14E"/>`,
};

function retrato(av = {}, tamanho = 96) {
  const pele = av.pele || "#C68B59", cabelo = av.cabelo || "#222", roupa = av.roupa || "#333";
  const atras = av.estilo === "longo" ? CABELOS.longo(cabelo) : "";
  const frente = av.estilo === "longo" ? "" : (CABELOS[av.estilo] || CABELOS.curto)(cabelo);
  return `<svg viewBox="0 0 100 100" width="${tamanho}" height="${tamanho}" aria-hidden="true">
    <defs><clipPath id="c${tamanho}${pele.slice(1)}${cabelo.slice(1)}"><circle cx="50" cy="50" r="50"/></clipPath></defs>
    <g clip-path="url(#c${tamanho}${pele.slice(1)}${cabelo.slice(1)})">
      ${atras}
      <path d="M14 104c2-18 16-26 36-26s34 8 36 26z" fill="${roupa}"/>
      <path d="M43 70h14v10c0 4-14 4-14 0z" fill="${pele}"/><path d="M43 70h14v6c-4 3-10 3-14 0z" fill="#000" opacity=".12"/>
      <ellipse cx="50" cy="53" rx="20" ry="23" fill="${pele}"/>
      <ellipse cx="30" cy="55" rx="3.5" ry="5" fill="${pele}"/><ellipse cx="70" cy="55" rx="3.5" ry="5" fill="${pele}"/>
      ${frente}
      <circle cx="42" cy="54" r="2" fill="#1A1210"/><circle cx="58" cy="54" r="2" fill="#1A1210"/>
      <path d="M45 65c3 2.5 7 2.5 10 0" fill="none" stroke="#5A2E22" stroke-width="2" stroke-linecap="round"/>
      ${(ACESSORIOS[av.acessorio] || ACESSORIOS.nenhum)()}
    </g></svg>`;
}

function retratoPresidente(tamanho = 96) {
  return `<svg viewBox="0 0 100 100" width="${tamanho}" height="${tamanho}" aria-hidden="true">
    <circle cx="50" cy="50" r="50" fill="#1C1814"/>
    <g fill="none" stroke="#E9D8B4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M30 70h40M38 70V44M50 70V44M62 70V44M28 44h44M50 26l24 14H26z"/>
    </g></svg>`;
}
