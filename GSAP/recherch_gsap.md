\# GSAP Animation Projekt





Hier wird paar GSAP-Animationen gezeigt. Ziel war die Erstellung paar Prototypen für eine spätere Webanwendung.

Dabei sollte CDN nicht verwendet werden.



\---



\## Verwendete Technologien



\- HTML5

\- CSS3

\- JavaScript

\- GSAP (GreenSock Animation Platform)

\- ScrollTrigger Plugin



\---



\## Funktionen



\-

\- Scroll Animationen

\- Popup-Animation für Karten

\- Fade-In Effekte

\- Slide-In Animationen

\- Stagger Animationen

\- Infinite Scrolling Bereich

\-

\---



\## Verwendete GSAP Animationen



\### 1. Fade-In Animation

Texte erscheinen langsam mit Transparenz.



\### 2. ScrollTrigger Animation

Elemente werden beim Scrollen eingeblendet.



\### 3. Popup Animation

Box-Inhalte öffnen sich animiert per Klick.



\### 4. Infinite Scrolling

Kleine Elemente bewegen sich dauerhaft horizontal.



\---



\## Projektstruktur



```text

Projekt/

│

├── Animation.html

├── style.css

├── script.js

│

└── js/

\&#x20;   └── gsap/

\&#x20;       ├── gsap.min.js

\&#x20;       └── ScrollTrigger.min.js

```





\---



\##Befehle 

\---



```

gsap.to()



```


Animation startet vom aktuellen Zustand und läuft zum angegebenen Ziel



```

gsap.from()



``` 



Animation startet vom angegebenen Wert und läuft zum normalen Zustand



```

gsap.fromTo()



```



Anfangs- und Zielzustand werden komplett selbst festgelegt.



\## Besonderheiten



\- GSAP lokal eingebunden

\- Keine CDN Nutzung

\- Offline funktionsfähig

\- Mobile optimiert



\---



\## Autor



Annette Taborik

