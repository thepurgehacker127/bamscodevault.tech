const sectionButtons = document.querySelectorAll("[data-section]");
const hashLinks = document.querySelectorAll('a[href^="#"]');

sectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-section");
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  });
});

hashLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  });
});

const footerYear = document.getElementById("year");
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}
