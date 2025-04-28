import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { getOrderById, createOrder, updateOrder } from '../../api/orderService';
import { getCustomers } from '../../api/customerService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Spinner from '../../components/UI/Spinner';

const OrderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  
  // Get customerId from query params if available (for creating order from customer)
  const queryParams = new URLSearchParams(location.search);
  const customerIdFromQuery = queryParams.get('customerId');

  const [formData, setFormData] = useState({
    customer: customerIdFromQuery || '',
    products: [],
    totalAmount: 0,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'credit_card',
    notes: ''
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: 1
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch order data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const response = await getOrderById(id);
          setFormData(response.data);
        } catch (error) {
          console.error('Error fetching order:', error);
          setError('Failed to load order data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [id, isEditMode]);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setCustomersLoading(true);
        const response = await getCustomers();
        setCustomers(response.data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError('Failed to load customers. Please try again later.');
      } finally {
        setCustomersLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Calculate total amount whenever products change
  useEffect(() => {
    const total = formData.products.reduce((sum, product) => {
      return sum + (parseFloat(product.price) * parseInt(product.quantity));
    }, 0);
    
    setFormData(prev => ({
      ...prev,
      totalAmount: total
    }));
  }, [formData.products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when field is edited
    if (validationErrors[`product_${name}`]) {
      setValidationErrors(prev => ({
        ...prev,
        [`product_${name}`]: null
      }));
    }
  };

  const handleAddProduct = () => {
    // Validate product
    const errors = {};
    
    if (!newProduct.name.trim()) {
      errors.product_name = 'Product name is required';
    }
    
    if (!newProduct.price || isNaN(newProduct.price) || parseFloat(newProduct.price) <= 0) {
      errors.product_price = 'Price must be a positive number';
    }
    
    if (!newProduct.quantity || isNaN(newProduct.quantity) || parseInt(newProduct.quantity) <= 0) {
      errors.product_quantity = 'Quantity must be a positive number';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        ...errors
      }));
      return;
    }
    
    // Add product to list
    const productToAdd = {
      ...newProduct,
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity)
    };
    
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, productToAdd]
    }));
    
    // Reset new product form
    setNewProduct({
      name: '',
      description: '',
      price: '',
      quantity: 1
    });
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.customer) {
      errors.customer = 'Customer is required';
    }
    
    if (formData.products.length === 0) {
      errors.products = 'At least one product is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      if (isEditMode) {
        await updateOrder(id, formData);
        navigate(`/orders/${id}`, { state: { message: 'Order updated successfully' } });
      } else {
        const response = await createOrder(formData);
        navigate(`/orders/${response.data._id}`, { state: { message: 'Order created successfully' } });
      }
    } catch (error) {
      console.error('Error saving order:', error);
      setError(error.response?.data?.message || 'Failed to save order. Please try again.');
      setSaving(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="secondary" onClick={() => navigate(-1)} className="mr-4">
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Order' : 'Create New Order'}
          </h1>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
              
              <div className="mb-4">
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  id="customer"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  className={`form-input w-full ${validationErrors.customer ? 'border-red-500' : ''}`}
                  disabled={customersLoading || customerIdFromQuery}
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
                {validationErrors.customer && (
                  <p className="mt-1 text-sm text-red-500">{validationErrors.customer}</p>
                )}
                {customersLoading && (
                  <p className="mt-1 text-sm text-gray-500">Loading customers...</p>
                )}
                {!customersLoading && customers.length === 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">No customers found.</p>
                    <Link to="/customers/new" className="form-link text-sm">
                      + Add a new customer first
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Order Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-input w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    id="paymentStatus"
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    className="form-input w-full"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="form-input w-full"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Order Notes */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Order Notes</h2>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={5}
                  className="form-input w-full"
                  placeholder="Enter any additional notes about this order..."
                ></textarea>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{formData.products.length}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">
                    {formData.products.reduce((sum, product) => sum + parseInt(product.quantity || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between font-medium text-lg mt-2 pt-2 border-t border-blue-200">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(formData.totalAmount)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Products */}
        <Card className="mt-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Products</h2>
            
            {validationErrors.products && (
              <Alert type="error" message={validationErrors.products} className="mb-4" />
            )}
            
            {/* Product List */}
            {formData.products.length > 0 ? (
              <div className="mb-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.products.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                              <FaShoppingCart className="text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-gray-500">{product.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(product.price * product.quantity)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-md text-center text-gray-500">
                No products added yet. Add products below.
              </div>
            )}
            
            {/* Add Product Form */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-base font-medium mb-3">Add Product</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="name"
                    value={newProduct.name}
                    onChange={handleProductChange}
                    className={`form-input w-full ${validationErrors.product_name ? 'border-red-500' : ''}`}
                    placeholder="Enter product name"
                  />
                  {validationErrors.product_name && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.product_name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    id="productDescription"
                    name="description"
                    value={newProduct.description}
                    onChange={handleProductChange}
                    className="form-input w-full"
                    placeholder="Enter product description"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="productPrice"
                      name="price"
                      value={newProduct.price}
                      onChange={handleProductChange}
                      className={`form-input pl-7 w-full ${validationErrors.product_price ? 'border-red-500' : ''}`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {validationErrors.product_price && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.product_price}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="productQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="productQuantity"
                    name="quantity"
                    value={newProduct.quantity}
                    onChange={handleProductChange}
                    className={`form-input w-full ${validationErrors.product_quantity ? 'border-red-500' : ''}`}
                    placeholder="1"
                    min="1"
                  />
                  {validationErrors.product_quantity && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.product_quantity}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAddProduct}
                  className="flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Product
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            loading={saving}
          >
            <FaSave className="mr-2" />
            {isEditMode ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
