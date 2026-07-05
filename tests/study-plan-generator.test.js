const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

global.window = {};
require("../JS/study-plan-generator.js");

const generator = global.window.MPMStudyPlan;
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/module-mib.json"), "utf8"));
const modules = data.modules;

function moduleById(id) {
  return modules.find((module) => Number(module.nr) === Number(id));
}

function idsBySemester(from, to) {
  return modules
    .filter((module) => Number(module.semester) >= from && Number(module.semester) <= to)
    .map((module) => Number(module.nr));
}

function plan(options = {}) {
  return generator.generateStudyPlan({
    modules,
    selectedTrack: "medienproduktion",
    currentSemester: 1,
    startTerm: "winter",
    targetSemesterCount: 7,
    passedModuleIds: [],
    excludedModuleIds: [],
    selectedOppositeTrackModules: [],
    selectedElectives: [],
    selectedElectiveSlots: [],
    ...options
  });
}

function flatten(result) {
  return result.semesters.flatMap((semester) => semester.modules);
}

function semesterCredits(result) {
  return result.semesters.map((semester) => semester.totalCrp);
}

function semesterItems(result, semesterNumber) {
  return result.semesters.find((semester) => semester.semesterNumber === semesterNumber)?.modules || [];
}

function selectedSlotsFromOpenPlan(result) {
  const used = new Set();
  return flatten(result)
    .filter((item) => item.type === "elective-slot")
    .map((slot) => {
      const selectedModuleId = slot.allowedModules.find((moduleId) => !used.has(moduleId));
      used.add(selectedModuleId);
      return {
        id: slot.id,
        category: slot.category,
        selectedModuleId
      };
    });
}

{
  const result = plan();
  assert.equal(result.creditSummary.totalRequiredCrp, 210, "Die PO 2024 muss immer 210 CrP verlangen.");
  assert.equal(result.creditSummary.totalAfterPlanCrp, 210, "Ein kompletter leerer Startplan muss auf 210 CrP kommen.");
  assert.equal(result.creditSummary.missingAfterPlanCrp, 0);
  assert.equal(result.creditSummary.isComplete, false, "Offene Wahlpflicht-Slots dürfen noch nicht complete sein.");
}

{
  const result = plan({ startTerm: "summer", targetSemesterCount: 7 });
  assert.deepEqual(semesterCredits(result), [30, 30, 30, 30, 30, 30, 30], "Die Regelstudienzeit muss als normaler 7-Semester-Ablauf mit 30 CrP pro Semester geplant werden.");
  assert.deepEqual(semesterItems(result, 7).map((item) => Number(item.nr)), [27, 28, 29], "Im 7. Semester müssen Berufspraktische Phase, Bachelorarbeit und Kolloquium liegen.");
  assert.ok(semesterItems(result, 3).some((item) => item.id === "oppositeTrackChoice-1"), "Ein Modul aus dem anderen Schwerpunkt muss schon im 3. Semester auswählbar sein.");
  assert.ok(semesterItems(result, 5).some((item) => item.id === "trackElective-1"), "Ein Schwerpunkt-Wahlpflichtslot muss schon im 5. Semester auswählbar sein.");
  assert.equal(semesterItems(result, 6).filter((item) => item.type === "elective-slot").length, 5, "Im 6. Semester dürfen Wahlpflichtslots liegen, aber nicht alle Wahlpflichtbereiche in ein 60-CrP-Semester gedrückt werden.");
}

{
  const openPlan = plan();
  const result = plan({ selectedElectiveSlots: selectedSlotsFromOpenPlan(openPlan) });

  assert.equal(result.creditSummary.totalAfterPlanCrp, 210, "Ein vollständiger Plan inklusive Abschlussmodulen muss 210 CrP ergeben.");
  assert.equal(result.creditSummary.isComplete, true, "Erst ausgewählte Wahlpflicht-Slots plus Abschlussmodule dürfen complete sein.");
}

{
  const result = plan();
  const withoutCompletion = result.semesters.map((semester) => ({
    ...semester,
    modules: semester.modules.filter((module) => ![27, 28, 29].includes(Number(module.nr)))
  }));
  const state = generator.normalizeStudentState({
    modules,
    selectedTrack: "medienproduktion",
    currentSemester: 1,
    startTerm: "winter",
    targetSemesterCount: 7,
    passedModuleIds: [],
    selectedElectiveSlots: []
  });
  const summary = generator.calculateCreditSummary(state, withoutCompletion);

  assert.equal(summary.totalAfterPlanCrp, 180, "Ohne Abschlussmodule bleiben nur 180 CrP übrig.");
  assert.equal(summary.missingAfterPlanCrp, 30, "Ohne Praxisphase, Bachelorarbeit und Kolloquium fehlen 30 CrP.");
  assert.equal(summary.isComplete, false, "180 CrP dürfen niemals als abgeschlossen gelten.");
}

{
  const result = plan({
    currentSemester: 5,
    passedModuleIds: idsBySemester(1, 4),
    targetSemesterCount: 9
  });

  assert.ok(result.creditSummary.alreadyPassedCrp > 0, "Bestandene frühere Semester müssen separat gezählt werden.");
  assert.ok(result.creditSummary.remainingRequiredCrp < 210, "Nach bestandenen Modulen muss weniger als 210 CrP offen sein.");
  assert.equal(result.creditSummary.totalAfterPlanCrp, 210, "Zukunftsplan plus bestandene CrP muss wieder 210 ergeben.");
  assert.ok(result.semesters.every((semester) => semester.semesterNumber >= 5), "Vergangene Semester dürfen nicht angezeigt werden.");
}

{
  const result = plan();
  const slots = flatten(result).filter((item) => item.type === "elective-slot");

  assert.ok(slots.length > 0, "Wahlpflichtanforderungen müssen als Slots im Plan liegen.");
  assert.ok(slots.every((slot) => slot.status === "choice-required"), "Offene Wahlpflicht-Slots dürfen nicht zufällig vorgefüllt werden.");
  assert.ok(slots.every((slot) => Number(slot.crp) === 6), "Jeder offene Wahlpflicht-Slot zählt temporär mit 6 CrP.");
}

{
  const first = plan();
  const firstSlot = flatten(first).find((item) => item.type === "elective-slot" && item.allowedModules.length > 0);
  const selectedModuleId = firstSlot.allowedModules[0];
  const selected = plan({
    selectedElectiveSlots: [{
      id: firstSlot.id,
      category: firstSlot.category,
      selectedModuleId
    }]
  });
  const selectedSlot = flatten(selected).find((item) => item.type === "elective-slot" && item.id === firstSlot.id);
  const duplicateSlots = flatten(selected).filter((item) => item.type === "elective-slot" && item.id !== firstSlot.id);

  assert.equal(selectedSlot.selectedModuleId, selectedModuleId, "Ein ausgewähltes Wahlpflichtmodul muss im Slot bleiben.");
  assert.equal(selectedSlot.crp, 6, "Der ausgewählte Slot zählt weiter mit 6 CrP.");
  assert.ok(duplicateSlots.every((slot) => !slot.allowedModules.includes(selectedModuleId)), "Ausgewählte Wahlpflichtmodule dürfen nicht doppelt angeboten werden.");
}

{
  const excludedMandatoryId = 1;
  const result = plan({ excludedModuleIds: [excludedMandatoryId] });
  const ids = flatten(result).filter((item) => item.type !== "elective-slot").map((module) => Number(module.nr));

  assert.ok(ids.includes(excludedMandatoryId), "Pflichtmodule dürfen durch Ausschluss nicht aus dem Plan verschwinden.");
  assert.ok(result.studentState.warnings.length > 0, "Für ausgeschlossene Pflichtmodule muss eine Warnung vorhanden sein.");
}

{
  const first = plan();
  const slot = flatten(first).find((item) => item.type === "elective-slot" && item.allowedModules.length > 0);
  const excludedElectiveId = slot.allowedModules[0];
  const result = plan({ excludedModuleIds: [excludedElectiveId] });
  const matchingSlot = flatten(result).find((item) => item.type === "elective-slot" && item.category === slot.category);

  assert.ok(matchingSlot, "Der Wahlpflicht-Slot muss trotz Ausschluss bestehen bleiben.");
  assert.equal(matchingSlot.allowedModules.includes(excludedElectiveId), false, "Ausgeschlossene Wahlpflichtmodule dürfen nicht mehr angeboten werden.");
}

{
  const result = plan({ targetSemesterCount: 9 });

  assert.ok(result.semesters.length > 0);
  assert.ok(result.semesters.at(-1).semesterNumber <= 9, "Der 9-Semester-Plan darf maximal bis Semester 9 gehen.");
  assert.ok(result.semesters.every((semester) => semester.modules.length > 0), "Es dürfen keine leeren Semester gerendert werden.");
}

{
  const result = plan({
    passedModuleIds: modules.map((module) => Number(module.nr)),
    targetSemesterCount: 9
  });

  assert.equal(result.semesters.length, 0, "Wenn alles bestanden ist, darf kein Semester generiert werden.");
  assert.equal(result.creditSummary.isComplete, true);
  assert.equal(result.creditSummary.missingAfterPlanCrp, 0);
  assert.equal(result.message, "Alle Anforderungen der PO erfüllt.");
}

{
  const state = generator.normalizeStudentState({
    modules,
    selectedTrack: "web-mobile",
    currentSemester: 6,
    startTerm: "winter",
    targetSemesterCount: 7,
    passedModuleIds: [13],
    selectedElectiveSlots: []
  });
  assert.equal(generator.isModuleEligible(moduleById(43), state, []), false, "VPW-Module dürfen unter 18 EPW-CrP nicht geplant werden.");
}

{
  const state = generator.normalizeStudentState({
    modules,
    selectedTrack: "medienproduktion",
    currentSemester: 6,
    startTerm: "winter",
    targetSemesterCount: 7,
    passedModuleIds: [11],
    selectedElectiveSlots: []
  });
  assert.equal(generator.isModuleEligible(moduleById(33), state, []), false, "VPS-Module dürfen unter 18 EPS-CrP nicht geplant werden.");
}

{
  const state = generator.normalizeStudentState({
    modules,
    selectedTrack: "medienproduktion",
    currentSemester: 7,
    startTerm: "winter",
    targetSemesterCount: 7,
    passedModuleIds: idsBySemester(1, 5),
    selectedElectiveSlots: []
  });
  assert.equal(generator.isModuleEligible(moduleById(27), state, []), true, "Berufspraktische Phase muss nach erfüllten Grundlagen planbar sein.");
  assert.equal(generator.isModuleEligible(moduleById(28), state, []), true, "Bachelorarbeit muss nach erfüllten Grundlagen planbar sein.");
  assert.equal(generator.isModuleEligible(moduleById(29), state, []), false, "Kolloquium darf nicht vor Bachelorarbeit geplant werden.");
  assert.equal(generator.isModuleEligible(moduleById(29), state, [moduleById(28)]), true, "Kolloquium darf nach Bachelorarbeit geplant werden.");
}

console.log("study-plan-generator tests passed");
