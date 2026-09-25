(async () => {
  const intro = document.querySelector("[data-site-intro]");
  const gsap = window.gsap;
  let timeline;
  let watchdog;
  let finished = false;

  function finishIntro() {
    if (finished) return;
    finished = true;
    window.clearTimeout(watchdog);
    timeline?.kill();
    intro?.remove();
    document.body.classList.remove("intro-pending");
  }

  if (!intro || !gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishIntro();
    return;
  }

  // A failed asset or animation must never block the application.
  watchdog = window.setTimeout(finishIntro, 6500);
  const source = intro.querySelector("image");
  const logoAsset = new Image();
  logoAsset.src = source.getAttribute("href");

  try {
    await logoAsset.decode();
    if (finished) return;

    const ribbon = intro.querySelector(".intro-ribbon");
    const stroke = intro.querySelector(".intro-reveal-stroke");
    const detail = (name) => intro.querySelector('[data-intro-detail="' + name + '"]');
    const brush = { head: 0, tail: 0 };
    const paintRibbon = () => {
      ribbon.style.strokeDasharray = Math.max(0, brush.head - brush.tail) + " 1";
      ribbon.style.strokeDashoffset = String(-brush.tail);
      stroke.style.strokeDashoffset = String(1 - brush.head);
    };

    // Only the mask changes: the original SVG keeps its exact size and position.
    timeline = gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete: finishIntro });
    timeline
      .set(ribbon, { opacity: 1 })
      .to(brush, { head: 1, duration: 2.65, ease: "none", onUpdate: paintRibbon }, 0)
      .to(brush, { tail: 1, duration: 2.65, ease: "none", onUpdate: paintRibbon }, 0.2)
      .to(ribbon, { opacity: 0, duration: 0.2 }, 2.62)
      .to(detail("emblem"), { opacity: 1, duration: 0.42 }, 2.65)
      .to(detail("divider"), { opacity: 1, duration: 0.3 }, 2.75)
      .to(detail("caption"), { opacity: 1, duration: 0.4 }, 2.82)
      .to(intro, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 3.65);
  } catch {
    finishIntro();
  }

  window.addEventListener("pagehide", finishIntro, { once: true });
})();
