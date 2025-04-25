import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../api/apiClient';

/**
 * Custom hook to fetch and manage the user's friends list.
 * 
 * @returns {{ friends: Array, isLoading: boolean, error: string | null, refetchFriends: function }}
 */
export const useFriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFriends = useCallback(async () => {
    // console.log('useFriendsList: Fetching friends...');
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/friends/list');
      // console.log('useFriendsList: API response received', response.data);
      setFriends(response.data || []);
    } catch (err) {
      console.error('useFriendsList: Error fetching friends:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Could not load friends list.';
      setError(errorMessage);
      setFriends([]); // Clear friends on error
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies, fetch is manually triggered or on mount

  // Fetch friends when the hook is first used
  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]); // Depend on the memoized fetchFriends function

  return {
    friends,
    isLoading,
    error,
    refetchFriends: fetchFriends, // Expose a function to manually refetch
  };
};
