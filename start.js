document.getElementById('easy-button').addEventListener('click', function () {
  startGame('easy', 40);
});

document.getElementById('medium-button').addEventListener('click', function () {
  startGame('medium', 25);
});

document.getElementById('hard-button').addEventListener('click', function () {
  startGame('hard', 10);
});

function startGame(difficulty, dropInterval) {
  window.location.href = 'tetris.html?difficulty=' + difficulty + '&dropInterval=' + dropInterval;
}
