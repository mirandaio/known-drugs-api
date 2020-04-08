const { gql } = require('apollo-server');

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
    filteredTotal: Int
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
