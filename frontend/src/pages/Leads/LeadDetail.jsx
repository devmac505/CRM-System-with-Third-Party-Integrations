import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaExchangeAlt, 
  FaPlus, 
  FaPhone, 
  FaEnvelope, 
  FaComments, 
  FaCheck, 
  FaTimes 
} from 'react-icons/fa';
import { getLeadById, deleteLead, updateLead, addInteraction } from '../../api/leadService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Spinner from '../../components/UI/Spinner';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [interactionData, setInteractionData] = useState({
    type: 'call',
    notes: '',
    outcome: ''
  });
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [interactionError, setInteractionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        setLoading(true);
        const response = await getLeadById(id);
        setLead(response.data);
      } catch (error) {
        console.error('Error fetching lead:', error);
        setError('Failed to load lead details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleEdit = () => {
    navigate(`/leads/${id}/edit`);
  };

  const handleDelete = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteLead(id);
      navigate('/leads', { state: { message: `Lead has been deleted successfully.` } });
    } catch (error) {
      console.error('Error deleting lead:', error);
      setError('Failed to delete lead. Please try again.');
      setShowConfirmDialog(false);
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const updatedLead = { ...lead, status: newStatus };
      const response = await updateLead(id, updatedLead);
      setLead(response.data);
      setSuccessMessage(`Lead status updated to ${formatStatus(newStatus)}.`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating lead status:', error);
      setError('Failed to update lead status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInteractionChange = (e) => {
    const { name, value } = e.target;
    setInteractionData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    
    if (!interactionData.notes) {
      setInteractionError('Please enter interaction notes.');
      return;
    }
    
    try {
      setInteractionLoading(true);
      setInteractionError(null);
      
      const response = await addInteraction(id, interactionData);
      setLead(response.data);
      setSuccessMessage('Interaction added successfully.');
      
      // Reset form
      setInteractionData({
        type: 'call',
        notes: '',
        outcome: ''
      });
      setShowInteractionForm(false);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error adding interaction:', error);
      setInteractionError('Failed to add interaction. Please try again.');
    } finally {
      setInteractionLoading(false);
    }
  };

  // Format status
  const formatStatus = (status) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'new':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'contacted':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'qualified':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'proposal':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'negotiation':
          return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'closed_won':
          return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'closed_lost':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor()}`}>
        {formatStatus(status)}
      </span>
    );
  };

  // Interaction type icon
  const getInteractionIcon = (type) => {
    switch (type) {
      case 'call':
        return <FaPhone className="text-blue-500" />;
      case 'email':
        return <FaEnvelope className="text-green-500" />;
      case 'meeting':
        return <FaCalendarAlt className="text-purple-500" />;
      case 'social':
        return <FaComments className="text-pink-500" />;
      default:
        return <FaExchangeAlt className="text-gray-500" />;
    }
  };

  if (loading && !lead) {
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
          <Button variant="secondary" onClick={() => navigate('/leads')}>
            <FaArrowLeft className="mr-2" /> Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6">
        <Alert type="error" message="Lead not found" />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/leads')}>
            <FaArrowLeft className="mr-2" /> Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="secondary" onClick={() => navigate('/leads')} className="mr-4">
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Lead Details</h1>
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

      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-4" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Overview */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-800 font-bold text-2xl">
                  {lead.customer?.name ? lead.customer.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{lead.customer?.name || 'Unknown Customer'}</h2>
              <p className="text-gray-500 mb-3">{lead.customer?.email || 'No email'}</p>
              <StatusBadge status={lead.status} />
              
              <div className="w-full mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Lead Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500">
                      <FaMoneyBillWave className="mr-2" />
                      <span>Value:</span>
                    </div>
                    <span className="font-medium text-gray-900">{formatCurrency(lead.value)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500">
                      <FaCalendarAlt className="mr-2" />
                      <span>Expected Closing:</span>
                    </div>
                    <span className="font-medium text-gray-900">{formatDate(lead.expectedClosingDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500">
                      <FaChartLine className="mr-2" />
                      <span>Score:</span>
                    </div>
                    <span className="font-medium text-gray-900">{lead.score || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500">
                      <FaExchangeAlt className="mr-2" />
                      <span>Source:</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {lead.source.replace('_', ' ').charAt(0).toUpperCase() + lead.source.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {lead.assignedTo && (
                <div className="w-full mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Assigned To</h3>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">{lead.assignedTo.name}</p>
                      <p className="text-sm text-gray-500">{lead.assignedTo.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Lead Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lead Status</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  variant={lead.status === 'new' ? 'primary' : 'secondary'} 
                  size="sm"
                  onClick={() => handleStatusChange('new')}
                  disabled={lead.status === 'new' || loading}
                >
                  New
                </Button>
                <Button 
                  variant={lead.status === 'contacted' ? 'primary' : 'secondary'} 
                  size="sm"
                  onClick={() => handleStatusChange('contacted')}
                  disabled={lead.status === 'contacted' || loading}
                >
                  Contacted
                </Button>
                <Button 
                  variant={lead.status === 'qualified' ? 'primary' : 'secondary'} 
                  size="sm"
                  onClick={() => handleStatusChange('qualified')}
                  disabled={lead.status === 'qualified' || loading}
                >
                  Qualified
                </Button>
                <Button 
                  variant={lead.status === 'proposal' ? 'primary' : 'secondary'} 
                  size="sm"
                  onClick={() => handleStatusChange('proposal')}
                  disabled={lead.status === 'proposal' || loading}
                >
                  Proposal
                </Button>
                <Button 
                  variant={lead.status === 'negotiation' ? 'primary' : 'secondary'} 
                  size="sm"
                  onClick={() => handleStatusChange('negotiation')}
                  disabled={lead.status === 'negotiation' || loading}
                >
                  Negotiation
                </Button>
                <Button 
                  variant={lead.status === 'closed_won' ? 'success' : 'outline'} 
                  size="sm"
                  onClick={() => handleStatusChange('closed_won')}
                  disabled={lead.status === 'closed_won' || loading}
                >
                  <FaCheck className="mr-1" /> Closed Won
                </Button>
                <Button 
                  variant={lead.status === 'closed_lost' ? 'danger' : 'outline'} 
                  size="sm"
                  onClick={() => handleStatusChange('closed_lost')}
                  disabled={lead.status === 'closed_lost' || loading}
                >
                  <FaTimes className="mr-1" /> Closed Lost
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200"></div>
                <div className="space-y-6 relative">
                  {lead.status === 'closed_won' && (
                    <div className="flex">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center z-10">
                        <FaCheck className="text-green-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Deal Won!</h4>
                        <p className="text-gray-500">
                          Congratulations! This lead has been successfully converted to a customer.
                        </p>
                        <div className="mt-2">
                          <Link to={`/customers/${lead.customer?._id}`} className="form-link">
                            View Customer Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {lead.status === 'closed_lost' && (
                    <div className="flex">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center z-10">
                        <FaTimes className="text-red-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">Deal Lost</h4>
                        <p className="text-gray-500">
                          This lead has been marked as lost. You can add notes about why the deal was lost.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {lead.status !== 'closed_won' && lead.status !== 'closed_lost' && (
                    <div className="flex">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center z-10">
                        <FaExchangeAlt className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">In Progress</h4>
                        <p className="text-gray-500">
                          This lead is currently in the {formatStatus(lead.status)} stage.
                        </p>
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowInteractionForm(true)}
                          >
                            <FaPlus className="mr-1" /> Add Interaction
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Interaction Form */}
          {showInteractionForm && (
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Add Interaction</h3>
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowInteractionForm(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                
                {interactionError && (
                  <Alert type="error" message={interactionError} className="mb-4" />
                )}
                
                <form onSubmit={handleAddInteraction}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                        Interaction Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={interactionData.type}
                        onChange={handleInteractionChange}
                        className="form-input w-full"
                      >
                        <option value="call">Call</option>
                        <option value="email">Email</option>
                        <option value="meeting">Meeting</option>
                        <option value="social">Social Media</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-1">
                        Outcome (Optional)
                      </label>
                      <input
                        type="text"
                        id="outcome"
                        name="outcome"
                        value={interactionData.outcome}
                        onChange={handleInteractionChange}
                        className="form-input w-full"
                        placeholder="e.g., Scheduled follow-up call"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={interactionData.notes}
                      onChange={handleInteractionChange}
                      rows={3}
                      className="form-input w-full"
                      placeholder="Enter details about the interaction..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="mr-2"
                      onClick={() => setShowInteractionForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={interactionLoading}
                      disabled={interactionLoading}
                    >
                      <FaPlus className="mr-2" /> Add Interaction
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {/* Interactions */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Interactions</h3>
                {!showInteractionForm && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowInteractionForm(true)}
                  >
                    <FaPlus className="mr-1" /> Add Interaction
                  </Button>
                )}
              </div>
              
              {lead.interactions && lead.interactions.length > 0 ? (
                <div className="space-y-4">
                  {lead.interactions.map((interaction, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getInteractionIcon(interaction.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-base font-medium text-gray-900">
                              {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDateTime(interaction.date)}
                            </span>
                          </div>
                          {interaction.outcome && (
                            <p className="text-sm font-medium text-gray-700 mt-1">
                              Outcome: {interaction.outcome}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                            {interaction.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No interactions recorded yet.
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              {lead.notes ? (
                <p className="text-gray-700 whitespace-pre-line">{lead.notes}</p>
              ) : (
                <p className="text-gray-500 italic">No notes available for this lead.</p>
              )}
            </div>
          </Card>

          {/* Lead Information */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p>{formatDateTime(lead.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p>{formatDateTime(lead.updatedAt)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Lead"
        message={`Are you sure you want to delete this lead? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    </div>
  );
};

export default LeadDetail;
