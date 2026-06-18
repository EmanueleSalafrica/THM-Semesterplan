(() => {
  const animationApi = {};
  window.MPMAnimations = animationApi;

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.gsap) {
      return;
    }

    if (window.SplitText) {
      gsap.registerPlugin(SplitText);
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const interactiveSelector = [
      ".button-primary",
      ".button-secondary",
      ".dialog-close",
      ".focus-swipe-button",
      ".module-info-button",
      ".module-card",
      ".module-checkbox",
      ".choice-pill",
      ".plan-arrow",
      ".plan-tab"
    ].join(", ");
    const originalColors = new WeakMap();
    const closingDialogs = new WeakSet();
    let planTransitioning = false;

    function rememberColors(element) {
      if (!originalColors.has(element)) {
        const style = window.getComputedStyle(element);
        originalColors.set(element, {
          backgroundColor: style.backgroundColor,
          color: style.color
        });
      }
      return originalColors.get(element);
    }

    function interactiveTarget(event) {
      return event.target.closest?.(interactiveSelector);
    }

    function animateHoverIn(element) {
      if (reduceMotion.matches || element.disabled) {
        return;
      }

      rememberColors(element);
      gsap.killTweensOf(element);
      gsap.to(element, {
        scale: 1.1,
        y: -5,
        backgroundColor: "#ffffff",
        color: "#80ba24",
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto"
      });
    }

    function animateHoverOut(element) {
      if (reduceMotion.matches) {
        return;
      }

      const colors = rememberColors(element);
      gsap.killTweensOf(element);
      gsap.to(element, {
        scale: 1,
        y: 0,
        backgroundColor: colors.backgroundColor,
        color: colors.color,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => gsap.set(element, { clearProps: "transform,backgroundColor,color" })
      });
    }

    document.addEventListener("pointerover", (event) => {
      const element = interactiveTarget(event);
      if (element && !element.contains(event.relatedTarget)) {
        animateHoverIn(element);
      }
    });

    document.addEventListener("pointerout", (event) => {
      const element = interactiveTarget(event);
      if (element && !element.contains(event.relatedTarget)) {
        animateHoverOut(element);
      }
    });

    document.addEventListener("pointerdown", (event) => {
      const element = interactiveTarget(event);
      if (!element || element.disabled || reduceMotion.matches) {
        return;
      }

      gsap.killTweensOf(element);
      gsap.to(element, {
        scale: 0.9,
        y: 0,
        duration: 0.14,
        ease: "power2.out",
        overwrite: "auto"
      });
    });

    document.addEventListener("pointerup", (event) => {
      const element = interactiveTarget(event);
      if (!element || element.disabled || reduceMotion.matches) {
        return;
      }

      gsap.to(element, {
        scale: element.matches(":hover") ? 1.1 : 1,
        y: element.matches(":hover") ? -5 : 0,
        duration: 0.16,
        ease: "back.out(2)",
        overwrite: "auto"
      });
    });

    function animateSplitText(element, type, timeline, position = 0) {
      if (!element) {
        return;
      }

      if (!window.SplitText) {
        timeline.fromTo(element, { y: 16, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.32,
          ease: "power2.out"
        }, position);
        return;
      }

      const split = SplitText.create(element, { type, aria: "auto" });
      const targets = type === "chars" ? split.chars : split.words;
      timeline.fromTo(targets, {
        y: 16,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: type === "chars" ? 0.018 : 0.025,
        ease: "power2.out",
        onComplete: () => split.revert()
      }, position);
    }

    function animateDialogOpen(dialog) {
      if (reduceMotion.matches || closingDialogs.has(dialog)) {
        gsap.set(dialog, { "--dialog-backdrop-opacity": 0.7 });
        return;
      }

      const timeline = gsap.timeline();
      const detailFields = dialog.querySelectorAll(".module-detail-field, .elective-item");

      gsap.killTweensOf(dialog);
      timeline.fromTo(dialog, {
        scale: 0.72,
        opacity: 0,
        "--dialog-backdrop-opacity": 0
      }, {
        scale: 1,
        opacity: 1,
        "--dialog-backdrop-opacity": 0.7,
        duration: 0.22,
        ease: "back.out(1.7)"
      });

      animateSplitText(dialog.querySelector("h2"), "chars", timeline, 0.05);
      dialog.querySelectorAll(":scope > p, .module-details > p").forEach((paragraph, index) => {
        animateSplitText(paragraph, "words", timeline, 0.08 + index * 0.04);
      });

      if (detailFields.length > 0) {
        timeline.fromTo(detailFields, {
          x: (index) => index % 2 === 0 ? -90 : 90,
          opacity: 0
        }, {
          x: 0,
          opacity: 1,
          duration: 0.42,
          stagger: 0.05,
          ease: "power3.out",
          clearProps: "transform,opacity"
        }, 0.08);
      }
    }

    function closeDialog(dialog, onComplete) {
      if (!dialog?.open || closingDialogs.has(dialog)) {
        onComplete?.();
        return;
      }

      closingDialogs.add(dialog);
      if (reduceMotion.matches) {
        dialog.close();
        closingDialogs.delete(dialog);
        onComplete?.();
        return;
      }

      gsap.killTweensOf(dialog);
      gsap.to(dialog, {
        scale: 0.72,
        opacity: 0,
        "--dialog-backdrop-opacity": 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          dialog.close();
          closingDialogs.delete(dialog);
          gsap.set(dialog, { clearProps: "transform,opacity,--dialog-backdrop-opacity" });
          onComplete?.();
        }
      });
    }

    animationApi.closeDialog = closeDialog;

    document.querySelectorAll("dialog.app-dialog").forEach((dialog) => {
      const observer = new MutationObserver(() => {
        if (dialog.open && !closingDialogs.has(dialog)) {
          animateDialogOpen(dialog);
        }
      });
      observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });

      dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeDialog(dialog);
      });
    });

    document.addEventListener("submit", (event) => {
      const dialog = event.target.closest("dialog.app-dialog");
      if (dialog && event.target.method === "dialog") {
        event.preventDefault();
        closeDialog(dialog);
      }
    });

    function animateOptionsPanel() {
      const panel = document.querySelector('[data-screen="options"]');
      const greyout = document.querySelector("[data-options-greyout]");
      if (!panel) {
        return;
      }

      if (greyout) {
        greyout.hidden = false;
      }

      if (reduceMotion.matches) {
        return;
      }

      const elements = Array.from(panel.children);
      gsap.fromTo(panel, {
        x: -Math.min(window.innerWidth * 0.75, 460)
      }, {
        x: 0,
        duration: 0.3,
        ease: "power3.out",
        clearProps: "transform"
      });
      gsap.fromTo(elements, {
        x: -70,
        opacity: 0
      }, {
        x: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.045,
        delay: 0.08,
        ease: "power2.out",
        clearProps: "transform,opacity"
      });
      if (greyout) {
        gsap.fromTo(greyout, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      }
    }

    function hideOptionsGreyout() {
      const greyout = document.querySelector("[data-options-greyout]");
      if (!greyout || greyout.hidden) {
        return;
      }

      if (reduceMotion.matches) {
        greyout.hidden = true;
        return;
      }

      gsap.to(greyout, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          greyout.hidden = true;
          gsap.set(greyout, { clearProps: "opacity" });
        }
      });
    }

    function animatePlanCards(container = document.querySelector("[data-plan-container]")) {
      if (!container || reduceMotion.matches) {
        return;
      }

      const cards = container.querySelectorAll(".module-card");
      gsap.fromTo(cards, {
        y: Math.max(window.innerHeight * 0.62, 320),
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.62,
        stagger: 0.035,
        ease: "power3.out",
        clearProps: "transform,opacity"
      });
    }

    animationApi.transitionPlan = (container, direction, updatePlan) => {
      if (planTransitioning) {
        return;
      }

      if (reduceMotion.matches) {
        updatePlan();
        return;
      }

      planTransitioning = true;
      const distance = Math.max(window.innerWidth, 900);
      const exitX = direction > 0 ? -distance : distance;
      const enterX = -exitX;

      gsap.to(container, {
        x: exitX,
        opacity: 0,
        duration: 0.38,
        ease: "power2.inOut",
        onComplete: () => {
          updatePlan();
          const cards = container.querySelectorAll(".module-card");
          gsap.set(container, { x: enterX, opacity: 0 });
          gsap.set(cards, { y: Math.max(window.innerHeight * 0.3, 180), opacity: 0 });
          gsap.to(container, {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut",
            clearProps: "transform,opacity",
            onComplete: () => {
              planTransitioning = false;
            }
          });
          gsap.to(cards, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.025,
            ease: "power3.out",
            clearProps: "transform,opacity"
          });
        }
      });
    };

    document.addEventListener("mpm:screen-change", (event) => {
      if (event.detail.screenName === "options") {
        animateOptionsPanel();
      } else {
        hideOptionsGreyout();
      }

      if (event.detail.screenName === "plan") {
        requestAnimationFrame(() => animatePlanCards());
      }
    });

    const startHeading = document.querySelector(".screen-start h1");
    if (startHeading && !reduceMotion.matches) {
      const timeline = gsap.timeline();
      animateSplitText(startHeading, "chars", timeline);
    }
  });
})();
