const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    knownDrugs(page: Page, sort: SortInput, filters: [Filter!]): KnownDrugs
  }

  input Filter {
    filterBy: String!
    value: String!
  }

  input Page {
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
    total: Int!
    uniqueDrugs: Int!
    uniqueDiseases: Int!
    uniqueDrugsByType: [Count!]!
    uniqueDrugsByActivity: [Count!]!
  }

  type Count {
    category: String!
    count: Int!
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

module.exports = typeDefs;
