(function () {
  async function starteApiAbfrage(url, optionen = {}) {
    if (!url || typeof url !== "string") {
      throw new Error("Für die API-Abfrage wird eine gültige URL benötigt.");
    }

    const einstellungen = {
      method: "GET",
      ...optionen,
      headers: {
        Accept: "application/json",
        ...(optionen.headers || {})
      }
    };

    const antwort = await fetch(url, einstellungen);
    const contentType = antwort.headers.get("content-type") || "";
    const daten = contentType.includes("application/json")
      ? await antwort.json()
      : await antwort.text();

    if (!antwort.ok) {
      const fehler = new Error(`API-Abfrage fehlgeschlagen: ${antwort.status} ${antwort.statusText}`);
      fehler.status = antwort.status;
      fehler.statusText = antwort.statusText;
      fehler.daten = daten;
      throw fehler;
    }

    console.info("[MPM] API-Abfrage erfolgreich:", {
      url,
      status: antwort.status,
      statusText: antwort.statusText,
      daten
    });

    return daten;
  }

  window.MPMProjekt = window.MPMProjekt || {};
  window.MPMProjekt.api = {
    starteApiAbfrage
  };
})();
