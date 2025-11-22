// Referências aos botões
const btnOfferPhone = document.getElementById("btnOfferPhone");
const btnOfferIphone = document.getElementById("btnOfferIphone");
const statusBtn = document.getElementById("statusBtn");

// Simples animação de "waiting"
let dotCount = 0;
setInterval(() => {
  dotCount = (dotCount + 1) % 4;
  const dots = ".".repeat(dotCount);
  statusBtn.textContent = `⏳ WAITING FOR VERIFICATION${dots}`;
}, 800);

// Clique nos botões principais
btnOfferPhone.addEventListener("click", () => {
  startVerification("phone");
});

btnOfferIphone.addEventListener("click", () => {
  startVerification("iphone");
});

// Início da "verificação"
function startVerification(source) {
  statusBtn.classList.remove("completed");
  statusBtn.classList.add("verifying");
  statusBtn.textContent = "⏳ VERIFYING OFFER...";

  // LOG opcional – só para debug local
  console.log("Usuário clicou na oferta:", source);

  // ------- AQUI VOCÊ CHAMA O CONTENT LOCKER REAL --------
  openLocker();
}

// Função para abrir o Content Locker
function openLocker() {
  /* 
    QUANDO VOCÊ CRIAR O LOCKER (OGAds / CPAlead / etc):

    1. No painel da rede, crie um Content Locker.
    2. Eles vão te dar um código (tipo um <script> + um div).
    3. Existem duas opções comuns:

    (a) Locker em modo "URL":
        - Eles te dão uma URL pronta do tipo:
          https://seusubdomain.ogads.com/locker123
        - Aí você pode simplesmente mandar o usuário pra lá:
          window.location.href = "SUA_URL_DO_LOCKER";

    (b) Locker em modo "embutido (JS no site)":
        - Você cola o <script> deles em index.html
        - E chama a função que abre o locker aqui dentro.
        - Exemplo hipotético:
          if (typeof OGAds !== "undefined") {
            OGAds.showLocker();
          }

    Enquanto você ainda não tiver o código real,
    vou deixar só um alert simulando:
  */

  alert("Aqui entraria o Content Locker (OGAds / CPAlead). Cole o script conforme instruções da rede.");
}
