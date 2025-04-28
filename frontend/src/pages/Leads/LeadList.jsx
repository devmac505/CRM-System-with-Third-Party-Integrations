import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaTrash, FaEdit, FaEye, FaExchangeAlt, FaChartLine, FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getLeads, deleteLead, updateLead } from '../../api/leadService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Spinner from '../../components/UI/Spinner';
import Pagination from '../../components/UI/Pagination';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const LeadList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'pipeline'

  const navigate = useNavigate();

  // Fetch leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await getLeads();
        setLeads(response.data || []);
        setTotalPages(Math.ceil((response.data?.length || 0) / itemsPerPage));
      } catch (error) {
        console.error('Error fetching leads:', error);
        setError('Failed to load leads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [itemsPerPage]);

  // Filter leads based on search term and status
  const filteredLeads = leads.filter(lead => {
    const customerName = lead.customer?.name || '';
    const customerEmail = lead.customer?.email || '';

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.notes && lead.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Paginate leads
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle status filter
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
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
      setActionSuccess(`Lead status updated to ${newStatus.replace('_', ' ')}.`);

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

    const formatStatus = (status) => {
      return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor()}`}>
        {formatStatus(status)}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Render list view
  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expected Closing
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedLeads.length > 0 ? (
            paginatedLeads.map((lead) => (
              <tr
                key={lead._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewLead(lead._id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-800 font-medium text-sm">
                        {lead.customer?.name ? lead.customer.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{lead.customer?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{lead.customer?.email || 'No email'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatCurrency(lead.value || 0)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(lead.expectedClosingDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.source.replace('_', ' ').charAt(0).toUpperCase() + lead.source.replace('_', ' ').slice(1)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleViewLead(lead._id)}
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleEditLead(lead._id)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteClick(lead)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'No leads match your search criteria.'
                  : 'No leads found. Add your first lead!'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Render pipeline view
  const renderPipelineView = () => {
    const statusColumns = [
      { id: 'new', label: 'New' },
      { id: 'contacted', label: 'Contacted' },
      { id: 'qualified', label: 'Qualified' },
      { id: 'proposal', label: 'Proposal' },
      { id: 'negotiation', label: 'Negotiation' },
      { id: 'closed_won', label: 'Closed Won' },
      { id: 'closed_lost', label: 'Closed Lost' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {statusColumns.map(column => {
          const columnLeads = filteredLeads.filter(lead => lead.status === column.id);
          const totalValue = columnLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

          return (
            <div key={column.id} className="min-w-[250px]">
              <div className="bg-gray-100 p-3 rounded-t-lg border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">{column.label}</h3>
                  <span className="text-xs font-medium bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatCurrency(totalValue)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-b-lg min-h-[300px]">
                {columnLeads.length > 0 ? (
                  columnLeads.map(lead => (
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
                            onClick={() => handleEditLead(lead._id)}
                            title="Edit"
                          >
                            <FaEdit size={12} />
                          </button>
                        </div>

                        <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                          {column.id !== 'new' && (
                            <button
                              className="text-gray-400 hover:text-yellow-600 p-1"
                              onClick={() => {
                                const currentIndex = statusColumns.findIndex(c => c.id === lead.status);
                                if (currentIndex > 0) {
                                  handleStatusChange(lead, statusColumns[currentIndex - 1].id);
                                }
                              }}
                              title="Move Left"
                            >
                              <FaChevronLeft size={12} />
                            </button>
                          )}

                          {column.id !== 'closed_won' && column.id !== 'closed_lost' && (
                            <button
                              className="text-gray-400 hover:text-green-600 p-1"
                              onClick={() => {
                                const currentIndex = statusColumns.findIndex(c => c.id === lead.status);
                                if (currentIndex < statusColumns.length - 1) {
                                  handleStatusChange(lead, statusColumns[currentIndex + 1].id);
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
                    No leads
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('list')}
            className="flex items-center"
          >
            <FaList className="mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'pipeline' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('pipeline')}
            className="flex items-center"
          >
            <FaChartLine className="mr-2" />
            Pipeline
          </Button>
          <Link to="/leads/new">
            <Button variant="primary" className="flex items-center">
              <FaPlus className="mr-2" />
              Add Lead
            </Button>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <Alert type="success" message={actionSuccess} className="mb-4" />
      )}

      {error && (
        <Alert type="error" message={error} className="mb-4" />
      )}

      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
                <select
                  className="form-input pl-10"
                  value={statusFilter}
                  onChange={handleStatusFilter}
                >
                  <option value="all">All Statuses</option>
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
          </div>
        </div>
      </Card>

      <Card>
        {loading && leads.length === 0 ? (
          <div className="flex justify-center items-center p-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {viewMode === 'list' ? renderListView() : renderPipelineView()}

            {viewMode === 'list' && filteredLeads.length > itemsPerPage && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredLeads.length / itemsPerPage)}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </Card>

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

export default LeadList;
