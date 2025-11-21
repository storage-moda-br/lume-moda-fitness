// -------------------------
// MODAL SOBRE (abre apenas pelo menu)
// -------------------------

const modalSobre = document.getElementById('sobreModal');
const closeModal = document.getElementById('closeModal');

// Função para abrir o modal Sobre
function abrirSobre() {
  modalSobre.style.display = 'flex';
}

// Fechar modal Sobre
closeModal.addEventListener('click', () => modalSobre.style.display = 'none');
window.addEventListener('click', e => { 
  if (e.target === modalSobre) modalSobre.style.display = 'none'; 
});


// -------------------------
// MENU LATERAL
// -------------------------

const menuBtn = document.getElementById("menuBtn");
const menuLateral = document.getElementById("menuLateral");
const fecharMenu = document.getElementById("fecharMenu");

// abrir menu lateral
menuBtn.addEventListener("click", () => {
  menuLateral.classList.add("ativo");
});

// fechar menu lateral
fecharMenu.addEventListener("click", () => {
  menuLateral.classList.remove("ativo");
});

// clicar fora fecha
menuLateral.addEventListener("click", (e) => {
  if (e.target === menuLateral) {
    menuLateral.classList.remove("ativo");
  }
});


// -------------------------
// LIGA O ITEM "Sobre" DO MENU PARA ABRIR O MODAL
// -------------------------

const itemSobre = document.querySelector(".menu-item:nth-child(4)");

itemSobre.addEventListener("click", () => {
  menuLateral.classList.remove("ativo"); // fecha menu
  abrirSobre(); // abre modal Sobre
});

// -------------------------
// MODAL POLÍTICA DE PRIVACIDADE
// -------------------------

const privacidadeModal = document.getElementById("privacidadeModal");
const closePriv = document.querySelector(".closePrivacidade");
const itemPrivacidade = document.querySelector(".menu-item:nth-child(2)");


itemPrivacidade.addEventListener("click", () => {
  menuLateral.classList.remove("ativo");
  privacidadeModal.style.display = "flex";
});

closePriv.addEventListener("click", () => {
  privacidadeModal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === privacidadeModal) privacidadeModal.style.display = "none";
});


// -------------------------
// MODAL TERMOS DE USO
// -------------------------

const termosModal = document.getElementById("termosModal");
const closeTermos = document.querySelector(".closeTermos");
const itemTermos = document.querySelector(".menu-item:nth-child(3)");


itemTermos.addEventListener("click", () => {
  menuLateral.classList.remove("ativo");
  termosModal.style.display = "flex";
});

closeTermos.addEventListener("click", () => {
  termosModal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === termosModal) termosModal.style.display = "none";
});
// MENSAGENS ROTATIVAS DO POPUP
const mensagensPopup = [
  "Alguém de São Paulo acabou de comprar <strong>Limpa Nome 2026</strong>.",
  "Cliente do Rio de Janeiro adquiriu o <strong>Curso Viver de IA</strong>.",
  "Compra realizada: <strong>Ideias de Negócios com IA 2026</strong> — Belo Horizonte.",
  "Pedido confirmado de Salvador: <strong>Curso TikTok Shop</strong>.",
  "Compra feita agora: <strong>Crie seu próprio SaaS com IA</strong> — Recife."
];

// FUNÇÃO QUE MOSTRA O POPUP
function mostrarPopup() {
  const popup = document.getElementById("popupCompra");
  const texto = document.getElementById("popupTexto");

  if (!popup || !texto) return; // proteção se html faltar

  // seleciona mensagem aleatória
  const msg = mensagensPopup[Math.floor(Math.random() * mensagensPopup.length)];

  texto.innerHTML = msg;
  popup.classList.add("show");

  // remove depois de 6 segundos
  setTimeout(() => {
    popup.classList.remove("show");
  }, 6000);

  // agenda próxima exibição entre 20 e 45 segundos
  const intervalo = Math.floor(Math.random() * (45000 - 20000)) + 20000;
  setTimeout(mostrarPopup, intervalo);
}

// inicia 1º popup após 5 segundos
setTimeout(mostrarPopup, 5000);
