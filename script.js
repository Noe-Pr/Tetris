// Récupérez les paramètres de l'URL pour la difficulté et la vitesse de descente
const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty');
let dropInterval;

// Déterminez la vitesse de descente en fonction de la difficulté
switch (difficulty) {
  case 'easy':
    dropInterval = 40; // Niveau facile, vitesse de descente de 1000 ms (1 seconde)
    break;
  case 'medium':
    dropInterval = 25; // Niveau moyen, vitesse de descente de 800 ms (0,8 seconde)
    break;
  case 'hard':
    dropInterval = 10; // Niveau difficile, vitesse de descente de 600 ms (0,6 seconde)
    break;
  default:
    // Redirigez l'utilisateur vers la page de sélection de la difficulté si la difficulté n'est pas valide
    window.location.href = 'index.html';
}

// Définit les matrices pour chaque forme tétris.
const formes = {
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  'J': [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'L': [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  'O': [
    [1, 1],
    [1, 1],
  ],
  'S': [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  'Z': [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  'T': [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ]
};

// Associe des couleurs aux formes
const colors = {
  'I': 'cyan',
  'O': 'yellow',
  'T': 'purple',
  'S': 'green',
  'Z': 'red',
  'J': 'blue',
  'L': 'orange'
};

// Génère un nombre aléatoire
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Génère aléatoirement des formes (2 formes identiques ne peuvent pas se suivre)
const formeSequence = [];

function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    formeSequence.push(name);
  }
}

// Définir la prochaine forme
function getNextforme() {
  if (formeSequence.length === 0) {
    generateSequence();
  }

  const name = formeSequence.pop();
  const matrix = formes[name];
  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === 'I' ? -1 : -2;

  return {
    name: name,
    matrix: matrix,
    row: row,
    col: col
  };
}

// Effectue une rotation d'une matrice
function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - j][i])
  );

  return result;
}

// Définit une fonction pour vérifier si un mouvement est valide.
function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && (
        cellCol + col < 0 ||
        cellCol + col >= playfield[0].length ||
        cellRow + row >= playfield.length ||
        playfield[cellRow + row][cellCol + col])
      ) {
        return false;
      }
    }
  }

  return true;
}

// Met une forme sur le jeu (fait apparaître la forme durant la partie)
function placeforme() {
  for (let row = 0; row < forme.matrix.length; row++) {
    for (let col = 0; col < forme.matrix[row].length; col++) {
      if (forme.matrix[row][col]) {
        if (forme.row + row < 0) {
          return showGameOver();
        }
        playfield[forme.row + row][forme.col + col] = forme.name;
      }
    }
  }

  forme = getNextforme();
  score += 10; // Ajoute 10 points à chaque nouvelle forme
  updateScore();
}

// Fonction pour vérifier si une ligne est complète
function isRowComplete(row) {
  for (let col = 0; col < playfield[row].length; col++) {
    if (playfield[row][col] === 0) {
      return false; // La ligne n'est pas complète
    }
  }
  return true; // La ligne est complète
}

// Fonction pour supprimer une ligne complète
function removeRow(row) {
  for (let r = row; r >= 0; r--) {
    for (let col = 0; col < playfield[r].length; col++) {
      playfield[r][col] = playfield[r - 1][col];
    }
  }
  // Remplit la première ligne avec des zéros
  for (let col = 0; col < playfield[0].length; col++) {
    playfield[0][col] = 0;
  }

  // Ajoute le bonus au score
  bonus += 20;
  updateScore();
}

// Affiche l'écran de fin de jeu
function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;

  context.fillStyle = 'rgba(0, 0, 0, 0.7)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 1;
  context.fillStyle = 'white';
  context.font = '36px Montserrat';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('GAME OVER !', canvas.width / 2, canvas.height / 2 - 30);

  // Show the "Recommencer" button below the "Game Over" message
  document.getElementById('restart-button-container').style.display = 'block';
}

// Fonction pour mettre à jour l'affichage du score
function updateScore() {
  const scoreDisplay = document.getElementById('score-display');
  scoreDisplay.textContent = 'Score : ' + (score + bonus);
  scoreDisplay.style.textAlign = 'center'; // Ajustez le style du score si nécessaire
}

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32;
const playfield = [];
let score = 0; // Initialise le score
let bonus = 0; // Initialise le bonus

// Remet le jeu à zéro
for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

let count = 0;
let forme = getNextforme();
let rAF = null;
let gameOver = false;

// Variable pour suivre l'état de la pause
let isPaused = false;

// Fonction pour mettre en pause ou reprendre le jeu
function togglePause() {
  isPaused = !isPaused;
  if (!gameOver) {
    if (isPaused) {
      cancelAnimationFrame(rAF); // Arrête la boucle de jeu
      // Assombrir l'écran et afficher le texte Pause
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = 'white';
      context.font = '40px Montserrat';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('Pause', canvas.width / 2, canvas.height / 2 - 30);

      context.font = '24px Montserrat';
      context.fillText('Cliquez pour reprendre', canvas.width / 2, canvas.height / 2 + 20);
    } else {
      rAF = requestAnimationFrame(loop); // Reprend la boucle de jeu
      context.clearRect(0, 0, canvas.width, canvas.height); // Efface l'écran sombre
    }
  }
}

// Gestionnaire d'événements pour le bouton "Pause"
document.getElementById('pause-button').addEventListener('click', function () {
  togglePause();
});

// Gestionnaire d'événements pour le bouton "Quitter"
document.getElementById('quit-button').addEventListener('click', function () {
  window.location.href = 'index.html';
});

// Gestionnaire d'événements pour le bouton "Recommencer"
document.getElementById('restart-button').addEventListener('click', function () {
  // Reset the game variables
  gameOver = false;
  score = 0;
  bonus = 0;
  updateScore();

  // Clear the playfield
  for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }

  // Start the game loop again
  rAF = requestAnimationFrame(loop);
  document.getElementById('restart-button-container').style.display = 'none';
});

document.addEventListener('keydown', function (e) {
  // Gestion des touches du clavier uniquement lorsque le jeu n'est pas en pause
  if (!isPaused) {
    if (e.keyCode === 37 || e.keyCode === 39) {
      const col = e.keyCode === 37
        ? forme.col - 1
        : forme.col + 1;

      if (isValidMove(forme.matrix, forme.row, col)) {
        forme.col = col;
      }
    }

    if (e.keyCode === 38) {
      const matrix = rotate(forme.matrix);
      if (isValidMove(matrix, forme.row, forme.col)) {
        forme.matrix = matrix;
      }
    }

    if (e.keyCode === 40) {
      const row = forme.row + 1;

      if (!isValidMove(forme.matrix, row, forme.col)) {
        forme.row = row - 1;
        placeforme();

        // Vérifie et supprime les lignes complètes
        for (let row = playfield.length - 1; row >= 0; ) {
          if (isRowComplete(row)) {
            removeRow(row);
          } else {
            row--;
          }
        }
        return;
      }

      forme.row = row;
    }
  }
});

// Boucle de jeu
function loop() {
  if (!isPaused) {
    rAF = requestAnimationFrame(loop);

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Dessine les cases du terrain de jeu avec les formes
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        if (playfield[row][col]) {
          const name = playfield[row][col];
          context.fillStyle = colors[name];
          context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
        }
      }
    }

    if (forme) {
      if (++count > dropInterval) {
        forme.row++;
        count = 0;

        if (!isValidMove(forme.matrix, forme.row, forme.col)) {
          forme.row--;
          placeforme();

          // Vérifie et supprime les lignes complètes
          for (let row = playfield.length - 1; row >= 0; ) {
            if (isRowComplete(row)) {
              removeRow(row);
            } else {
              row--;
            }
          }
        }
      }

      context.fillStyle = colors[forme.name];

      for (let row = 0; row < forme.matrix.length; row++) {
        for (let col = 0; col < forme.matrix[row].length; col++) {
          if (forme.matrix[row][col]) {
            context.fillRect((forme.col + col) * grid, (forme.row + row) * grid, grid - 1, grid - 1);
          }
        }
      }
    }
  }
}

// Initialise l'affichage du score
updateScore();

rAF = requestAnimationFrame(loop);
