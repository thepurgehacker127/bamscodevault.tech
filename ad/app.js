const revealItems = document.querySelectorAll(".reveal");
const statNumbers = document.querySelectorAll(".stat-number");
const rotatingText = document.getElementById("rotatingText");

const phrases = [
  "Businesses That Need More Attention",
  "Brands That Want A Stronger Presence",
  "Entrepreneurs Ready To Look More Professional",
  "Creators Who Need A Better Website"
];

let phraseIndex = 0;
let countersStarted = false;

function revealOnScroll() {
  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      item.classList.add("active");
    }
  });
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute("data-target"), 10);
  let current = 0;
  const increment = Math.max(1, Math.ceil(target / 60));

  function update() {
    current += increment;
    if (current >= target) current = target;

    if (target === 100) {
      element.textContent = `${current}%`;
    } else {
      element.textContent = `${current}+`;
    }

    if (current < target) {
      requestAnimationFrame(update);
    }
  }

  update();
}

function startCountersIfVisible() {
  const visible = [...statNumbers].some((item) => {
    const rect = item.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  });

  if (visible && !countersStarted) {
    statNumbers.forEach((item) => animateCounter(item));
    countersStarted = true;
  }
}

function rotateText() {
  if (!rotatingText) return;

  phraseIndex = (phraseIndex + 1) % phrases.length;
  rotatingText.style.opacity = "0";

  setTimeout(() => {
    rotatingText.textContent = phrases[phraseIndex];
    rotatingText.style.opacity = "1";
  }, 250);
}

window.addEventListener("load", () => {
  revealOnScroll();
  startCountersIfVisible();
});

window.addEventListener("scroll", () => {
  revealOnScroll();
  startCountersIfVisible();
});

setInterval(rotateText, 2600);