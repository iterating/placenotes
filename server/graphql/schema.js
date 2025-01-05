import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Location {
    type: String!
    coordinates: [Float!]!
  }

  type Note {
    _id: ID!
    userId: ID!
    email: String!
    title: String
    body: String!
    location: Location!
    locationName: String
    createdAt: String!
    updatedAt: String!
  }

  input LocationInput {
    type: String!
    coordinates: [Float!]!
  }

  input SearchNotesInput {
    query: String!
    location: LocationInput
    radius: Float
    limit: Int
  }

  type Query {
    searchNotes(input: SearchNotesInput!): [Note!]!
    getNotesByLocation(location: LocationInput!, radius: Float): [Note!]!
  }
`;
