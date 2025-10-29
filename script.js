/* ================= EFEITOS NO BOTÃO ================= */
document.getElementById("sortear").onmouseover=function(){
  this.style.background="rgba(0,147,255,1)";
  this.style.transform="scale(1.04)";
};
document.getElementById("sortear").onmouseout=function(){
  this.style.background="rgba(0,147,255,0.85)";
  this.style.transform="scale(1)";
};


/* ================= FIREBASE ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* Ajuste se necessário: mesmo projeto já usado antes */
const app = initializeApp({
  apiKey: "AIzaSyCbHS1KJ_-BApLiVsXjBrqdu7_T7oOoNYQ",
  authDomain: "bistecaoapp.firebaseapp.com",
  projectId: "bistecaoapp"
});
const db = getFirestore(app);


/* ================= ESTADO ================= */
let isAdmin = false;
let partidas = [];               // {numero, dupla1:[a,b], dupla2:[c,d], deFora:[e,f], vencedor:null|'1'|'2'}
let usedPairs = new Set();       // pares já usados ("A|B")
let trophyCountsDia = {};
let trophyCountsMes = {};

/* === SELEÇÃO DE SALA (REAL / TESTE) === */
let salaAtual = localStorage.getItem("bancoAtivo") || "play-do-bistecao";
let salaDocRef = doc(db, "salas", salaAtual);

// ✅ Listener Firebase para mudar banco em todos dispositivos
onSnapshot(doc(db, "config", "dbSelecionado"), (snap) => {
  if (!snap.exists()) return;

  const firebaseSala = snap.data().sala;

  if (firebaseSala !== salaAtual) {
    localStorage.setItem("bancoAtivo", firebaseSala);
    location.reload();
  }
});


async function atualizarSala(novaSala){
  salaAtual = novaSala; // ✅ Atualiza ANTES do firestore
  localStorage.setItem("bancoAtivo", novaSala);

  await setDoc(doc(db, "config", "dbSelecionado"), {
    sala: novaSala
  });

  location.reload();
}




/* ================ HELPERS GERAIS ================ */
function getNomes(){
  return [...Array(6)].map((_,i)=>document.getElementById("p"+(i+1)).value.trim());
}
function embaralhar(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function keyPair(a,b){ return [a,b].sort().join('|'); }
function isDuplaRepetida(dupla){ return usedPairs.has(keyPair(dupla[0],dupla[1])); }

function dataKeyHoje(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function mesKey(d = new Date()){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  return `${y}-${m}`;
}
function labelMes(d = new Date()){
  return d.toLocaleDateString('pt-BR',{ month:'long', year:'numeric'}).replace(/^./,c=>c.toUpperCase());
}
function weekdayLabel(d){
  return d.toLocaleDateString('pt-BR',{ weekday:'long'}).replace(/^./,c=>c.toUpperCase());
}

// === Normalização de nomes (remove acentos, símbolos e espaços extras)
function normalizarNome(nome) {
  return nome
    .normalize("NFD")                 // separa acentos
    .replace(/[\u0300-\u036f]/g, "")  // remove acentos
    .replace(/[^a-zA-Z\s]/g, "")      // mantém só letras e espaços
    .trim()                           // tira espaços nas pontas
    .replace(/\s+/g, " ");            // colapsa espaços múltiplos
}



/* ===== MENU ===== */
const menu=document.getElementById("menuDropdown");

function atualizarMenuAdmin() {
  const botoesAdmin = menu.querySelectorAll(".nova, .encerrarMes, .selecionarSala");
  botoesAdmin.forEach(btn => {
    btn.style.display = isAdmin ? "flex" : "none";
  });
}

atualizarMenuAdmin();

document.getElementById("menuIcon").onclick=()=>menu.style.display=menu.style.display==="block"?"none":"block";
window.onclick=e=>{if(!e.target.closest('.menu-dropdown')&&!e.target.closest('#menuIcon'))menu.style.display='none';};
menu.querySelector(".trofeus").onclick=(ev)=>{ev.preventDefault();abrirModal("rankingModal");};
menu.querySelector(".nova").onclick = (ev) => {
  ev.preventDefault();
  menu.style.display = 'none';
  setTimeout(() => novaRodada(), 200);
};

menu.querySelector(".regras").onclick=(ev)=>{ev.preventDefault();abrirModal("regrasModal");};
menu.querySelector(".sobre").onclick=(ev)=>{ev.preventDefault();abrirModal("sobreModal");};
menu.querySelector(".admin").onclick=(ev)=>{ev.preventDefault();abrirModal("adminModal");};
menu.querySelector(".historico-trofeus")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("historicoTrofeusModal"); prepararHistoricoTrofeus(); });
menu.querySelector(".encerrar-mes")?.addEventListener('click', async (ev)=>{
  ev.preventDefault();
  if(!isAdmin){ alert("Somente administradores podem encerrar o mês."); return; }
  await encerrarMesAtual();
});
menu.querySelector(".historico-partidas")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("historicoPartidasModal"); prepararHistoricoPartidas(); });

function abrirModal(id){
  menu.style.display='none';
  document.getElementById(id).style.display='block';
}
document.querySelectorAll(".modal .close").forEach(c=>c.onclick=e=>e.target.closest(".modal").style.display='none');


menu.querySelector(".trofeus")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("rankingModal"); renderRanking(); });
menu.querySelector(".regras")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("regrasModal"); });
menu.querySelector(".sobre")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("sobreModal"); });
menu.querySelector(".admin")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("adminModal"); setTimeout(()=>document.getElementById("senhaInput")?.focus(), 50); });


menu.querySelector(".historicoTrofeus")?.addEventListener('click', (ev)=>{
  ev.preventDefault();
  abrirModal("historicoTrofeusModal");
  prepararHistoricoTrofeus();
});
menu.querySelector(".encerrarMes")?.addEventListener('click', async (ev)=>{
  ev.preventDefault();
  if(!isAdmin){ alert("Somente administradores podem encerrar o mês."); return; }
  await encerrarMesAtual();
});
menu.querySelector(".historicoPartidas")?.addEventListener('click', (ev)=>{
  ev.preventDefault();
  abrirModal("historicoPartidasModal");
  prepararHistoricoPartidas();
});


/* ================ LOGIN ADMIN ================ */
document.getElementById("btnEntrarSenha").onclick = async ()=>{
  const senha = document.getElementById("senhaInput").value.trim();
  const snap = await getDoc(doc(db,"config","senhaAdmin"));
  if(snap.exists() && senha === snap.data().valor){
    isAdmin = true;
    localStorage.setItem("bistecaAdmin","1");
    document.getElementById("msgSenha").innerText = "✅ Acesso liberado!";
    setTimeout(()=>document.getElementById("adminModal").style.display='none',800);
    atualizarMenuAdmin();
  } else {
    document.getElementById("msgSenha").innerText = "Senha incorreta!";
  }
};
if(localStorage.getItem("bistecaAdmin")==="1") isAdmin = true;
if (isAdmin) atualizarMenuAdmin();


/* ================ FIRESTORE SYNC ================ */
onSnapshot(salaDocRef, snap=>{
  if(!snap.exists()) return;
  const d = snap.data();

  if (d.nomes && Array.isArray(d.nomes)) {
    d.nomes.forEach((nome, idx)=>{
      const campo = document.getElementById("p"+(idx+1));
      if(campo && campo.value.trim() !== nome) {
        campo.value = nome;
      }
    });
  }

  partidas = d.partidas || [];
  usedPairs = new Set(d.usedPairs || []);
  trophyCountsDia = d.trophyCountsDia || {};
  trophyCountsMes = d.trophyCountsMes || {};
  renderPartidas();
  renderTrofeusDia();
  renderRanking();
});

async function salvar(){
  await setDoc(salaDocRef, {
    partidas,
    usedPairs: Array.from(usedPairs),
    trophyCountsDia,
    trophyCountsMes,
    nomes: getNomes()
  });
}


/* ================ SORTEIO 1ª PARTIDA ================ */
document.getElementById("sortear").onclick = ()=>{
  if(!isAdmin){ alert("Somente administradores."); return; }
  criarPrimeira();
};
function criarPrimeira(){
  const n = getNomes();
  if(n.some(x=>!x)){ alert("Preencha os 6 nomes."); return; }
  const e = embaralhar(n.slice(0,4));
  partidas = [{ numero:1, dupla1:[e[0],e[1]], dupla2:[e[2],e[3]], deFora:n.slice(4), vencedor:null }];
  usedPairs.clear();
  renderPartidas();
  salvar();
}


/* ================ GERAÇÃO (2..9) ================ */
function todasParticoes4([a,b,c,d]){
  return [
    [[a,b],[c,d]],
    [[a,c],[b,d]],
    [[a,d],[b,c]]
  ];
}
function gerarProximaPartidaSimulada(stateUltima, statePenultima){
  const nomes = getNomes();
  const jogadoresUlt = [...stateUltima.dupla1, ...stateUltima.dupla2];
  const jogadoresPen = statePenultima? [...statePenultima.dupla1, ...statePenultima.dupla2] : [];
  const mustLeave   = jogadoresUlt.filter(p=>jogadoresPen.includes(p));
  const permanecer  = jogadoresUlt.filter(p=>!mustLeave.includes(p));
  const entra       = stateUltima.deFora.slice();

  let candidatos = [...permanecer, ...entra].slice(0,4);
  if(candidatos.length<4){
    const faltam = nomes.filter(n=>!candidatos.includes(n)&&!jogadoresUlt.includes(n));
    while(candidatos.length<4 && faltam.length) candidatos.push(faltam.shift());
  }
  if(candidatos.length<4) return null;

  const opcoes = todasParticoes4(candidatos);
  const ord = embaralhar(opcoes.slice());
  let escolhida = null;
  for(const opt of ord){
    if(!isDuplaRepetida(opt[0]) && !isDuplaRepetida(opt[1])){ escolhida = opt; break; }
  }
  if(!escolhida){
    let best = ord[0], bestR = 10;
    ord.forEach(opt=>{
      const r = (isDuplaRepetida(opt[0])?1:0)+(isDuplaRepetida(opt[1])?1:0);
      if(r<bestR){ bestR=r; best=opt; }
    });
    escolhida = best;
  }
  const [dupla1,dupla2] = escolhida;
  const novaDeFora = nomes.filter(n=>!candidatos.includes(n));
  usedPairs.add(keyPair(dupla1[0],dupla1[1]));
  usedPairs.add(keyPair(dupla2[0],dupla2[1]));
  return { numero:0, dupla1, dupla2, deFora:novaDeFora, vencedor:null };
}
function gerarSequenciaAposPrimeira(){
  if(partidas.length===0) return;
  const primeira = partidas[0];
  if(!primeira.vencedor) return;

  partidas = [partidas[0]];
  usedPairs.clear();
  usedPairs.add(keyPair(primeira.dupla1[0], primeira.dupla1[1]));
  usedPairs.add(keyPair(primeira.dupla2[0], primeira.dupla2[1]));

  const states = [];
  states.push({ dupla1:primeira.dupla1.slice(), dupla2:primeira.dupla2.slice(), deFora:primeira.deFora.slice() });

  const vencedores = primeira.vencedor==='1'? primeira.dupla1.slice(): primeira.dupla2.slice();
  const perdedores = primeira.vencedor==='1'? primeira.dupla2.slice(): primeira.dupla1.slice();
  const deFora     = primeira.deFora.slice();
  const embFor     = embaralhar(deFora.slice());

  const p2_dupla1 = [vencedores[0], embFor[0]];
  const p2_dupla2 = [vencedores[1], embFor[1]];
  const state2 = { dupla1:p2_dupla1, dupla2:p2_dupla2, deFora:perdedores.slice() };
  usedPairs.add(keyPair(p2_dupla1[0],p2_dupla1[1]));
  usedPairs.add(keyPair(p2_dupla2[0],p2_dupla2[1]));
  states.push(state2);

  for(let idx=3; idx<=9; idx++){
    const stUlt = states[states.length-1];
    const stPen = states.length>=2? states[states.length-2] : null;
    const nova  = gerarProximaPartidaSimulada(stUlt, stPen);
    if(!nova) break;
    nova.numero = idx;
    states.push({ dupla1:nova.dupla1.slice(), dupla2:nova.dupla2.slice(), deFora:nova.deFora.slice() });
  }

  for(let i=1;i<states.length;i++){
    const st = states[i];
    partidas.push({ numero:partidas.length+1, dupla1:st.dupla1.slice(), dupla2:st.dupla2.slice(), deFora:st.deFora.slice(), vencedor:null });
  }
}


/* ================ RENDER PARTIDAS (visual idêntico) ================ */
function renderPartidas(){
  const r = document.getElementById("resultado");
  r.innerHTML = "";
  partidas.forEach(p=>{
    const d1Class = p.vencedor==='1' ? 'dupla dupla-vencedora' : 'dupla';
    const d2Class = p.vencedor==='2' ? 'dupla dupla-vencedora' : 'dupla';
    const perd1   = p.vencedor==='2' ? 'dupla dupla-perdedora' : 'dupla';
    const perd2   = p.vencedor==='1' ? 'dupla dupla-perdedora' : 'dupla';
    r.innerHTML += `
      <h3 style="text-align:center;">Partida ${p.numero}</h3>
      <div id="d1-${p.numero}" class="${p.vencedor==='2'?perd1:d1Class}">
        <strong>Dupla 1:</strong> ${p.dupla1.join(' & ')} ${p.vencedor==='1'?'🏆':''}
      </div>
      <div id="d2-${p.numero}" class="${p.vencedor==='1'?perd2:d2Class}">
        <strong>Dupla 2:</strong> ${p.dupla2.join(' & ')} ${p.vencedor==='2'?'🏆':''}
      </div>
      <div class="dupla-fora"><strong>De fora:</strong> ${p.deFora.join(' & ')}</div>
    `;
  });
  if(isAdmin){
    partidas.forEach(p=>{
      if(p.vencedor===null){
        const el1 = document.getElementById(`d1-${p.numero}`);
        const el2 = document.getElementById(`d2-${p.numero}`);
        if(el1) el1.onclick = ()=>vencedor(p.numero,1);
        if(el2) el2.onclick = ()=>vencedor(p.numero,2);
      }
    });
  }
}


/* ================ LÓGICA DE VITÓRIA ================ */
function vencedor(n,d){
  const p = partidas.find(x=>x.numero===n);
  if(!p || p.vencedor) return;
  p.vencedor = d.toString();

  const ganh = d===1 ? p.dupla1 : p.dupla2;
  ganh.forEach(g=>{
    trophyCountsDia[g]  = (trophyCountsDia[g]||0) + 1;
    trophyCountsMes[g]  = (trophyCountsMes[g]||0) + 1;
  });

  if(n===1){ gerarSequenciaAposPrimeira(); }

  renderPartidas();
  renderTrofeusDia();
  renderRanking();
  salvar();
}


/* ================ DUPLO CLIQUE (somente admin) ================ */
document.addEventListener("dblclick",(e)=>{
  if(!isAdmin) return;
  const el = e.target.closest(".dupla-vencedora");
  if(!el) return;
  const id = el.id.match(/d(1|2)-(\d+)/);
  if(!id) return;
  const num = parseInt(id[2]);
  const p = partidas.find(x=>x.numero===num);
  if(p) p.vencedor = null;
  renderPartidas(); salvar();
});


/* ================ TROFÉUS: DIA E MÊS (render) ================ */
function renderTrofeusDia(){
  const c = document.getElementById("trofeusDiaContainer");
  const l = document.getElementById("trofeusDiaLista");
  const e = Object.entries(trophyCountsDia||{});
  if(e.length===0){ c.style.display="none"; return; }
  c.style.display = "block";
  l.innerHTML = e.sort((a,b)=>b[1]-a[1]).map(([n,v])=>`
    <div class='trofeus-dia-item'><span>${n}</span><span>${v} 🏆</span></div>
  `).join('');
}
function renderRanking(){
  const l = document.getElementById("rankingList");
  if(!l) return;
  const e = Object.entries(trophyCountsMes||{});
  l.innerHTML = e.length
    ? e.sort((a,b)=>b[1]-a[1]).map(([n,v])=>`<div class='trofeus-dia-item'><span>${n}</span><span>${v} 🏆</span></div>`).join('')
    : "<p style='text-align:center;color:#777;'>Nenhum troféu neste mês.</p>";
}


/* ================ NOVA RODADA (salva histórico do dia + sincroniza) ================ */
async function novaRodada(){
  if(!isAdmin){ alert("Somente administradores."); return; }
  if(!confirm("Tem certeza que deseja iniciar nova rodada? Isso apagará os resultados do dia.")) return;

  const hoje = dataKeyHoje();
  const docDiaRef = doc(db, "partidasDia", `play-do-bistecao_${hoje}`);
  await setDoc(docDiaRef, {
    sala: "play-do-bistecao",
    dataKey: hoje,
    partidas: partidas || [],
    nomes: getNomes(),
    createdAt: Date.now()
  });

  partidas = [];
  usedPairs = new Set();
  trophyCountsDia = {};

  await setDoc(salaDocRef, {
    partidas: [],
    usedPairs: [],
    trophyCountsDia: {},
    trophyCountsMes: trophyCountsMes || {},
    nomes: getNomes()
  });

  document.getElementById("resultado").innerHTML = "";
  renderTrofeusDia();
  renderRanking();
}


/* ================ Nomes: padronização + proteção duplicada ================ */
[...Array(6)].forEach((_, i) => {
  const campo = document.getElementById("p" + (i + 1));
  let ultimoValorValido = campo.value;

  campo.addEventListener("focus", () => {
    ultimoValorValido = campo.value;
  });

  campo.addEventListener("blur", async () => {
    let v = campo.value.trim();

    // Normaliza acentos e espaços
    v = normalizarNome(v);

    if (v.length === 0) {
      campo.value = ultimoValorValido;
      return;
    }

    // ✅ Capitaliza TODAS as palavras do nome composto
    v = v.split(" ").map(w =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join(" ");

    // Coleta nomes atuais já normalizados
    const nomesAtuais = [...Array(6)].map((_, j) =>
      j === i ? v : document.getElementById("p" + (j + 1)).value.trim()
    );

    // ✅ Proteção contra duplicação dentro dos 6 jogadores
    if (nomesAtuais.filter(n => n === v).length > 1) {
      alert("⚠️ Este nome já está sendo utilizado!");
      campo.value = ultimoValorValido;
      return;
    }

   
    campo.value = v;
    ultimoValorValido = v;

    // ✅ Salva somente nomes, sem mexer em troféus
    await setDoc(salaDocRef, { nomes: nomesAtuais }, { merge: true });
  });
});



/* ================ HISTÓRICO DE TROFÉUS ================ */
async function prepararHistoricoTrofeus(){
  const sel = document.getElementById("mesSelect");
  const list = document.getElementById("historicoTrofeusList");
  if(!sel || !list) return;

  sel.innerHTML = "";
  const now = new Date();
  for(let i=0;i<12;i++){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const mk = mesKey(d);
    const opt = document.createElement("option");
    opt.value = mk;
    opt.textContent = labelMes(d);
    sel.appendChild(opt);
  }

  async function carregar(mk){
    const ref = doc(db, "historicoTrofeus", `play-do-bistecao_${mk}`);
    const s = await getDoc(ref);
    if(!s.exists()){ list.innerHTML = "<p style='text-align:center;color:#777;'>Sem dados para esse mês.</p>"; return; }
    const data = s.data();
    const entries = Object.entries(data || {}).filter(([k])=>!["sala","mesKey","rotulo","closedAt"].includes(k));
    list.innerHTML = entries.length
      ? entries.sort((a,b)=>b[1]-a[1]).map(([nome,q])=>`<div class='trofeus-dia-item'><span>${nome}</span><span>${q} 🏆</span></div>`).join('')
      : "<p style='text-align:center;color:#777;'>Sem dados para esse mês.</p>";
  }
  sel.onchange = ()=>carregar(sel.value);
  await carregar(sel.value);
}


/* ================ ENCERRAR MÊS ================= */
async function encerrarMesAtual(){
  const mk = mesKey(new Date());
  const rotulo = labelMes(new Date());

  await setDoc(doc(db,"historicoTrofeus", `play-do-bistecao_${mk}`), {
    ...trophyCountsMes,
    sala: "play-do-bistecao",
    mesKey: mk,
    rotulo,
    closedAt: Date.now()
  });

  trophyCountsMes = {};
  await setDoc(salaDocRef, {
    partidas,
    usedPairs: Array.from(usedPairs),
    trophyCountsDia,
    trophyCountsMes,
    nomes: getNomes()
  });
}


/* ================ HISTÓRICO DE PARTIDAS ================ */
async function prepararHistoricoPartidas(){
  const selMes = document.getElementById("mesPartidasSelect");
  const listaDatas = document.getElementById("listaPartidasDoMes");
  const detalhes = document.getElementById("detalhesPartida");
  if(!selMes || !listaDatas || !detalhes) return;

  selMes.innerHTML = "";
  const now = new Date();
  for(let i=0;i<12;i++){
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const mk = mesKey(d);
    const opt = document.createElement("option");
    opt.value = mk;
    opt.textContent = labelMes(d);
    selMes.appendChild(opt);
  }

  async function listarDiasDoMes(mk){
    listaDatas.innerHTML = "<p style='text-align:center;color:#777;'>Carregando…</p>";
    detalhes.innerHTML = "";

    const [ano,mes] = mk.split("-").map(Number);
    const lastDay = new Date(ano, mes, 0).getDate();
    const encontrados = [];

    for(let dia=1; dia<=lastDay; dia++){
      const dd = String(dia).padStart(2,'0');
      const key = `${ano}-${String(mes).padStart(2,'0')}-${dd}`;
      const ref = doc(db,"partidasDia", `play-do-bistecao_${key}`);
      const s = await getDoc(ref);
      if(s.exists()){
        encontrados.push({ key, data: s.data() });
      }
    }

    if(encontrados.length===0){
      listaDatas.innerHTML = "<p style='text-align:center;color:#777;'>Nenhuma partida salva neste mês.</p>";
      return;
    }

    listaDatas.innerHTML = encontrados.map(({key})=>{
      const [Y,M,D] = key.split("-");
      const d = new Date(Number(Y), Number(M)-1, Number(D));
      const semana = weekdayLabel(d);
      return `
        <div class="trofeus-dia-item" data-date="${key}" style="cursor:pointer;">
          <span>Partida ${D}/${M}/${Y} — ${semana}</span>
          <span>🔎 Ver</span>
        </div>
      `;
    }).join("");

    listaDatas.querySelectorAll(".trofeus-dia-item").forEach(el=>{
      el.addEventListener("click", async ()=>{
        const key = el.getAttribute("data-date");
        const ref = doc(db,"partidasDia", `play-do-bistecao_${key}`);
        const s = await getDoc(ref);
        if(!s.exists()){ detalhes.innerHTML = "<p style='text-align:center;color:#777;'>Partida não encontrada.</p>"; return; }
        const dataDia = s.data();
        const pts = dataDia.partidas || [];

        let html = "";
        pts.forEach(p=>{
          const d1Class = p.vencedor==='1' ? 'dupla dupla-vencedora' : 'dupla';
          const d2Class = p.vencedor==='2' ? 'dupla dupla-vencedora' : 'dupla';
          const perd1   = p.vencedor==='2' ? 'dupla dupla-perdedora' : 'dupla';
          const perd2   = p.vencedor==='1' ? 'dupla dupla-perdedora' : 'dupla';
          html += `
            <h3 style="text-align:center;">Partida ${p.numero}</h3>
            <div class="${p.vencedor==='2'?perd1:d1Class}">
              <strong>Dupla 1:</strong> ${p.dupla1.join(' & ')} ${p.vencedor==='1'?'🏆':''}
            </div>
            <div class="${p.vencedor==='1'?perd2:d2Class}">
              <strong>Dupla 2:</strong> ${p.dupla2.join(' & ')} ${p.vencedor==='2'?'🏆':''}
            </div>
            <div class="dupla-fora"><strong>De fora:</strong> ${p.deFora.join(' & ')}</div>
          `;
        });

        detalhes.innerHTML = `
          <div class="trofeus-dia-container" style="margin-top:10px;">
            <h3 style="margin-bottom:8px;">📅 ${key.split("-").reverse().join("/")}</h3>
            ${html || "<p style='text-align:center;color:#777;'>Sem partidas neste dia.</p>"}
          </div>
        `;
      });
    });
  }

  selMes.onchange = ()=> listarDiasDoMes(selMes.value);
  await listarDiasDoMes(selMes.value);
}
/* SELEÇÃO DE SALA - ABERTURA DO MODAL */
document.querySelector(".selecionarSala").addEventListener("click", ev => {
  ev.preventDefault();
  abrirModal("selecionarSalaModal");
});

/* TROCA DE SALA AO CLICAR NO BOTÃO */
document.querySelectorAll(".btn-sala").forEach(btn=>{
  btn.addEventListener("click", () => {
    atualizarSala(btn.getAttribute("data-sala"));
  });
});

function atualizarIndicadorDB(){
  const el = document.getElementById("indicadorDB");
  const elModal = document.getElementById("indicadorDBModal");
  if(!el && !elModal) return;

  const isReal = salaAtual === "play-do-bistecao";
  const txt = isReal ? "✅ Banco Real" : "🧪 Banco de Teste";
  const cor = isReal ? "#0093ff" : "#ff9800";

  if(el){
    el.textContent = txt;
    el.style.color = cor;
  }
  if(elModal){
    elModal.textContent = txt;
    elModal.style.color = cor;
  }
}


document.addEventListener("DOMContentLoaded", atualizarIndicadorDB);

// ✅ Clique nos botões do modal Selecionar DB
document.querySelectorAll(".btn-sala").forEach(btn => {
  btn.addEventListener("click", () => {
    atualizarSala(btn.getAttribute("data-sala"));
  });
});

/* ================= Editor de Troféus (Admin) ================= */
const editarTrofeusModal = document.getElementById("editarTrofeusModal");
const listaTrofeusEl = document.getElementById("listaTrofeus");
const btnTabDia = document.getElementById("btnTabDia");
const btnTabMes = document.getElementById("btnTabMes");
const novoNomeInput = document.getElementById("novoNomeInput");
const novoValorInput = document.getElementById("novoValorInput");
const btnAdicionarTrofeu = document.getElementById("btnAdicionarTrofeu");
const btnSalvarTrofeus = document.getElementById("btnSalvarTrofeus");
const btnCancelarEditar = document.getElementById("btnCancelarEditar");

let editorModo = "dia"; // "dia" ou "mes"
let editData = {}; // cópia local dos trophyCounts

function abrirEditarTrofeus(modo = "dia"){
  if(!isAdmin){ alert("Somente administradores podem editar troféus."); return; }
  editorModo = modo;
  btnTabDia.classList.toggle("active", modo === "dia");
  btnTabMes.classList.toggle("active", modo === "mes");
  // faz cópia local para edição (não toca em original até salvar)
  editData = modo === "dia" ? {...(trophyCountsDia||{})} : {...(trophyCountsMes||{})};
  renderEditorLista();
  abrirModal("editarTrofeusModal");
}

function renderEditorLista(){
  const entries = Object.entries(editData || {});
  if(entries.length === 0){
    listaTrofeusEl.innerHTML = `<p style="text-align:center;color:#777;">Nenhum registro.</p>`;
    return;
  }

  listaTrofeusEl.innerHTML = entries.sort((a,b)=>b[1]-a[1]).map(([nome,val]) => `
    <div class="edit-row" data-nome="${nome}">
      <input type="text" class="edit-nome" value="${escapeHtml(nome)}" style="flex:1;">
      <input type="number" class="edit-valor" value="${val}" min="0" style="width:70px;">
      <button class="btn-neutro btn-save">✔</button>
      <button class="btn-neutro btn-delete">✖</button>
    </div>
  `).join('');

  listaTrofeusEl.querySelectorAll(".edit-row").forEach(el=>{
    const nomeInput = el.querySelector(".edit-nome");
    const valInput = el.querySelector(".edit-valor");
    const btnSave = el.querySelector(".btn-save");
    const btnDel = el.querySelector(".btn-delete");
    const originalNome = el.getAttribute("data-nome");

    btnSave.onclick = ()=> salvarLinha(originalNome, nomeInput.value, valInput.value);
    btnDel.onclick = ()=> excluirLinha(originalNome);
  });
}


// adicionar novo
btnAdicionarTrofeu.onclick = ()=>{
  const n = normalizarNome(novoNomeInput.value || "");
  if(!n){ showToast("Digite um nome válido"); return; }
  const nome = n.split(" ").map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(" ");
  const val = Math.max(0, Number(novoValorInput.value) || 0);
  if(editData[nome] !== undefined){
    editData[nome] = Number(editData[nome]) + val;
  } else {
    editData[nome] = val;
  }
  novoNomeInput.value = "";
  novoValorInput.value = "";
  renderEditorLista();
  showToast("Adicionado localmente. Clique em Salvar para persistir.");
};

// salvar no firestore
btnSalvarTrofeus.onclick = async ()=>{
  try{
    if(editorModo === "dia"){
      trophyCountsDia = {...editData};
      await setDoc(salaDocRef, { trophyCountsDia: trophyCountsDia }, { merge: true });
    } else {
      trophyCountsMes = {...editData};
      await setDoc(salaDocRef, { trophyCountsMes: trophyCountsMes }, { merge: true });
    }
    renderTrofeusDia();
    renderRanking();
    showToast("Salvo com sucesso ✅");
    editarTrofeusModal.style.display = "none";
  }catch(err){
    console.error(err);
    showToast("Erro ao salvar. Veja console.");
  }
};

// abas
btnTabDia.onclick = ()=> abrirEditarTrofeus("dia");
btnTabMes.onclick = ()=> abrirEditarTrofeus("mes");

// cancelar fecha modal (reaproveita classe close)
btnCancelarEditar.onclick = ()=> editarTrofeusModal.style.display = "none";


// helper: toast
function showToast(msg, timeout=2200){
  let t = document.getElementById("toastMsg");
  if(!t){
    t = document.createElement("div");
    t.id = "toastMsg";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = "block";
  t.style.opacity = "1";
  setTimeout(()=>{ t.style.opacity = "0"; setTimeout(()=>t.style.display="none",300); }, timeout);
}

// Expor uma entrada de menu: ligar ao menu (apenas admin)
menu.querySelector(".trofeus")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("rankingModal"); renderRanking(); });
/* Cria item extra — recomendamos inserir no HTML do menu com a classe .editarTrofeus
   <a href="#" class="editarTrofeus">Editar Troféus</a>
*/
document.querySelector(".editarTrofeus")?.addEventListener("click", (ev)=>{
  ev.preventDefault();
  abrirEditarTrofeus("dia");
});


/* Inicialização simples de render */
renderPartidas();
renderTrofeusDia();
renderRanking();

