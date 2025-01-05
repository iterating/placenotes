import { gql } from '@apollo/client';

export const SEARCH_NOTES = gql`
  query SearchNotes($input: SearchNotesInput!) {
    searchNotes(input: $input) {
      _id
      title
      body
      locationName
      location {
        type
        coordinates
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_NOTES_BY_LOCATION = gql`
  query GetNotesByLocation($location: LocationInput!, $radius: Float) {
    getNotesByLocation(location: $location, radius: $radius) {
      _id
      title
      body
      locationName
      location {
        type
        coordinates
      }
      createdAt
      updatedAt
    }
  }
`;
