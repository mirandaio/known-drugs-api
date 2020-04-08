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
  
  return {
    total: knownDrugsData.length,
    filteredTotal: drugs.length,
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
