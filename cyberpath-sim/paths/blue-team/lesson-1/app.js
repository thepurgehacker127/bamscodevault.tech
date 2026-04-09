const LESSON_KEY = "cyberpathSim:lesson:blue-team-1:v1";
const PROGRESS_KEY = "cyberpathSim:progress:v1";

const checkpointBtn = document.getElementById("checkpointBtn");
const checkpointMessage = document.getElementById("checkpointMessage");
const finalQuizBtn = document.getElementById("finalQuizBtn");
const finalQuizMessage = document.getElementById("finalQuizMessage");
const unlockRoomBtn = document.getElementById("unlockRoomBtn");

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || { completed: {}, history: [] };
  } catch {
    return { completed: {}, history: [] };
  }
}

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function unlockRoom() {
  unlockRoomBtn.classList.remove("disabled");
  unlockRoomBtn.textContent = "Open SOC Log Triage";
}

function loadLessonState() {
  try {
    const lessonState = JSON.parse(localStorage.getItem(LESSON_KEY)) || {};
    if (lessonState.passed) {
      unlockRoom();
      finalQuizMessage.textContent = "Lesson passed. Room unlocked.";
    }
  } catch {}
}

checkpointBtn.addEventListener("click", () => {
  const q1 = document.getElementById("q1").value;
  const q2 = document.getElementById("q2").value;
  const q3 = document.getElementById("q3").value;

  let score = 0;
  if (q1 === "b") score++;
  if (q2 === "a") score++;
  if (q3 === "b") score++;

  checkpointMessage.textContent = `Checkpoint score: ${score}/3`;
});

finalQuizBtn.addEventListener("click", () => {
  const f1 = document.getElementById("f1").value;
  const f2 = document.getElementById("f2").value;
  const f3 = document.getElementById("f3").value;

  let score = 0;
  if (f1 === "a") score++;
  if (f2 === "b") score++;
  if (f3 === "a") score++;

  if (score < 3) {
    finalQuizMessage.textContent = `Final quiz score: ${score}/3. You need 3/3 to unlock the room.`;
    return;
  }

  localStorage.setItem(LESSON_KEY, JSON.stringify({
    passed: true,
    score,
    completedAt: new Date().toISOString()
  }));

  const progress = readProgress();
  progress.completed["blue-lesson-1"] = true;
  progress.history = progress.history || [];
  progress.history.push({
    simId: "blue-lesson-1",
    title: "Blue Team Lesson 1",
    completedAt: new Date().toISOString(),
    score: 100,
    badge: "SOC Foundations I"
  });
  saveProgress(progress);

  unlockRoom();
  finalQuizMessage.textContent = "Perfect score. SOC Log Triage unlocked.";
});

loadLessonState();
