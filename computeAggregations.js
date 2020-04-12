const computeAggregations = drugs => {
  const uniqueDrugs = new Set();
  const uniqueDiseases = new Set();
  const uniqueDrugsByActivity = {};
  const uniqueDrugsByType = {};
  const clinicalTrialsByPhase = {};

  for (let i = 0; i < drugs.length; i++) {
    const row = drugs[i];
    uniqueDrugs.add(row.drug.name);
    uniqueDiseases.add(row.disease.name);

    if (uniqueDrugsByActivity[row.drug.activity]) {
      uniqueDrugsByActivity[row.drug.activity].add(row.drug.name);
    } else {
      uniqueDrugsByActivity[row.drug.activity] = new Set();
      uniqueDrugsByActivity[row.drug.activity].add(row.drug.name);
    }

    if (uniqueDrugsByType[row.drug.type]) {
      uniqueDrugsByType[row.drug.type].add(row.drug.name);
    } else {
      uniqueDrugsByType[row.drug.type] = new Set();
      uniqueDrugsByType[row.drug.type].add(row.drug.name);
    }
  }

  return {
    total: drugs.length,
    uniqueDrugs: uniqueDrugs.size,
    uniqueDiseases: uniqueDiseases.size,
    uniqueDrugsByType: Object.entries(uniqueDrugsByType)
      .map(d => ({ category: d[0], count: d[1].size })),
    uniqueDrugsByActivity: Object.entries(uniqueDrugsByActivity)
      .map(d => ({ category: d[0], count: d[1].size }))
  };
};

module.exports = computeAggregations;
