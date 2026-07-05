(function () {
  const TOTAL_REQUIRED_CRP = 210;
  const COMPLETION_MODULE_IDS = [27, 28, 29];
  const COMPLETION_CRP = 30;
  const OPPOSITE_TRACK_CRP = 12;
  const TRACK_ELECTIVE_CRP = 24;
  const GENERAL_ELECTIVE_CRP = 12;
  const UNIVERSITY_ELECTIVE_CRP = 6;
  const DEFAULT_TARGET_CRP_PER_SEMESTER = 30;
  const MAX_CRP_PER_SEMESTER = 36;
  const MIN_ELECTIVE_SEMESTER = 5;
  const ADVANCED_GATE_CRP = 18;
  const FOUNDATION_GATE_CRP = 60;
  const DEFAULT_TARGET_CREDITS = {
    7: 30,
    8: 27,
    9: 24
  };
  const TRACKS = {
    medienproduktion: {
      field: "medienproduktion",
      otherField: "webmobile"
    },
    "web-mobile": {
      field: "webmobile",
      otherField: "medienproduktion"
    }
  };

  function moduleId(module) {
    return Number(module?.nr);
  }

  function moduleCredits(module) {
    return Number(module?.credits) || 0;
  }

  function moduleSemester(module) {
    return Number(module?.semester) || 1;
  }

  function isYes(value) {
    return value === "Ja";
  }

  function uniqueNumbers(values = []) {
    return [...new Set(values.map(Number).filter(Number.isInteger))];
  }

  function normalizeTrack(track) {
    if (track === "Web & Mobile" || track === "webmobile" || track === "web-mobile") {
      return "web-mobile";
    }

    return "medienproduktion";
  }

  function normalizeTerm(term) {
    return term === "Sommer" || term === "summer" ? "summer" : "winter";
  }

  function termForSemester(startTerm, offset) {
    const startsInWinter = normalizeTerm(startTerm) === "winter";
    const even = offset % 2 === 0;
    return startsInWinter ? even ? "winter" : "summer" : even ? "summer" : "winter";
  }

  function moduleOfferedInTerm(module, term) {
    const value = term === "summer" ? module.sose : module.wise;
    return value === "Ja" || value === "Bedarf";
  }

  function compareModules(a, b) {
    const semesterDiff = moduleSemester(a) - moduleSemester(b);
    return semesterDiff !== 0 ? semesterDiff : String(a.titel).localeCompare(String(b.titel));
  }

  function byId(modules, ids) {
    const idSet = new Set(uniqueNumbers(ids));
    return modules.filter((module) => idSet.has(moduleId(module)));
  }

  function sumCredits(modules) {
    return modules.reduce((sum, module) => sum + moduleCredits(module), 0);
  }

  function cappedCredits(modules, limit) {
    return Math.min(sumCredits(modules), limit);
  }

  function isCompletionModule(module) {
    return COMPLETION_MODULE_IDS.includes(moduleId(module));
  }

  function isCommonMandatory(module) {
    return isYes(module.pflicht) && isYes(module.medienproduktion) && isYes(module.webmobile) && !isCompletionModule(module);
  }

  function isTrackSpecificMandatory(module, track) {
    const config = TRACKS[track];
    return Boolean(config)
      && isYes(module.pflicht)
      && isYes(module[config.field])
      && !isYes(module[config.otherField]);
  }

  function isOppositeTrackMandatory(module, track) {
    const config = TRACKS[track];
    return Boolean(config)
      && isYes(module.pflicht)
      && isYes(module[config.otherField])
      && !isYes(module[config.field]);
  }

  function isTrackElective(module, track) {
    const config = TRACKS[track];
    return Boolean(config) && !isYes(module.pflicht) && isYes(module[config.field]);
  }

  function isUniversityElective(module) {
    return moduleId(module) === 31;
  }

  function isGeneralElective(module) {
    return !isYes(module.pflicht) && !isYes(module.medienproduktion) && !isYes(module.webmobile) && !isUniversityElective(module);
  }

  function isFoundationTrackModule(module) {
    return moduleSemester(module) >= 3 && moduleSemester(module) <= 5;
  }

  function isAdvancedTrackModule(module) {
    return moduleSemester(module) >= 6;
  }

  function isPracticeOrThesis(module) {
    return moduleId(module) === 27 || moduleId(module) === 28;
  }

  function isColloquium(module) {
    return moduleId(module) === 29;
  }

  function completionOrder(module) {
    const index = COMPLETION_MODULE_IDS.indexOf(moduleId(module));
    return index === -1 ? 99 : index;
  }

  function preferredElectiveSlotSemester(category, index) {
    if (category === "oppositeTrackChoice") {
      return MIN_ELECTIVE_SEMESTER;
    }

    if (category === "trackElective") {
      return index === 0 ? 5 : 6;
    }

    if (category === "generalElective") {
      return index === 0 ? 5 : 6;
    }

    if (category === "universityElective") {
      return 6;
    }

    return 6;
  }

  function isElectiveSlotEligibleForSemester(slot, semesterNumber, currentSemester) {
    const effectiveSemester = Math.max(semesterNumber, currentSemester);
    return effectiveSemester >= MIN_ELECTIVE_SEMESTER;
  }

  function categorizeModule(module, track) {
    if (isCompletionModule(module)) {
      return "completion";
    }

    if (isCommonMandatory(module)) {
      return "mandatory";
    }

    if (isTrackSpecificMandatory(module, track)) {
      return "trackMandatory";
    }

    if (isOppositeTrackMandatory(module, track)) {
      return "oppositeTrackChoice";
    }

    if (isUniversityElective(module)) {
      return "universityElective";
    }

    if (isTrackElective(module, track)) {
      return "trackElective";
    }

    if (isGeneralElective(module)) {
      return "generalElective";
    }

    return "other";
  }

  function selectedIdsForCategory(studentState, category) {
    return studentState.selectedElectiveSlots
      .filter((slot) => slot.category === category && slot.selectedModuleId)
      .map((slot) => Number(slot.selectedModuleId));
  }

  function getPassedRequiredBuckets(studentState) {
    const passedModules = byId(studentState.modules, studentState.passedModuleIds);
    const commonMandatory = passedModules.filter(isCommonMandatory);
    const trackMandatory = passedModules.filter((module) => isTrackSpecificMandatory(module, studentState.selectedTrack));
    const completion = passedModules.filter(isCompletionModule);
    const oppositeTrack = passedModules.filter((module) => isOppositeTrackMandatory(module, studentState.selectedTrack));
    const trackElective = passedModules.filter((module) => isTrackElective(module, studentState.selectedTrack));
    const generalElective = passedModules.filter(isGeneralElective);
    const universityElective = passedModules.filter(isUniversityElective);

    return {
      commonMandatory,
      trackMandatory,
      completion,
      oppositeTrack,
      trackElective,
      generalElective,
      universityElective
    };
  }

  function calculateAlreadyPassedCrp(studentState) {
    const buckets = getPassedRequiredBuckets(studentState);
    return sumCredits(buckets.commonMandatory)
      + sumCredits(buckets.trackMandatory)
      + sumCredits(buckets.completion)
      + cappedCredits(buckets.oppositeTrack, OPPOSITE_TRACK_CRP)
      + cappedCredits(buckets.trackElective, TRACK_ELECTIVE_CRP)
      + cappedCredits(buckets.generalElective, GENERAL_ELECTIVE_CRP)
      + cappedCredits(buckets.universityElective, UNIVERSITY_ELECTIVE_CRP);
  }

  function normalizeSelectedSlots(input) {
    return (input.selectedElectiveSlots || []).map((slot) => ({
      id: String(slot.id),
      category: slot.category,
      selectedModuleId: slot.selectedModuleId == null ? null : Number(slot.selectedModuleId)
    }));
  }

  function normalizeStudentState(input) {
    const modules = Array.isArray(input.modules) ? input.modules : [];
    const selectedTrack = normalizeTrack(input.selectedTrack);
    const passedModuleIds = uniqueNumbers(input.passedModuleIds);
    const excludedModuleIds = uniqueNumbers(input.excludedModuleIds);
    const selectedOppositeTrackModules = uniqueNumbers(input.selectedOppositeTrackModules);
    const selectedElectives = uniqueNumbers(input.selectedElectives);
    const selectedElectiveSlots = normalizeSelectedSlots(input);
    const currentSemester = Math.min(Math.max(Number(input.currentSemester) || 1, 1), 9);
    const targetSemesterCount = Math.min(Math.max(Number(input.targetSemesterCount) || 7, currentSemester), 9);
    const state = {
      modules,
      selectedTrack,
      currentSemester,
      startTerm: normalizeTerm(input.startTerm),
      targetSemesterCount,
      targetCreditsPerSemester: DEFAULT_TARGET_CREDITS[targetSemesterCount] || 30,
      passedModuleIds,
      excludedModuleIds,
      selectedOppositeTrackModules,
      selectedElectives,
      selectedElectiveSlots,
      warnings: []
    };
    const excludedMandatory = modules.filter((module) => (
      excludedModuleIds.includes(moduleId(module))
      && (isCommonMandatory(module) || isTrackSpecificMandatory(module, selectedTrack) || isCompletionModule(module))
    ));
    state.warnings = excludedMandatory.map((module) => (
      `${module.titel} ist ein Pflicht- oder Abschlussmodul und bleibt deshalb im Studienplan.`
    ));
    state.requiredBuckets = getPassedRequiredBuckets(state);
    state.alreadyPassedCrp = calculateAlreadyPassedCrp(state);
    state.remainingRequirements = getRemainingRequirements(state);
    return state;
  }

  function getRemainingRequirements(studentState) {
    const passedIds = new Set(studentState.passedModuleIds);
    const requiredMandatory = studentState.modules.filter((module) => (
      isCommonMandatory(module) || isTrackSpecificMandatory(module, studentState.selectedTrack)
    ));
    const missingMandatoryModules = requiredMandatory.filter((module) => !passedIds.has(moduleId(module))).map(moduleId);
    const missingTrackMandatoryModules = studentState.modules
      .filter((module) => isTrackSpecificMandatory(module, studentState.selectedTrack))
      .filter((module) => !passedIds.has(moduleId(module)))
      .map(moduleId);
    const missingCompletionModules = studentState.modules
      .filter(isCompletionModule)
      .filter((module) => !passedIds.has(moduleId(module)))
      .map(moduleId);
    const buckets = getPassedRequiredBuckets(studentState);

    return {
      missingMandatoryModules,
      missingTrackMandatoryModules,
      missingOppositeTrackCredits: Math.max(0, OPPOSITE_TRACK_CRP - cappedCredits(buckets.oppositeTrack, OPPOSITE_TRACK_CRP)),
      missingTrackElectiveCredits: Math.max(0, TRACK_ELECTIVE_CRP - cappedCredits(buckets.trackElective, TRACK_ELECTIVE_CRP)),
      missingGeneralElectiveCredits: Math.max(0, GENERAL_ELECTIVE_CRP - cappedCredits(buckets.generalElective, GENERAL_ELECTIVE_CRP)),
      missingUniversityElectiveCredits: Math.max(0, UNIVERSITY_ELECTIVE_CRP - cappedCredits(buckets.universityElective, UNIVERSITY_ELECTIVE_CRP)),
      missingThesisOrPracticeModules: missingCompletionModules,
      totalMissingCredits: Math.max(0, TOTAL_REQUIRED_CRP - studentState.alreadyPassedCrp)
    };
  }

  function plannedIds(plannedItems = []) {
    return plannedItems
      .filter((item) => item.type !== "elective-slot")
      .map(moduleId);
  }

  function plannedAndPassedIds(studentState, plannedItems = []) {
    return new Set([...studentState.passedModuleIds, ...plannedIds(plannedItems)]);
  }

  function foundationRequirementMet(studentState, plannedItems = []) {
    const ids = [...plannedAndPassedIds(studentState, plannedItems)];
    const config = TRACKS[studentState.selectedTrack];
    const foundationModules = byId(studentState.modules, ids).filter((module) => (
      isFoundationTrackModule(module) && (isYes(module[config.field]) || isYes(module[config.otherField]))
    ));
    return sumCredits(foundationModules) >= FOUNDATION_GATE_CRP;
  }

  function advancedRequirementMet(module, studentState, plannedItems = []) {
    if (!isAdvancedTrackModule(module) || isCompletionModule(module)) {
      return true;
    }

    const ids = [...plannedAndPassedIds(studentState, plannedItems)];
    const predicate = isYes(module.webmobile)
      ? (candidate) => isFoundationTrackModule(candidate) && isYes(candidate.webmobile)
      : (candidate) => isFoundationTrackModule(candidate) && isYes(candidate.medienproduktion);
    return sumCredits(byId(studentState.modules, ids).filter(predicate)) >= ADVANCED_GATE_CRP;
  }

  function bachelorBeforeColloquium(module, plannedItems = []) {
    return !isColloquium(module) || plannedItems.some((item) => moduleId(item) === 28);
  }

  function isModuleEligible(module, studentState, plannedItems = [], semesterContext = {}) {
    if (!module || studentState.passedModuleIds.includes(moduleId(module))) {
      return false;
    }

    if (plannedAndPassedIds(studentState, plannedItems).has(moduleId(module))) {
      return false;
    }

    if (!advancedRequirementMet(module, studentState, plannedItems)) {
      return false;
    }

    if (isPracticeOrThesis(module) && !foundationRequirementMet(studentState, plannedItems)) {
      return false;
    }

    if (!bachelorBeforeColloquium(module, plannedItems)) {
      return false;
    }

    return true;
  }

  function getAllowedModulesForSlot(slot, studentState, plannedItems = []) {
    const usedIds = new Set([
      ...studentState.passedModuleIds,
      ...plannedIds(plannedItems),
      ...studentState.selectedElectiveSlots
        .filter((candidate) => candidate.id !== slot.id && candidate.selectedModuleId)
        .map((candidate) => Number(candidate.selectedModuleId))
    ]);

    return studentState.modules
      .filter((module) => categorizeModule(module, studentState.selectedTrack) === slot.category)
      .filter((module) => !usedIds.has(moduleId(module)))
      .filter((module) => !studentState.excludedModuleIds.includes(moduleId(module)))
      .sort(compareModules)
      .map(moduleId);
  }

  function selectedModuleForSlot(slot, studentState) {
    const explicit = studentState.selectedElectiveSlots.find((candidate) => candidate.id === slot.id)?.selectedModuleId;
    if (explicit != null) {
      return Number(explicit);
    }

    const legacySelected = [...studentState.selectedOppositeTrackModules, ...studentState.selectedElectives]
      .find((id) => getAllowedModulesForSlot(slot, studentState).includes(Number(id)));
    return legacySelected == null ? null : Number(legacySelected);
  }

  function createElectiveSlots(studentState) {
    const requirements = getRemainingRequirements(studentState);
    const slotSpecs = [
      ["oppositeTrackChoice", "Modul aus anderem Schwerpunkt auswählen", requirements.missingOppositeTrackCredits],
      ["trackElective", "Schwerpunkt-Wahlpflicht auswählen", requirements.missingTrackElectiveCredits],
      ["generalElective", "Allgemeines Wahlpflichtmodul auswählen", requirements.missingGeneralElectiveCredits],
      ["universityElective", "Hochschulweites Wahlpflichtmodul auswählen", requirements.missingUniversityElectiveCredits]
    ];
    const slots = [];

    slotSpecs.forEach(([category, label, missingCredits]) => {
      const count = Math.ceil(missingCredits / 6);
      for (let index = 0; index < count; index += 1) {
        const slot = {
          type: "elective-slot",
          id: `${category}-${index + 1}`,
          label: `${label} ${count > 1 ? index + 1 : ""}`.trim(),
          crp: 6,
          credits: 6,
          category,
          allowedModules: [],
          selectedModuleId: null,
          semesterNumber: preferredElectiveSlotSemester(category, index),
          status: "choice-required"
        };
        slot.allowedModules = getAllowedModulesForSlot(slot, studentState);
        slot.selectedModuleId = selectedModuleForSlot(slot, studentState);
        if (slot.selectedModuleId) {
          slot.status = "planned";
        }
        slots.push(slot);
      }
    });

    return slots;
  }

  function selectModuleForElectiveSlot(studentState, slotId, moduleIdToSelect) {
    const slots = createElectiveSlots(studentState);
    const slot = slots.find((candidate) => candidate.id === slotId);
    const selectedModuleId = Number(moduleIdToSelect);

    if (!slot || !slot.allowedModules.includes(selectedModuleId)) {
      return studentState;
    }

    return normalizeStudentState({
      ...studentState,
      selectedElectiveSlots: [
        ...studentState.selectedElectiveSlots.filter((candidate) => candidate.id !== slotId),
        { id: slotId, category: slot.category, selectedModuleId }
      ]
    });
  }

  function createSemesterObjects(studentState) {
    const count = Math.max(1, studentState.targetSemesterCount - studentState.currentSemester + 1);
    return Array.from({ length: count }, (_, index) => ({
      semesterNumber: studentState.currentSemester + index,
      term: termForSemester(studentState.startTerm, index),
      modules: [],
      totalCrp: 0
    }));
  }

  function itemCredits(item) {
    return item.type === "elective-slot" ? Number(item.crp) || 6 : moduleCredits(item);
  }

  function semesterLoadScore(semester, item, targetCredits) {
    const creditsAfterAdd = semester.totalCrp + itemCredits(item);
    const target = Number(targetCredits) || DEFAULT_TARGET_CRP_PER_SEMESTER;
    const overMaxPenalty = creditsAfterAdd > MAX_CRP_PER_SEMESTER ? 1000 + creditsAfterAdd - MAX_CRP_PER_SEMESTER : 0;
    const targetPenalty = creditsAfterAdd > target ? 100 + creditsAfterAdd - target : target - creditsAfterAdd;

    return {
      creditsAfterAdd,
      overMaxPenalty,
      targetPenalty,
      isUnderTarget: creditsAfterAdd <= target
    };
  }

  function compareSemesterLoad(a, b, item, targetCredits, preferLaterWhenFull = false) {
    const scoreA = semesterLoadScore(a, item, targetCredits);
    const scoreB = semesterLoadScore(b, item, targetCredits);

    if (scoreA.overMaxPenalty !== scoreB.overMaxPenalty) {
      return scoreA.overMaxPenalty - scoreB.overMaxPenalty;
    }

    if (scoreA.isUnderTarget !== scoreB.isUnderTarget) {
      return scoreA.isUnderTarget ? -1 : 1;
    }

    if (scoreA.targetPenalty !== scoreB.targetPenalty) {
      return scoreA.targetPenalty - scoreB.targetPenalty;
    }

    if (preferLaterWhenFull && !scoreA.isUnderTarget && !scoreB.isUnderTarget) {
      return b.semesterNumber - a.semesterNumber;
    }

    return a.semesterNumber - b.semesterNumber;
  }

  function addItemToSemester(semester, item) {
    const plannedItem = { ...item, plannedSemesterNumber: semester.semesterNumber };
    semester.modules.push(plannedItem);
    semester.totalCrp += itemCredits(plannedItem);
    return plannedItem;
  }

  function bestSemesterForItem(item, semesters, studentState, plannedItems, variant = "standard") {
    let preferred = item.type === "elective-slot"
      ? Math.max(item.semesterNumber, studentState.currentSemester, MIN_ELECTIVE_SEMESTER)
      : Math.max(moduleSemester(item), studentState.currentSemester);
    if (item.type !== "elective-slot" && isColloquium(item)) {
      const thesisItem = plannedItems.find((plannedItem) => moduleId(plannedItem) === 28);
      if (thesisItem?.plannedSemesterNumber) {
        preferred = Math.max(preferred, thesisItem.plannedSemesterNumber);
      }
    }
    const candidates = semesters.filter((semester) => semester.semesterNumber >= preferred);
    const eligibleCandidates = item.type === "elective-slot"
      ? candidates.filter((semester) => isElectiveSlotEligibleForSemester(item, semester.semesterNumber, studentState.currentSemester))
      : candidates.filter((semester) => isModuleEligible(item, studentState, plannedItems, semester));

    if (eligibleCandidates.length === 0) {
      return null;
    }

    if (studentState.targetSemesterCount === 7 && variant === "standard") {
      const regularSemester = eligibleCandidates.find((semester) => semester.semesterNumber === preferred);
      if (regularSemester && item.type !== "elective-slot") {
        return regularSemester;
      }
    }

    if (variant === "balanced" || variant === "relaxed") {
      return eligibleCandidates
        .slice()
        .sort((a, b) => {
          const creditDiff = a.totalCrp - b.totalCrp;
          return creditDiff !== 0 ? creditDiff : a.semesterNumber - b.semesterNumber;
        })[0];
    }

    return eligibleCandidates
      .slice()
      .sort((a, b) => compareSemesterLoad(
        a,
        b,
        item,
        studentState.targetCreditsPerSemester,
        item.type === "elective-slot"
      ))[0];
  }

  function requiredModules(studentState) {
    const passedIds = new Set(studentState.passedModuleIds);
    const mandatory = studentState.modules.filter((module) => (
      isCommonMandatory(module) || isTrackSpecificMandatory(module, studentState.selectedTrack) || isCompletionModule(module)
    ));

    return mandatory
      .filter((module) => !passedIds.has(moduleId(module)))
      .sort((a, b) => {
        const aCompletion = isCompletionModule(a) ? 1 : 0;
        const bCompletion = isCompletionModule(b) ? 1 : 0;
        if (aCompletion !== bCompletion) {
          return aCompletion - bCompletion;
        }
        if (aCompletion && bCompletion) {
          return completionOrder(a) - completionOrder(b);
        }
        return compareModules(a, b);
      });
  }

  function buildRemainingStudyPlan(studentState, options = {}) {
    const semesters = createSemesterObjects(studentState);
    const plannedItems = [];
    const pool = [...requiredModules(studentState), ...createElectiveSlots(studentState)];
    let progress = true;

    while (progress) {
      progress = false;
      pool.forEach((item) => {
        if (plannedItems.some((plannedItem) => plannedItem.type !== "elective-slot" && moduleId(plannedItem) === moduleId(item))) {
          return;
        }
        if (plannedItems.some((plannedItem) => plannedItem.type === "elective-slot" && plannedItem.id === item.id)) {
          return;
        }

        const targetSemester = bestSemesterForItem(item, semesters, studentState, plannedItems, options.variant || "standard");
        if (!targetSemester) {
          return;
        }

        const plannedItem = addItemToSemester(targetSemester, item);
        plannedItems.push(plannedItem);
        progress = true;
      });
    }

    return trimRenderedSemesters(semesters, studentState, options);
  }

  function trimRenderedSemesters(semesters, studentState, options = {}) {
    return semesters
      .filter((semester) => options.showPastSemesters || semester.semesterNumber >= studentState.currentSemester)
      .filter((semester) => semester.modules.length > 0)
      .map((semester) => ({
        semesterNumber: semester.semesterNumber,
        term: semester.term,
        modules: semester.modules,
        totalCrp: semester.totalCrp
      }));
  }

  function flattenPlannedItems(semesters) {
    return semesters.flatMap((semester) => semester.modules);
  }

  function calculateCreditSummary(studentState, semesters) {
    const plannedItems = flattenPlannedItems(semesters);
    const plannedRemainingCrp = plannedItems.reduce((sum, item) => sum + itemCredits(item), 0);
    const totalAfterPlanCrp = studentState.alreadyPassedCrp + plannedRemainingCrp;
    const missingAfterPlanCrp = Math.max(0, TOTAL_REQUIRED_CRP - totalAfterPlanCrp);
    const hasOpenElectiveSlots = plannedItems.some((item) => item.type === "elective-slot" && !item.selectedModuleId);

    return {
      totalRequiredCrp: TOTAL_REQUIRED_CRP,
      alreadyPassedCrp: studentState.alreadyPassedCrp,
      remainingRequiredCrp: Math.max(0, TOTAL_REQUIRED_CRP - studentState.alreadyPassedCrp),
      plannedRemainingCrp,
      totalAfterPlanCrp,
      missingAfterPlanCrp,
      isComplete: missingAfterPlanCrp === 0 && !hasOpenElectiveSlots
    };
  }

  function generateStudyPlan(input) {
    const studentState = normalizeStudentState(input);
    const semesters = buildRemainingStudyPlan(studentState, { variant: input.variant || "standard" });
    const creditSummary = calculateCreditSummary(studentState, semesters);

    return {
      studentState,
      semesters: creditSummary.isComplete && studentState.alreadyPassedCrp === TOTAL_REQUIRED_CRP ? [] : semesters,
      creditSummary,
      message: creditSummary.isComplete && studentState.alreadyPassedCrp === TOTAL_REQUIRED_CRP
        ? "Alle Anforderungen der PO erfüllt."
        : ""
    };
  }

  window.MPMStudyPlan = {
    normalizeStudentState,
    getRemainingRequirements,
    buildRemainingStudyPlan,
    createElectiveSlots,
    getAllowedModulesForSlot,
    selectModuleForElectiveSlot,
    isModuleEligible,
    trimRenderedSemesters,
    calculateCreditSummary,
    generateStudyPlan,
    _internals: {
      TOTAL_REQUIRED_CRP,
      categorizeModule,
      isCommonMandatory,
      isTrackSpecificMandatory,
      isOppositeTrackMandatory,
      isTrackElective,
      isGeneralElective,
      isUniversityElective,
      isCompletionModule,
      isElectiveSlotEligibleForSemester,
      MIN_ELECTIVE_SEMESTER,
      DEFAULT_TARGET_CRP_PER_SEMESTER,
      MAX_CRP_PER_SEMESTER,
      itemCredits
    }
  };
})();
