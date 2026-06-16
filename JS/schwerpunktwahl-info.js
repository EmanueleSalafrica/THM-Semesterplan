const focusApp = document.querySelector(".focus-app");
const panels = Array.from(document.querySelectorAll("[data-focus-panel]"));

let startX = 0;
let startY = 0;

function isMobileLayout() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function setFocusMode(mode) {
  focusApp.dataset.focusMode = mode;
}

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
