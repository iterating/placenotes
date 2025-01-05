import { useLazyQuery } from '@apollo/client';
import { SEARCH_NOTES, GET_NOTES_BY_LOCATION } from '../lib/graphql/notes.queries';
import { useState, useCallback } from 'react';

export const useNoteSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const [executeSearch] = useLazyQuery(SEARCH_NOTES, {
    onCompleted: (data) => {
      setSearchResults(data.searchNotes);
      setIsSearching(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      setIsSearching(false);
    }
  });

  const [executeLocationSearch] = useLazyQuery(GET_NOTES_BY_LOCATION, {
    onCompleted: (data) => {
      setSearchResults(data.getNotesByLocation);
      setIsSearching(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      setIsSearching(false);
    }
  });

  const searchNotes = useCallback(async ({ query, location, radius, limit }) => {
    setIsSearching(true);
    setError(null);

    if (location && !query) {
      // Location-only search
      await executeLocationSearch({
        variables: {
          location,
          radius
        }
      });
    } else {
      // Text search or combined search
      await executeSearch({
        variables: {
          input: {
            query,
            location,
            radius,
            limit
          }
        }
      });
    }
  }, [executeSearch, executeLocationSearch]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchNotes,
    clearSearch,
    searchResults,
    isSearching,
    error
  };
};
