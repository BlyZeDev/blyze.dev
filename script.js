const GITHUB_USERNAME = "BlyZeDev";
const FEATURED_REPOS = ["DotTray", "ConsoleNexusEngine", "T-Rex-Game-3DS"];
const MAX_PROJECTS = 6;
const BIRTH_DATE = new Date("2004-07-05");

document.querySelectorAll(
  ".hero__mockup, .nav__logo, .footer__brand img"
).forEach(img => {
  img.addEventListener("error", () => { img.style.visibility = "hidden"; }, { once: true });
});

document.getElementById("year").textContent = new Date().getFullYear();

const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav__links");
const scrollHint = document.querySelector(".scroll-hint");

window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 20);
  if (scrollHint) scrollHint.classList.toggle("is-hidden", window.scrollY > 10);
}, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const typedTextEl = document.getElementById("typedText");
const typedCursorEl = document.getElementById("typedCursor");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const linesToType = [
  "writing performant code in C#",
  "not unit testing :o",
  "praying it compiles on first try",
  "debugging with Console.WriteLine",
  "removing bugs by ignoring them",
  "works on my machine™",
  "accidentally optimizing the wrong thing",
  "fixing one bug and spawning three more",
  "clean code enthusiast (mostly)"
];

function setCursorIdle(isIdle) {
  typedCursorEl.classList.toggle("cursor--idle", isIdle);
}

function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
     today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return age;
}

const ageEl = document.querySelector('[data-stat="age"]');

if (ageEl) {
  ageEl.textContent = `${calculateAge(BIRTH_DATE)} years`;
}

function typeLoop() {
  if (prefersReducedMotion) {
    typedTextEl.textContent = linesToType[0];
    setCursorIdle(true);
    return;
  }
  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    setCursorIdle(false);
    const current = linesToType[lineIndex];
    if (!deleting) {
      charIndex++;
      typedTextEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setCursorIdle(true);
        setTimeout(tick, 1800);
        return;
      }
      setTimeout(tick, 38);
    } else {
      charIndex--;
      typedTextEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % linesToType.length;
        setCursorIdle(true);
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, 18);
    }
  }
  tick();
}
typeLoop();

const revealTargets = document.querySelectorAll(
  ".section__head, .about__text, .about__facts, .project-card, .skills__group, .timeline__item, .contact-card"
);
revealTargets.forEach(el => el.classList.add("reveal"));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

revealTargets.forEach(el => revealObserver.observe(el));

async function loadGitHub() {
  const grid = document.getElementById("projectsGrid");
  const errorEl = document.getElementById("projectsError");

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`)
    ]);

    if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API request failed");

    const user = await userRes.json();
    const repos = await reposRes.json();

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    setStat("repos", user.public_repos ?? repos.length);
    setStat("stars", totalStars);

    const nonForks = repos.filter(r => !r.fork);
    const featured = FEATURED_REPOS
      .map(name => nonForks.find(r => r.name === name))
      .filter(Boolean);
    const rest = nonForks
      .filter(r => !FEATURED_REPOS.includes(r.name))
      .sort((a, b) => b.stargazers_count - a.stargazers_count);

    const finalList = [...featured, ...rest].slice(0, MAX_PROJECTS);

    if (finalList.length === 0) throw new Error("No repositories found");

    grid.innerHTML = finalList.map(repoCardHTML).join("");
    document.querySelectorAll(".project-card").forEach(el => {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  } catch (err) {
    console.error(err);
    grid.hidden = true;
    errorEl.hidden = false;
    setStat("repos", "26");
    setStat("stars", "70+");
  }
}

function setStat(key, value) {
  const el = document.querySelector(`[data-stat="${key}"]`);
  if (el) el.textContent = value;
}

function repoCardHTML(repo) {
  const desc = repo.description ? escapeHTML(repo.description) : "No description yet.";
  const lang = repo.language || "—";
  return `
    <a class="project-card" href="${repo.html_url}" target="_blank" rel="noopener">
      <div class="project-card__top">
        <span class="project-card__name">${escapeHTML(repo.name)}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M7 7h10v10"/></svg>
        </span>
      </div>
      <p class="project-card__desc">${desc}</p>
      <div class="project-card__meta">
        <span><span class="lang-dot"></span>${escapeHTML(lang)}</span>
        <span>★ ${repo.stargazers_count}</span>
        <span>⑂ ${repo.forks_count}</span>
      </div>
    </a>
  `;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

loadGitHub();