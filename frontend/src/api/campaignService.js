import axios from './axios';

// Get all campaigns
export const getCampaigns = async () => {
  const response = await axios.get('/campaigns');
  return response.data;
};

// Get campaign by ID
export const getCampaignById = async (id) => {
  const response = await axios.get(`/campaigns/${id}`);
  return response.data;
};

// Create new campaign
export const createCampaign = async (campaignData) => {
  const response = await axios.post('/campaigns', campaignData);
  return response.data;
};

// Update campaign
export const updateCampaign = async (id, campaignData) => {
  const response = await axios.put(`/campaigns/${id}`, campaignData);
  return response.data;
};

// Delete campaign
export const deleteCampaign = async (id) => {
  const response = await axios.delete(`/campaigns/${id}`);
  return response.data;
};

// Send campaign
export const sendCampaign = async (id) => {
  const response = await axios.post(`/campaigns/${id}/send`);
  return response.data;
};
