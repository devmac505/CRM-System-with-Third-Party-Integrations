import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { getLeadById, createLead, updateLead } from '../../api/leadService';
import { getCustomers } from '../../api/customerService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Spinner from '../../components/UI/Spinner';

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  
  // Get customerId from query params if available (for creating lead from customer)
  const queryParams = new URLSearchParams(location.search);
  const customerIdFromQuery = queryParams.get('customerId');

  const [formData, setFormData] = useState({
    customer: customerIdFromQuery || '',
    source: 'website',
    status: 'new',
    score: 0,
    value: 0,
    expectedClosingDate: '',
    assignedTo: '',
    notes: ''
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch lead data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchLead = async () => {
        try {
          setLoading(true);
          const response = await getLeadById(id);
          
          // Format date for input field
          const lead = response.data;
          if (lead.expectedClosingDate) {
            const date = new Date(lead.expectedClosingDate);
            lead.expectedClosingDate = date.toISOString().split('T')[0];
          }
          
          setFormData({
            customer: lead.customer?._id || '',
            source: lead.source || 'website',
            status: lead.status || 'new',
            score: lead.score || 0,
            value: lead.value || 0,
            expectedClosingDate: lead.expectedClosingDate || '',
            assignedTo: lead.assignedTo?._id || '',
            notes: lead.notes || ''
          });
        } catch (error) {
          console.error('Error fetching lead:', error);
          setError('Failed to load lead data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchLead();
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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.customer) {
      errors.customer = 'Customer is required';
    }
    
    if (formData.value && isNaN(formData.value)) {
      errors.value = 'Value must be a number';
    }
    
    if (formData.score && (isNaN(formData.score) || formData.score < 0 || formData.score > 100)) {
      errors.score = 'Score must be a number between 0 and 100';
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
      
      // Convert string values to numbers
      const dataToSubmit = {
        ...formData,
        value: Number(formData.value),
        score: Number(formData.score)
      };
      
      if (isEditMode) {
        await updateLead(id, dataToSubmit);
        navigate(`/leads/${id}`, { state: { message: 'Lead updated successfully' } });
      } else {
        const response = await createLead(dataToSubmit);
        navigate(`/leads/${response.data._id}`, { state: { message: 'Lead created successfully' } });
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      setError(error.response?.data?.message || 'Failed to save lead. Please try again.');
      setSaving(false);
    }
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
            {isEditMode ? 'Edit Lead' : 'Add New Lead'}
          </h1>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              
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
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="form-input w-full"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social_media">Social Media</option>
                    <option value="email_campaign">Email Campaign</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-input w-full"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                    Potential Value
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      className={`form-input pl-7 w-full ${validationErrors.value ? 'border-red-500' : ''}`}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  {validationErrors.value && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.value}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Score (0-100)
                  </label>
                  <input
                    type="number"
                    id="score"
                    name="score"
                    value={formData.score}
                    onChange={handleChange}
                    className={`form-input w-full ${validationErrors.score ? 'border-red-500' : ''}`}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  {validationErrors.score && (
                    <p className="mt-1 text-sm text-red-500">{validationErrors.score}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="expectedClosingDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Closing Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarAlt className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="expectedClosingDate"
                    name="expectedClosingDate"
                    value={formData.expectedClosingDate}
                    onChange={handleChange}
                    className="form-input pl-10 w-full"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
              
              <div className="mb-4">
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="form-input pl-10 w-full"
                  >
                    <option value="">Not assigned</option>
                    <option value="user1">John Doe</option>
                    <option value="user2">Jane Smith</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Note: In a real application, this would be populated with actual users.
                </p>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={8}
                  className="form-input w-full"
                  placeholder="Enter any additional notes about this lead..."
                ></textarea>
              </div>
            </div>
          </Card>
        </div>

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
            {isEditMode ? 'Update Lead' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;
