import axios from './axios';

// Get all customers
export const getCustomers = async () => {
  const response = await axios.get('/customers');
  return response.data;
};

// Get customer by ID
export const getCustomerById = async (id) => {
  const response = await axios.get(`/customers/${id}`);
  return response.data;
};

// Create new customer
export const createCustomer = async (customerData) => {
  const response = await axios.post('/customers', customerData);
  return response.data;
};

// Update customer
export const updateCustomer = async (id, customerData) => {
  const response = await axios.put(`/customers/${id}`, customerData);
  return response.data;
};

// Delete customer
export const deleteCustomer = async (id) => {
  const response = await axios.delete(`/customers/${id}`);
  return response.data;
};
