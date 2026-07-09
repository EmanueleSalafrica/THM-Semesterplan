(() => {
  const root = document.querySelector("[data-start-background]");
  const startScreen = document.querySelector('[data-screen="start"]');
  const gsapInstance = window.gsap;

  if (!root || !startScreen || !gsapInstance) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const circles = [];
  const pointer = {
    active: false,
    x: 0,
    y: 0
  };

  let isStartActive = !startScreen.hidden;
  let lastFrameTime = performance.now();

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function circleCount() {
    if (window.matchMedia("(max-width: 520px)").matches) {
      return 7;
    }

    if (window.matchMedia("(max-width: 900px)").matches) {
      return 10;
    }

    return 14;
  }

  function buildCircles() {
    root.replaceChildren();
    circles.length = 0;

    for (let index = 0; index < circleCount(); index += 1) {
      const element = document.createElement("span");
      element.className = "start-background-circle";
      root.append(element);
      circles.push({
        element,
        size: 96,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        phase: randomBetween(0, Math.PI * 2),
        speed: randomBetween(0.18, 0.36),
        opacity: randomBetween(0.42, 0.78)
      });
    }
  }

  function layoutCircles() {
    const bounds = root.getBoundingClientRect();
    const width = Math.max(bounds.width, window.innerWidth);
    const height = Math.max(bounds.height, window.innerHeight);

    circles.forEach((circle) => {
      const size = randomBetween(70, width > 900 ? 170 : 128);
      const edgeOffset = size * 0.35;

      circle.size = size;
      circle.x = randomBetween(-edgeOffset, width - size + edgeOffset);
      circle.y = randomBetween(-edgeOffset, height - size + edgeOffset);
      circle.vx = randomBetween(-22, 22);
      circle.vy = randomBetween(-20, 20);

      circle.element.style.setProperty("--circle-size", `${Math.round(size)}px`);
      circle.element.style.setProperty("--circle-opacity", circle.opacity.toFixed(2));
      gsapInstance.set(circle.element, {
        x: circle.x,
        y: circle.y,
        scale: randomBetween(0.86, 1.12)
      });
    });
  }

  function updatePointer(event) {
    pointer.active = true;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  function clearPointer() {
    pointer.active = false;
  }

  function debounce(callback, delay) {
    let timeoutId;

    return () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(callback, delay);
    };
  }

  function animate() {
    if (!isStartActive || reducedMotion.matches) {
      lastFrameTime = performance.now();
      return;
    }

    const bounds = root.getBoundingClientRect();
    const now = performance.now();
    const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
    const time = now / 1000;
    const width = Math.max(bounds.width, window.innerWidth);
    const height = Math.max(bounds.height, window.innerHeight);

    lastFrameTime = now;

    circles.forEach((circle) => {
      const driftX = Math.sin(time * circle.speed + circle.phase) * 8;
      const driftY = Math.cos(time * (circle.speed + 0.11) + circle.phase) * 8;
      const centerX = bounds.left + circle.x + circle.size / 2;
      const centerY = bounds.top + circle.y + circle.size / 2;

      if (pointer.active) {
        const dx = centerX - pointer.x;
        const dy = centerY - pointer.y;
        const distance = Math.hypot(dx, dy);
        const radius = Math.max(190, circle.size * 1.9);

        if (distance > 0 && distance < radius) {
          const force = (radius - distance) / radius;
          circle.vx += (dx / distance) * force * 620 * delta;
          circle.vy += (dy / distance) * force * 620 * delta;
        }
      }

      circle.vx += driftX * delta;
      circle.vy += driftY * delta;
      circle.vx *= 0.992;
      circle.vy *= 0.992;

      const maxVelocity = 125;
      const velocity = Math.hypot(circle.vx, circle.vy);
      if (velocity > maxVelocity) {
        circle.vx = (circle.vx / velocity) * maxVelocity;
        circle.vy = (circle.vy / velocity) * maxVelocity;
      }

      circle.x += circle.vx * delta;
      circle.y += circle.vy * delta;

      const margin = circle.size * 0.42;
      const minX = -margin;
      const maxX = width - circle.size + margin;
      const minY = -margin;
      const maxY = height - circle.size + margin;

      if (circle.x < minX || circle.x > maxX) {
        circle.x = Math.min(Math.max(circle.x, minX), maxX);
        circle.vx *= -0.88;
      }

      if (circle.y < minY || circle.y > maxY) {
        circle.y = Math.min(Math.max(circle.y, minY), maxY);
        circle.vy *= -0.88;
      }

      gsapInstance.set(circle.element, {
        x: circle.x,
        y: circle.y,
        rotation: Math.sin(time * 0.42 + circle.phase) * 8
      });
    });
  }

  buildCircles();
  layoutCircles();

  startScreen.addEventListener("pointermove", updatePointer);
  startScreen.addEventListener("pointerleave", clearPointer);
  window.addEventListener("resize", debounce(layoutCircles, 150));
  document.addEventListener("mpm:screen-change", (event) => {
    isStartActive = event.detail?.screenName === "start";
    if (!isStartActive) {
      clearPointer();
    }
  });

  gsapInstance.ticker.add(animate);
})();
