//button

document.addEventListener("DOMContentLoaded", () => {

  const buttons = document.querySelectorAll(
    ".button-primary, .button-secondary "
  );

  buttons.forEach(button => {

    // Hover
    button.addEventListener("mouseenter", () => {
      gsap.to(button, {
        scale: 1.1,
        duration: 0.5,
        ease: "power2.out"
      });
    });

    // Hover verlassen
    button.addEventListener("mouseleave", () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
    });

    // Klick runterdrücken
    button.addEventListener("mousedown", () => {
      gsap.to(button, {
        scale: -0.8,
        duration: 0.2
      });
    });

    // Klick loslassen
    button.addEventListener("mouseup", () => {
      gsap.to(button, {
        scale: 1.1,
        duration: 0.1
      });
    });

  });

});

//Semesterplan-Karten

gsap.from(".semester-section", {
  y: 300,
  opacity: 0,
  stagger: 0.15,
  duration: 0.8,
  ease: "power3.out"
});

//Modul-Popup für Öffnen

gsap.fromTo(".module-dialog",
  {
    scale: 0,
    opacity: 0
  },
  {
    scale: 1,
    opacity: 1,
    duration: 0.2,
    ease: "back.out(1.7)"
  });

//Modul-Popup für Schließen

gsap.to(".module-dialog", {
  scale: 0,
  opacity: 0,
  duration: 0.2
});

//Öffnen des Popups wird der Hintergrund

gsap.fromTo(".overlay",
  {
    opacity: 0
  },
  {
    opacity: 1,
    duration: 0.2
  });

//Schließen des Popups wird der Hintergrund

gsap.to(".overlay", {
  opacity: 0,
  duration: 0.2
});

//Textanimation

gsap.from(".screen screen-start h1", {
  y: 30,
  opacity: 0,
  stagger: 0.08,
  duration: 0.6
});




//linke/rechte Buttons und Swipe-Navigation


const prevBtn = document.querySelector(".plan-arrow-previous");
const nextBtn = document.querySelector(".plan-arrow-next");
const containers = document.querySelectorAll(".plan-container");
let current = 0;

function showContainer(index, direction) {
  if (index < 0 || index >= containers.length) return;
  if (index === current) return;
  // Buttons deaktivieren
  prevBtn.disabled = true;
  nextBtn.disabled = true;

  const oldContainer = containers[current];
  const newContainer = containers[index];
  // Startposition des neuen Containers (von rechts oder links)
  gsap.set(newContainer, { x: (direction === 'next' ? '100%' : '-100%'), display: 'block', opacity: 0 });

  // Timeline: altes raus, neues rein
  const tl = gsap.timeline({
    onComplete: () => {
      // Zustand nach Animation
      oldContainer.classList.remove("plan-active");
      oldContainer.setAttribute("aria-hidden", "true");
      oldContainer.style.display = 'none';

      newContainer.classList.add("plan-active");
      newContainer.setAttribute("aria-hidden", "false");

      current = index;
      updateButtons();
    }
  });

  // altes ausblenden/verschieben
  tl.to(oldContainer, { x: (direction === 'next' ? '-100%' : '100%'), opacity: 0, duration: 0.5, ease: "power2.inOut" })
    // neues einblenden/verschieben (zeitlich gleichzeitig um 0 positioniert)
    .to(newContainer, { x: '0%', opacity: 1, duration: 0.8, ease: "power2.inOut" }, 0);
}

function goNext() {
  showContainer(current + 1, 'next');
}
function goPrev() {
  showContainer(current - 1, 'prev');
}

function updateButtons() {
  prevBtn.disabled = (current === 0);
  nextBtn.disabled = (current === containers.length - 1);
}

nextBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);
updateButtons();

// Popup

document
  .querySelectorAll(".elective-item")
  .forEach(card => {

    const popup = card.querySelector(".popup");
    let open = false;
    card.addEventListener("click", () => {
      open = !open;
      if (open) {
        popup.style.display = ".app-dialog,.module-dialog";
        gsap.fromTo(
          popup,
          {
            opacity: 0,
            scale: .5,
            y: 50
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1
          }
        );
      } else {
        gsap.to(popup, {
          opacity: 0,
          scale: .7,
          duration: .7,
          onComplete() {
            popup.style.display = "none";
          }
        });
      }
    });
  });


