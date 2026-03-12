/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

export const API_ENDPOINTS = {
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

export default API_BASE_URL;
