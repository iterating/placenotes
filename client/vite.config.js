import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()], // Ensure this line is correctly set up
  // ... other configurations ...
});