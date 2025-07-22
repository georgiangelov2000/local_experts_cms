// Centralized configuration for React frontend

const config = {
  API_BASE: process.env.REACT_APP_API_BASE || 'http://localhost:80/api/cms/v1',
  AUTH_BASE: process.env.REACT_APP_AUTH_BASE || 'http://localhost:80/api/cms/v1',
  // Add more endpoints or settings as needed
};

export default config; 