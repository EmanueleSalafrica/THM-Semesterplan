//import { gsap, ScrollTrigger } from "../gsap.js"



// Animation 1

  gsap.from(".title", {
    y: -100,
    opacity: 0,
    duration: 2

  });

// Animation 2

  gsap.from(".split", {
    opacity: 0,
    y: 50,
    stagger: .3,
    duration: 1.5

  });


// Animation 3

  gsap.from(".elem", {

    scrollTrigger: {
      trigger: ".container",
      start: "top 75%"

    },

    opacity: 0,
    scale: .6,
    rotation: 8,
    duration: 1.5,
    stagger: .3

  });


// Animation 4

 /* gsap.to(".track", {

    x: -500,
    repeat: -1,
    duration: 12,
    ease: "none"

  });*/

gsap.to(".mini",{
  x:"100vw",
  duration:20,
  ease:"none",
  repeat:-1
})


// Popup

  document
    .querySelectorAll(".popup-card")
    .forEach(card => {

      const popup = card.querySelector(".popup");

      let open = false;

      card.addEventListener("click", () => {

        open = !open;

        if (open) {

          popup.style.display = "block";

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

