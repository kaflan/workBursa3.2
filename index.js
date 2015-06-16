window.addEventListener('load', function onLoad() {
  'use strict';
  var w1 = new WebSocket(gameUrls.list);
  var response;
  var ul = document.querySelector('.existing-games');
  var gameside;
  var playerId;
  var request2;
  var newGameButton = document.querySelector('.newGame');
  var createGameButton = document.querySelector('.createGame');
  var startGameDiv = document.querySelector('.startGame');
  var mainGameDiv = document.querySelector('.mainGame');
  var statusMEssage1 = startGameDiv.querySelector('.status-message');
  var statusMEssage2 = mainGameDiv.querySelector('.status-message');
  var data;
  var request1;
  var yourid;
  var Player;
  var field = document.querySelector('.field');
  var request3;
  var rows;
  var row;
  var cells;
  var cell;

  function addCells(size) {
    var id = 1;
    for (rows = 0; rows < size; rows++) {
      row = document.createElement('div');
      row.classList.add('row');
      field.appendChild(row);
      for (cells = 0; cells < size; cells++) {
        cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = id;
        id = id + 1;
        row.appendChild(cell);
      }
    }
  }

  function addToUl(liElem) {
    ul.appendChild(liElem);
  }

  function removeFromUl(elemId) {
    ul.removeChild(document.getElementById(elemId));
  }

  function createLiElem(elemId) {
    var li = document.createElement('li');
    li.id = elemId;
    li.innerHTML = elemId;
    li.addEventListener('click', function Connect(e) {
      yourid = e.target.id;
      w1.send(JSON.stringify({register: e.target.id}));
    });
    return li;
  }

  function startGame(pId) {
    statusMEssage1.innerHTML = 'Ожидаем начала игры';
    createGameButton.disabled = true;
    data = {player: pId, game: yourid};
    request2 = new XMLHttpRequest();
    request2.open('POST', gameUrls.gameReady);
    request2.setRequestHeader('Content-Type', 'application/json');
    request2.send(JSON.stringify(data));
    request2.addEventListener('readystatechange', function getResponse(resp) {
      if (resp.target.readyState === resp.target.DONE && resp.target.status === 200) {
        mainGameDiv.style.display = 'block';
        startGameDiv.style.display = 'none';
        Player = JSON.parse(resp.target.responseText).side;
        addCells(10);
      }
      if (resp.target.status === 410) {
        statusMEssage1.innerHTML = 'Ошибка старта игры: другой игрок не ответил';
      }
      statusMEssage1.innerHTML = 'Неизвестная ошибка старта игры';
    });
  }

  function createGame() {
    createGameButton.disabled = true;
    statusMEssage1.textContent = 'Ожидаем начала игры';
    request1 = new XMLHttpRequest();
    request1.open('POST', gameUrls.newGame);
    request1.send();
    request1.addEventListener('readystatechange', function getResponse(resp) {
      if (resp.target.readyState === 4) {
        if (resp.target.status === 200) {
          yourid = JSON.parse(resp.target.responseText).yourId;
          w1.send(JSON.stringify({register: yourid}));
        } else {
          createGameButton.disabled = false;
          statusMEssage1.innerHTML = 'Ошибка создания игры';
        }
      }
    });
    request3 = new XMLHttpRequest();
    request3.open('POST', gameUrls.gameReady);
    request3.setRequestHeader(yourId, playerId);
    request3.send();
    request3.addEventListener('readystatechange', function getResponse(res) {
      if (res.target.readyState === res.target.DONE) {
        if (res.target.status === 200) {
          gameside = JSON.parse(res.target.responseText).gameSide;
          console.log(gameside);
          startGameDiv.style.display = 'block';
          mainGameDiv.style.display = 'none';
        }
      }
      if (res.target.status === 410) {
        statusMEssage1.innerHTML = 'Ошибка старта игры: другой игрок не ответил';
      }
    });
  }

  function surrender() {
    request3 = new XMLHttpRequest();
    request3.open('PUT', gameUrls.surrender);
    request3.setRequestHeader(yourId, playerId);
    request3.send();
    request3.addEventListener('reabystatechenge', function getRes(resp) {
      if (resp.target.readyState === resp.target.DONE && resp.target.status === 200) {
        mainGameDiv.style.display = 'none';
        startGameDiv.style.display = 'block';
        console.log('ok!');
      }
      console.log(' not ok!');
      statusMEssage1.innerHTML = 'Неизвестная ошибка';
    });
  }

  function clickAction(event) {
    if (event.target.classList.contains('cell')) {
      if (event.target.classList.contains('x') ||
        event.target.classList.contains('o')) {
      }
      if (Player === 'x') {
        request3 = new XMLHttpRequest();
        request3.open('POST', gameUrls.move);
        request3.setRequestHeader('Content-Type', 'application/json');
        request3.setRequestHeader('Game-ID', yourid);
        request3.setRequestHeader('Player-ID', playerId);
        request3.send(JSON.stringify({move: event.target.id}));
        request3.addEventListener('readystatechange', function getResponse(resp) {
          if (resp.target.readyState === resp.target.DONE) {
            if (resp.target.status === 200) {
              event.target.classList.add('x');
            }
          }
          statusMEssage2.innerHTML = "ууууу";
        });
      }
      event.target.classList.add('o');
    }
  }

  w1.addEventListener('message', function wsMessage(e) {
    response = JSON.parse(e.data);
    if (response.action === 'add') {
      addToUl(createLiElem(response.id));
    }
    if (response.action === 'remove') {
      removeFromUl(response.id);
    }
    if (response.action === 'startGame') {
      playerId = response.id;
      console.log('startgame:  this' + playerId);
      startGame(playerId);
    }
    if (response.error === 'message') {
      sendError();
    }
  });

  createGameButton.addEventListener('click', createGame);


  newGameButton.addEventListener('click', surrender);
  field.addEventListener('click', clickAction);


});


