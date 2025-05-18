// Get references to DOM elements
const wordDisplay = document.getElementById("word-display"); // Element showing the word
const wordInput = document.getElementById("word-input"); // Where user types
const timeEl = document.getElementById("time"); // Timer
const scoreEl = document.getElementById("score"); // Score tracker
const accuracyEl = document.getElementById("accuracy"); // Accuracy %
const wpmEl = document.getElementById("wpm"); // Words per minute
const restartBtn = document.getElementById("restart-btn"); // Restart button
const music = document.getElementById("bg-music");


// Word list for the game
const words = [
  "banana", "computer", "sky", "javascript", "keyboard",
  "development", "monitor", "window", "python", "challenge"
];

// Game state variables
let currentWord = ""; // The word the user must type
let score = 0; // Number of correct words
let totalTyped = 0; // Total characters typed
let correctTyped = 0; // Correct characters typed
let timeLeft = 60; // Time countdown
let gameStarted = false; // Flag to detect if game started
let timerInterval; // Holds the timer reference

// Function to pick and display a random word
function showNewWord() {
  const randomIndex = Math.floor(Math.random() * words.length); // Get random index
  currentWord = words[randomIndex]; // Set current word
  wordDisplay.textContent = currentWord; // Show on screen
  wordInput.value = ""; // Clear input box
}

// Function to start the countdown timer
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--; // Decrease time
    timeEl.textContent = timeLeft; // Update UI
    if (timeLeft === 0) {
      clearInterval(timerInterval); // Stop timer
      endGame(); // Trigger game end
    }
  }, 1000); // Every second
}

// Function to end the game
function endGame() {
  wordInput.disabled = true; // Disable typing
  wordDisplay.textContent = "Time's up!"; // Game over message
}

// Function to reset and restart the game
function restartGame() {
  score = 0;
  totalTyped = 0;
  correctTyped = 0;
  timeLeft = 60;
  gameStarted = false;
  wordInput.disabled = false;
  wordInput.value = "";
  scoreEl.textContent = 0;
  timeEl.textContent = 60;
  accuracyEl.textContent = 100;
  wpmEl.textContent = 0;
  clearInterval(timerInterval);
  showNewWord();
}

// Function to update stats (accuracy and WPM)
function updateStats() {
  const accuracy = totalTyped === 0 ? 100 : Math.round((correctTyped / totalTyped) * 100); // Avoid divide-by-zero
  const elapsed = 60 - timeLeft; // Time passed
  const wpm = elapsed > 0 ? Math.round((score / elapsed) * 60) : 0; // Words per minute
  accuracyEl.textContent = accuracy;
  wpmEl.textContent = wpm;
}

// Event listener for typing
wordInput.addEventListener("input", () => {
  if (!gameStarted) {
    gameStarted = true;
    music.play();
    startTimer(); // Start timer on first input
  }

  const typedText = wordInput.value; // What user typed
  totalTyped += 1; // Track each input character

  if (currentWord.startsWith(typedText)) {
    correctTyped += 1; // If correct so far, increment correct chars
    wordInput.style.color = "green"; // Green for correct
  } else {
    wordInput.style.color = "red"; // Red if mismatch
  }

  if (typedText === currentWord) {
    score += 1; // Correct full word
    scoreEl.textContent = score; // Update score UI
    showNewWord(); // Show new word
  }

  updateStats(); // Update accuracy and WPM
});

// Restart button event
restartBtn.addEventListener("click", restartGame);

// Initialize the game
showNewWord(); // First word when page loads

