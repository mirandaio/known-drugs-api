const fs = require('fs');
const Fuse = require('fuse.js');
const orderBy = require('lodash.orderby');
const computeAggregations = require('./computeAggregations');

const KEY_MAP = {
  disease: 'disease.name',
  phase: 'clinicalTrial.phase',
  status: 'clinicalTrial.status',
  source: 'clinicalTrial.sourceName',
  drug: 'drug.name',
  type: 'drug.type',
  mechanismOfAction: 'mechanismOfAction.name',
  activity: 'drug.activity'
};

const knownDrugsData = JSON.parse(
  fs.readFileSync('./ESR1-known-drugs-v2.json', 'utf8')
);

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
  return orderBy(data, [KEY_MAP[sortBy]], [direction]);
}

function filter(data, filters) {
  if(!filters) return data;

  let filteredData = data;

  filters.forEach(filter => {
    const fuse = new Fuse(filteredData, { threshold: 0.4, keys: [ KEY_MAP[filter.filterBy] ] });
    filteredData = fuse.search(filter.value).map(d => d.item);
  });

  return filteredData;
}

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
