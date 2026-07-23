/* ============================================================
   IVAN — script.js v2
   Complete interaction system
   ============================================================ */

/* ── CONFIG ── */
const C = {
  name: "Ivan",
  full: "Ivan Kaweesa",
  handle: "Mosses Muwa",
  email: "mossesmuwa@proton.me",
  linkedin: "https://linkedin.com/in/ivankaweesa",
  github: "https://github.com/Mossesmuwa",
  instagram: "https://www.instagram.com/mosses.muwa/",
  thm: "https://tryhackme.com/p/MM",
  htb: "https://app.hackthebox.com/profile/mossesmuwa",
  cyberStart: new Date("2025-01-01"),
  deStart: new Date("2026-07-01"),
  formspree: "https://formspree.io/f/xeepgrdn",
};

/* ── SAFE STORAGE — never lets storage access crash the script ── */
/* Some browsers throw when localStorage/sessionStorage is touched on
   file:// pages (no server) or with storage blocked. Every call in this
   file goes through here so a blocked/unavailable store degrades
   gracefully instead of halting all remaining JS. */
const safeStorage = {
  get(store, key) {
    try {
      return store.getItem(key);
    } catch {
      return null;
    }
  },
  set(store, key, val) {
    try {
      store.setItem(key, val);
      return true;
    } catch {
      return false;
    }
  },
  remove(store, key) {
    try {
      store.removeItem(key);
    } catch {}
  },
};

/* ── YEAR ── */
document
  .querySelectorAll(".js-year")
  .forEach((el) => (el.textContent = new Date().getFullYear()));

/* ── SESSION LOADER ── */
const loaderShown = safeStorage.get(sessionStorage, "iv-loaded");
const loader = document.getElementById("loader");
if (loader) {
  if (loaderShown) {
    loader.classList.add("hidden");
  } else {
    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.classList.add("hidden");
        safeStorage.set(sessionStorage, "iv-loaded", "1");
      }, 1800);
    });
  }
}

/* ── THEME ── */
const html = document.documentElement;
const saved =
  safeStorage.get(localStorage, "iv-theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "lime" : "lime");
html.setAttribute("data-theme", saved);

function toggleTheme(e) {
  const cur = html.getAttribute("data-theme");
  const next = cur === "lime" ? "signal" : "lime";
  const ripple = document.getElementById("theme-ripple");
  if (ripple && e) {
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;
    const r =
      Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) * 2;
    ripple.style.cssText = `left:${x}px;top:${y}px;width:0;height:0;`;
    void ripple.offsetWidth;
    ripple.style.transition = "width 0.45s ease,height 0.45s ease";
    ripple.style.width = r + "px";
    ripple.style.height = r + "px";
    setTimeout(() => {
      html.setAttribute("data-theme", next);
      safeStorage.set(localStorage, "iv-theme", next);
      updateThemeIcon();
      ripple.style.transition = "none";
      ripple.style.cssText = "";
    }, 230);
  } else {
    html.setAttribute("data-theme", next);
    safeStorage.set(localStorage, "iv-theme", next);
    updateThemeIcon();
  }
}

function updateThemeIcon() {
  const theme = html.getAttribute("data-theme");
  document.querySelectorAll(".theme-icon").forEach((el) => {
    el.textContent = theme === "lime" ? "◐" : "◑";
  });
}
updateThemeIcon();

document
  .querySelectorAll(".sb-theme-btn, .mob-theme-btn")
  .forEach((btn) => btn.addEventListener("click", toggleTheme));

/* ── PAGE TRANSITIONS ── */
function navigateTo(url) {
  const t = document.querySelector(".page-transition");
  if (!t) {
    location.href = url;
    return;
  }
  t.classList.add("fade-in");
  setTimeout(() => {
    location.href = url;
  }, 160);
}

// Intercept nav links for smooth transitions
document.querySelectorAll("a[href]").forEach((a) => {
  const href = a.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("http") ||
    href.startsWith("mailto") ||
    href.startsWith("tel")
  )
    return;
  a.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo(href);
  });
});

// Fade in on page load
window.addEventListener("pageshow", () => {
  const t = document.querySelector(".page-transition");
  if (t) {
    t.classList.remove("fade-in");
  }
});

/* ── CUSTOM CURSOR ── */
if (window.matchMedia("(pointer:fine)").matches) {
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (dot)
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });

  (function lerp() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    if (ring)
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(lerp);
  })();

  document.addEventListener("mouseover", (e) => {
    const t = e.target;
    document.body.classList.remove("cur-text", "cur-hover", "cur-term");
    if (t.closest(".term-overlay")) document.body.classList.add("cur-term");
    else if (
      t.closest(
        "a,button,.btn,.pn-item,.sb-nav-item,.card[onclick],#constellation-wrap,.term-dot,.cmd-result,.tool-chip,.footer-name",
      )
    )
      document.body.classList.add("cur-hover");
    else if (t.closest("p,h1,h2,h3,h4,li,span:not(.chip)"))
      document.body.classList.add("cur-text");
  });
}

/* ── CURSOR TRAIL ── */
(function () {
  const canvas = document.getElementById("cursor-canvas");
  if (!canvas || !window.matchMedia("(pointer:fine)").matches) return;
  const ctx = canvas.getContext("2d");
  let W,
    H,
    pts = [],
    shift = false;

  function resize() {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  document.addEventListener("mousemove", (e) => {
    pts.push({ x: e.clientX, y: e.clientY, r: 3, life: 1 });
    if (pts.length > 80) pts.shift();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Shift") shift = true;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "Shift") shift = false;
  });

  const c1 = () =>
    html.getAttribute("data-theme") === "lime" ? "226,255,93" : "139,92,246";

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    if (shift && pts.length > 1) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach((p, i) => {
        if (i) ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = `rgba(${c1()},0.5)`;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();
    } else {
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        p.life -= 0.045;
        p.r *= 0.94;
        if (p.life <= 0) {
          pts.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0, p.r * p.life), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c1()},${p.life * 0.55})`;
        ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  })();
})();

/* ── RIPPLE ON CLICK ── */
document.addEventListener("click", (e) => {
  const el = document.createElement("div");
  el.className = "ripple";
  el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:100px;height:100px;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
  // rapid click burst
  rapidClick(e);
  // cursor click feedback — ring briefly expands and fades
  if (window.matchMedia("(pointer:fine)").matches) {
    document.body.classList.add("cur-click");
    setTimeout(() => document.body.classList.remove("cur-click"), 260);
  }
});

let rclicks = 0,
  rTimer;
function rapidClick(e) {
  rclicks++;
  clearTimeout(rTimer);
  rTimer = setTimeout(() => (rclicks = 0), 800);
  if (rclicks >= 10) {
    rclicks = 0;
    burst(e.clientX, e.clientY);
  }
}

function burst(cx, cy) {
  for (let i = 0; i < 40; i++) {
    const el = document.createElement("div");
    const a = (i / 40) * Math.PI * 2,
      d = 60 + Math.random() * 70;
    el.style.cssText = `position:fixed;z-index:9995;pointer-events:none;
      left:${cx}px;top:${cy}px;width:5px;height:5px;border-radius:50%;
      background:var(--accent);transform:translate(-50%,-50%);
      transition:all 0.8s cubic-bezier(0.2,0,0.8,1);`;
    document.body.appendChild(el);
    void el.offsetWidth;
    el.style.left = cx + Math.cos(a) * d + "px";
    el.style.top = cy + Math.sin(a) * d + "px";
    el.style.opacity = "0";
    el.style.transform = "translate(-50%,-50%) scale(0)";
    setTimeout(() => el.remove(), 900);
  }
  if (navigator.vibrate) navigator.vibrate([20, 30, 20]);
}

/* ── MAGNETIC BUTTONS ── */
document.querySelectorAll(".btn-primary").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) * 0.14;
    const dy = (e.clientY - r.top - r.height / 2) * 0.14;
    btn.style.transform = `translate(${dx}px,${dy}px) translateY(-2px)`;
    btn.style.transition = "none";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
    btn.style.transition = "";
  });
});

/* ── SIDEBAR ── */
const sb = document.getElementById("sidebar");
function setActiveNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".sb-nav-item, .pn-item").forEach((a) => {
    a.classList.remove("active");
    const href = a.getAttribute("href") || "";
    if (
      href.includes(page) ||
      (page === "index.html" && href === "../index.html") ||
      (page === "" && (href === "index.html" || href === "../index.html"))
    )
      a.classList.add("active");
  });
}
setActiveNav();

/* ── SCROLL PROGRESS + NAVBAR ── */
const progBar = document.getElementById("scroll-progress");
const sbProg = document.querySelector(".sb-prog-fill");
const scrollTopBtn = document.getElementById("scroll-top");

window.addEventListener(
  "scroll",
  () => {
    const pct = (scrollY / (document.body.scrollHeight - innerHeight)) * 100;
    if (progBar) progBar.style.width = pct + "%";
    if (sbProg) sbProg.style.height = pct + "%";
    if (scrollTopBtn) scrollTopBtn.classList.toggle("show", scrollY > 400);
    if (pct >= 99.5) missionComplete();
  },
  { passive: true },
);

scrollTopBtn?.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }),
);

let missionDone = false;
function missionComplete() {
  if (missionDone) return;
  missionDone = true;
  const toast = document.createElement("div");
  toast.style.cssText = `position:fixed;bottom:120px;left:50%;transform:translateX(-50%);
    background:var(--bg-3);border:0.5px solid var(--accent);color:var(--accent);
    font-family:var(--font-mono);font-size:0.76rem;padding:7px 18px;
    border-radius:100px;z-index:600;animation:fadeUp 0.3s ease;`;
  toast.textContent = "✓ mission complete";
  document.body.appendChild(toast);
  if (navigator.vibrate) navigator.vibrate(100);
  setTimeout(() => toast.remove(), 2500);
}

/* ── HAMBURGER ── */
const drawer = document.getElementById("mobile-drawer");
const hamburger = document.getElementById("hamburger");
hamburger?.addEventListener("click", () => {
  const open = drawer?.classList.toggle("open");
  hamburger.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
});
document.getElementById("drawer-close")?.addEventListener("click", closeDrawer);
function closeDrawer() {
  drawer?.classList.remove("open");
  hamburger?.classList.remove("open");
  document.body.style.overflow = "";
}
window.closeDrawer = closeDrawer;

/* ── REVEAL ON SCROLL ── */
const revObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const siblings =
        e.target.parentElement?.querySelectorAll(
          ".reveal,.reveal-l,.reveal-r",
        ) || [];
      let delay = 0;
      [...siblings].forEach((s, i) => {
        if (s === e.target) delay = i * 75;
      });
      setTimeout(() => e.target.classList.add("v"), delay);
      revObs.unobserve(e.target);
    });
  },
  { threshold: 0.1 },
);
document
  .querySelectorAll(".reveal,.reveal-l,.reveal-r")
  .forEach((el) => revObs.observe(el));

/* ── COUNT UP ── */
function countUp(el, target, dur = 1600) {
  const isFloat = target % 1 !== 0;
  const pre = el.dataset.prefix || "";
  const suf = el.dataset.suffix || "";
  const start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    const v = target * e;
    el.textContent = pre + (isFloat ? v.toFixed(1) : Math.floor(v)) + suf;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = pre + (isFloat ? target.toFixed(1) : target) + suf;
  })(start);
}
const countObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countUp(e.target, parseFloat(e.target.dataset.target));
      countObs.unobserve(e.target);
    });
  },
  { threshold: 0.5 },
);
document.querySelectorAll(".count-up").forEach((el) => countObs.observe(el));

/* ── LIVE COUNTERS ── */
function updateCounters() {
  const now = Date.now();
  const cyberDays = Math.floor((now - C.cyberStart.getTime()) / 86400000);
  const deDays = Math.max(
    0,
    Math.floor((now - C.deStart.getTime()) / 86400000),
  );
  document
    .querySelectorAll(".js-cyber-days")
    .forEach((el) => (el.textContent = cyberDays));
  document
    .querySelectorAll(".js-de-days")
    .forEach((el) => (el.textContent = deDays));
  // Local time
  const t = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  document
    .querySelectorAll(".js-local-time")
    .forEach((el) => (el.textContent = t));
}
updateCounters();
setInterval(updateCounters, 30000);

/* ── GREETING GLITCH ── */
function glitchGreet(el, text, onDone) {
  if (!el) return;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
  let settled = 0;
  const letters = text.split("");
  el.textContent = "";
  // Create spans
  const spans = letters.map((ch, i) => {
    const s = document.createElement("span");
    s.textContent =
      ch === " " ? "\u00a0" : chars[Math.floor(Math.random() * chars.length)];
    s.style.color = "var(--accent)";
    s.style.display = "inline-block";
    el.appendChild(s);
    return s;
  });

  const settle = (idx) => {
    if (idx >= letters.length) {
      if (onDone) onDone();
      return;
    }
    if (letters[idx] === " ") {
      spans[idx].textContent = "\u00a0";
      settle(idx + 1);
      return;
    }
    let count = 0;
    const iv = setInterval(() => {
      spans[idx].textContent = chars[Math.floor(Math.random() * chars.length)];
      if (++count >= 6) {
        clearInterval(iv);
        spans[idx].textContent = letters[idx];
        spans[idx].style.color = "var(--text-1)";
        settle(idx + 1);
      }
    }, 40);
  };
  setTimeout(() => settle(0), 200);
}

(function initGreeting() {
  const h = new Date().getHours();
  const greets = {
    morning: "Good morning.",
    afternoon: "Good afternoon.",
    evening: "Good evening.",
    late: "You're up late.",
  };
  const key =
    h >= 6 && h < 12
      ? "morning"
      : h >= 12 && h < 18
        ? "afternoon"
        : h >= 18
          ? "evening"
          : "late";
  const lang = navigator.language || "";
  const isDE = lang.startsWith("de");
  const deGreet = document.getElementById("greeting-de");
  if (isDE && deGreet) deGreet.style.display = "flex";

  // Loader greeting — only plays if loader is actually shown
  const loaderGreetEl = document.getElementById("loader-greeting-text");
  if (loaderGreetEl && !loaderShown) {
    setTimeout(() => glitchGreet(loaderGreetEl, greets[key]), 400);
  } else if (loaderGreetEl) {
    loaderGreetEl.textContent = greets[key];
  }

  // Top-center greeting bar (desktop) — fades in then glitches the text
  const greetBar = document.getElementById("greeting-bar");
  const heroGreetEl = document.getElementById("greeting-text");
  const revealDelay = loaderShown ? 300 : 2200;
  if (greetBar) setTimeout(() => greetBar.classList.add("show"), revealDelay);
  if (heroGreetEl)
    setTimeout(() => glitchGreet(heroGreetEl, greets[key]), revealDelay + 200);

  // Mobile top-bar greeting — same text, fades in centered in the nav bar
  const mobGreetWrap = document.getElementById("mobile-greeting");
  const mobGreetEl = document.getElementById("greeting-text-mobile");
  if (mobGreetWrap)
    setTimeout(() => mobGreetWrap.classList.add("show"), revealDelay);
  if (mobGreetEl)
    setTimeout(() => glitchGreet(mobGreetEl, greets[key]), revealDelay + 200);
})();

/* ── TYPING ROLES ── */
const roles = [
  "IT Systems Professional",
  "Cybersecurity Student",
  "Penetration Tester",
  "Network Engineer",
  "Blue Team Defender",
  "Python Scripter",
];
let ri = 0,
  ci = 0,
  del = false,
  pause = 0;
const roleEl = document.getElementById("typing-role");
function typeRole() {
  if (!roleEl) return;
  const phrase = roles[ri];
  if (pause > 0) {
    pause--;
    setTimeout(typeRole, 60);
    return;
  }
  if (!del) {
    roleEl.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) {
      del = true;
      pause = 28;
    }
    setTimeout(typeRole, 75);
  } else {
    roleEl.textContent = phrase.slice(0, --ci);
    if (ci === 0) {
      del = false;
      ri = (ri + 1) % roles.length;
      pause = 6;
    }
    setTimeout(typeRole, 40);
  }
}
setTimeout(typeRole, loaderShown ? 400 : 2400);

/* ── NAME HOVER ── */
const nameEl = document.getElementById("hero-name");
if (nameEl) {
  nameEl.addEventListener("mouseenter", () => {
    nameEl.innerHTML =
      '<span style="color:var(--text-1)">Ivan</span><span class="last-name" style="color:var(--text-2);font-weight:300;margin-left:0.2em;"> Kaweesa</span>';
  });
  nameEl.addEventListener("mouseleave", () => {
    nameEl.textContent = "Ivan.K";
  });
}

/* ── PHOTO ── */
const heroPhoto = document.getElementById("hero-photo");
const heroFrame = document.getElementById("hero-frame");
heroFrame?.addEventListener("mouseenter", () => {
  if (heroPhoto) heroPhoto.style.filter = "saturate(1)";
  heroFrame.style.transform = "rotate(3deg)";
});
heroFrame?.addEventListener("mouseleave", () => {
  if (heroPhoto) heroPhoto.style.filter = "saturate(0)";
  heroFrame.style.transform = "rotate(2deg)";
});
heroFrame?.addEventListener("click", () => {
  const sat = heroPhoto?.style.filter === "saturate(1)";
  if (heroPhoto) heroPhoto.style.filter = sat ? "saturate(0)" : "saturate(1)";
  if (navigator.vibrate) navigator.vibrate(20);
});

/* ── 3D TILT ── */
window.tilt3d = function (el, e) {
  const r = el.getBoundingClientRect();
  const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
  const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
  el.style.transition = "none";
  el.style.transform = `perspective(900px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) scale(1.02)`;
  const ix = ((e.clientX - r.left) / r.width) * 100;
  const iy = ((e.clientY - r.top) / r.height) * 100;
  el.style.background = `radial-gradient(circle at ${ix}% ${iy}%, var(--bg-3) 0%, var(--bg-2) 70%)`;
};
window.resetTilt = function (el) {
  el.style.transition = "";
  el.style.transform = "";
  el.style.background = "";
};

/* ── LOGO HOLD ── */
let logoHold;
document.querySelectorAll(".logo-btn").forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    logoHold = setTimeout(() => {
      btn.style.filter = "hue-rotate(120deg) brightness(1.5)";
      setTimeout(() => (btn.style.filter = ""), 800);
    }, 3000);
  });
  btn.addEventListener("mouseleave", () => clearTimeout(logoHold));
  // Double tap mobile
  let tapCount = 0,
    tapTimer;
  btn.addEventListener("click", () => {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => (tapCount = 0), 400);
    if (tapCount >= 2) {
      tapCount = 0;
      const cur = html.getAttribute("data-theme");
      html.setAttribute("data-theme", cur === "lime" ? "signal" : "lime");
      setTimeout(() => {
        html.setAttribute("data-theme", cur);
      }, 2000);
    }
  });
});

/* ── FOOTER NAME ── */
document
  .getElementById("footer-name")
  ?.addEventListener("mouseenter", function () {
    this.style.letterSpacing = "8px";
  });
document
  .getElementById("footer-name")
  ?.addEventListener("mouseleave", function () {
    this.style.letterSpacing = "";
  });

/* ── IDLE BEHAVIOUR ── */
let idleTimer,
  idleActive = false;
const PAGE = location.pathname.split("/").pop() || "index";

const IDLE_ACTIONS = {
  "index.html": () => {
    const grid = document.querySelector(".grid-bg");
    if (grid) grid.style.animation = "grid-drift 8s ease-in-out infinite";
    return () => {
      if (grid) grid.style.animation = "";
    };
  },
  "about.html": () => {
    const ph = document.getElementById("about-photo");
    if (ph) ph.style.filter = "saturate(1)";
    return () => {
      if (ph) ph.style.filter = "";
    };
  },
  "operations.html": () => {
    const scan = document.createElement("div");
    scan.id = "idle-scan";
    scan.style.cssText = `position:fixed;left:0;right:0;top:0;height:1px;
      background:linear-gradient(90deg,transparent,var(--accent),transparent);
      opacity:0.4;pointer-events:none;z-index:500;
      animation:page-scan 8s linear infinite;`;
    document.body.appendChild(scan);
    return () => scan.remove();
  },
  "contact.html": () => {
    const dot = document.querySelector(".avail-dot");
    if (dot) dot.style.animationDuration = "0.8s";
    return () => {
      if (dot) dot.style.animationDuration = "";
    };
  },
};

let idleCleanup;
function startIdle() {
  if (idleActive) return;
  idleActive = true;
  const action = IDLE_ACTIONS[PAGE] || IDLE_ACTIONS["index.html"];
  if (action) idleCleanup = action();
}
function resetIdle() {
  clearTimeout(idleTimer);
  if (idleActive && idleCleanup) {
    idleCleanup();
    idleCleanup = null;
  }
  idleActive = false;
  idleTimer = setTimeout(startIdle, 60000);
}
["mousemove", "keydown", "scroll", "touchstart"].forEach((ev) =>
  document.addEventListener(ev, resetIdle, { passive: true }),
);
resetIdle();

// CSS for idle animations
const idleStyle = document.createElement("style");
idleStyle.textContent = `
@keyframes grid-drift {
  0%,100%{background-position:0 0}
  50%{background-position:10px 10px}
}
@keyframes page-scan {
  0%{top:0;opacity:0.4} 95%{top:100vh;opacity:0.2} 100%{top:100vh;opacity:0}
}
@keyframes fadeUp {
  from{opacity:0;transform:translateX(-50%) translateY(8px)}
  to{opacity:1;transform:translateX(-50%) translateY(0)}
}
`;
document.head.appendChild(idleStyle);

/* ── TERMINAL ── */
const termOverlay = document.getElementById("term-overlay");
const termBody = document.getElementById("term-body");
const termInput = document.getElementById("term-input");
let cmdHist = [],
  histIdx = -1;

function openTerminal() {
  termOverlay?.classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(() => termInput?.focus(), 350);
}
function closeTerminal() {
  termOverlay?.classList.remove("open");
  document.body.style.overflow = "";
}
window.openTerminal = openTerminal;

document
  .querySelectorAll(".open-terminal")
  .forEach((el) => el.addEventListener("click", openTerminal));
document.querySelector(".td-r")?.addEventListener("click", closeTerminal);
termOverlay?.addEventListener("click", (e) => {
  if (e.target === termOverlay) closeTerminal();
});
document.querySelector(".td-y")?.addEventListener("click", () => {
  const w = document.getElementById("term-window");
  if (w) w.style.height = w.style.height === "40px" ? "" : "40px";
});
document.querySelector(".td-g")?.addEventListener("click", () => {
  const w = document.getElementById("term-window");
  if (w) {
    const big = w.style.width === "98vw";
    w.style.width = big ? "" : "98vw";
    w.style.height = big ? "" : "96vh";
  }
});

// Drag handle for mobile
let startY, startH;
document.querySelector(".drag-handle")?.addEventListener("touchstart", (e) => {
  const w = document.getElementById("term-window");
  startY = e.touches[0].clientY;
  startH = w?.offsetHeight || 500;
});
document.querySelector(".drag-handle")?.addEventListener("touchmove", (e) => {
  const w = document.getElementById("term-window");
  if (!w) return;
  const dy = startY - e.touches[0].clientY;
  w.style.height =
    Math.max(200, Math.min(startH + dy, innerHeight * 0.95)) + "px";
});

function termPrint(html, delay = 0) {
  return new Promise((res) =>
    setTimeout(() => {
      const div = document.createElement("span");
      div.className = "t-line";
      div.innerHTML = html;
      termBody?.appendChild(div);
      if (termBody) termBody.scrollTop = termBody.scrollHeight;
      res();
    }, delay),
  );
}

function tPrompt() {
  return `<span class="t-dim">┌──(</span><span class="t-red">ivan㉿kali</span><span class="t-dim">)-[~]<br>└─$</span>`;
}

/* ── GERMAN WORD OF THE DAY ── */
const DE_WORDS = [
  {
    de: "die Sicherheit",
    en: "security / safety",
    ex: "Die Sicherheit ist wichtig.",
  },
  { de: "das Netzwerk", en: "the network", ex: "Das Netzwerk ist sicher." },
  { de: "der Angriff", en: "the attack", ex: "Der Angriff wurde abgewehrt." },
  {
    de: "die Verteidigung",
    en: "the defence",
    ex: "Die Verteidigung war stark.",
  },
  {
    de: "das Passwort",
    en: "the password",
    ex: "Das Passwort ist verschlüsselt.",
  },
  {
    de: "die Verschlüsselung",
    en: "the encryption",
    ex: "Verschlüsselung schützt Daten.",
  },
  { de: "lernen", en: "to learn", ex: "Ich lerne jeden Tag Deutsch." },
  { de: "die Erfahrung", en: "the experience", ex: "Erfahrung ist wertvoll." },
  { de: "der Computer", en: "the computer", ex: "Der Computer ist schnell." },
  {
    de: "die Firewall",
    en: "the firewall",
    ex: "Die Firewall blockiert Angriffe.",
  },
  { de: "der Fehler", en: "the error / mistake", ex: "Aus Fehlern lernt man." },
  { de: "die Lösung", en: "the solution", ex: "Wir finden eine Lösung." },
  { de: "neugierig", en: "curious", ex: "Ich bin neugierig auf alles." },
  {
    de: "die Ausbildung",
    en: "the apprenticeship / training",
    ex: "Die Ausbildung dauert drei Jahre.",
  },
  { de: "stark", en: "strong", ex: "Das Passwort ist stark." },
  {
    de: "die Herausforderung",
    en: "the challenge",
    ex: "Jede Herausforderung macht stärker.",
  },
  { de: "schaffen", en: "to manage / achieve", ex: "Ich schaffe das!" },
  { de: "der Schutz", en: "the protection", ex: "Schutz ist notwendig." },
  { de: "entdecken", en: "to discover", ex: "Man kann viel entdecken." },
  {
    de: "die Fähigkeit",
    en: "the skill / ability",
    ex: "Diese Fähigkeit ist wichtig.",
  },
  { de: "verstehen", en: "to understand", ex: "Ich verstehe das langsam." },
  { de: "die Zukunft", en: "the future", ex: "Die Zukunft ist digital." },
  { de: "fleißig", en: "hardworking / diligent", ex: "Er ist sehr fleißig." },
  { de: "das Ziel", en: "the goal", ex: "Mein Ziel ist B2." },
  { de: "vorwärtskommen", en: "to make progress", ex: "Ich komme vorwärts." },
  { de: "der Schlüssel", en: "the key", ex: "Lernen ist der Schlüssel." },
  { de: "anwenden", en: "to apply", ex: "Ich wende mein Wissen an." },
  { de: "die Praxis", en: "the practice", ex: "Praxis macht den Meister." },
  { de: "mutig", en: "brave / bold", ex: "Sei mutig und lerne weiter." },
  {
    de: "der Fortschritt",
    en: "the progress",
    ex: "Ich sehe meinen Fortschritt.",
  },
];
function getDEWord() {
  const day = Math.floor(Date.now() / 86400000);
  return DE_WORDS[day % DE_WORDS.length];
}
window.getDEWord = getDEWord;
document
  .querySelectorAll(".de-word-de")
  .forEach((el) => (el.textContent = getDEWord().de));
document
  .querySelectorAll(".de-word-en")
  .forEach((el) => (el.textContent = getDEWord().en));
document
  .querySelectorAll(".de-word-ex")
  .forEach((el) => (el.textContent = getDEWord().ex));

/* ── LIVE SECURITY NEWS — primary + stack design ── */
const NEWS_SOURCES = [
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews&count=5",
    name: "The Hacker News",
    color: "#ff3b5c",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.bleepingcomputer.com/feed/&count=3",
    name: "BleepingComputer",
    color: "#00d4ff",
  },
  {
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://krebsonsecurity.com/feed/&count=2",
    name: "Krebs on Security",
    color: "#e2ff5d",
  },
];
const NEWS_FALLBACK = [
  {
    title:
      "Critical OpenSSH Vulnerability Allows Remote Code Execution on Linux Systems",
    source: "The Hacker News",
    link: "https://thehackernews.com",
    color: "#ff3b5c",
    time: "2h ago",
  },
  {
    title:
      "New Ransomware Strain Targets Healthcare Organisations Across Europe",
    source: "BleepingComputer",
    link: "https://bleepingcomputer.com",
    color: "#00d4ff",
    time: "4h ago",
  },
  {
    title: "Microsoft Patches Zero-Day Exploited in Active Attacks",
    source: "Krebs on Security",
    link: "https://krebsonsecurity.com",
    color: "#e2ff5d",
    time: "6h ago",
  },
  {
    title:
      "CISA Adds Three New Vulnerabilities to Known Exploited Vulnerabilities Catalog",
    source: "CISA",
    link: "https://cisa.gov",
    color: "#ff3b5c",
    time: "8h ago",
  },
  {
    title: "Nation-State Actors Abuse Cloud Services for Persistent Access",
    source: "The Hacker News",
    link: "https://thehackernews.com",
    color: "#ff3b5c",
    time: "12h ago",
  },
];

async function loadSecNews(containerId, autoRefresh) {
  const el = document.getElementById(containerId);
  if (!el) return;
  let all = [];
  for (const src of NEWS_SOURCES) {
    try {
      const r = await fetch(src.url);
      const d = await r.json();
      if (d.items?.length) {
        d.items.slice(0, 3).forEach((item) =>
          all.push({
            title: item.title,
            source: src.name,
            link: item.link,
            color: src.color,
            time: item.pubDate ? getTimeAgo(new Date(item.pubDate)) : "Recent",
          }),
        );
      }
    } catch {}
  }
  if (!all.length) all = NEWS_FALLBACK;
  renderSecNews(el, all);
  if (autoRefresh) setTimeout(() => loadSecNews(containerId, true), 300000);
}

function renderSecNews(el, items) {
  const primary = items[0];
  const rest = items.slice(1, 5);
  el.innerHTML = `
    <div class="news-grid">
      <a href="${primary.link}" target="_blank" rel="noopener" class="news-primary">
        <div class="np-badge">
          <span style="width:6px;height:6px;border-radius:50%;background:${primary.color};display:inline-block;flex-shrink:0"></span>
          PRIMARY · BREAKING
        </div>
        <div class="np-title">${primary.title}</div>
        <div class="np-meta">
          <span class="np-source">${primary.source} · ${primary.time}</span>
          <span class="np-link"><i class="ti ti-arrow-up-right" style="font-size:0.85rem"></i> Read</span>
        </div>
      </a>
      <div class="news-stack">
        ${rest
          .map(
            (item) => `
          <a href="${item.link}" target="_blank" rel="noopener" class="ns-item">
            <div class="ns-dot" style="background:${item.color}"></div>
            <div style="flex:1;min-width:0;">
              <div class="ns-source">${item.source} · ${item.time}</div>
              <div class="ns-title">${item.title}</div>
            </div>
            <i class="ti ti-arrow-up-right ns-arrow"></i>
          </a>`,
          )
          .join("")}
        <div class="news-live-bar">
          <div style="display:flex;align-items:center;gap:5px;"><div class="live-dot"></div> LIVE FEED</div>
          <span>refreshes every 5 min</span>
        </div>
      </div>
    </div>`;
  el.querySelector(".news-primary")?.classList.add("news-flash");
}
window.loadSecNews = loadSecNews;

function getTimeAgo(date) {
  const diff = Date.now() - date.getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d > 0) return d + "d ago";
  if (h > 0) return h + "h ago";
  return "Just now";
}

/* ── CVE OF THE DAY ── */
const CVES = [
  {
    id: "CVE-2024-3400",
    severity: "CRITICAL",
    product: "Palo Alto PAN-OS",
    desc: "Command injection in GlobalProtect gateway allows unauthenticated RCE.",
  },
  {
    id: "CVE-2024-21762",
    severity: "CRITICAL",
    product: "Fortinet FortiOS",
    desc: "Out-of-bounds write vulnerability allows unauthenticated remote code execution.",
  },
  {
    id: "CVE-2023-46604",
    severity: "CRITICAL",
    product: "Apache ActiveMQ",
    desc: "Allows remote code execution via specially crafted ClassInfo OpenWire protocol message.",
  },
  {
    id: "CVE-2023-44487",
    severity: "HIGH",
    product: "HTTP/2 Protocol",
    desc: "Rapid Reset Attack enables large-scale DDoS by resetting streams rapidly.",
  },
  {
    id: "CVE-2024-1709",
    severity: "CRITICAL",
    product: "ConnectWise ScreenConnect",
    desc: "Authentication bypass allows creation of admin accounts without credentials.",
  },
  {
    id: "CVE-2022-30190",
    severity: "HIGH",
    product: "Microsoft MSDT (Follina)",
    desc: "Remote code execution via malicious Office documents without macros.",
  },
  {
    id: "CVE-2021-44228",
    severity: "CRITICAL",
    product: "Apache Log4Shell",
    desc: "JNDI injection in logging library affects millions of Java applications worldwide.",
  },
];
function getCVE() {
  return CVES[Math.floor(Date.now() / 86400000) % CVES.length];
}
window.getCVE = getCVE;
const cve = getCVE();
document.querySelectorAll(".cve-id").forEach((el) => (el.textContent = cve.id));
document
  .querySelectorAll(".cve-product")
  .forEach((el) => (el.textContent = cve.product));
document
  .querySelectorAll(".cve-desc")
  .forEach((el) => (el.textContent = cve.desc));
document.querySelectorAll(".cve-severity").forEach((el) => {
  el.textContent = cve.severity;
  el.className =
    "cve-severity chip " +
    (cve.severity === "CRITICAL" ? "chip-red" : "chip-amber");
});

/* ── TERMINAL COMMANDS ── */
const CMDS = {
  help: () => [
    `<span class="t-lime">// available commands</span>`,
    ``,
    `<span class="t-cyan">  whoami      </span> who is Ivan`,
    `<span class="t-cyan">  ls          </span> list skills as files`,
    `<span class="t-cyan">  ls labs/    </span> list all operations`,
    `<span class="t-cyan">  nmap        </span> scan this system`,
    `<span class="t-cyan">  ssh [host]  </span> connect somewhere`,
    `<span class="t-cyan">  ping        </span> check connectivity`,
    `<span class="t-cyan">  date        </span> time + live counters`,
    `<span class="t-cyan">  uname -a    </span> system info`,
    `<span class="t-cyan">  history     </span> command history`,
    `<span class="t-cyan">  hire        </span> best command here`,
    `<span class="t-cyan">  flag        </span> 🚩`,
    `<span class="t-cyan">  matrix      </span> ...`,
    `<span class="t-cyan">  clear       </span> clear output`,
    ``,
    `<span class="t-dim">  there are 5 flags hidden on this site.</span>`,
  ],
  whoami: () => [
    `<span class="t-lime">[ IDENTITY ]</span>`,
    `<span class="t-white">Name:    </span> Ivan Kaweesa`,
    `<span class="t-white">Role:    </span> IT Systems & Cybersecurity`,
    `<span class="t-white">Learning:</span> Deutsch 🇩🇪 — A1 → B2`,
    `<span class="t-white">Open to: </span> Opportunities worldwide`,
    `<span class="t-white">Goal:    </span> Professional in IT & Cybersecurity`,
    ``,
    `<span class="t-dim">No theory without practice.</span>`,
  ],
  ls: () => [
    `<span class="t-dim">drwxr-xr-x  ivan  staff  labs/</span>`,
    `<span class="t-cyan">pentest.sh</span>            <span class="t-dim">offensive security</span>`,
    `<span class="t-cyan">network-admin.conf</span>    <span class="t-dim">routing, vlans, switching</span>`,
    `<span class="t-cyan">active-directory.exe</span>  <span class="t-dim">windows domain environments</span>`,
    `<span class="t-cyan">python-tools.py</span>       <span class="t-dim">automation & scripting</span>`,
    `<span class="t-cyan">wireshark.pcap</span>        <span class="t-dim">packet analysis</span>`,
    `<span class="t-cyan">deutsch.mp3</span>           <span class="t-dim">growing daily — wächst täglich</span>`,
    `<span class="t-dim">try: </span><span class="t-lime">ls labs/</span>`,
  ],
  "ls labs/": () => [
    `<span class="t-lime">labs/</span>`,
    `  <span class="t-cyan">op-001-windows-server/  </span><span class="t-green">✓</span> AD, GPO, hardening`,
    `  <span class="t-cyan">op-002-kali-linux/      </span><span class="t-green">✓</span> Nmap + vsftpd exploit`,
    `  <span class="t-cyan">op-003-web-app/         </span><span class="t-green">✓</span> OWASP Top 10`,
    `  <span class="t-cyan">op-004-telnet-exploit/  </span><span class="t-green">✓</span> Plaintext creds via Wireshark`,
    `  <span class="t-cyan">op-005-network-infra/   </span><span class="t-amber">⟳</span> Routing, VLANs — in progress`,
    `  <span class="t-cyan">op-006-siem-blueteam/   </span><span class="t-amber">⟳</span> Splunk, IR — coming soon`,
  ],
  "nmap localhost": () => [
    `<span class="t-dim">Starting Nmap — ivan.sys</span>`,
    ``,
    `<span class="t-white">PORT      STATE   SERVICE</span>`,
    `<span class="t-green">80/tcp    open    portfolio</span>`,
    `<span class="t-green">443/tcp   open    portfolio-ssl</span>`,
    `<span class="t-cyan">22/tcp    closed  ssh  </span><span class="t-dim">// not that easy</span>`,
    `<span class="t-lime">1337/tcp  open    curiosity</span>`,
    `<span class="t-amber">4040/tcp  open    opportunities</span>`,
    ``,
    `<span class="t-dim">Nmap done: 1 host up</span>`,
  ],
  "ssh germany": () => [
    `<span class="t-dim">Connecting to de.opportunities.world...</span>`,
    `<span class="t-cyan">Language requirement: B2</span>`,
    `<span class="t-amber">Current level: A1 — Progress: 12%</span>`,
    `<span class="t-lime">Connection maintained. Auf geht's.</span>`,
  ],
  ping: () => [
    `PING ivan.sys`,
    `<span class="t-green">64 bytes: ttl=64 time=0.001ms — always online</span>`,
    `<span class="t-green">64 bytes: ttl=64 time=0.001ms — always online</span>`,
    `<span class="t-green">64 bytes: ttl=64 time=0.001ms — always online</span>`,
  ],
  date: () => {
    const now = new Date();
    const cd = Math.floor((now - C.cyberStart) / 86400000);
    const dd = Math.max(0, Math.floor((now - C.deStart) / 86400000));
    return [
      `<span class="t-white">${now.toUTCString()}</span>`,
      `<span class="t-lime">Cybersecurity: ${cd} days</span>`,
      `<span class="t-amber">German:        ${dd} days</span>`,
    ];
  },
  "uname -a": () => [
    `<span class="t-cyan">IVAN.SYS 2.0 — Curiosity, Kali Linux, Deutsch lessons. Kernel: handcrafted.</span>`,
  ],
  history: () => {
    const h = [...cmdHist].slice(0, 8);
    return h.length
      ? h.map((c, i) => `<span class="t-dim">${i + 1}</span>  ${c}`)
      : [`<span class="t-dim">no history</span>`];
  },
  germany: () => [
    `<span class="t-amber">  ████████████████████████</span>`,
    `<span class="t-white">  ████████████████████████</span>`,
    `<span class="t-red">  ████████████████████████</span>`,
    ``,
    `<span class="t-lime">Target: Germany. Language: B2. Status: in progress.</span>`,
  ],
  hire: () => {
    setTimeout(() => {
      closeTerminal();
      navigateTo("../pages/contact.html?subject=I+want+to+work+with+you");
    }, 1200);
    return [
      `<span class="t-lime">Good initiative. Routing to secure channel...</span>`,
    ];
  },
  flag: () => {
    addFlag(3);
    return [
      `<span class="t-lime">FLAG_03/05 {t3rm1n4l_3xpl0r3r}</span>`,
      `<span class="t-dim">2 more flags hidden. Check the source. Check /humans.txt.</span>`,
    ];
  },
  "cat flag.txt": () => [
    `<span class="t-white">FLAG_03/05 {t3rm1n4l_3xpl0r3r}</span>`,
    `<span class="t-red">████_04/05 {████████}</span>`,
    `<span class="t-red">████_05/05 {████████}</span>`,
  ],
  "ls /secret/": () => [
    `<span class="t-cyan">found_me.txt</span>  <span class="t-dim">// try cat</span>`,
    `<span class="t-cyan">now.html</span>      <span class="t-dim">// /pages/now.html</span>`,
  ],
  "cat found_me.txt": () => [
    `<span class="t-lime">You found the secret directory.</span>`,
    ``,
    `<span class="t-white">Ivan here. If you're reading this,</span>`,
    `<span class="t-white">you're exactly the kind of person I want to know.</span>`,
    ``,
    `<span class="t-dim">There's a page at /pages/now.html</span>`,
    `<span class="t-dim">that nobody links to. You earned it.</span>`,
  ],
  matrix: () => {
    matrixRain();
    return [`<span class="t-dim">Initialising...</span>`];
  },
  "sudo rm -rf /": () => [
    `<span class="t-red">Permission denied.</span>`,
    `<span class="t-dim">Nice try. I'm not that vulnerable.</span>`,
    `<span class="t-dim">This incident has been logged. 👁</span>`,
  ],
  exit: () => {
    setTimeout(() => {
      closeTerminal();
      setTimeout(() => {
        openTerminal();
        termPrint(
          `<span class="t-lime">You can check out any time you like...</span>`,
        );
        termPrint(
          `<span class="t-dim">...but you can never leave.</span>`,
          600,
        );
      }, 500);
    }, 600);
    return [`<span class="t-dim">Closing...</span>`];
  },
  clear: () => {
    if (termBody)
      termBody.innerHTML = `
      <span class="t-line"><span class="t-dim">┌──(</span><span class="t-red">ivan㉿kali</span><span class="t-dim">)-[~]</span></span>
      <span class="t-line"><span class="t-lime">└─$</span> Terminal cleared.</span>`;
    return [];
  },
};

async function runCmd(raw) {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return;
  cmdHist.unshift(cmd);
  if (cmdHist.length > 20) cmdHist.pop();
  histIdx = -1;
  await termPrint(
    `${tPrompt()}&nbsp;<span class="t-white">${raw.trim()}</span>`,
  );
  const fn = CMDS[cmd];
  if (fn) {
    const lines = fn();
    for (let i = 0; i < lines.length; i++)
      await termPrint(lines[i] || "&nbsp;", i * 30);
    await termPrint("&nbsp;", lines.length * 30);
  } else {
    // Name detection
    if (/^[a-z]+$/.test(cmd) && cmd.length > 1) {
      const name = cmd.charAt(0).toUpperCase() + cmd.slice(1);
      await termPrint(
        `<span class="t-lime">Hello, ${name}. Ivan is expecting you.</span>`,
        30,
      );
    } else {
      await termPrint(
        `<span class="t-red">command not found: ${cmd}</span>`,
        30,
      );
      await termPrint(
        `<span class="t-dim">Type <span class="t-lime">help</span> for commands</span>`,
        60,
      );
    }
    await termPrint("&nbsp;", 90);
  }
}

termInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const v = termInput.value;
    termInput.value = "";
    runCmd(v);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    histIdx = Math.min(histIdx + 1, cmdHist.length - 1);
    termInput.value = cmdHist[histIdx] || "";
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    histIdx = Math.max(histIdx - 1, -1);
    termInput.value = histIdx >= 0 ? cmdHist[histIdx] : "";
  }
});
termInput?.addEventListener("focus", () =>
  setTimeout(
    () => termInput.scrollIntoView({ behavior: "smooth", block: "center" }),
    300,
  ),
);

function matrixRain() {
  const ch = "アイウエオカキクケコ0123456789ABCDEF";
  let n = 0;
  const iv = setInterval(() => {
    const line = Array.from(
      { length: 38 },
      () => ch[Math.floor(Math.random() * ch.length)],
    ).join("");
    termPrint(
      `<span style="color:#00ff9d;opacity:${0.3 + Math.random() * 0.7}">${line}</span>`,
    );
    if (++n >= 18) {
      clearInterval(iv);
      setTimeout(() => runCmd("clear"), 200);
    }
  }, 80);
}

/* ── COMMAND PALETTE ── */
const CMD_DATA = [
  {
    ico: "ti-home",
    name: "Home",
    desc: "Back to the start",
    url: "../index.html",
  },
  { ico: "ti-user", name: "About", desc: "Who is Ivan?", url: "about.html" },
  {
    ico: "ti-radar",
    name: "Arsenal",
    desc: "Skills, tools, certifications",
    url: "arsenal.html",
  },
  {
    ico: "ti-activity",
    name: "Operations",
    desc: "Lab writeups and projects",
    url: "operations.html",
  },
  {
    ico: "ti-chart-bar",
    name: "Intel",
    desc: "Why cybersecurity matters",
    url: "intel.html",
  },
  {
    ico: "ti-mail",
    name: "Contact",
    desc: "Open a secure channel",
    url: "contact.html",
  },
  {
    ico: "ti-terminal-2",
    name: "Open Terminal",
    desc: "Launch the Kali terminal",
    url: "#",
    fn: () => {
      closeCMD();
      openTerminal();
    },
  },
  {
    ico: "ti-user-check",
    name: "Hire Ivan",
    desc: "Pre-fill contact form",
    url: "contact.html?subject=I+want+to+work+with+you",
  },
  {
    ico: "ti-flag",
    name: "Hunt Flags",
    desc: "5 flags hidden on this site",
    url: "#",
    fn: () => {
      closeCMD();
      openTerminal();
    },
  },
];

const cmdOv = document.getElementById("cmd-overlay");
const cmdInp = document.getElementById("cmd-input");
const cmdRes = document.getElementById("cmd-results");
let cmdFiltered = CMD_DATA,
  cmdSel = 0;

function openCMD() {
  cmdOv?.classList.add("open");
  cmdInp?.focus();
  renderCMD("");
}
function closeCMD() {
  cmdOv?.classList.remove("open");
  if (cmdInp) cmdInp.value = "";
}
window.openCMD = openCMD;

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    openCMD();
  }
  if (e.key === "?" && !e.target.matches("input,textarea")) openCMD();
  if (e.key === "Escape") {
    closeTerminal();
    closeCMD();
    closeDrawer();
  }
  if (e.key === "t" && !e.target.matches("input,textarea")) openTerminal();
});
cmdOv?.addEventListener("click", (e) => {
  if (e.target === cmdOv) closeCMD();
});
cmdInp?.addEventListener("input", () => renderCMD(cmdInp.value));
cmdInp?.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    cmdSel = Math.min(cmdSel + 1, cmdFiltered.length - 1);
    renderCMD(cmdInp.value, true);
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    cmdSel = Math.max(cmdSel - 1, 0);
    renderCMD(cmdInp.value, true);
  }
  if (e.key === "Enter") selectCMD(cmdSel);
});

function renderCMD(q, keepSel = false) {
  if (!keepSel) cmdSel = 0;
  cmdFiltered = CMD_DATA.filter(
    (d) =>
      !q ||
      d.name.toLowerCase().includes(q.toLowerCase()) ||
      d.desc.toLowerCase().includes(q.toLowerCase()),
  );
  if (!cmdRes) return;
  if (!cmdFiltered.length) {
    cmdRes.innerHTML = '<div class="cmd-empty">No results</div>';
    return;
  }
  cmdRes.innerHTML = cmdFiltered
    .map(
      (d, i) => `
    <div class="cmd-result${i === cmdSel ? " sel" : ""}" data-i="${i}">
      <i class="ti ${d.ico} cmd-result-ico"></i>
      <div><div class="cmd-result-name">${d.name}</div><div class="cmd-result-desc">${d.desc}</div></div>
    </div>`,
    )
    .join("");
  cmdRes.querySelectorAll(".cmd-result").forEach((el, i) => {
    el.addEventListener("mouseenter", () => {
      cmdSel = i;
      renderCMD(cmdInp?.value || "", true);
    });
    el.addEventListener("click", () => selectCMD(i));
  });
}
function selectCMD(i) {
  const d = cmdFiltered[i];
  if (!d) return;
  closeCMD();
  if (d.fn) d.fn();
  else if (d.url && d.url !== "#") navigateTo(d.url);
}

/* ── EASTER EGGS ── */
// Console
console.log(
  "%c\n╔══════════════════════════════════════════════════════╗\n║  IVAN.SYS — CLASSIFIED TERMINAL                      ║\n║  Agent: Ivan Kaweesa                                 ║\n║                                                      ║\n║  You opened DevTools. Suspicious. Or impressive.     ║\n║  Either way — respect.                               ║\n║                                                      ║\n║  FLAG_01/05 {d3v_t00ls_cl34r3d}                      ║\n║                                                      ║\n║  Try: ivan.unlock() in this console.                 ║\n╚══════════════════════════════════════════════════════╝\n",
  "color:#e2ff5d;font-family:monospace;font-size:11px",
);
console.log(
  "%c// there are 5 flags on this site. good luck.",
  "color:#4a6080;font-family:monospace",
);
addFlag(1);

window.ivan = {
  unlock: () => {
    console.log(
      "%c\n  ██████╗ ██╗   ██╗ █████╗ ███╗   ██╗\n  ██╔══██╗██║   ██║██╔══██╗████╗  ██║\n  ██║  ██║██║   ██║███████║██╔██╗ ██║\n  ██║  ██║╚██╗ ██╔╝██╔══██║██║╚██╗██║\n  ██████╔╝ ╚████╔╝ ██║  ██║██║ ╚████║\n  ╚═════╝   ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝\n\n  IT Systems & Cybersecurity\n  Open to opportunities worldwide\n  ivan.unlock() — you found the easter egg.\n",
      "color:#8b5cf6;font-family:monospace;font-size:11px",
    );
    addFlag(3);
  },
  help: () =>
    console.log("Available: ivan.unlock(), ivan.flags(), ivan.contact()"),
  flags: () => {
    const f = JSON.parse(safeStorage.get(localStorage, "iv-flags") || "[]");
    console.log(
      `%cFlags found: ${f.length}/5`,
      "color:#e2ff5d;font-family:monospace",
    );
    console.log(
      `%cFound: ${f.join(", ") || "none yet"}`,
      "color:#4a6080;font-family:monospace",
    );
  },
  contact: () =>
    console.log(`%cEmail: ${C.email}`, "color:#e2ff5d;font-family:monospace"),
};

// Right-click
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  document.getElementById("ctx-menu")?.remove();
  const found = JSON.parse(
    safeStorage.get(localStorage, "iv-flags") || "[]",
  ).length;
  const m = document.createElement("div");
  m.id = "ctx-menu";
  m.style.cssText = `position:fixed;z-index:9990;
    left:${Math.min(e.clientX, innerWidth - 200)}px;
    top:${Math.min(e.clientY, innerHeight - 240)}px;
    background:var(--bg-2);
    backdrop-filter:blur(20px);
    border:0.5px solid var(--border);border-radius:var(--r-md);
    padding:6px;min-width:200px;
    box-shadow:0 20px 40px rgba(0,0,0,0.5);
    font-family:var(--font-body);font-size:0.82rem;`;
  const item = (icon, text, fn) => {
    const d = document.createElement("div");
    d.style.cssText = `display:flex;align-items:center;gap:8px;padding:7px 10px;
      border-radius:var(--r-sm);color:var(--text-2);cursor:pointer;transition:background 0.15s`;
    d.innerHTML = `<i class="ti ${icon}" style="color:var(--accent)"></i> ${text}`;
    d.addEventListener(
      "mouseenter",
      () => (d.style.background = "var(--bg-3)"),
    );
    d.addEventListener("mouseleave", () => (d.style.background = ""));
    d.addEventListener("click", () => {
      m.remove();
      fn();
    });
    return d;
  };
  m.appendChild(
    item("ti-code", "View source", () => window.open(location.href)),
  );
  m.appendChild(
    item("ti-copy", "Copy URL", () =>
      navigator.clipboard.writeText(location.href),
    ),
  );
  const sep = document.createElement("div");
  sep.style.cssText = "height:0.5px;background:var(--border);margin:4px 0";
  m.appendChild(sep);
  const flagItem = item(
    "ti-flag",
    `Hunt flags <span style="color:var(--text-3);font-size:0.72rem;margin-left:auto">${found}/5</span>`,
    openTerminal,
  );
  m.appendChild(flagItem);
  m.appendChild(item("ti-terminal-2", "Open terminal", openTerminal));
  m.appendChild(item("ti-search", "Command palette", openCMD));
  document.body.appendChild(m);
  const close = () => {
    m.remove();
    document.removeEventListener("click", close);
  };
  setTimeout(() => document.addEventListener("click", close), 10);
});

// Konami
let konamiSeq = [];
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
let konamiCount = 0;
document.addEventListener("keydown", (e) => {
  konamiSeq.push(e.key);
  konamiSeq = konamiSeq.slice(-10);
  if (konamiSeq.join(",") === KONAMI.join(",")) {
    konamiCount++;
    if (konamiCount === 1) {
      addFlag(2);
      breach();
    } else {
      termPrint && openTerminal();
      setTimeout(async () => {
        await termPrint(
          `<span class="t-lime">[ivan]: I see you've been here before.</span>`,
        );
        await termPrint(
          `<span class="t-dim">That's the Konami code. Try something harder.</span>`,
          400,
        );
        await termPrint(
          `<span class="t-dim">Hint 1: read the source code.</span>`,
          800,
        );
        await termPrint(
          `<span class="t-dim">Hint 2: visit /humans.txt</span>`,
          1200,
        );
        await termPrint(
          `<span class="t-dim">Hint 3: ivan.unlock() in the console.</span>`,
          1600,
        );
      }, 400);
    }
  }
});

function breach() {
  const ov = document.getElementById("breach-overlay");
  const bt = document.getElementById("breach-term");
  if (!ov || !bt) return;
  ov.classList.add("active");
  document.body.style.overflow = "hidden";
  const lines = [
    "[!] INTRUSION DETECTED",
    `[!] TRACING SOURCE... 192.168.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`,
    "[!] DEPLOYING COUNTERMEASURES...",
    "[!] ANALYSING THREAT VECTOR...",
    "[!] ...",
    "[!] ...",
    "[!] Just kidding.",
    "",
    "FLAG_02/05 {k0nam1_s3qu3nc3}",
    "",
    "ACCESS GRANTED — you think like a hacker.",
  ];
  let i = 0;
  bt.innerHTML = "";
  const iv = setInterval(() => {
    bt.innerHTML += (lines[i] || "") + "<br>";
    if (++i >= lines.length) {
      clearInterval(iv);
      setTimeout(() => {
        ov.classList.remove("active");
        document.body.style.overflow = "";
      }, 1200);
    }
  }, 300);
  if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
}

// Flag system
function addFlag(n) {
  const stored = JSON.parse(safeStorage.get(localStorage, "iv-flags") || "[]");
  if (!stored.includes(n)) {
    stored.push(n);
    safeStorage.set(localStorage, "iv-flags", JSON.stringify(stored));
    if (stored.length >= 5) showDebrief();
  }
  document
    .querySelectorAll(".flag-count")
    .forEach((el) => (el.textContent = stored.length));
}
window.addFlag = addFlag;
// Init flag count display
const fc = JSON.parse(safeStorage.get(localStorage, "iv-flags") || "[]").length;
document.querySelectorAll(".flag-count").forEach((el) => (el.textContent = fc));

function showDebrief() {
  const d = document.getElementById("debrief");
  if (d) {
    d.style.display = "flex";
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  }
}
if (location.hash === "#debrief") showDebrief();

// Tab title change
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    document.title = "Ivan.K — come back!";
  } else {
    document.title =
      document.querySelector("title")?.dataset.orig || document.title;
  }
});
const titleEl = document.querySelector("title");
if (titleEl) titleEl.dataset.orig = titleEl.textContent;

// Favicon pulse
(function pulseFav() {
  const link = document.querySelector('link[rel="icon"]');
  if (!link) return;
  const orig = link.href;
  setInterval(() => {
    link.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%23080c14'/><polygon points='16,4 28,10 28,22 16,28 4,22 4,10' fill='none' stroke='%23ffffff' stroke-width='1.5'/><circle cx='16' cy='16' r='2.5' fill='%23e2ff5d'/></svg>`;
    setTimeout(() => {
      link.href = orig;
    }, 300);
  }, 8000);
})();

// Keyboard shortcut map (? key)
document.addEventListener("keydown", (e) => {
  if (e.key !== "?" || e.target.matches("input,textarea")) return;
  const existing = document.getElementById("shortcut-map");
  if (existing) {
    existing.remove();
    return;
  }
  const map = document.createElement("div");
  map.id = "shortcut-map";
  map.style.cssText = `position:fixed;inset:0;z-index:9990;
    background:rgba(5,8,15,0.85);backdrop-filter:blur(10px);
    display:flex;align-items:center;justify-content:center;`;
  map.innerHTML = `<div style="background:var(--bg-2);border:0.5px solid var(--border-hi);
    border-radius:var(--r-xl);padding:2rem;min-width:320px;font-family:var(--font-mono);">
    <div style="font-size:0.7rem;color:var(--accent);letter-spacing:2px;margin-bottom:1.5rem;">KEYBOARD SHORTCUTS</div>
    ${[
      ["Ctrl+K", "Command palette"],
      ["T", "Open terminal"],
      ["?", "This menu"],
      ["Esc", "Close everything"],
      ["↑↑↓↓←→←→BA", "...you know what this does"],
    ]
      .map(
        ([
          k,
          v,
        ]) => `<div style="display:flex;justify-content:space-between;gap:2rem;padding:6px 0;border-bottom:0.5px solid var(--border);font-size:0.8rem;">
      <span style="color:var(--accent)">${k}</span><span style="color:var(--text-2)">${v}</span></div>`,
      )
      .join("")}
    <div style="text-align:center;margin-top:1.5rem;font-size:0.72rem;color:var(--text-3)">Press ? or click to close</div>
  </div>`;
  map.addEventListener("click", () => map.remove());
  document.body.appendChild(map);
});

/* ── PRINT QR ── */
window.addEventListener("beforeprint", () => {
  const qr = document.createElement("div");
  qr.id = "print-qr";
  qr.style.cssText =
    "display:none;text-align:center;padding:20px;font-family:monospace;font-size:12px;";
  qr.innerHTML = `<p>Scan to visit: <strong>${location.origin}</strong></p>
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(location.origin)}" alt="QR code"/>`;
  document.body.appendChild(qr);
});
window.addEventListener("afterprint", () =>
  document.getElementById("print-qr")?.remove(),
);

/* ── CONTACT FORM ── */
document
  .getElementById("contact-form")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();
    const fb = document.getElementById("form-feedback");
    const btn = document.getElementById("submit-btn");
    const name = document.getElementById("cf-name")?.value.trim();
    const email = document.getElementById("cf-email")?.value.trim();
    const msg = document.getElementById("cf-message")?.value.trim();
    if (!name || !email || !msg) {
      showFeedback(fb, "Please fill in all required fields.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback(fb, "Please enter a valid email address.", "error");
      return;
    }
    // Save to localStorage in case of navigation
    safeStorage.set(
      localStorage,
      "iv-form-draft",
      JSON.stringify({ name, email, msg }),
    );
    btn.disabled = true;
    btn.innerHTML =
      '<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Transmitting...';
    try {
      const res = await fetch(C.formspree, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject: document.getElementById("cf-subject")?.value,
          message: msg,
        }),
      });
      if (res.ok) {
        safeStorage.remove(localStorage, "iv-form-draft");
        // Transform form to confirmation
        const form = document.getElementById("contact-form");
        form.style.transition = "all 0.4s ease";
        form.style.opacity = "0";
        setTimeout(() => {
          form.innerHTML = `<div style="text-align:center;padding:2rem;">
          <div style="font-size:2rem;margin-bottom:1rem;color:var(--green)"><i class="ti ti-circle-check"></i></div>
          <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:600;color:var(--text-1);margin-bottom:0.5rem">Message transmitted.</div>
          <div style="color:var(--text-2);font-size:0.9rem;margin-bottom:1.5rem">Ivan replies personally within 24 hours.</div>
          <button class="btn btn-outline" onclick="location.reload()">Send another</button>
        </div>`;
          form.style.opacity = "1";
        }, 400);
        if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
      } else throw new Error();
    } catch {
      showFeedback(fb, "Transmission failed. Try emailing directly.", "error");
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-send"></i> Transmit message';
  });

// Restore draft
const draft = JSON.parse(
  safeStorage.get(localStorage, "iv-form-draft") || "null",
);
if (draft) {
  if (document.getElementById("cf-name"))
    document.getElementById("cf-name").value = draft.name || "";
  if (document.getElementById("cf-email"))
    document.getElementById("cf-email").value = draft.email || "";
  if (document.getElementById("cf-message"))
    document.getElementById("cf-message").value = draft.msg || "";
}

// Real-time validation
document.getElementById("cf-email")?.addEventListener("input", function () {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value);
  this.style.borderColor =
    this.value.length > 3 ? (valid ? "var(--green)" : "var(--red)") : "";
  this.style.boxShadow =
    this.value.length > 3
      ? valid
        ? "0 0 0 3px rgba(0,255,157,0.1)"
        : "0 0 0 3px rgba(255,59,92,0.1)"
      : "";
});

function showFeedback(el, msg, type) {
  if (!el) return;
  el.textContent = (type === "error" ? "⚠ " : "✅ ") + msg;
  el.className = `form-feedback show ${type}`;
}

// Pre-fill subject from URL
const sp = new URLSearchParams(location.search).get("subject");
if (sp && document.getElementById("cf-subject"))
  document.getElementById("cf-subject").value = decodeURIComponent(sp);
