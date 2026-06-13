//import { gsap } from "gsap";
//import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*Schwerpunktwahlinfo
Text: Splittext Animation, character für Headlines, word für Fließtext
Grafiken/Bilder: beidseitig von außerhalb des jeweiligen Bereichs einschieben/faden
Buttons: beidseitig von außerhalb des jeweiligen Bereichs einschieben/faden
*/

/*Generator
Button: bei hoverOver, leicht vergrößert (10-15%) ODER leicht angehoben (5dp nach oben bewegen bis cap erreicht ist)
Farbveränderung, von Grün/Graugrün zu weiß, Schriftfarbe muss entsprechend von weiß zu THM Grün wechseln
bei onClick, reduziere Größe (10-15%), sehr kurzer Zeitraum (0.1 - 0.25) um physisches Runterdrücken zu simulieren.
Cards: bei öffnen, in Semesterplan, von unterem Bildschirmrand an position schieben.
bei hoverOver, leicht vergrößert (10-15%) ODER leicht angehoben (5dp nach oben bewegen bis cap erreicht ist)
bei onClick, reduziere Größe (10-15%), sehr kurzer Zeitraum (0.1 - 0.25) um physisches Runterdrücken zu simulieren.
Pop Up Window: bei Aufruf, von Mitte aus rapide Vergrößern, vllt (0.1 - 0.25).
bei Schließen, reverse von Aufruf
Zusätzlich, Greyout wird eingefaded, selbe Zeit Aufruf/Schließen, von 0 zu 100%
Zusätzlich, Text wird behandelt wie Text in Schwerpunkwahl.
Zusätzlich, Bilder mitsamt Zusatzinfo werden als Packet wie Grafiken/Bilder in Schwerpunktwahl behandelt.
OptionsLapel: bei onClick, rapide von der Seite ausfahren bis Enddestination erreicht ist.
Alle Elemente des Optionslapels sind von anfang an an ihrer Endpostion.
Buttons und Cards haben selbes hoverOver und onClick Verhalten wie sonst.
Greyout wird eingefaded, selbe Zeit wie Aufruf/Schließen von Pop Up Window.
Semesterplanwechsel: Semesterpläne schieben sich entsprechend des Buttons der gedrückt wurde
Linker Button = Alles wird nach rechts geschoben
Rechter Button = Alles wird nach links geschoben
*/

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

  gsap.utils.toArray(".elem").forEach(elem => {
    gsap.from(elem, {
      scrollTrigger: {
        trigger: elem,
        start: "top 75%",
      },
      opacity: 0,
      scale: .6,
      rotation: 8,
      duration: 1.5,
    });
  })

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

