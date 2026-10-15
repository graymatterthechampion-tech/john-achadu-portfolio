/* ============================================
   Footer year
   ============================================ */
document.getElementById("year").textContent = new Date().getFullYear();

/* ============================================
   Navbar: solid background on scroll
   ============================================ */
const navbar = document.getElementById("navbar");

function updateNavbarState() {
  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", updateNavbarState, { passive: true});
updateNavbarState();

/* ============================================
   Mobile menu toggle
   ============================================ */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
  const isOpen = !mobileMenu.classList.contains("hidden");
  mobileMenu.classList.toggle("hidden");
  menuBtn.setAttribute("aria-expanded", String(!isOpen));
});

document.querySelectorAll("#mobileMenu [data-nav]").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

/* ============================================
   Scrollspy: highlight active nav link
   ============================================ */
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll("[data-nav]");

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
);

sections.forEach((section) => spyObserver.observe(section));

/* ============================================
   Hero terminal: typing effect cycling roles
   ============================================ */
const roles = [
  "Full Stack JavaScript Engineer",
  "React & Redux Developer",
  "Node.js / Express API Builder",
  "Trader-turned-Software Engineer",
];

const typedEl = document.getElementById("typedRole");
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeLoop() {
  const current = roles[roleIndex];

  if (isDeleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  typedEl.textContent = current.slice(0, charIndex);

  let delay = isDeleting ? 35 : 65;

  if (!isDeleting && charIndex === current.length) {
    delay = 1400;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    delay = 300;
  }

  window.setTimeout(typeLoop, delay);
}

if (typedEl) {
  typeLoop();
}

/* ============================================
   Scroll reveal animations
   ============================================ */
const revealEls = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute("data-reveal-delay") || 0;
        window.setTimeout(() => entry.target.classList.add("in-view"), Number(delay));
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => revealObserver.observe(el));

/* Skill bars fill when their group scrolls into view */
const skillGroups = document.querySelectorAll(".skill-group");

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

skillGroups.forEach((group) => skillObserver.observe(group));

/* ============================================
   Contact form validation (client-side only)
   ============================================ */
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

function setError(fieldName, message) {
  const field = contactForm.querySelector(`[name="${fieldName}"]`);
  const errorEl = contactForm.querySelector(`[data-error-for="${fieldName}"]`);
  const row = field.closest(".form-row");

  if (message) {
    row.classList.add("has-error");
    errorEl.textContent = message;
  } else {
    row.classList.remove("has-error");
    errorEl.textContent = "";
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    let valid = true;

    if (name.length < 2) {
      setError("name", "Please enter your name.");
      valid = false;
    } else {
      setError("name", "");
    }

    if (!isValidEmail(email)) {
      setError("email", "Please enter a valid email.");
      valid = false;
    } else {
      setError("email", "");
    }

    if (message.length < 10) {
      setError("message", "Message should be at least 10 characters.");
      valid = false;
    } else {
      setError("message", "");
    }

    if (!valid) {
      formStatus.classList.add("hidden");
      return;
    }

    // No backend wired up yet — simulate a successful send.
    formStatus.textContent = `Thanks ${name.split(" ")[0]}, your message is ready — connect a backend or mailto action to send it for real.`;
    formStatus.classList.remove("hidden");
    contactForm.reset();
  });
}

