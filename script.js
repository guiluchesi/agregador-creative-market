const vo = require('vo');
const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true });
const dados = require('./dados.js');

const adicionaNoBoard = () => {
    var boardName = "Testes";
    var boards = document.querySelectorAll('ul div[role="button"]');
    var getButton = false;

    boards.forEach(function(board){
      if (board.querySelector('p').innerText == boardName && !getButton){
          getButton = true;
          board.querySelector('button').click();
      }
    });
};

const getProdutoNovo = produto => {
  return nightmare => nightmare
    .goto(`https://br.pinterest.com/pin/create/button/?media=${produto.image}&description=${produto.description}&url=${produto.url}?u=caiocall`)
    .wait('ul div[role="button"]')
    .evaluate(adicionaNoBoard)
    .then(() => console.log('Castor'));
};

const creativeMarket = function * () {
  let arrayDeProdutos;

  console.log('Logando no Pinterest');
  yield nightmare
    .goto('https://br.pinterest.com/')
    .wait()
    .type('form input[type="email"]', dados.pinterest.user)
    .type('form input[type="password"]', dados.pinterest.senha)
    .click('form button')
    .wait(3000);

  console.log('Acessando o Creative Market');
  yield nightmare
    .goto('https://creativemarket.com/');

  console.log('Coletando dados dos produtos');
  yield nightmare
    .wait('#popular-products .products')
    .evaluate(() => {
      let array = [];
      let itens = document.querySelectorAll('#popular-products .products li .btn-pinterest');

      itens.forEach(item => {
        array.push({
          image: encodeURIComponent(item.getAttribute('data-media')),
          description: encodeURIComponent(item.getAttribute('data-description')),
          url: encodeURIComponent(item.getAttribute('data-url')),
        });
      });

      return array;
    })
    .then(itens => {
      if(itens.length > 0) {
        console.log('Dados de produto coletados');
        arrayDeProdutos = itens;
        return;
      }

      console.error('Não foi possível coletar nenhum dado');
    });

    console.log('Começando o cadastro dos itens');
    for (var i = 0; i < arrayDeProdutos.length; i++) {
      const produtoAtual = arrayDeProdutos[i];
      yield nightmare
        .goto(`https://br.pinterest.com/pin/create/button/?media=${produtoAtual.image}&description=${produtoAtual.description}&url=${produtoAtual.url}?u=${dados.usuarioDeReferencia}`)
        .wait('ul div[role="button"]')
        .evaluate(adicionaNoBoard)
        .then(() => console.log(`Item ${decodeURIComponent(produtoAtual.description)} cadastrado`));
    }
};

vo(creativeMarket)((err, suc) => {
  if (err) console.log('Errou: ', err);
  console.log('Programa Finalizado');
});
