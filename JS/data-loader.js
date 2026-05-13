(function () {
  const DEFAULT_DATA_URL = "data/module-mib.json";

  function pruefeModuldaten(daten) {
    if (!daten || typeof daten !== "object") {
      throw new Error("Die geladene Datenstruktur ist kein gültiges JSON-Objekt.");
    }

    if (!Array.isArray(daten.modules)) {
      throw new Error("Die geladene Datenstruktur enthält kein modules-Array.");
    }

    return daten;
  }

  async function ladeModuldaten(url = DEFAULT_DATA_URL) {
    const antwort = await fetch(url);

    if (!antwort.ok) {
      throw new Error(`Daten konnten nicht geladen werden: ${antwort.status} ${antwort.statusText}`);
    }

    const daten = pruefeModuldaten(await antwort.json());

    window.MPMProjekt = window.MPMProjekt || {};
    window.MPMProjekt.moduldaten = daten;
    window.MPMProjekt.module = daten.modules;

    console.info("[MPM] Moduldaten geladen:", {
      version: daten.version,
      anzahlModule: daten.modules.length,
      quelle: url
    });
    console.table(
      daten.modules.slice(0, 5).map((modul) => ({
        nr: modul.nr,
        titel: modul.titel,
        semester: modul.semester,
        credits: modul.credits,
        pflicht: modul.pflicht
      }))
    );

    return daten;
  }

  window.MPMProjekt = window.MPMProjekt || {};
  window.MPMProjekt.ladeModuldaten = ladeModuldaten;
})();
