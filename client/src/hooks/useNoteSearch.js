import { useState, useCallback } from 'react';
import { apiClient } from '../api/apiClient';

export const useNoteSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);


  const searchNotes = useCallback(async ({ query, location, radius, limit }) => {
    setIsSearching(true);
    setError(null);

    try {
      if (location && !query) {
        // Location-only search
        const params = new URLSearchParams();
        params.append('latitude', location.coordinates[1]);
        params.append('longitude', location.coordinates[0]);
        if (radius) params.append('radius', radius);
        
        const response = await apiClient.get(`/notes/nearby?${params.toString()}`);
        setSearchResults(response.data);
      } else {
        // Text search
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (limit) params.append('limit', limit);
        
        const response = await apiClient.get(`/notes/search?${params.toString()}`);
        setSearchResults(response.data.notes || response.data);
      }
      setIsSearching(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Search failed');
      setIsSearching(false);
      setSearchResults([]);
    }
  }, []);

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
