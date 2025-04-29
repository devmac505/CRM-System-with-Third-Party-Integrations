import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaTrash, 
  FaEdit, 
  FaEye, 
  FaPaperPlane, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa';
import { getCampaigns, deleteCampaign, sendCampaign } from '../../api/campaignService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Spinner from '../../components/UI/Spinner';
import Pagination from '../../components/UI/Pagination';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [campaignToSend, setCampaignToSend] = useState(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [sendingCampaign, setSendingCampaign] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCampaigns();
      setCampaigns(response.data || []);
      
      // Calculate total pages
      const filteredCampaigns = filterCampaigns(response.data || []);
      setTotalPages(Math.ceil(filteredCampaigns.length / itemsPerPage));
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns. Please try again later.');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = (campaign) => {
    setCampaignToDelete(campaign);
    setShowConfirmDialog(true);
  };

  const handleSend = (campaign) => {
    setCampaignToSend(campaign);
    setShowSendDialog(true);
  };

  const confirmDelete = async () => {
    if (!campaignToDelete) return;
    
    try {
      await deleteCampaign(campaignToDelete._id);
      setCampaigns(campaigns.filter(c => c._id !== campaignToDelete._id));
      setActionSuccess(`Campaign "${campaignToDelete.name}" has been deleted.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setError('Failed to delete campaign. Please try again later.');
    } finally {
      setShowConfirmDialog(false);
      setCampaignToDelete(null);
    }
  };

  const confirmSend = async () => {
    if (!campaignToSend) return;
    
    try {
      setSendingCampaign(true);
      await sendCampaign(campaignToSend._id);
      
      // Update campaign status in the list
      const updatedCampaigns = campaigns.map(c => {
        if (c._id === campaignToSend._id) {
          return { ...c, status: 'active', sentDate: new Date() };
        }
        return c;
      });
      
      setCampaigns(updatedCampaigns);
      setActionSuccess(`Campaign "${campaignToSend.name}" has been sent successfully.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error sending campaign:', error);
      setError('Failed to send campaign. Please try again later.');
    } finally {
      setShowSendDialog(false);
      setCampaignToSend(null);
      setSendingCampaign(false);
    }
  };

  const filterCampaigns = (campaignList) => {
    return campaignList.filter(campaign => {
      // Filter by search term
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const paginateCampaigns = (campaignList) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return campaignList.slice(startIndex, endIndex);
  };

  // Get status badge class based on campaign status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get campaign type badge class
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'social_media':
        return 'bg-purple-100 text-purple-800';
      case 'sms':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format campaign type for display
  const formatCampaignType = (type) => {
    switch (type) {
      case 'social_media':
        return 'Social Media';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Filter and paginate campaigns
  const filteredCampaigns = filterCampaigns(campaigns);
  const displayedCampaigns = paginateCampaigns(filteredCampaigns);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Link to="/campaigns/new">
          <Button variant="primary" className="flex items-center">
            <FaPlus className="mr-2" />
            Create Campaign
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
                className="form-input pl-10 w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('all')}
                className="text-sm"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('draft')}
                className="text-sm"
              >
                Draft
              </Button>
              <Button
                variant={statusFilter === 'scheduled' ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('scheduled')}
                className="text-sm"
              >
                Scheduled
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('active')}
                className="text-sm"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('completed')}
                className="text-sm"
              >
                Completed
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No campaigns found.</p>
            <Link to="/campaigns/new">
              <Button variant="primary">Create Your First Campaign</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Audience
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedCampaigns.map(campaign => (
                    <tr key={campaign._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.name}
                            </div>
                            {campaign.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {campaign.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(campaign.type)}`}>
                          {formatCampaignType(campaign.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.status === 'scheduled' ? (
                          <div>
                            <div>Scheduled for:</div>
                            <div>{formatDate(campaign.scheduledDate)}</div>
                          </div>
                        ) : campaign.status === 'active' || campaign.status === 'completed' ? (
                          <div>
                            <div>Sent on:</div>
                            <div>{formatDate(campaign.sentDate)}</div>
                          </div>
                        ) : (
                          <div>
                            <div>Created on:</div>
                            <div>{formatDate(campaign.createdAt)}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {campaign.audience?.length || 0} recipients
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/campaigns/${campaign._id}`}>
                            <Button variant="secondary" size="sm" className="flex items-center">
                              <FaEye className="mr-1" />
                              View
                            </Button>
                          </Link>
                          
                          {campaign.status === 'draft' && (
                            <>
                              <Link to={`/campaigns/${campaign._id}/edit`}>
                                <Button variant="secondary" size="sm" className="flex items-center">
                                  <FaEdit className="mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              
                              <Button 
                                variant="primary" 
                                size="sm" 
                                className="flex items-center"
                                onClick={() => handleSend(campaign)}
                              >
                                <FaPaperPlane className="mr-1" />
                                Send
                              </Button>
                            </>
                          )}
                          
                          {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                            <Button 
                              variant="danger" 
                              size="sm" 
                              className="flex items-center"
                              onClick={() => handleDelete(campaign)}
                            >
                              <FaTrash className="mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Campaign"
        message={`Are you sure you want to delete the campaign "${campaignToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowConfirmDialog(false);
          setCampaignToDelete(null);
        }}
      />

      {/* Confirm Send Dialog */}
      <ConfirmDialog
        isOpen={showSendDialog}
        title="Send Campaign"
        message={`Are you sure you want to send the campaign "${campaignToSend?.name}" to ${campaignToSend?.audience?.length || 0} recipients? This action cannot be undone.`}
        confirmText={sendingCampaign ? "Sending..." : "Send"}
        cancelText="Cancel"
        onConfirm={confirmSend}
        onCancel={() => {
          setShowSendDialog(false);
          setCampaignToSend(null);
        }}
        confirmDisabled={sendingCampaign}
      />
    </div>
  );
};

export default CampaignList;
