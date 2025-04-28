import axios from './axios';

// Get all orders
export const getOrders = async () => {
  const response = await axios.get('/orders');
  return response.data;
};

// Get order by ID
export const getOrderById = async (id) => {
  const response = await axios.get(`/orders/${id}`);
  return response.data;
};

// Create new order
export const createOrder = async (orderData) => {
  const response = await axios.post('/orders', orderData);
  return response.data;
};

// Update order
export const updateOrder = async (id, orderData) => {
  const response = await axios.put(`/orders/${id}`, orderData);
  return response.data;
};

// Delete order
export const deleteOrder = async (id) => {
  const response = await axios.delete(`/orders/${id}`);
  return response.data;
};

// Process payment
export const processPayment = async (id, paymentData) => {
  const response = await axios.post(`/orders/${id}/payment`, paymentData);
  return response.data;
};
