import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaTag, FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaUser } from 'react-icons/fa';
import { getCustomerById, deleteCustomer } from '../../api/customerService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Spinner from '../../components/UI/Spinner';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const response = await getCustomerById(id);
        setCustomer(response.data);
      } catch (error) {
        console.error('Error fetching customer:', error);
        setError('Failed to load customer details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleEdit = () => {
    navigate(`/customers/${id}/edit`);
  };

  const handleDelete = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteCustomer(id);
      navigate('/customers', { state: { message: `Customer "${customer.name}" has been deleted successfully.` } });
    } catch (error) {
      console.error('Error deleting customer:', error);
      setError('Failed to delete customer. Please try again.');
      setShowConfirmDialog(false);
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'active':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'inactive':
          return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'lead':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'prospect':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert type="error" message={error} />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/customers')}>
            <FaArrowLeft className="mr-2" /> Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <Alert type="error" message="Customer not found" />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/customers')}>
            <FaArrowLeft className="mr-2" /> Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="secondary" onClick={() => navigate('/customers')} className="mr-4">
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="primary" onClick={handleEdit}>
            <FaEdit className="mr-2" /> Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash className="mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Overview */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-800 font-bold text-2xl">
                  {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{customer.name}</h2>
              <p className="text-gray-500 mb-3">{customer.company || 'No company'}</p>
              <StatusBadge status={customer.status} />
              
              <div className="w-full mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-3" />
                    <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                      {customer.email}
                    </a>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center">
                      <FaPhone className="text-gray-400 mr-3" />
                      <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                        {customer.phone}
                      </a>
                    </div>
                  )}
                  {customer.company && (
                    <div className="flex items-center">
                      <FaBuilding className="text-gray-400 mr-3" />
                      <span>{customer.company}</span>
                    </div>
                  )}
                </div>
              </div>

              {customer.address && Object.values(customer.address).some(val => val) && (
                <div className="w-full mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Address</h3>
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-gray-400 mr-3 mt-1" />
                    <div>
                      {customer.address.street && <p>{customer.address.street}</p>}
                      {customer.address.city && customer.address.state && (
                        <p>{customer.address.city}, {customer.address.state} {customer.address.zipCode}</p>
                      )}
                      {customer.address.country && <p>{customer.address.country}</p>}
                    </div>
                  </div>
                </div>
              )}

              {customer.tags && customer.tags.length > 0 && (
                <div className="w-full mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                        <FaTag className="mr-1 text-gray-500" size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {customer.socialProfiles && Object.values(customer.socialProfiles).some(val => val) && (
                <div className="w-full mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Social Profiles</h3>
                  <div className="flex justify-center space-x-4">
                    {customer.socialProfiles.facebook && (
                      <a href={customer.socialProfiles.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        <FaFacebook size={24} />
                      </a>
                    )}
                    {customer.socialProfiles.twitter && (
                      <a href={customer.socialProfiles.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                        <FaTwitter size={24} />
                      </a>
                    )}
                    {customer.socialProfiles.linkedin && (
                      <a href={customer.socialProfiles.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">
                        <FaLinkedin size={24} />
                      </a>
                    )}
                    {customer.socialProfiles.instagram && (
                      <a href={customer.socialProfiles.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                        <FaInstagram size={24} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {customer.assignedTo && (
                <div className="w-full mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Assigned To</h3>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">{customer.assignedTo.name}</p>
                      <p className="text-sm text-gray-500">{customer.assignedTo.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              {customer.notes ? (
                <p className="text-gray-700 whitespace-pre-line">{customer.notes}</p>
              ) : (
                <p className="text-gray-500 italic">No notes available for this customer.</p>
              )}
            </div>
          </Card>

          {/* Recent Orders */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
                <Link to={`/orders/new?customerId=${customer._id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  + Add Order
                </Link>
              </div>
              <div className="bg-gray-50 p-8 text-center rounded-lg">
                <p className="text-gray-500 mb-4">No orders found for this customer.</p>
                <Link to={`/orders/new?customerId=${customer._id}`}>
                  <Button variant="primary" size="sm">Create First Order</Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
              <div className="bg-gray-50 p-8 text-center rounded-lg">
                <p className="text-gray-500">No activity recorded yet.</p>
              </div>
            </div>
          </Card>

          {/* Customer Information */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p>{new Date(customer.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customer.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    </div>
  );
};

export default CustomerDetail;
