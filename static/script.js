// === DOM Elements ===
const gameArea = document.getElementById('game-area');
const healthBar = document.getElementById('health');
const startMessage = document.getElementById('start-message');
const spaceship = document.getElementById('spaceship');
const shieldVisual = document.getElementById('shield-visual');
const shootSound = document.getElementById('shoot-sound');
const explosionSound = document.getElementById('explosion-sound');
const bossSound = document.getElementById('boss-sound');
const bossWarning = document.getElementById('boss-warning');

// === Game State ===
let words = [];         // Active enemies (words)
let bullets = [];       // Active bullets
let shields = [];       // Falling shield pickups
let spawnInterval;      
let moveInterval;       
let bossInterval;
let health = 1000;
let shieldActive = false;
let shieldTimeout = null;
let gameSpeed = 0.0001;
let activeTarget = null;     // Which word player is typing
let activeTargetProgress = 0; // How many letters typed correctly

// === Word List ===
const wordList = [
  "rocket", "galaxy", "gravity", "planet", "universe", "meteor",
  "asteroid", "satellite", "comet", "orbit", "launch", "blackhole", "nebula"
];

// === START GAME ===
function startGame() {
  startMessage.style.display = 'none'; // Hide start text
  health = 1000;
  gameSpeed = 0.000005;
  updateHealth();
  words = [];
  bullets = [];
  shields = [];
  clearIntervals();
  spawnInterval = setInterval(spawnWord, 2000);
  moveInterval = setInterval(moveEverything, 30);
  bossInterval = setInterval(spawnBoss, 30000); // Boss every 30s
}

// === CLEAR OLD INTERVALS ===
function clearIntervals() {
  clearInterval(spawnInterval);
  clearInterval(moveInterval);
  clearInterval(bossInterval);
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// === SPAWN A NORMAL WORD OR SHIELD ===
function spawnWord() {
  if (Math.random() < 0.1) {
    spawnShield(); // 10% chance to spawn a shield
    return;
  }
  const word = wordList[Math.floor(Math.random() * wordList.length)];
  const x = Math.random() * (window.innerWidth - 100);
  const el = document.createElement('div');
  el.className = 'word';
  el.style.left = `${x}px`;
  el.textContent = word;
  gameArea.appendChild(el);

  words.push({
    text: word,
    element: el,
    x: x,
    y: 0,
    speed: 1 + Math.random() * 2 * gameSpeed,
    hp: 1,
    isBoss: false
  });
}

// === SPAWN SHIELD PICKUP ===
function spawnShield() {
  const x = (window.innerWidth / 2) - 20; // Center of screen minus half the width of the shield (40px / 2)
  const el = document.createElement('img');
  el.src = '/assets/Force.gif';
  el.style.position = 'absolute';
  el.style.width = '40px';
  el.style.top = '0px';
  el.style.left = `${x}px`;
  el.style.zIndex = 2;
  gameArea.appendChild(el);

  shields.push({
    element: el,
    x: x,
    y: 0,
    speed: 2
  });
}

// === MOVE EVERYTHING: Words, Shields, Bullets ===
function moveEverything() {
  gameSpeed += 0.0005; // Gradually increase difficulty

  // Move words
  for (let word of words) {
    word.y += word.speed;
    word.element.style.top = `${word.y}px`;

    if (word.y > window.innerHeight - 50) {
      destroyWord(word, false);
      if (!shieldActive) damagePlayer(20);
    }
  }

  // Move shields
  for (let shield of shields) {
    shield.y += shield.speed;
    shield.element.style.top = `${shield.y}px`;

    const rectShip = spaceship.getBoundingClientRect();
    const rectShield = shield.element.getBoundingClientRect();

    if (isColliding(rectShip, rectShield)) {
      activateShield();
      gameArea.removeChild(shield.element);
      shields = shields.filter(s => s !== shield);
    }
  }


  //===================================================================
  // === Move bullets toward live target ===
  for (let bullet of bullets) {
    if (!bullet.target) continue; // Bullet needs target

    // Get live position of target
    const targetRect = bullet.target.element.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    // Calculate vector to target
    const dx = targetX - bullet.x;
    const dy = targetY - bullet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
/*
    // If bullet close enough, consider it hit
    if (distance < 20) {
      // === NEW: Remove first character of target word ===
      let wordObj = bullet.target;
      wordObj.text = wordObj.text.substring(1); // Cut first letter
      if (wordObj.text.length === 0) {
        destroyWord(wordObj, true); // Explode if finished
      } else {
        wordObj.element.textContent = wordObj.text; // Update display
      }
    
      removeBullet(bullet); // Remove the bullet after hitting
      continue;
    }
    */

    // Move bullet toward target
    bullet.x += (dx / distance) * bullet.speed;
    bullet.y += (dy / distance) * bullet.speed;
    bullet.element.style.left = `${bullet.x}px`;
    bullet.element.style.top = `${bullet.y}px`;
  }

  // Clean up offscreen bullets
  //bullets = bullets.filter(b => b.y > -20 && b.y < window.innerHeight);


}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// === CHECK COLLISION BETWEEN SHIP AND SHIELD ===
function isColliding(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

// === ACTIVATE SHIELD ===
function activateShield() {
  shieldActive = true;
  shieldVisual.style.display = 'block';
  clearTimeout(shieldTimeout);

  shieldTimeout = setTimeout(() => {
    shieldActive = false;
    shieldVisual.style.display = 'none';
  }, 5000); // 5 seconds shield
}

// === SPAWN A BOSS ===
function spawnBoss() {
  bossWarning.style.display = 'block';
  bossSound.play();
  setTimeout(() => bossWarning.style.display = 'none', 2000);

  const word = wordList[Math.floor(Math.random() * wordList.length)] + ".";
  const x = Math.random() * (window.innerWidth - 150);
  const el = document.createElement('div');
  el.className = 'word boss';
  el.style.left = `${x}px`;
  el.textContent = word;
  gameArea.appendChild(el);

  words.push({
    text: word,
    element: el,
    x: x,
    y: 0,
    speed: 1 * gameSpeed,
    hp: 3,   // Boss needs 3 hits
    isBoss: true
  });
}

// === DESTROY WORD ===
function destroyWord(wordObj, isCorrect) {
  if (isCorrect) {
    createExplosion(wordObj.x, wordObj.y);
    explosionSound.play();
  }
  gameArea.removeChild(wordObj.element);
  words = words.filter(w => w !== wordObj);
}

// === CREATE EXPLOSION EFFECT ===
function createExplosion(x, y) {
  const boom = document.createElement('div');
  boom.className = 'explosion';
  boom.style.left = `${x}px`;
  boom.style.top = `${y}px`;
  boom.style.position = 'absolute';
  boom.textContent = '💥';
  gameArea.appendChild(boom);

  setTimeout(() => {
    gameArea.removeChild(boom);
  }, 500);
}
/*
// === REMOVE BULLET ===
function removeBullet(bullet) {
  gameArea.removeChild(bullet.element);
  bullets = bullets.filter(b => b !== bullet);
}*/

// === DAMAGE PLAYER ===
function damagePlayer(amount) {
  health -= amount;
  if (health <= 0) {
    health = 0;
    endGame();
  }
  updateHealth();
}

// === UPDATE HEALTH BAR ===
function updateHealth() {
  healthBar.style.width = `${health}%`;
}

// === END GAME ===
function endGame() {
  clearIntervals();
  alert("Game Over! Refresh to play again!");
}
/*
// === FIRE BULLET FROM SPACESHIP ===
function fireBullet() {
  const rect = spaceship.getBoundingClientRect();
  const bullet = document.createElement('div');
  bullet.className = 'bullet';
  bullet.style.left = `${rect.left + rect.width / 2}px`;
  bullet.style.top = `${rect.top}px`;
  gameArea.appendChild(bullet);

  bullets.push({
    element: bullet,
    x: rect.left + rect.width / 2,
    y: rect.top
  });

  shootSound.play();
}*/

// === GLOBAL KEYDOWN HANDLER ===
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase(); // normalize lowercase

  // If no active target word, find one
  if (!activeTarget) {
    //activeTarget = words.find(w => w.text.startsWith(key));
    activeTarget = words.find(w => w.text.toLowerCase().startsWith(key));
    activeTargetProgress = 0;
  }

  // If there is a target
  if (activeTarget) {
    //const expectedChar = activeTarget.text[activeTargetProgress].toLowerCase();
    const attemptedText = (activeTarget.text.substring(0, activeTargetProgress) + key).toLowerCase();

    //if (key === expectedChar) {
    if (activeTarget.text.toLowerCase().startsWith(attemptedText)) {
      fireBullet(); // Fire bullet on correct letter
      activeTargetProgress++;

      activeTarget.element.innerHTML =
        "<span style='color:cyan;'>" +
        activeTarget.text.substring(0, activeTargetProgress) +
        "</span>" +
        activeTarget.text.substring(activeTargetProgress);

        // Reset the sound to the beginning and play it again on each key press
        shootSound.currentTime = 0; // Reset to the beginning of the sound
        shootSound.play(); // Play the sound

      // Fully completed word
      if (activeTargetProgress >= activeTarget.text.length) {
        destroyWord(activeTarget, true);
        activeTarget = null;
        activeTargetProgress = 0;
      }
      else {

      }
    }
    else {
      // Mismatch: reset target and progress
      // Wrong letter -> cancel targeting
      activeTarget.element.innerHTML = activeTarget.text; // reset highlight
      /**/
      activeTarget = null;
      activeTargetProgress = 0;
      
    }
  }
});

// === START GAME ON ANY KEY ===
document.body.addEventListener('keydown', () => {
  if (startMessage.style.display !== 'none') {
    startGame();
  }
});

//==============================================================================================
// === FIRE BULLET FROM SPACESHIP - Now HOMING ===
function fireBullet() {
  const rect = spaceship.getBoundingClientRect();

  if (!activeTarget) return; // Safety: no target, no bullet

  const bullet = document.createElement('div');
  bullet.className = 'bullet';
  bullet.style.left = `${rect.left + rect.width / 2}px`;
  bullet.style.top = `${rect.top}px`;
  bullet.style.position = 'absolute';
  gameArea.appendChild(bullet);

  bullets.push({
    element: bullet,
    x: rect.left + rect.width / 2,
    y: rect.top,
    target: activeTarget, // 🧠 Save live reference to moving word!
    speed: 20
    
  });

  shootSound.currentTime = 0;
  shootSound.play();

  // Rotate ship toward target (optional if you want rotation)
  const targetRect = activeTarget.element.getBoundingClientRect();
  rotateSpaceshipToTarget(targetRect);
}


// === ROTATE SPACESHIP TOWARD TARGET ===
function rotateSpaceshipToTarget(targetRect) {
  const shipRect = spaceship.getBoundingClientRect();

  const dx = (targetRect.left + targetRect.width/2) - (shipRect.left + shipRect.width/2);
  const dy = (targetRect.top + targetRect.height/2) - (shipRect.top + shipRect.height/2);

  const angleRad = Math.atan2(dy, dx); // Get angle in radians
  const angleDeg = angleRad * 180 / Math.PI; // Convert to degrees

  // Rotate the spaceship using CSS transform
  spaceship.style.transform = `translateX(-50%) rotate(${angleDeg + 90}deg)`;
}

//=====================================================================================================
