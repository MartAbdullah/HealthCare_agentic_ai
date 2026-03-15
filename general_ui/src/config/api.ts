/**
 * API Configuration
 * Centralized configuration for all API endpoints
 * Supports both build-time and runtime API URL configuration
 */

// Get API URL from runtime config (set by server.js) or environment variable or default
const getAPIBaseURL = (): string => {
  // Check if window.API_CONFIG is set by server
  if (typeof window !== 'undefined' && (window as any).API_CONFIG?.API_URL) {
    return (window as any).API_CONFIG.API_URL;
  }
  // Fallback to environment variable set at build time
  return process.env.REACT_APP_API_URL || 'http://localhost:8001';
};

// Factory function to get fresh endpoints each time (NOT cached from build time)
export const getAPIEndpoints = () => {
  const API_BASE_URL = getAPIBaseURL();
  
  return {
    // Global
    health: `${API_BASE_URL}/health`,

    // Basic Agent (Patient Intake)
    basic: {
      health: `${API_BASE_URL}/basic/health`,
      analyze: `${API_BASE_URL}/basic/analyze`,
    },

    // Intermediate Agent (Specialist Consultation)
    intermediate: {
      health: `${API_BASE_URL}/intermediate/health`,
      analyze: `${API_BASE_URL}/intermediate/analyze`,
    },

    // Advanced Agent (Clinical Document)
    advanced: {
      health: `${API_BASE_URL}/advanced/health`,
      files: `${API_BASE_URL}/advanced/files`,
      upload: `${API_BASE_URL}/advanced/upload`,
      processStorage: `${API_BASE_URL}/advanced/process-storage`,
      approve: `${API_BASE_URL}/advanced/approve`,
    },
  } as const;
};

// Log configuration for debugging
if (typeof window !== 'undefined') {
  console.log('API Base URL:', getAPIBaseURL());
}

// Lazy proxy for backward compatibility with existing code
// This automatically calls getAPIEndpoints() when accessing properties
export const API_ENDPOINTS = new Proxy({} as any, {
  get: (_, prop) => {
    return (getAPIEndpoints() as any)[prop];
  }
});

export default getAPIBaseURL();
