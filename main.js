const paragraphs = [
  { text: "Tralalero Tralala", model: "tralalero" },
  { text: "Tung Tung Tung Sahur", model: "sahur" },
  { text: "Bombardiro Crocodilo", model: "bombardiro" },
  { text: "Brr Brr Patapim", model: "brr" },
  { text: "Chimpanzini Bananini", model: "bananini" },
  { text: "Bobrini Cocosini", model: "bobrini" },
  { text: "Ballerina Cappuccina", model: "ballerina" },
  { text: "Udin Din Din Dun Madin Din Din Dun", model: "udin" },
  { text: "Lirili Larila", model: "lirili" },
];

const typingText = document.querySelector(".typing-text p");
const inpField = document.querySelector(".input-field");
const tryAgainBtn = document.querySelector(".content button");
const timeTag = document.querySelector(".time span b");
const wpmTag = document.querySelector(".wpm span");
const scoreTag = document.querySelector(".score span");
const modelWrapper = document.querySelector(".model-wrapper");

let timer;
let maxTime = 30;
let timeLeft = maxTime;
let charIndex = 0;
let isTyping = false;
let score = 0;
let wpm;
let totalCharsTyped = 0;
let totalElapsedTime = 0;
let shuffledParagraphs = [];
let currentParagraphIndex = 0;

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function loadParagraph() {
  if (currentParagraphIndex >= shuffledParagraphs.length) {
    showPopover(`All paragraphs completed!<br>Final Score: ${score}<br>WPM: ${wpm}`);
    inpField.disabled = true;
    clearInterval(timer);
  }

  const paragraphData = shuffledParagraphs[currentParagraphIndex];
  currentParagraphIndex++;

  typingText.innerHTML = "";
  paragraphData.text.split("").forEach((char) => {
    typingText.innerHTML += `<span>${char}</span>`;
  });

  typingText.querySelector("span").classList.add("active");

  modelWrapper.innerHTML = `
    <model-viewer 
      src="assets/models/${paragraphData.model}.glb" 
      alt="A 3D model"
      ar 
      auto-rotate 
      camera-controls
      id="model"
      style="width: 100%; height: 300px;">
    </model-viewer>`;
}

function initTyping(e) {
  const characters = typingText.querySelectorAll("span");
  const typedChar = inpField.value[charIndex];

  if (!isTyping) {
    timer = setInterval(initTimer, 1000);
    isTyping = true;
  }

  // BACKSPACE HANDLING
  if (e.inputType === "deleteContentBackward") {
    if (charIndex > 0) {
      charIndex--;
      characters[charIndex].classList.remove("correct", "incorrect");
      characters[charIndex].classList.add("active");
      characters[charIndex + 1]?.classList.remove("active");
    }
    updateWPM();
    return;
  }

  const currentChar = characters[charIndex];
  if (typedChar == null) return;

  // ⛔ Strict space handling
  if (currentChar.innerText === " " && e.data !== " ") {
    // Don't accept anything except an actual space key
    inpField.value = inpField.value.slice(0, -1); // Remove the wrong input
    return;
  }

  // ✅ Correct character
  if (typedChar === currentChar.innerText) {
    currentChar.classList.add("correct");
    score++;
    totalCharsTyped++;
    scoreTag.innerText = score;
  } else {
    currentChar.classList.add("incorrect");
    if (score > 0) score--;
    scoreTag.innerText = score;
  }

  currentChar.classList.remove("active");
  charIndex++;

  if (charIndex < characters.length) {
    characters[charIndex].classList.add("active");
  } else {
    loadNextParagraph();
  }

  updateWPM();
}


function updateWPM() {
  totalElapsedTime = maxTime - timeLeft;
  wpm = Math.round((totalCharsTyped / 5 / totalElapsedTime) * 60);
  wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
  wpmTag.innerText = wpm;
}

function loadNextParagraph() {
  charIndex = 0;
  inpField.value = "";
  loadParagraph();
}

function initTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timeTag.innerText = timeLeft;
    updateWPM();
  } else {
    clearInterval(timer);
    inpField.disabled = true;
    showPopover(`Time's up!<br>Final Score: ${score}<br>WPM: ${wpm}`);
  }
}

function resetGame() {
  clearInterval(timer);
  timeLeft = maxTime;
  timeTag.innerText = timeLeft;
  charIndex = isTyping = score = 0;
  inpField.value = "";
  // wpmTag.innerText = 0;
  totalCharsTyped = 0;
  totalElapsedTime = 0;
  scoreTag.innerText = 0;
  shuffledParagraphs = shuffle([...paragraphs]);
  currentParagraphIndex = 0;
  loadParagraph();
  inpField.disabled = false;
  wpmTag.innerText = 0;
}

function showPopover(message) {
  const popover = document.getElementById("game-popover");
  const popoverMsg = document.getElementById("popover-message");
  popoverMsg.innerHTML = message;
  popover.showPopover();
}

shuffledParagraphs = shuffle([...paragraphs]);
loadParagraph();
inpField.addEventListener("input", (e) => initTyping(e));
tryAgainBtn.addEventListener("click", resetGame);
document.addEventListener("keydown", () => inpField.focus());
typingText.addEventListener("click", () => inpField.focus());
