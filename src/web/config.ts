export const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : window.location.hostname === 'localhost'
    ? 'http://localhost:3051'
    : 'http://host.docker.internal:3051';