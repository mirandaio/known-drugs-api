const gql = require('graphql-tag');
const { ApolloServer } = require('apollo-server');
const fs = require('fs');

const knownDrugsData = JSON.parse(fs.readFileSync('./ESR1-known-drugs.json', 'utf8'));

const typeDefs = gql`
  type Query {
    knownDrugs(page: Pagination): KnownDrugs
  }

  input Pagination {
    index: Int!
    size: Int!
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
  }
`;

const resolvers = {
  Query: {
    knownDrugs(_, { page }) {

      if (page) {
        const i = page.size * page.index;
        return {
          aggregations: {
            total: knownDrugsData.length,
          },
          rows: knownDrugsData.slice(i, i + page.size).map(d => {
            return {
              disease: d.disease,
              phase: d.phase
            };
          })
        };
      } else {
        return {
          aggregations: {
            total: knownDrugsData.length
          },
          rows: knownDrugsData.slice(0, 10).map(d => {
            return {
              disease: d.disease,
              phase: d.phase
            };
          })
        }
      }
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen(4000).then(() => console.log('on port 4000'));
