const gql = require('graphql-tag');
const { ApolloServer } = require('apollo-server');
const fs = require('fs');

const knownDrugsData = JSON.parse(fs.readFileSync('./ESR1-known-drugs.json', 'utf8'));

const typeDefs = gql`
  type Query {
    knownDrugs(page: Pagination, sort: SortInput): KnownDrugs
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
    status: String!
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
    if (direction === 'asc') {
      if (a[sortBy] < b[sortBy]) {
        return -1;
      }

      if (a[sortBy] > b[sortBy]) {
        return 1;
      }

      return 0;
    } else {
      if (a[sortBy] < b[sortBy]) {
        return 1;
      }

      if (a[sortBy] > b[sortBy]) {
        return -1;
      }

      return 0;
    }
  });
}

function getPage(data, page) {
  if (page) {
    const i = page.size * page.index;
    return knownDrugsData.slice(i, i + page.size).map(d => {
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

  return knownDrugsData.slice(0, 10).map(d => {
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

const resolvers = {
  Query: {
    knownDrugs(_, { page, sort }) {
      let drugs = sortDrugs(knownDrugsData, sort);
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
