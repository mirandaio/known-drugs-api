const gql = require('graphql-tag');
const { ApolloServer } = require('apollo-server');

const typeDefs = gql`
  type Query {
    knownDrugs(page: Int): KnownDrugs
  }

  type KnownDrugs {
    aggregations: Aggregations!
    rows: [KnownDrug!]!
  }

  type Aggregations {
    count: Int
  }

  type KnownDrug {
    disease: String!
    phase: Int!
  }
`;

const resolvers = {
  Query: {
    knownDrugs() {
      return {
        aggregations: {
          count: 7
        },
        rows: [{
          disease: 'infertility',
          phase: 4
        }]
      }
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen(4000).then(() => console.log('on port 4000'));
