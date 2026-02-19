let firstCard = null;
let secondCard = null;
let lockBoard = false;

const cards = [
  { id: 1, name: "Rocket", image: "images/rocket.jfif" },
  { id: 2, name: "Moon", image: "images/moon.jfif" },
  { id: 3, name: "Star", image: "images/star.webp" },
  { id: 4, name: "Comet", image: "images/comet.jfif" },
  { id: 5, name: "Sun", image: "images/sun.jfif" },
  { id: 6, name: "Planets", image: "images/planets.jpg" },
];
let idCounter = 1;

const gameCards = cards.flatMap((obj) => [
  { ...obj, id: idCounter++ },
  { ...obj, id: idCounter++ },
]);
shuffleCards(gameCards);
function shuffleCards(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }
}
const board = document.getElementById("game-board");

gameCards.forEach((card) => {
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
});

function handleClick() {
  if (lockBoard) return;
  if (this === firstCard) return;
  if (this.classList.contains("matched")) return;
  this.classList.add("flipped");
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
  }, 1000);
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
    resetBoard();
  }, 500);
}
