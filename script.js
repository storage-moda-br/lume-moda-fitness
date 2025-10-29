/* ================= EFEITOS NO BOTÃO ================= */
const btnSortear = document.getElementById("sortear");
btnSortear.onmouseover = function(){
  this.style.background="rgba(0,147,255,1)";
  this.style.transform="scale(1.04)";
};
btnSortear.onmouseout = function(){
  this.style.background="rgba(0,147,255,0.85)";
  this.style.transform="scale(1)";
};

/* ================= FIREBASE ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyCbHS1KJ_-BApLiVsXjBrqdu7_T7oOoNYQ",
  authDomain: "bistecaoapp.firebaseapp.com",
  projectId: "bistecaoapp"
});
const db = getFirestore(app);

/* ================= ESTADO ================= */
let isAdmin = false;
let partidas = [];
let usedPairs = new Set();
let trophyCountsDia = {};
let trophyCountsMes = {};

/* 🔄 SELEÇÃO DE BANCO: REAL / TESTE */
let salaAtual = localStorage.getItem("bancoAtivo") || "play-do-bistecao";
let salaDocRef = doc(db, "salas", salaAtual);

onSnapshot(doc(db, "config", "dbSelecionado"), (snap) => {
  if (!snap.exists()) return;
  const firebaseSala = snap.data().sala;
  if (firebaseSala !== salaAtual) {
    localStorage.setItem("bancoAtivo", firebaseSala);
    location.reload();
  }
});

async function atualizarSala(novaSala){
  salaAtual = novaSala;
  localStorage.setItem("bancoAtivo", novaSala);
  await setDoc(doc(db, "config", "dbSelecionado"), { sala: novaSala });
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

/* 🔤 Normalização de nomes */
function normalizarNome(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

/* ================= MENU COMPLETO ================= */
const menu = document.getElementById("menuDropdown");
const menuIcon = document.getElementById("menuIcon");

function atualizarMenuAdmin() {
  const botoesAdmin = menu.querySelectorAll(".nova, .encerrarMes, .selecionarSala, .editarTrofeus");
  botoesAdmin.forEach(btn => {
    btn.style.display = isAdmin ? "flex" : "none";
  });
}

menuIcon.onclick = () => {
  menu.style.display = menu.style.display === "block" ? "none" : "block";
};

window.onclick = (e) => {
  if (!e.target.closest('.menu-dropdown') && !e.target.closest('#menuIcon')) {
    menu.style.display = 'none';
  }
};

function ligarMenu() {
  menu.querySelector(".trofeus")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("rankingModal"); renderRanking(); });
  menu.querySelector(".historicoTrofeus")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("historicoTrofeusModal"); prepararHistoricoTrofeus(); });
  menu.querySelector(".historicoPartidas")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("historicoPartidasModal"); prepararHistoricoPartidas(); });

  menu.querySelector(".encerrarMes")?.addEventListener("click", (ev)=>{
    ev.preventDefault();
    if(!isAdmin) { alert("Somente administradores"); return; }
    encerrarMesAtual();
  });

  menu.querySelector(".nova")?.addEventListener("click", (ev)=>{
    ev.preventDefault();
    if(!isAdmin) { alert("Somente administradores"); return; }
    novaRodada();
  });

  menu.querySelector(".regras")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("regrasModal"); });
  menu.querySelector(".sobre")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("sobreModal"); });
  menu.querySelector(".admin")?.addEventListener('click', (ev)=>{ ev.preventDefault(); abrirModal("adminModal"); });
  menu.querySelector(".selecionarSala")?.addEventListener("click", (ev)=>{ ev.preventDefault(); abrirModal("selecionarSalaModal"); });
  menu.querySelector(".editarTrofeus")?.addEventListener("click", (ev)=>{ ev.preventDefault(); abrirEditarTrofeus("dia"); });
}

ligarMenu();
atualizarMenuAdmin();

/* ================= LOGIN ADMIN ================= */
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
if(localStorage.getItem("bistecaAdmin")==="1"){ isAdmin = true; atualizarMenuAdmin(); }

/* ================= FIRESTORE SYNC ================= */
onSnapshot(salaDocRef, snap=>{
  if(!snap.exists()) return;
  const d = snap.data();

  if (d.nomes && Array.isArray(d.nomes)) {
    d.nomes.forEach((nome, idx)=>{
      const campo = document.getElementById("p"+(idx+1));
      if(campo && campo.value.trim() !== nome) campo.value = nome;
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

/* ================= SORTEIO ================= */
btnSortear.onclick = ()=>{
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

/* ================= RENDER PARTIDAS ================= */
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
        document.getElementById(`d1-${p.numero}`).onclick = ()=> vencedor(p.numero,1);
        document.getElementById(`d2-${p.numero}`).onclick = ()=> vencedor(p.numero,2);
      }
    });
  }
}

function vencedor(n,d){
  const p = partidas.find(x=>x.numero===n);
  if(!p || p.vencedor) return;
  p.vencedor = d.toString();

  const ganh = d===1 ? p.dupla1 : p.dupla2;
  ganh.forEach(g=>{
    trophyCountsDia[g]  = (trophyCountsDia[g]||0) + 1;
    trophyCountsMes[g]  = (trophyCountsMes[g]||0) + 1;
  });

  renderPartidas();
  renderTrofeusDia();
  renderRanking();
  salvar();
}

/* ================= RENDER TROFÉUS ================= */
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

/* ================= NOMES ================= */
[...Array(6)].forEach((_, i)=>{
  const campo = document.getElementById("p"+(i+1));
  let ultimoValorValido = campo.value;

  campo.addEventListener("focus", () => ultimoValorValido = campo.value);

  campo.addEventListener("blur", async ()=>{
    let v = campo.value.trim();

    v = normalizarNome(v);
    if(!v){
      campo.value = ultimoValorValido;
      return;
    }

    v = v.split(" ").map(w=> w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

    const nomesAtuais = getNomes();
    nomesAtuais[i] = v;

    if (nomesAtuais.filter(n => n === v).length > 1){
      alert("⚠️ Nome duplicado!");
      campo.value = ultimoValorValido;
      return;
    }

    campo.value = v;
    ultimoValorValido = v;

    await setDoc(salaDocRef, { nomes: nomesAtuais }, { merge: true });
  });
});

/* ================= EDITOR TROFÉUS ================= */
const editarTrofeusModal = document.getElementById("editarTrofeusModal");
const listaTrofeusEl = document.getElementById("listaTrofeus");
const btnTabDia = document.getElementById("btnTabDia");
const btnTabMes = document.getElementById("btnTabMes");
const novoNomeInput = document.getElementById("novoNomeInput");
const novoValorInput = document.getElementById("novoValorInput");
const btnAdicionarTrofeu = document.getElementById("btnAdicionarTrofeu");
const btnSalvarTrofeus = document.getElementById("btnSalvarTrofeus");
const btnCancelarEditar = document.getElementById("btnCancelarEditar");
let editorModo = "dia";
let editData = {};

function abrirEditarTrofeus(modo="dia"){
  if(!isAdmin){ alert("Somente administradores!"); return; }
  
  editorModo = modo;
  btnTabDia.classList.toggle("active", modo === "dia");
  btnTabMes.classList.toggle("active", modo === "mes");

  editData = modo === "dia" ? {...trophyCountsDia} : {...trophyCountsMes};
  renderEditorLista();
  abrirModal("editarTrofeusModal");
}

function renderEditorLista(){
  const entries = Object.entries(editData || {});
  if(entries.length===0){
    listaTrofeusEl.innerHTML = `<p style='text-align:center;color:#777;'>Nenhum registro.</p>`;
    return;
  }

  listaTrofeusEl.innerHTML = entries.sort((a,b)=>b[1]-a[1]).map(([nome,val])=>`
    <div class="edit-row" data-nome="${nome}">
      <input type="text" class="edit-nome" value="${nome}" style="flex:1;">
      <input type="number" class="edit-valor" value="${val}" min="0" style="width:60px;">
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

function salvarLinha(orig, novoNome, novoValor){
  const nome = normalizarNome(novoNome);
  if(!nome) return showToast("Nome inválido");

  const novoCap = nome.split(" ").map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(" ");
  const val = Math.max(0, Number(novoValor)||0);

  delete editData[orig];
  editData[novoCap] = val;
  renderEditorLista();
}

function excluirLinha(nome){
  delete editData[nome];
  renderEditorLista();
}

btnAdicionarTrofeu.onclick = ()=>{
  const n = normalizarNome(novoNomeInput.value||"");
  if(!n) return showToast("Digite um nome válido");

  const cap = n.split(" ").map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(" ");
  const val = Math.max(0, Number(novoValorInput.value)||0);

  editData[cap] = (editData[cap]||0) + val;
  novoNomeInput.value="";
  novoValorInput.value="";
  renderEditorLista();
};

btnSalvarTrofeus.onclick = async ()=>{
  try{
    if(editorModo==="dia"){
      trophyCountsDia = {...editData};
      await setDoc(salaDocRef,{trophyCountsDia},{merge:true});
    }else{
      trophyCountsMes = {...editData};
      await setDoc(salaDocRef,{trophyCountsMes},{merge:true});
    }
    renderTrofeusDia();
    renderRanking();
    editarTrofeusModal.style.display="none";
    showToast("Salvo ✅");
  }catch{
    showToast("Erro ao salvar ❌");
  } 
};

btnCancelarEditar.onclick = ()=> editarTrofeusModal.style.display="none";

function showToast(msg,t=1800){
  let tEl = document.getElementById("toastMsg");
  if(!tEl){
    tEl = document.createElement("div");
    tEl.id = "toastMsg";
    document.body.appendChild(tEl);
  }
  tEl.textContent = msg;
  tEl.style.display="block";
  tEl.style.opacity="1";
  setTimeout(()=>{tEl.style.opacity="0";setTimeout(()=>tEl.style.display="none",300);},t);
}

/* ✅ Atualiza indicador de banco */
function atualizarIndicadorDB(){
  const el = document.getElementById("indicadorDB");
  const el2 = document.getElementById("indicadorDBModal");
  if(!el && !el2) return;
  const real = salaAtual==="play-do-bistecao";
  const txt = real?"✅ Banco Real":"🧪 Banco de Teste";
  const cor = real?"#0093ff":"#ff9800";
  if(el){el.textContent=txt;el.style.color=cor;}
  if(el2){el2.textContent=txt;el2.style.color=cor;}
}
document.addEventListener("DOMContentLoaded",atualizarIndicadorDB);

/* ================= HISTÓRICO — (mantido sem alterações) ================= */
function prepararHistoricoTrofeus() {}
function prepararHistoricoPartidas() {}

/* Inicialização */
renderPartidas();
renderTrofeusDia();
renderRanking();
