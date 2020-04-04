const gql = require('graphql-tag');
const { ApolloServer } = require('apollo-server');
const fs = require('fs');
const Fuse = require('fuse.js');

const knownDrugsData = JSON.parse(fs.readFileSync('./ESR1-known-drugs.json', 'utf8'));

const typeDefs = gql`
  type Query {
    knownDrugs(page: Pagination, sort: SortInput, filters: Filters): KnownDrugs
  }

  input Filters {
    disease: String
    phase: Int
    status: String
    source: String
    drug: String
    type: String
    mechanism: String
    activity: String
  }

  input Pagination {
    index: Int!
    size: Int!
  }

  input SortInput {
    sortBy: String!
    direction: String
  }

  type KnownDrugs {
    aggregations: Aggregations!
    rows: [KnownDrug!]!
  }

  type Aggregations {
    total: Int
  }

  type KnownDrug {
    disease: String!
    phase: Int!
    status: String
    source: String!
    drug: String!
    type: String!
    mechanism: String!
    activity: String!
  }
`;

function sortDrugs(data, sort) {
  if (!sort) return data;

  const { sortBy, direction } = sort;

  return data.sort((a, b) => {
    if (a[sortBy] === b[sortBy]) return 0;

    if (direction === 'asc') {
      if (a[sortBy] === null || a[sortBy] < b[sortBy]) {
        return -1;
      }

      if (a[sortBy] > b[sortBy]) {
        return 1;
      }

    } else {
      if (a[sortBy] === null || a[sortBy] < b[sortBy]) {
        return 1;
      }

      if (a[sortBy] > b[sortBy]) {
        return -1;
      }

    }
  });
}

function getPage(data, page) {
  if (page) {
    const i = page.size * page.index;
    return data.slice(i, i + page.size).map(d => {
      return {
        disease: d.disease,
        phase: d.phase,
        status: d.status,
        source: d.source,
        drug: d.drug,
        type: d.type,
        mechanism: d.mechanism,
        activity: d.activity
      };
    })
  }

  return data.slice(0, 10).map(d => {
    return {
      disease: d.disease,
      phase: d.phase,
      status: d.status,
      source: d.source,
      drug: d.drug,
      type: d.type,
      mechanism: d.mechanism,
      activity: d.activity
    };
  });
}

const options = {
  isCaseSensitive: false,
  // minMatchCharLength: 5,
  threshold: 0.6,
  keys: [ 'disease' ]
};

function filter(data, filters) {
  const {
    disease, phase, status, source, drug, type, mechanism, activity
  } = filters;

  let filteredData = data;


  if (disease) {
    const fuseDisease = new Fuse(filteredData, options);
    filteredData = fuseDisease.search(disease).map(d => d.item);
  }

  return filteredData;
}

const resolvers = {
  Query: {
    knownDrugs(_, { page, sort, filters }) {
      let drugs = filter(knownDrugsData, filters);
      drugs = sortDrugs(drugs, sort);
      drugs = getPage(drugs, page);

      return {
        aggregations: {
          total: knownDrugsData.length
        },
        rows: drugs
      };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen(4000).then(() => console.log('on port 4000'));
