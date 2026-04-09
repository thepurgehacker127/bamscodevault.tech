const PROGRESS_KEY = "cyberpathSim:progress:v1";
const terminalOutput = document.getElementById("terminalOutput");
const terminalForm = document.getElementById("terminalForm");
const terminalInput = document.getElementById("terminalInput");
const decisionSelect = document.getElementById("decisionSelect");
const finishBtn = document.getElementById("finishBtn");
const finishMessage = document.getElementById("finishMessage");

const objectiveMap = {
  alerts: document.getElementById("obj-alerts"),
  failures: document.getElementById("obj-failures"),
  ip: document.getElementById("obj-ip"),
  user: document.getElementById("obj-user"),
  decision: document.getElementById("obj-decision")
};

const state = {
  seenAlerts: false,
  seenFailures: false,
  seenIp: false,
  seenUser: false,
  chosenDecision: false
};

function addLine(text, type = "output") {
  const div = document.createElement("div");
  div.className = `term-line ${type}`;
  div.textContent = text;
  terminalOutput.appendChild(div);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function markObjective(key) {
  const el = objectiveMap[key];
  if (!el) return;
  el.classList.add("complete");
}

function handleCommand(raw) {
  const input = raw.trim();
  if (!input) return;

  addLine(`analyst@cyberpath:~$ ${input}`, "input");

  switch (input.toLowerCase()) {
    case "help":
      addLine("Commands: help, alerts, auth --failures, ip 203.0.113.50, user j.smith, decision contain");
      break;

    case "alerts":
      state.seenAlerts = true;
      markObjective("alerts");
      addLine("ALERT 1: Repeated failed VPN logins for j.smith followed by a successful login from 203.0.113.50.");
      addLine("ALERT 2: Unusual PowerShell execution on WS-447 shortly after successful authentication.");
      break;

    case "auth --failures":
      state.seenFailures = true;
      markObjective("failures");
      addLine("Failed login burst detected:");
      addLine("- j.smith : 11 failed attempts in 4 minutes");
      addLine("- source IP spread before final success");
      addLine("- pattern is consistent with password spraying / credential attack");
      break;

    case "ip 203.0.113.50":
      state.seenIp = true;
      markObjective("ip");
      addLine("IP intelligence on 203.0.113.50:");
      addLine("- New for this user");
      addLine("- Not seen in normal historical login profile");
      addLine("- Risk score: High");
      addLine("- Geo mismatch with previous successful logins");
      break;

    case "user j.smith":
      state.seenUser = true;
      markObjective("user");
      addLine("User context:");
      addLine("- Employee: J. Smith");
      addLine("- MFA recently reported as inconsistent");
      addLine("- Endpoint WS-447 tied to suspicious PowerShell activity");
      addLine("- Business role: finance operations");
      break;

    case "decision contain":
      state.chosenDecision = true;
      decisionSelect.value = "contain";
      markObjective("decision");
      addLine("Decision staged: contain host + reset credentials + escalate", "good");
      break;

    default:
      addLine("Unknown command. Type help to view available commands.", "bad");
      break;
  }
}

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || { completed: {}, history: [] };
  } catch {
    return { completed: {}, history: [] };
  }
}

function saveProgress(result) {
  const progress = readProgress();
  progress.completed["blue-log-triage"] = true;
  progress.history = progress.history || [];
  progress.history.push(result);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

terminalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleCommand(terminalInput.value);
  terminalInput.value = "";
  terminalInput.focus();
});

finishBtn.addEventListener("click", () => {
  const selected = decisionSelect.value;

  if (selected === "contain") {
    state.chosenDecision = true;
    markObjective("decision");
  }

  const allDone =
    state.seenAlerts &&
    state.seenFailures &&
    state.seenIp &&
    state.seenUser &&
    selected === "contain";

  if (!allDone) {
    finishMessage.textContent = "Finish all objectives and choose the correct containment action first.";
    addLine("Simulation not complete. Review the evidence and choose the best action.", "bad");
    return;
  }

  const result = {
    simId: "blue-log-triage",
    title: "SOC Log Triage (Beginner)",
    completedAt: new Date().toISOString(),
    score: 100,
    badge: "SOC Triage I"
  };

  saveProgress(result);
  finishMessage.textContent = "Saved. Dashboard progress updated.";
  addLine("Room complete. Progress saved to dashboard.", "good");
});

addLine("Welcome to SOC Log Triage.");
addLine("Type help to view available commands.");
terminalInput.focus();
