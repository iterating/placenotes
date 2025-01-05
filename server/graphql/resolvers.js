import { searchNotes as searchNotesService, getNotesByLocation as getNotesByLocationService } from '../services/notes.service.js';

export const resolvers = {
  Query: {
    searchNotes: async (_, { input }, { req }) => {
      if (!req.user) {
        throw new Error('Authentication required');
      }

      const { query, location, radius, limit } = input;
      
      // If location is provided, use getNotesByLocation service
      if (location) {
        const notes = await getNotesByLocationService({
          userId: req.user._id,
          location,
          radius: radius || 1000 // Default radius of 1km
        });

        // Filter notes by query if provided
        if (query) {
          return notes.filter(note => 
            note.title?.toLowerCase().includes(query.toLowerCase()) ||
            note.body.toLowerCase().includes(query.toLowerCase()) ||
            note.locationName?.toLowerCase().includes(query.toLowerCase())
          );
        }
        return notes;
      }

      // Otherwise use text search
      return searchNotesService({
        userId: req.user._id,
        query,
        limit: limit || 20
      });
    },

    getNotesByLocation: async (_, { location, radius }, { req }) => {
      if (!req.user) {
        throw new Error('Authentication required');
      }

      return getNotesByLocationService({
        userId: req.user._id,
        location,
        radius: radius || 1000 // Default radius of 1km
      });
    }
  }
};
