const PROGRESS_KEY = "cyberpathSim:progress:v1";
const terminalOutput = document.getElementById("terminalOutput");
const terminalForm = document.getElementById("terminalForm");
const terminalInput = document.getElementById("terminalInput");
const verdictSelect = document.getElementById("verdictSelect");
const finishBtn = document.getElementById("finishBtn");
const finishMessage = document.getElementById("finishMessage");

const objectiveMap = {
  inbox: document.getElementById("obj-inbox"),
  open: document.getElementById("obj-open"),
  sender: document.getElementById("obj-sender"),
  headers: document.getElementById("obj-headers"),
  url: document.getElementById("obj-url"),
  verdict: document.getElementById("obj-verdict")
};

const state = {
  seenInbox: false,
  seenOpen: false,
  seenSender: false,
  seenHeaders: false,
  seenUrl: false,
  chosenVerdict: false
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
      addLine("Commands: help, inbox, open 2, sender 2, headers 2, url 2, verdict phishing");
      break;

    case "inbox":
      state.seenInbox = true;
      markObjective("inbox");
      addLine("Inbox summary:");
      addLine("1 | HR Update | hr@company.example | Routine policy reminder");
      addLine("2 | Microsoft 365 Security Alert | security-team@micr0soft-login-alerts.com | Suspicious sign-in detected");
      addLine("3 | Team Lunch Poll | coworker@company.example | Internal scheduling");
      break;

    case "open 2":
      state.seenOpen = true;
      markObjective("open");
      addLine("Opened email #2:");
      addLine("Subject: Microsoft 365 Security Alert");
      addLine("Body: We detected unusual sign-in activity. Review your account immediately:");
      addLine("Link text: Secure Account Review");
      break;

    case "sender 2":
      state.seenSender = true;
      markObjective("sender");
      addLine("Sender analysis:");
      addLine("- Display theme mimics Microsoft security mail");
      addLine("- Actual sender domain: micr0soft-login-alerts.com");
      addLine("- Domain uses zero instead of the letter o");
      addLine("- Sender is not trusted internal mail");
      break;
    case "headers 2":
      state.seenHeaders = true;
      markObjective("headers");
      addLine("Header findings:");
      addLine("- SPF: fail");
      addLine("- DKIM: fail");
      addLine("- Reply-To differs from display identity");
      addLine("- Return-Path domain does not match claimed service");
      break;

    case "url 2":
      state.seenUrl = true;
      markObjective("url");
      addLine("Embedded URL analysis:");
      addLine("- Display text: Secure Account Review");
      addLine("- Actual URL: hxxps://micr0soft-login-alerts.com/review-session");
      addLine("- Brand impersonation detected");
      addLine("- High likelihood credential harvesting");
      break;

    case "verdict phishing":
      state.chosenVerdict = true;
      verdictSelect.value = "phishing";
      markObjective("verdict");
      addLine("Verdict staged: phishing - escalate and block", "good");
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
  progress.completed["blue-phishing-review"] = true;
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
  const selected = verdictSelect.value;

  if (selected === "phishing") {
    state.chosenVerdict = true;
    markObjective("verdict");
  }

  const allDone =
    state.seenInbox &&
    state.seenOpen &&
    state.seenSender &&
    state.seenHeaders &&
    state.seenUrl &&
    selected === "phishing";

  if (!allDone) {
    finishMessage.textContent = "Complete the analysis steps and choose the phishing verdict first.";
    addLine("Simulation not complete. Review the evidence and choose the correct verdict.", "bad");
    return;
  }

  const result = {
    simId: "blue-phishing-review",
    title: "Phishing Email Review",
    completedAt: new Date().toISOString(),
    score: 100,
    badge: "Phishing Hunter I"
  };

  saveProgress(result);
  finishMessage.textContent = "Saved. Dashboard progress updated.";
  addLine("Room complete. Progress saved to dashboard.", "good");
});

addLine("Welcome to Phishing Email Review.");
addLine("Type help to view available commands.");
terminalInput.focus();
