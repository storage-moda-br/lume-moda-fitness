// MENU MOBILE
const openMenu = document.getElementById("openMenu");
const closeMenu = document.getElementById("closeMenu");
const menuMobile = document.getElementById("menuMobile");

openMenu.onclick = () => menuMobile.classList.add("open");
closeMenu.onclick = () => menuMobile.classList.remove("open");


// LISTA DE PRODUTOS (20 PRODUTOS COMPLETOS)
const produtos = [

  { nome:"Copo Térmico Bambu Azul",
    categoria:"COPOS TÉRMICOS",
    desc:"Copo térmico com base bambu, ideal para uso diário.",
    imagem:"prod1.jpg"
  },

  { nome:"Garrafa Plástica Azul 700ml",
    categoria:"SQUEEZES E GARRAFAS",
    desc:"Garrafa leve e resistente com tampa inox.",
    imagem:"prod2.jpg"
  },

  { nome:"Taça Térmica Inox Preta",
    categoria:"COPOS TÉRMICOS",
    desc:"Taça térmica elegante, parede dupla.",
    imagem:"prod3.jpg"
  },

  { nome:"Copo Térmico Slim Azul",
    categoria:"COPOS TÉRMICOS",
    desc:"Modelo slim com tampa rosqueável.",
    imagem:"prod4.jpg"
  },

  { nome:"Pasta Notebook Azul 15''",
    categoria:"MOCHILAS E PASTAS",
    desc:"Pasta acolchoada com zíper frontal.",
    imagem:"prod5.jpg"
  },

  { nome:"Bloco Executivo com Caneta",
    categoria:"BLOCOS E CADERNETAS",
    desc:"Bloco elegante com capa sintética preta.",
    imagem:"prod6.jpg"
  },

  { nome:"Garrafa Inox Rosé",
    categoria:"SQUEEZES E GARRAFAS",
    desc:"Garrafa térmica inox rosé premium.",
    imagem:"prod7.jpg"
  },

  { nome:"Copo Slim Azul",
    categoria:"COPOS TÉRMICOS",
    desc:"Copo térmico slim com tampa superior.",
    imagem:"prod8.jpg"
  },

  { nome:"Copo Slim Vermelho",
    categoria:"COPOS TÉRMICOS",
    desc:"Modelo slim moderno e colorido.",
    imagem:"prod9.jpg"
  },

  { nome:"Squeeze Inox e Acrílico",
    categoria:"SQUEEZES E GARRAFAS",
    desc:"Squeeze misto inox e acrílico 600ml.",
    imagem:"prod10.jpg"
  },

  { nome:"Garrafa Fumê 600ml",
    categoria:"SQUEEZES E GARRAFAS",
    desc:"Garrafa fosca com alça lateral.",
    imagem:"prod11.jpg"
  },

  { nome:"Garrafa Premium Verde Água",
    categoria:"SQUEEZES E GARRAFAS",
    desc:"Garrafa metálica minimalista 500ml.",
    imagem:"prod12.jpg"
  },

  { nome:"Garrafa Premium Verde",
    categoria:"SQUEEZES E GARRAFAS",
    desc:"Garrafa metálica verde moderna.",
    imagem:"prod13.jpg"
  },

  { nome:"Garrafa Vermelha com Inox",
    categoria:"SQUEEZES E GARRAFAS",
    desc:"Garrafa colorida com base em inox.",
    imagem:"prod14.jpg"
  },

  { nome:"Garrafa Térmica Madeira",
    categoria:"SQUEEZES E GARRAFAS",
    desc:"Termo com tampa digital de temperatura.",
    imagem:"prod15.jpg"
  },

  { nome:"Copo Térmico Preto Slim",
    categoria:"COPOS TÉRMICOS",
    desc:"Copo térmico preto, parede dupla inox.",
    imagem:"prod16.jpg"
  },

  { nome:"Garrafa Inox com Tampa Bambu",
    categoria:"SQUEEZES E GARRAFAS",
    desc:"Garrafa premium com tampa de bambu.",
    imagem:"prod17.jpg"
  },

  { nome:"Pasta Notebook Azul",
    categoria:"MOCHILAS E PASTAS",
    desc:"Pasta clássica com alça reforçada.",
    imagem:"prod18.jpg"
  },

  { nome:"Caderno Executivo Preto",
    categoria:"BLOCOS E CADERNETAS",
    desc:"Caderno executivo com acabamento premium.",
    imagem:"prod19.jpg"
  },

  { nome:"Garrafa Inox Rosé Metal",
    categoria:"SQUEEZES E GARRAFAS",
    desc:"Garrafa inox rosé com alça metálica.",
    imagem:"prod20.jpg"
  },

];


// RENDERIZAÇÃO DOS PRODUTOS
const lista = document.getElementById("listaProdutos");

produtos.forEach(p => {
    lista.innerHTML += `
        <div class="produto">

            <div class="produto-img-box">
                <img src="${p.imagem}">
            </div>

            <div class="categoria">${p.categoria}</div>

            <h3>${p.nome}</h3>

            <div class="prod-desc">${p.desc}</div>

        </div>
    `;
});
