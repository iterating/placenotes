import React, { useState, useCallback } from 'react';
import { useNoteSearch } from '../hooks/useNoteSearch';
import { useGeolocation } from '../hooks/useGeolocation';
import { Box, TextField, IconButton, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { Search as SearchIcon, MyLocation as MyLocationIcon, Clear as ClearIcon } from '@mui/icons-material';

const NoteSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { searchNotes, clearSearch, searchResults, isSearching, error } = useNoteSearch();
  const { getCurrentPosition } = useGeolocation();

  const handleSearch = useCallback(async (useLocation = false) => {
    if (!searchQuery && !useLocation) return;

    let searchParams = { query: searchQuery };

    if (useLocation) {
      try {
        const position = await getCurrentPosition();
        searchParams.location = {
          type: 'Point',
          coordinates: [position.coords.longitude, position.coords.latitude]
        };
        searchParams.radius = 1000; // 1km radius
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    }

    searchNotes(searchParams);
  }, [searchQuery, searchNotes, getCurrentPosition]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    clearSearch();
  }, [clearSearch]);

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: searchQuery && (
              <IconButton onClick={handleClear} size="small">
                <ClearIcon />
              </IconButton>
            )
          }}
        />
        <IconButton onClick={() => handleSearch()} color="primary">
          <SearchIcon />
        </IconButton>
        <IconButton onClick={() => handleSearch(true)} color="primary">
          <MyLocationIcon />
        </IconButton>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {isSearching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {searchResults.map((note) => (
            <Card key={note._id}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {note.title || 'Untitled Note'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {note.locationName}
                </Typography>
                <Typography variant="body1">
                  {note.body}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(note.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default NoteSearch;
