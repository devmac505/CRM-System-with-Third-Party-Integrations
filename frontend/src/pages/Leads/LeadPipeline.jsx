import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getLeads, updateLead, deleteLead } from '../../api/leadService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Spinner from '../../components/UI/Spinner';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const LeadPipeline = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  
  const navigate = useNavigate();

  // Define pipeline stages
  const pipelineStages = [
    { id: 'new', label: 'New' },
    { id: 'contacted', label: 'Contacted' },
    { id: 'qualified', label: 'Qualified' },
    { id: 'proposal', label: 'Proposal' },
    { id: 'negotiation', label: 'Negotiation' },
    { id: 'closed_won', label: 'Closed Won' },
    { id: 'closed_lost', label: 'Closed Lost' }
  ];

  // Fetch leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await getLeads();
        setLeads(response.data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setError('Failed to load leads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Filter leads based on search term
  const filteredLeads = leads.filter(lead => {
    const customerName = lead.customer?.name || '';
    const customerEmail = lead.customer?.email || '';
    
    return customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.notes && lead.notes.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Group leads by status
  const groupedLeads = pipelineStages.reduce((acc, stage) => {
    acc[stage.id] = filteredLeads.filter(lead => lead.status === stage.id);
    return acc;
  }, {});

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle view lead
  const handleViewLead = (id) => {
    navigate(`/leads/${id}`);
  };

  // Handle edit lead
  const handleEditLead = (id) => {
    navigate(`/leads/${id}/edit`);
  };

  // Handle delete lead
  const handleDeleteClick = (lead) => {
    setLeadToDelete(lead);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    
    try {
      setLoading(true);
      await deleteLead(leadToDelete._id);
      
      // Remove from state
      setLeads(leads.filter(l => l._id !== leadToDelete._id));
      setActionSuccess(`Lead for "${leadToDelete.customer?.name || 'Unknown'}" has been deleted successfully.`);
      
      // Hide dialog and reset
      setShowConfirmDialog(false);
      setLeadToDelete(null);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting lead:', error);
      setError('Failed to delete lead. Please try again.');
      setShowConfirmDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setLeadToDelete(null);
  };

  // Handle lead status change
  const handleStatusChange = async (lead, newStatus) => {
    try {
      setLoading(true);
      const updatedLead = { ...lead, status: newStatus };
      const response = await updateLead(lead._id, updatedLead);
      
      // Update state
      setLeads(leads.map(l => l._id === lead._id ? response.data : l));
      setActionSuccess(`Lead status updated to ${formatStatus(newStatus)}.`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating lead status:', error);
      setError('Failed to update lead status. Please try again.');
    } finally {
      setLoading(false);
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

  // Calculate stage metrics
  const calculateStageMetrics = (stageId) => {
    const stageLeads = groupedLeads[stageId] || [];
    const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
    
    return {
      count: stageLeads.length,
      totalValue
    };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
        <Link to="/leads/new">
          <Button variant="primary" className="flex items-center">
            <FaPlus className="mr-2" />
            Add Lead
          </Button>
        </Link>
      </div>

      {actionSuccess && (
        <Alert type="success" message={actionSuccess} className="mb-4" />
      )}

      {error && (
        <Alert type="error" message={error} className="mb-4" />
      )}

      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search leads..."
                className="form-input pl-10 w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="ml-4">
              <Link to="/leads">
                <Button variant="secondary">
                  View as List
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {loading && leads.length === 0 ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-6">
          <div className="grid grid-cols-7 gap-4 min-w-max">
            {pipelineStages.map(stage => {
              const metrics = calculateStageMetrics(stage.id);
              
              return (
                <div key={stage.id} className="w-72">
                  <div className="bg-gray-100 p-3 rounded-t-lg border-b sticky top-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-700">{stage.label}</h3>
                      <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                        {metrics.count}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatCurrency(metrics.totalValue)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-b-lg min-h-[calc(100vh-250px)] max-h-[calc(100vh-250px)] overflow-y-auto">
                    {groupedLeads[stage.id]?.length > 0 ? (
                      groupedLeads[stage.id].map(lead => (
                        <div 
                          key={lead._id}
                          className="p-3 bg-white m-2 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleViewLead(lead._id)}
                        >
                          <div className="font-medium text-gray-900 truncate">
                            {lead.customer?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatCurrency(lead.value || 0)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDate(lead.expectedClosingDate)}
                          </div>
                          
                          <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
                            <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="text-gray-400 hover:text-blue-600 p-1"
                                onClick={() => handleViewLead(lead._id)}
                                title="View"
                              >
                                <FaEye size={12} />
                              </button>
                              <button
                                className="text-gray-400 hover:text-indigo-600 p-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditLead(lead._id);
                                }}
                                title="Edit"
                              >
                                <FaEdit size={12} />
                              </button>
                              <button
                                className="text-gray-400 hover:text-red-600 p-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(lead);
                                }}
                                title="Delete"
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                            
                            <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                              {stage.id !== 'new' && (
                                <button
                                  className="text-gray-400 hover:text-yellow-600 p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentIndex = pipelineStages.findIndex(s => s.id === lead.status);
                                    if (currentIndex > 0) {
                                      handleStatusChange(lead, pipelineStages[currentIndex - 1].id);
                                    }
                                  }}
                                  title="Move Left"
                                >
                                  <FaChevronLeft size={12} />
                                </button>
                              )}
                              
                              {stage.id !== 'closed_won' && stage.id !== 'closed_lost' && (
                                <button
                                  className="text-gray-400 hover:text-green-600 p-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentIndex = pipelineStages.findIndex(s => s.id === lead.status);
                                    if (currentIndex < pipelineStages.length - 1) {
                                      handleStatusChange(lead, pipelineStages[currentIndex + 1].id);
                                    }
                                  }}
                                  title="Move Right"
                                >
                                  <FaChevronRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No leads in this stage
                      </div>
                    )}
                    
                    {/* Add lead button at the bottom of each column */}
                    <div className="p-2">
                      <Link 
                        to={`/leads/new?status=${stage.id}`}
                        className="block w-full p-2 text-center text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        <FaPlus className="inline mr-1" size={10} />
                        Add lead
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Lead"
        message={`Are you sure you want to delete the lead for ${leadToDelete?.customer?.name || 'this customer'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    </div>
  );
};

export default LeadPipeline;
