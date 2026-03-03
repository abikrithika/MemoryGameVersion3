let firstCard = null;
let secondCard = null;
let lockBoard = false;

let revealCount = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;
let score = 0;
const FLIP_BACK_DELAY = 1500;

const LEVELS = {
  1: { pairs: 6, time: 50, columns: 4 }, // 12 cards
  2: { pairs: 8, time: 70, columns: 4 }, // 16 cards
  3: { pairs: 10, time: 100, columns: 5 }, // 20 cards
};

const revealDisplay = document.getElementById("reveal-count");
const timerDisplay = document.getElementById("timer");

const restartBtn = document.getElementById("restart-btn");

const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popup-message");
const popupClose = document.getElementById("popup-close");

let cards = [];
let idCounter = 1;

let level = 1;
let timeLimit = LEVELS[level].time;

const scoreModal = document.getElementById("score-modal");
const finalScoreText = document.getElementById("final-score-text");
const saveScoreBtn = document.getElementById("save-score-btn");
const playerNameInput = document.getElementById("player-name");

const leaderboardBtn = document.getElementById("leaderboard-btn");
const leaderboardContainer = document.getElementById("leaderboard");

popupClose.addEventListener("click", () => {
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

function fetchCardsAndStart() {
  const pairs = LEVELS[level].pairs;
  timeLimit = LEVELS[level].time;

  fetch(`http://localhost:3000/api/cards?level=${level}&limit=${pairs}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch cards");
      }
      return res.json();
    })
    .then((data) => {
      if (!data || data.length === 0) {
        console.error("No cards returned from API");
        showPopup("⚠️ No cards found for this level!", "error");
        return;
      }

      cards = data;
      updateGrid();
      restartGame();
    })
    .catch((err) => {
      console.error("Error fetching cards:", err);
      showPopup("⚠️ Failed to load cards!", "error");
    });
}
fetchCardsAndStart();

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

    if (timer >= timeLimit) {
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

    const efficiency = cards.length / revealCount;
    score = Math.floor((timeLimit - timer) * 10 * efficiency);

    finalScoreText.textContent = `Time: ${timer}s | Reveals: ${revealCount} | Score: ${score}`;

    scoreModal.classList.remove("hidden");
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
function showPopup(message, type = "info") {
  popupMessage.textContent = message;

  popup.classList.remove("hidden");

  // Remove previous type styles
  popup.classList.remove("success", "error");

  // Add new type style
  if (type === "success") {
    popup.classList.add("success");
  }

  if (type === "error") {
    popup.classList.add("error");
  }
}

popupClose.addEventListener("click", () => {
  popup.classList.add("hidden");
});

saveScoreBtn.addEventListener("click", async () => {
  const playerName = playerNameInput.value.trim();

  if (!playerName) {
    showPopup("⚠️ Please enter your astronaut name!", "error");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/save-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player: playerName,
        score: score,
        level: level,
        time: timer,
      }),
    });

    if (!res.ok) throw new Error("Failed to save score");

    await res.json();

    scoreModal.classList.add("hidden");
    playerNameInput.value = "";

    showPopup("🚀 Score Saved Successfully!", "success");
  } catch (err) {
    console.error("Save Score Error:", err);
    showPopup("⚠️ Error Saving Score. Try again.", "error");
  }
});

function clearBoard() {
  while (board.firstChild) {
    board.removeChild(board.firstChild);
  }
}
function updateGrid() {
  const columns = LEVELS[level].columns;
  board.style.gridTemplateColumns = `repeat(${columns}, 100px)`;
}
document.querySelectorAll(".level-controls button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".level-controls button")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    level = parseInt(btn.dataset.level);
    fetchCardsAndStart();
  });
});

leaderboardBtn.addEventListener("click", async () => {
  try {
    // Toggle visibility first
    leaderboardContainer.classList.toggle("active");

    // If already visible, just close it
    if (!leaderboardContainer.classList.contains("active")) {
      return;
    }

    const res = await fetch("http://localhost:3000/api/leaderboard");

    if (!res.ok) throw new Error("Failed to fetch leaderboard");

    const data = await res.json();

    while (leaderboardContainer.firstChild) {
      leaderboardContainer.removeChild(leaderboardContainer.firstChild);
    }

    const title = document.createElement("h3");
    title.textContent = "🏆 Top 10 Players";
    leaderboardContainer.appendChild(title);

    if (data.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No scores yet!";
      leaderboardContainer.appendChild(empty);
    } else {
      data.forEach((player, index) => {
        const row = document.createElement("p");
        row.textContent =
          `${index + 1}. ${player.player} - ${player.score} pts (Level ${player.level})`;
        leaderboardContainer.appendChild(row);
      });
    }

  } catch (err) {
    console.error("Leaderboard Error:", err);
    showPopup("⚠️ Could not load leaderboard", "error");
  }
});