// Einstiegspunkt für eigenes JavaScript.
// GSAP wird lokal über JS/lib/gsap/gsap.min.js eingebunden.

if (window.gsap) {
  console.log("GSAP ist lokal verfügbar:", window.gsap.version);
}

if (window.MPMProjekt?.ladeModuldaten) {
  window.MPMProjekt.ladeModuldaten().catch((fehler) => {
    console.error("[MPM] Moduldaten konnten nicht geladen werden.", fehler);
  });
}
