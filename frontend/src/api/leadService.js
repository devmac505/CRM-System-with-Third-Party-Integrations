import axios from './axios';

// Get all leads
export const getLeads = async () => {
  const response = await axios.get('/leads');
  return response.data;
};

// Get lead by ID
export const getLeadById = async (id) => {
  const response = await axios.get(`/leads/${id}`);
  return response.data;
};

// Create new lead
export const createLead = async (leadData) => {
  const response = await axios.post('/leads', leadData);
  return response.data;
};

// Update lead
export const updateLead = async (id, leadData) => {
  const response = await axios.put(`/leads/${id}`, leadData);
  return response.data;
};

// Delete lead
export const deleteLead = async (id) => {
  const response = await axios.delete(`/leads/${id}`);
  return response.data;
};

// Add interaction to lead
export const addInteraction = async (id, interactionData) => {
  const response = await axios.post(`/leads/${id}/interactions`, interactionData);
  return response.data;
};
