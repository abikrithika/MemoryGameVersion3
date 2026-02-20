let firstCard = null;
let secondCard = null;
let lockBoard = false;

let revealCount = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;

const FLIP_BACK_DELAY = 1500;
const TIME_LIMIT = 60;

const revealDisplay = document.getElementById("reveal-count");
const timerDisplay = document.getElementById("timer");

const restartBtn = document.getElementById("restart-btn");

const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popup-message");
const closePopup = document.getElementById("close-popup");

let cards = [];
let idCounter = 1;

closePopup.addEventListener("click", () => {
  popup.classList.add("hidden");
  restartGame();
});

function shuffleCards(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }
}
const board = document.getElementById("game-board");

fetch("http://localhost:3000/api/cards")
  .then((res) => res.json())
  .then((data) => {
    cards = data;
    startGame();
  })
  .catch((err) => console.error("Error fetching cards:", err));

function startGame() {
  clearBoard();
  idCounter = 1;

  const gameCards = cards.flatMap((obj) => [
    { ...obj, id: idCounter++ },
    { ...obj, id: idCounter++ },
  ]);

  shuffleCards(gameCards);

  gameCards.forEach(createCard);
}

restartBtn.addEventListener("click", restartGame);

function createCard(card) {
  const cardElement = document.createElement("div");
  cardElement.dataset.name = card.name;
  cardElement.classList.add("card");

  const cardInner = document.createElement("div");
  cardInner.classList.add("card-inner");

  const cardFront = document.createElement("div");
  cardFront.classList.add("card-front");

  const frontImg = document.createElement("img");
  frontImg.src = "images/cardFront.jpg";
  frontImg.alt = "CardFront";

  cardFront.appendChild(frontImg);

  const cardBack = document.createElement("div");
  cardBack.classList.add("card-back");

  const backImg = document.createElement("img");
  backImg.src = card.image;
  backImg.alt = card.name;

  cardBack.appendChild(backImg);

  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardElement.appendChild(cardInner);

  cardElement.addEventListener("click", handleClick);

  board.appendChild(cardElement);
}

function handleClick() {
  if (lockBoard) return;
  if (this === firstCard) return;
  if (this.classList.contains("matched")) return;
  if (!gameStarted) {
    startTimer();
    gameStarted = true;
    restartBtn.classList.remove("hidden");
  }

  this.classList.add("flipped");

  revealCount++;
  revealDisplay.textContent = revealCount;

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;
  checkForMatch();
}
function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");

    resetBoard();
  }, FLIP_BACK_DELAY);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}
function checkForMatch() {
  if (firstCard.dataset.name === secondCard.dataset.name) {
    disableCards();
  } else {
    unflipCards();
  }
}
function disableCards() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");

  setTimeout(() => {
    firstCard.classList.add("hidden");
    secondCard.classList.add("hidden");
    checkForWin();
    resetBoard();
  }, 500);
}
function startTimer() {
  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = timer;
    if (timer >= TIME_LIMIT) {
      clearInterval(timerInterval);
      lockBoard = true;
      showPopup("⏰ Mission Failed! The galaxy slipped away this time...");
    }
  }, 1000);
}
function checkForWin() {
  const matchedCards = document.querySelectorAll(".card.matched");
  if (matchedCards.length === cards.length * 2) {
    clearInterval(timerInterval);
    showPopup(`🌟 Stellar Memory! 
You conquered space in ${timer}s 
with ${revealCount} reveals!`);
  }
}
function restartGame() {
  clearInterval(timerInterval);
  revealCount = 0;
  timer = 0;
  gameStarted = false;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  revealDisplay.textContent = 0;
  timerDisplay.textContent = 0;
  restartBtn.classList.add("hidden");
  clearBoard();
  idCounter = 1;

  startGame();
}
function showPopup(message) {
  popupMessage.textContent = message;
  popup.classList.remove("hidden");
}

function clearBoard() {
  while (board.firstChild) {
    board.removeChild(board.firstChild);
  }
}
