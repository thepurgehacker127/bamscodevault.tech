const LESSONS = Array.isArray(window.CYBERPATH_LESSONS) ? window.CYBERPATH_LESSONS : [];
const LESSON_PROGRESS_KEY = "cyberpathSim:academy:progress:v1";

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(LESSON_PROGRESS_KEY)) || { completed: {} };
  } catch {
    return { completed: {} };
  }
}

function saveProgress(progress) {
  localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(progress));
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function createOptionList(selectEl, options) {
  selectEl.innerHTML = `<option value="">Select one</option>` + options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
}

function renderAcademyIndex() {
  const academyGrid = document.getElementById("academyGrid");
  if (!academyGrid) return;

  const progress = readProgress();
  const lessonCount = document.getElementById("lessonCount");
  const completedCount = document.getElementById("completedCount");
  const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));

  lessonCount.textContent = String(LESSONS.length);
  completedCount.textContent = String(Object.keys(progress.completed || {}).length);

  function paint(filter) {
    academyGrid.innerHTML = LESSONS
      .filter((lesson) => filter === "all" || lesson.path === filter)
      .map((lesson) => {
        const done = Boolean(progress.completed && progress.completed[lesson.id]);
        return `
          <article class="lesson-tile">
            <div class="lesson-tile-top">
              <span class="path-pill">${lesson.path}</span>
              ${done ? `<span class="done-pill">Completed</span>` : ``}
            </div>
            <h3>${lesson.title}</h3>
            <p>${lesson.summary}</p>
            <div class="meta-row">
              <span class="meta-chip">${lesson.difficulty}</span>
              <span class="meta-chip">${lesson.id}</span>
            </div>
            <a class="btn primary" href="/cyberpath-sim/academy/lesson.html?id=${lesson.id}">Open Lesson</a>
          </article>
        `;
      })
      .join("");
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      paint(btn.dataset.filter);
    });
  });

  paint("all");
}

function renderLessonPage() {
  const lessonTitle = document.getElementById("lessonTitle");
  if (!lessonTitle) return;

  const lessonId = getParam("id");
  const lesson = LESSONS.find((item) => item.id === lessonId);

  if (!lesson) {
    lessonTitle.textContent = "Lesson not found";
    return;
  }

  const lessonHero = document.getElementById("lessonHero");
  const lessonMeta = document.getElementById("lessonMeta");
  const lessonBody = document.getElementById("lessonBody");
  const videoSlot = document.getElementById("videoSlot");

  lessonHero.innerHTML = `
    <div>
      <p class="eyebrow">${lesson.path}</p>
      <h1>${lesson.title}</h1>
      <p class="muted">${lesson.summary}</p>
    </div>
    <div class="hero-actions">
      <a class="btn ghost" href="/cyberpath-sim/academy/">Back to Academy</a>
    </div>
  `;

  lessonTitle.textContent = lesson.title;
  lessonMeta.innerHTML = `
    <span class="meta-chip">${lesson.path}</span>
    <span class="meta-chip">${lesson.difficulty}</span>
    <span class="meta-chip">${lesson.id}</span>
  `;

  lessonBody.innerHTML = `
    ${lesson.paragraphs.map((p) => `<p>${p}</p>`).join("")}
    <ul>${lesson.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
  `;

  if (lesson.videoEmbed) {
    videoSlot.innerHTML = `<iframe src="${lesson.videoEmbed}" allowfullscreen loading="lazy"></iframe>`;
  } else {
    videoSlot.innerHTML = `
      <div class="video-placeholder">
        <strong>No video linked yet.</strong>
        <p>Add a YouTube embed URL in <code>cyberpath-sim/academy/lessons.js</code> for this lesson. Use only videos that provide YouTube's Embed option.</p>
      </div>
    `;
  }

  const cp = lesson.checkpoint.questions;
  const fq = lesson.finalQuiz.questions;

  document.getElementById("cp1Label").textContent = cp[0].text;
  document.getElementById("cp2Label").textContent = cp[1].text;
  document.getElementById("cp3Label").textContent = cp[2].text;
  createOptionList(document.getElementById("cp1"), cp[0].options);
  createOptionList(document.getElementById("cp2"), cp[1].options);
  createOptionList(document.getElementById("cp3"), cp[2].options);

  document.getElementById("fq1Label").textContent = fq[0].text;
  document.getElementById("fq2Label").textContent = fq[1].text;
  document.getElementById("fq3Label").textContent = fq[2].text;
  createOptionList(document.getElementById("fq1"), fq[0].options);
  createOptionList(document.getElementById("fq2"), fq[1].options);
  createOptionList(document.getElementById("fq3"), fq[2].options);

  const checkpointBtn = document.getElementById("checkpointBtn");
  const checkpointMessage = document.getElementById("checkpointMessage");
  const finalQuizBtn = document.getElementById("finalQuizBtn");
  const finalQuizMessage = document.getElementById("finalQuizMessage");
  const nextActionBtn = document.getElementById("nextActionBtn");

  checkpointBtn.addEventListener("click", () => {
    let score = 0;
    if (document.getElementById("cp1").value === cp[0].answer) score++;
    if (document.getElementById("cp2").value === cp[1].answer) score++;
    if (document.getElementById("cp3").value === cp[2].answer) score++;
    checkpointMessage.textContent = `Checkpoint score: ${score}/3`;
  });

  finalQuizBtn.addEventListener("click", () => {
    let score = 0;
    if (document.getElementById("fq1").value === fq[0].answer) score++;
    if (document.getElementById("fq2").value === fq[1].answer) score++;
    if (document.getElementById("fq3").value === fq[2].answer) score++;

    if (score < 3) {
      finalQuizMessage.textContent = `Final quiz score: ${score}/3. You need 3/3 to complete this lesson.`;
      return;
    }

    const progress = readProgress();
    progress.completed[lesson.id] = {
      completedAt: new Date().toISOString(),
      badge: lesson.badge,
      title: lesson.title
    };
    saveProgress(progress);

    finalQuizMessage.textContent = `Perfect score. ${lesson.title} completed.`;
    nextActionBtn.textContent = lesson.relatedHref && lesson.relatedHref !== "/cyberpath-sim/dashboard/" ? "Open Related Room" : "Back to Dashboard";
    nextActionBtn.href = lesson.relatedHref || "/cyberpath-sim/dashboard/";
  });

  const progress = readProgress();
  if (progress.completed && progress.completed[lesson.id]) {
    finalQuizMessage.textContent = "Lesson already completed.";
    nextActionBtn.textContent = lesson.relatedHref && lesson.relatedHref !== "/cyberpath-sim/dashboard/" ? "Open Related Room" : "Back to Dashboard";
    nextActionBtn.href = lesson.relatedHref || "/cyberpath-sim/dashboard/";
  }
}

renderAcademyIndex();
renderLessonPage();
