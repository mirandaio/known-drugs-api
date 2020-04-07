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

function filter(data, filters) {
  if (!filters) return data;

  const {
    disease, phase, status, source, drug, type, mechanism, activity
  } = filters;

  let filteredData = data;

  if (disease) {
    const fuseDisease = new Fuse(filteredData, { keys: [ 'disease' ]});
    filteredData = fuseDisease.search(disease).map(d => d.item);
  }

  if (phase != undefined) {
    filteredData = filteredData.filter(d => d.phase === phase);
  }

  if (status) {
    const fuseStatus = new Fuse(filteredData, { keys: [ 'status' ] });
    filteredData = fuseStatus.search(status).map(d => d.item);
  }

  if (source) {
    const fuseSource = new Fuse(filteredData, { keys: [ 'source' ] });
    filteredData = fuseSource.search(source).map(d => d.item);
  }

  if (drug) {
    const fuseDrug = new Fuse(filteredData, { keys: [ 'drug' ] });
    filteredData = fuseDrug.search(drug).map(d => d.item);
  }

  if (type) {
    const fuseType = new Fuse(filteredData, { keys: [ 'type' ] });
    filteredData = fuseType.search(type).map(d => d.item);
  }

  if (mechanism) {
    const fuseMechanism = new Fuse(filteredData, { keys: [ 'mechanism' ] });
    filteredData = fuseMechanism.search(mechanism).map(d => d.item);
  }

  if (activity) {
    const fuseActivity = new Fuse(filteredData, { keys: [ 'activity' ] });
    filteredData = fuseActivity.search(activity).map(d => d.item);
  }

  return filteredData;
}

const resolvers = {
  Query: {
    knownDrugs(_, { page, sort, filters }) {
      let drugs = filter(knownDrugsData, filters);
      const total = drugs.length;
      drugs = sortDrugs(drugs, sort);
      drugs = getPage(drugs, page);

      return {
        aggregations: {
          total
        },
        rows: drugs
      };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true
});

server.listen({ port: process.env.PORT || 4000 })
  .then(({ url }) => console.log(`Server ready at ${url}`));
