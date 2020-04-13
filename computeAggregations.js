const computeAggregations = data => {
  const uniqueDrugs = new Set();
  const clinicalTrials = new Set();
  const uniqueDiseases = new Set();
  const uniqueDrugsByActivity = {};
  const uniqueDrugsByType = {};
  const clinicalTrialsByPhase = {};

  data.forEach(row => {
    const { phase, sourceUrl } = row.clinicalTrial;
    const { activity, type, name } = row.drug;

    uniqueDrugs.add(name);
    clinicalTrials.add(sourceUrl);
    uniqueDiseases.add(row.disease.name);

    if (clinicalTrialsByPhase[phase]) {
      clinicalTrialsByPhase[phase].add(sourceUrl);
    } else {
      clinicalTrialsByPhase[phase] = new Set();
      clinicalTrialsByPhase[phase].add(sourceUrl);
    }

    if (uniqueDrugsByActivity[activity]) {
      uniqueDrugsByActivity[activity].add(name);
    } else {
      uniqueDrugsByActivity[activity] = new Set();
      uniqueDrugsByActivity[activity].add(name);
    }

    if (uniqueDrugsByType[type]) {
      uniqueDrugsByType[type].add(name);
    } else {
      uniqueDrugsByType[type] = new Set();
      uniqueDrugsByType[type].add(name);
    }
  });

  return {
    total: data.length,
    uniqueDrugs: uniqueDrugs.size,
    clinicalTrials: clinicalTrials.size,
    uniqueDiseases: uniqueDiseases.size,
    clinicalTrialsByPhase: Object.entries(clinicalTrialsByPhase)
      .map(d => ({ category: d[0], count: d[1].size })),
    uniqueDrugsByType: Object.entries(uniqueDrugsByType)
      .map(d => ({ category: d[0], count: d[1].size })),
    uniqueDrugsByActivity: Object.entries(uniqueDrugsByActivity)
      .map(d => ({ category: d[0], count: d[1].size }))
  };
};

module.exports = computeAggregations;
