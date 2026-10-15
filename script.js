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

/* ============================================
   Contact form: validation and delivery via Web3Forms
   ============================================ */
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const WEB3FORMS_ACCESS_KEY = "1b058508-ed54-42b5-91d9-9ce6db56a138";
const CONTACT_EMAIL = "graymatterthechampion@gmail.com";
const REQUEST_TIMEOUT_MS = 15000;

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

function validateForm(name, email, message) {
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

  return valid;
}

function showStatus(message, isError) {
  formStatus.textContent = message;
  formStatus.classList.toggle("is-error", isError);
  formStatus.classList.remove("hidden");
}

function hideStatus() {
  formStatus.classList.add("hidden");
  formStatus.classList.remove("is-error");
}

function hasAccessKey() {
  return WEB3FORMS_ACCESS_KEY.length > 0 && !WEB3FORMS_ACCESS_KEY.startsWith("PASTE_");
}

async function sendMessage(payload) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    const rejectedByService = body !== null && body.success === false;

    if (response.ok && !rejectedByService) {
      return { ok: true, reason: "" };
    }
    return { ok: false, reason: "rejected" };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }
    return { ok: false, reason: "network" };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function firstName(fullName) {
  const parts = fullName.split(/\s+/);
  return parts[0];
}

if (contactForm && formStatus) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const submitLabel = submitButton ? submitButton.textContent : "Send message";
  let isSending = false;

  const setSending = (sending) => {
    isSending = sending;
    if (submitButton) {
      submitButton.disabled = sending;
      submitButton.textContent = sending ? "Sending..." : submitLabel;
    }
  };

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (isSending) {
      return;
    }

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!validateForm(name, email, message)) {
      hideStatus();
      return;
    }

    if (contactForm.botcheck && contactForm.botcheck.checked) {
      contactForm.reset();
      return;
    }

    if (!hasAccessKey()) {
      showStatus(`The form isn't connected yet. Please email me directly at ${CONTACT_EMAIL}.`, true);
      return;
    }

    hideStatus();
    setSending(true);

    const result = await sendMessage({
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New portfolio message from ${name}`,
      name,
      email,
      message,
    });

    setSending(false);

    if (result.ok) {
      showStatus(`Thanks ${firstName(name)}, your message has been sent. I'll reply soon.`, false);
      contactForm.reset();
      return;
    }

    if (result.reason === "timeout") {
      showStatus(`The request timed out. Please try again, or email me at ${CONTACT_EMAIL}.`, true);
      return;
    }

    showStatus(`Your message couldn't be sent. Please try again, or email me at ${CONTACT_EMAIL}.`, true);
  });
}
