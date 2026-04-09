const RESULT_KEY = "cyberpathSim:intake:v1";
const PROGRESS_KEY = "cyberpathSim:progress:v1";

const dashBadge = document.getElementById("dashBadge");
const dashRole = document.getElementById("dashRole");
const dashMeta = document.getElementById("dashMeta");
const dashScore = document.getElementById("dashScore");
const dashSkills = document.getElementById("dashSkills");
const dashNextSkills = document.getElementById("dashNextSkills");
const dashClearBtn = document.getElementById("dashClearBtn");
const simList = document.getElementById("simList");
const badgeStrip = document.getElementById("badgeStrip");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressCount = document.getElementById("progressCount");

const DEFAULT_ITEMS = [
  {
    id: "blue-lesson-1",
    title: "Blue Team Lesson 1",
    description: "Learn what a SOC analyst does and pass the quiz to unlock the first room.",
    href: "/cyberpath-sim/paths/blue-team/lesson-1/",
    status: "open"
  },
  {
    id: "blue-log-triage",
    title: "SOC Log Triage (Beginner)",
    description: "Review alert evidence, inspect failed logins, identify the risky IP, and choose the right containment action.",
    href: "/cyberpath-sim/sims/soc-log-triage/",
    status: "open"
  },
  {
    id: "blue-phishing-review",
    title: "Phishing Email Review",
    description: "Analyze a suspicious email, inspect sender tricks, review headers, inspect the URL, and choose the correct verdict.",
    href: "/cyberpath-sim/sims/phishing-email-review/",
    status: "open"
  }
];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setChipWrap(el, items, emptyText) {
  if (!el) return;
  if (!items || !items.length) {
    el.innerHTML = `<span class="chip muted-chip">${emptyText}</span>`;
    return;
  }
  el.innerHTML = items.map((item) => `<span class="chip">${item}</span>`).join("");
}

function loadResultUi() {
  const result = readJson(RESULT_KEY, null);

  if (!result) {
    dashBadge.textContent = "No badge";
    dashRole.textContent = "No result yet";
    dashMeta.textContent = "Complete the intake page first to generate your recommended path.";
    dashScore.textContent = "0";
    setChipWrap(dashSkills, [], "No skills yet");
    setChipWrap(dashNextSkills, [], "Run simulations to unlock recommendations");
    return;
  }

  const badge = result.badge || "Career Explorer";
  const role = result.role || "CyberPath Candidate";
  const score = Number(result.score || 0);
  const path = result.path || "Mixed";
  const confidence = result.confidence || "Starter";
  const skills = result.skills || [];
  const nextSkills = result.nextSkills || ["Log analysis", "Decision making", "Incident documentation"];

  dashBadge.textContent = badge;
  dashRole.textContent = role;
  dashMeta.textContent = `${path} path • ${confidence} confidence`;
  dashScore.textContent = String(score);
  setChipWrap(dashSkills, skills, "No skills yet");
  setChipWrap(dashNextSkills, nextSkills, "Run simulations to unlock recommendations");
}

function loadProgressUi() {
  const progress = readJson(PROGRESS_KEY, { completed: {}, history: [] });
  const completedCount = DEFAULT_ITEMS.filter((item) => progress.completed && progress.completed[item.id]).length;
  const totalCount = DEFAULT_ITEMS.length;
  const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}% complete`;
  progressCount.textContent = `${completedCount} / ${totalCount} complete`;

  simList.innerHTML = DEFAULT_ITEMS.map((item) => {
    const done = Boolean(progress.completed && progress.completed[item.id]);
    const checkClass = done ? "sim-check complete" : "sim-check";
    const checkMark = done ? "✓" : "";
    const rightHtml =
      item.status === "open"
        ? `<a class="sim-simlink" href="${item.href}">Open</a>`
        : `<span class="sim-simlink">Coming soon</span>`;

    return `
      <article class="sim-item">
        <div class="sim-item-left">
          <div class="${checkClass}">${checkMark}</div>
          <div class="sim-meta">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          </div>
        </div>
        ${rightHtml}
      </article>
    `;
  }).join("");

  const history = Array.isArray(progress.history) ? progress.history : [];
  if (!history.length) {
    badgeStrip.innerHTML = `<div class="badge-card muted-badge">No badges earned yet</div>`;
    return;
  }

  const uniqueBadges = [];
  const seen = new Set();

  for (const item of history) {
    const badge = item.badge || "Completed";
    if (!seen.has(badge)) {
      seen.add(badge);
      uniqueBadges.push({
        badge,
        title: item.title || "Completed item"
      });
    }
  }

  badgeStrip.innerHTML = uniqueBadges.map((entry) => `
    <div class="badge-card">
      <strong>${entry.badge}</strong>
      <span>${entry.title}</span>
    </div>
  `).join("");
}

function clearAllProgress() {
  localStorage.removeItem(RESULT_KEY);
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem("cyberpathSim:lesson:blue-team-1:v1");
  loadResultUi();
  loadProgressUi();
}

dashClearBtn?.addEventListener("click", clearAllProgress);

loadResultUi();
loadProgressUi();
