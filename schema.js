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
    clinicalTrials: Int!
    uniqueDiseases: Int!
    clinicalTrialsByPhase: [Count!]!
    uniqueDrugsByType: [Count!]!
    uniqueDrugsByActivity: [Count!]!
  }

  type Count {
    category: String!
    count: Int!
  }

  type KnownDrug {
    target: Target!
    disease: Disease!
    drug: EvDrug!
    clinicalTrial: ClinicalTrial!
    mechanismOfAction: EvidenceMechanismOfAction!
  }

  type Target {
    id: String!
    symbol: String!
  }

  type Disease {
    id: String!
    name: String!
  }

  type EvDrug {
    id: String!
    name: String!
    type: DrugType!
    activity: DrugActivity!
  }

  enum DrugType {
    SMALL_MOLECULE
    PROTEIN
    ENZYME
    ANTIBODY
    OLIGOSACCHARIDE
    OLIGONUCLEOTIDE
    UNKNOWN
  }

  enum DrugActivity {
    POSITIVE_MODULATOR
    NEGATIVE_MODULATOR
    OTHER
  }

  type ClinicalTrial {
    phase: Int!
    status: ClinicalTrialStatus
    sourceUrl: String!
    sourceName: String!
  }

  enum ClinicalTrialStatus {
    ACTIVE_NOT_RECRUITING
    COMPLETED
    NOT_APPLICABLE
    NOT_YET_RECRUITING
    RECRUITING
    SUSPENDED
    TERMINATED
    UNKNOWN_STATUS
    WITHDRAWN
    ENROLLING_BY_INVITATION
  }

  type EvidenceMechanismOfAction {
    name: String!
    sourceName: String
    sourceUrl: String
  }
`;

module.exports = typeDefs;
