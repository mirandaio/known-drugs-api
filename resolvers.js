const fs = require('fs');
const Fuse = require('fuse.js');

const knownDrugsData = JSON.parse(fs.readFileSync('./ESR1-known-drugs.json', 'utf8'));

function getPage(data, page) {
  if (page) {
    const i = page.size * page.index;
    return data.slice(i, i + page.size);
  }

  return data.slice(0, 10);
}

function sortDrugs(data, sort) {
  if (!sort) return data;

  const { sortBy, direction } = sort;

  return data.sort((a, b) => {
    if (a[sortBy] === b[sortBy]) return 0;

    if (direction === 'asc') {
      if (a[sortBy] === null) return -1;
      if (b[sortBy] === null) return 1; 

      if (a[sortBy] < b[sortBy]) {
        return -1;
      }

      if (a[sortBy] > b[sortBy]) {
        return 1;
      }

    } else {
      if (a[sortBy] === null) return 1;
      if (b[sortBy] === null) return -1; 

      if (a[sortBy] < b[sortBy]) {
        return 1;
      }

      if (a[sortBy] > b[sortBy]) {
        return -1;
      }

    }
  });
}

function filter(data, filters) {
  if(!filters) return data;

  let filteredData = data;

  filters.forEach(filter => {
    const fuse = new Fuse(filteredData, { keys: [ filter.filterBy ] });
    filteredData = fuse.search(filter.value).map(d => d.item);
  });

  return filteredData;
}

const computeAggregations = drugs => {
  const uniqueDrugs = new Set();
  const uniqueDiseases = new Set();
  const uniqueDrugsByActivity = {};
  const uniqueDrugsByType = {};
  const clinicalTrialsByPhase = {};

  for (let i = 0; i < drugs.length; i++) {
    const row = drugs[i];
    uniqueDrugs.add(row.drug);
    uniqueDiseases.add(row.disease);

    if (uniqueDrugsByActivity[row.activity]) {
      uniqueDrugsByActivity[row.activity].add(row.drug);
    } else {
      uniqueDrugsByActivity[row.activity] = new Set();
      uniqueDrugsByActivity[row.activity].add(row.drug);
    }

    if (uniqueDrugsByType[row.type]) {
      uniqueDrugsByType[row.type].add(row.drug);
    } else {
      uniqueDrugsByType[row.type] = new Set();
      uniqueDrugsByType[row.type].add(row.drug)
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

const resolvers = {
  Query: {
    knownDrugs(_, { page, sort, filters }) {
      const filteredDrugs = filter(knownDrugsData, filters);
      let drugs = sortDrugs(filteredDrugs, sort);
      drugs = getPage(drugs, page);

      return {
        aggregations: computeAggregations(filteredDrugs),
        rows: drugs
      };
    }
  }
};

module.exports = resolvers;
