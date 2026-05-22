(function () {
  const CURRGEN_API_URL = "https://turing.iem.thm.de/currgen/api/v1/generate-schedule";
  const ERLAUBTE_GESCHWINDIGKEITEN = [50, 60, 70, 80, 90, 100];
  const ERLAUBTE_SCHWERPUNKTE = ["MP", "WM"];
  const ERLAUBTE_START_JAHRESZEITEN = ["W", "S"];

  function parseModulListe(wert) {
    if (Array.isArray(wert)) {
      return wert.map(Number).filter(Number.isInteger);
    }

    if (!wert || typeof wert !== "string") {
      return [];
    }

    return wert
      .split(",")
      .map((eintrag) => Number(eintrag.trim()))
      .filter(Number.isInteger);
  }

  function pruefeCurrGenParameter(parameter) {
    const request = {
      geschwindigkeit: Number(parameter.geschwindigkeit),
      schwerpunkt: parameter.schwerpunkt,
      startJahreszeit: parameter.startJahreszeit,
      vorhandeneModule: parseModulListe(parameter.vorhandeneModule),
      ausgeschlosseneModule: parseModulListe(parameter.ausgeschlosseneModule),
      maxAnzahlLoesungen: Number(parameter.maxAnzahlLoesungen || 10),
      faktorReihenfolge: Number(parameter.faktorReihenfolge || 100),
      faktorVorEmpf: Number(parameter.faktorVorEmpf || 100)
    };

    if (!ERLAUBTE_GESCHWINDIGKEITEN.includes(request.geschwindigkeit)) {
      throw new Error("geschwindigkeit muss einer der Werte 50, 60, 70, 80, 90 oder 100 sein.");
    }

    if (!ERLAUBTE_SCHWERPUNKTE.includes(request.schwerpunkt)) {
      throw new Error('schwerpunkt muss "MP" oder "WM" sein.');
    }

    if (!ERLAUBTE_START_JAHRESZEITEN.includes(request.startJahreszeit)) {
      throw new Error('startJahreszeit muss "W" oder "S" sein.');
    }

    if (request.ausgeschlosseneModule.length > 3) {
      throw new Error("ausgeschlosseneModule darf maximal 3 Einträge enthalten.");
    }

    if (request.maxAnzahlLoesungen < 1 || request.maxAnzahlLoesungen > 100) {
      throw new Error("maxAnzahlLoesungen muss zwischen 1 und 100 liegen.");
    }

    if (request.faktorReihenfolge < 10 || request.faktorReihenfolge > 1000) {
      throw new Error("faktorReihenfolge muss zwischen 10 und 1000 liegen.");
    }

    if (request.faktorVorEmpf < 10 || request.faktorVorEmpf > 1000) {
      throw new Error("faktorVorEmpf muss zwischen 10 und 1000 liegen.");
    }

    return request;
  }

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

  async function generiereStudienplan(parameter) {
    const request = pruefeCurrGenParameter(parameter);

    const daten = await starteApiAbfrage(CURRGEN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    });

    console.info("[MPM] CurrGen-Studienplan generiert:", {
      status: daten.status,
      apiVersion: daten.apiVersion,
      anzahlGelieferterLoesungen: daten.anzahlGelieferterLoesungen,
      gesamtAnzahlLoesungen: daten.gesamtAnzahlLoesungen,
      penalty: daten.penalty,
      ersteLoesung: daten.loesungen?.[0]
    });

    return daten;
  }

  window.MPMProjekt = window.MPMProjekt || {};
  window.MPMProjekt.api = {
    CURRGEN_API_URL,
    starteApiAbfrage,
    generiereStudienplan,
    parseModulListe,
    pruefeCurrGenParameter
  };
})();
