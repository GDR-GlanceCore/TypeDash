// Get references to DOM elements
const wordDisplay = document.getElementById("word-display"); // Element showing the word
const wordInput = document.getElementById("word-input"); // Where user types
const timeEl = document.getElementById("time"); // Timer
const scoreEl = document.getElementById("score"); // Score tracker
const accuracyEl = document.getElementById("accuracy"); // Accuracy %
const wpmEl = document.getElementById("wpm"); // Words per minute
const restartBtn = document.getElementById("restart-btn"); // Restart button
const music = document.getElementById("bg-music"); // Audio file for background music
const correctSound = document.getElementById("correct-sound"); // Sound for correct word
const wrongSound = document.getElementById("wrong-sound"); // Sound for wrong word


// Word list for the game
const words = [
  "banana", "computer", "sky", "javascript", "keyboard",
  "development", "monitor", "window", "python", "challenge",
  "planet", "launch", "orbit", "shield", "comet", "rocket", "galaxy", "nebula", "meteor", "asteroid",
  "satellite", "gravity", "telescope", "spaceship", "astronaut", "eclipse", "universe", "solarsystem",
  "blackhole", "lightyear", "cosmos", "supernova", "star", "quasar", "wormhole", "terraform", "moonbase",
  "mars", "venus", "jupiter", "uranus", "neptune", "pluto", "mercury", "photon", "beam", "blaster",
  "probe", "reentry", "capsule", "module", "oxygen", "fuelcell", "trajectory", "booster", "gravitywell",
  "thruster", "navigation", "commlink", "telemetry", "scanner", "docking", "payload", "liftoff", "burn",
  "delta", "airlock", "rover", "suit", "mission", "command", "launchpad", "escape", "engine", "turret",
  "deflector", "ion", "raygun", "gamma", "tachyon", "antimatter", "nanobot", "cybernetics", "android",
  "spacesuit", "vacuum", "deepfield", "nebular", "solarflare", "darkmatter", "singularity", "timeline",
  "parallax", "asterism", "eventhorizon", "boosterjet", "quantum", "hyperdrive", "skywalker", "starlord",
  "voyager", "pulsar", "cometdust", "launchcode", "dockingbay", "extravehicular", "redshift", "zenith",
  "aphelion", "perihelion", "nova", "aurora", "crater", "spacedust", "microgravity", "plasma", "hubble",
  "exoatmosphere", "drone", "freighter", "hyperspace", "mech", "drivetrain", "airthruster", "battlesuit",
  "turbojet", "commandship", "spacewalk", "cryosleep", "blackbox", "jumpgate", "transmission", "uplink",
  "scannerarray", "chronometer", "distortion", "overload", "fusion", "stasis", "ionstorm", "sunspot",
  "solarpanel", "repairbot", "manifold", "cargo", "containment", "stellarwind", "interstellar", "flare",
  "circuitry", "gravitylock", "helmet", "basecamp", "flareburst", "commslink", "modulator", "vent",
  "launchsequence", "thrusterjet", "radiowave", "accelerator", "geosync", "clustermap", "drift", "magnetosphere",
  "supersymmetry", "beacon", "sensorarray", "outpost", "relay", "arraycore", "station", "hull", "cosmonaut",
  "spacesignal", "expedition", "remotepilot", "trajectorylock", "cosmic", "lifesupport", "artificial", "modulelink",
  "skygrid", "fleet", "subsystem", "flightdeck", "solarstorm", "starcore", "quantumwell", "thermalscan", "vortex",
  "ionflux", "transwarp", "orbitalpath", "gravwell", "computron", "metaverse", "dimension", "eventcore",
  "gravitycore", "timepulse", "chronos", "ionbeam", "dronepod", "commandlink", "controlhub", "navcomp"

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
  wordInput.focus();
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
    wordInput.style.color = "lime"; // Green for correct
    correctSound.currentTime = 0; // Reset sound
    correctSound.play(); // Play correct sound
  } else {
    wordInput.style.color = "red"; // Red if mismatch
    wrongSound.currentTime = 0; // Reset sound
    wrongSound.play(); // Play wrong sound
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

