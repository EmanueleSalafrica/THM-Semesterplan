const focusApp = document.querySelector(".focus-app");
const panels = Array.from(document.querySelectorAll("[data-focus-panel]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const animatedContent = new WeakSet();

let startX = 0;
let startY = 0;
let currentMode = "";

if (window.gsap && window.SplitText) {
  gsap.registerPlugin(SplitText);
}

function isMobileLayout() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function setFocusMode(mode) {
  if (currentMode === mode) {
    return;
  }

  currentMode = mode;
  focusApp.dataset.focusMode = mode;

  if (!window.gsap || reduceMotion.matches) {
    return;
  }

  requestAnimationFrame(() => {
    if (mode === "overview" || mode === "desktop") {
      animateOverview();
    } else {
      animatePanel(mode);
    }
  });
}

function splitAndAnimate(element, type, vars) {
  if (!element || !window.gsap) {
    return;
  }

  if (!window.SplitText) {
    gsap.fromTo(element, vars.from, vars.to);
    return;
  }

  const split = SplitText.create(element, {
    type,
    aria: "auto"
  });
  const targets = type === "chars" ? split.chars : split.words;
  gsap.fromTo(targets, vars.from, {
    ...vars.to,
    onComplete: () => split.revert()
  });
}

function animateOverview() {
  const question = document.querySelector(".focus-question h1");

  gsap.killTweensOf(panels);
  gsap.fromTo(panels, {
    xPercent: (index) => index === 0 ? -105 : 105,
    opacity: 0
  }, {
    xPercent: 0,
    opacity: 1,
    duration: 0.65,
    stagger: 0.08,
    ease: "power3.out",
    clearProps: "transform,opacity"
  });

  splitAndAnimate(question, "chars", {
    from: { y: 24, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.45, stagger: 0.025, ease: "power2.out" }
  });

  panels.forEach((panel, index) => {
    splitAndAnimate(panel.querySelector(".panel-title h2"), "chars", {
      from: { x: index === 0 ? -18 : 18, opacity: 0 },
      to: { x: 0, opacity: 1, duration: 0.35, stagger: 0.018, delay: 0.16, ease: "power2.out" }
    });
    splitAndAnimate(panel.querySelector(".panel-title p"), "words", {
      from: { y: 14, opacity: 0 },
      to: { y: 0, opacity: 1, duration: 0.3, stagger: 0.035, delay: 0.24, ease: "power2.out" }
    });
  });
}

function animateContentBlock(block, index) {
  if (animatedContent.has(block) || !window.gsap || reduceMotion.matches) {
    return;
  }

  animatedContent.add(block);
  const direction = index % 2 === 0 ? -1 : 1;
  const image = block.querySelector(".image-placeholder");
  const heading = block.querySelector("h3, h4");
  const paragraphs = block.querySelectorAll("p");
  const timeline = gsap.timeline();

  if (heading) {
    if (window.SplitText) {
      const headingSplit = SplitText.create(heading, { type: "chars", aria: "auto" });
      timeline.fromTo(headingSplit.chars, {
        y: 20,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.018,
        ease: "power2.out",
        onComplete: () => headingSplit.revert()
      });
    } else {
      timeline.fromTo(heading, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 });
    }
  }

  paragraphs.forEach((paragraph) => {
    if (window.SplitText) {
      const paragraphSplit = SplitText.create(paragraph, { type: "words", aria: "auto" });
      timeline.fromTo(paragraphSplit.words, {
        y: 12,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.28,
        stagger: 0.018,
        ease: "power2.out",
        onComplete: () => paragraphSplit.revert()
      }, heading ? "-=0.18" : 0);
    } else {
      timeline.fromTo(paragraph, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
    }
  });

  if (image) {
    timeline.fromTo(image, {
      x: direction * Math.min(window.innerWidth * 0.55, 460),
      opacity: 0
    }, {
      x: 0,
      opacity: 1,
      duration: 0.55,
      ease: "power3.out",
      clearProps: "transform,opacity"
    }, 0);
  }
}

function animatePanel(panelName) {
  const panel = document.querySelector(`[data-focus-panel="${panelName}"]`);
  if (!panel) {
    return;
  }

  splitAndAnimate(panel.querySelector(".panel-title h2"), "chars", {
    from: { y: 22, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.38, stagger: 0.02, ease: "power2.out" }
  });

  splitAndAnimate(panel.querySelector(".panel-title p"), "words", {
    from: { y: 12, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.3, stagger: 0.025, delay: 0.08, ease: "power2.out" }
  });

  panel.querySelectorAll(".intro-block, .module-entry").forEach((block, index) => {
    const rect = block.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      animateContentBlock(block, index);
    }
  });
}

const contentObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const blocks = Array.from(entry.target.parentElement.querySelectorAll(".intro-block, .module-entry"));
      animateContentBlock(entry.target, blocks.indexOf(entry.target));
      contentObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".intro-block, .module-entry").forEach((block) => {
  contentObserver.observe(block);
});

function openPanel(panelName) {
  if (!isMobileLayout()) {
    return;
  }

  setFocusMode(panelName);
}

function resetMobileOverview() {
  if (isMobileLayout()) {
    setFocusMode("overview");
  } else {
    setFocusMode("desktop");
  }
}

function handleSwipe(endX, endY) {
  if (!isMobileLayout()) {
    return;
  }

  const distanceX = endX - startX;
  const distanceY = endY - startY;

  if (Math.abs(distanceX) < 38 || Math.abs(distanceX) < Math.abs(distanceY)) {
    return;
  }

  openPanel(distanceX < 0 ? "web" : "media");
}

panels.forEach((panel) => {
  panel.addEventListener("click", () => {
    openPanel(panel.dataset.focusPanel);
  });

  panel.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPanel(panel.dataset.focusPanel);
    }
  });
});

focusApp.addEventListener("touchstart", (event) => {
  startX = event.changedTouches[0].clientX;
  startY = event.changedTouches[0].clientY;
});

focusApp.addEventListener("touchend", (event) => {
  handleSwipe(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
});

focusApp.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && !isMobileLayout()) {
    return;
  }

  startX = event.clientX;
  startY = event.clientY;
});

focusApp.addEventListener("pointerup", (event) => {
  if (event.pointerType === "mouse" && !isMobileLayout()) {
    return;
  }

  handleSwipe(event.clientX, event.clientY);
});

window.addEventListener("resize", resetMobileOverview);

resetMobileOverview();
