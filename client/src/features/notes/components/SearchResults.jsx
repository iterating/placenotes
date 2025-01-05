import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const searchNotes = async () => {
      const query = searchParams.get('q');
      if (!query) return;

      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiClient.get(`/notes/search?q=${encodeURIComponent(query)}`);
        setResults(response.data.notes || []);
      } catch (err) {
        console.error('Error searching notes:', err);
        setError('Failed to search notes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    searchNotes();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="search-results-container">
        <div className="loading">Searching...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results-container">
        <div className="no-results">No notes found matching your search.</div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <h2>Search Results</h2>
      <div className="results-list">
        {results.map((note) => (
          <div key={note._id} className="note-card">
            <h3>{note.title || 'Untitled Note'}</h3>
            <p>{note.content}</p>
            <div className="note-metadata">
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              {note.location && (
                <span>{note.location.name || 'Unknown Location'}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
