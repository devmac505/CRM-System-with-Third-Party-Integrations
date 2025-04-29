import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaPaperPlane, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaUsers, 
  FaChartBar, 
  FaEye, 
  FaMousePointer, 
  FaTimes, 
  FaCheck 
} from 'react-icons/fa';
import { getCampaignById, deleteCampaign, sendCampaign } from '../../api/campaignService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Spinner from '../../components/UI/Spinner';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await getCampaignById(id);
        setCampaign(response.data);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setError('Failed to load campaign details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleEdit = () => {
    navigate(`/campaigns/${id}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleSend = () => {
    setShowSendDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCampaign(id);
      navigate('/campaigns', { state: { message: `Campaign "${campaign.name}" has been deleted.` } });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setError('Failed to delete campaign. Please try again later.');
      setShowDeleteDialog(false);
    }
  };

  const confirmSend = async () => {
    try {
      setSendingCampaign(true);
      await sendCampaign(id);
      
      // Update campaign status
      setCampaign(prev => ({
        ...prev,
        status: 'active',
        sentDate: new Date()
      }));
      
      setSuccessMessage('Campaign has been sent successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error sending campaign:', error);
      setError('Failed to send campaign. Please try again later.');
    } finally {
      setShowSendDialog(false);
      setSendingCampaign(false);
    }
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

  // Format campaign type for display
  const formatCampaignType = (type) => {
    switch (type) {
      case 'social_media':
        return 'Social Media';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert type="error" message={error} />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/campaigns')}>
            <FaArrowLeft className="mr-2" /> Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <Alert type="error" message="Campaign not found" />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/campaigns')}>
            <FaArrowLeft className="mr-2" /> Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="secondary" onClick={() => navigate('/campaigns')} className="mr-4">
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Details</h1>
        </div>
        <div className="flex space-x-2">
          {campaign.status === 'draft' && (
            <>
              <Button variant="primary" onClick={handleSend}>
                <FaPaperPlane className="mr-2" /> Send Campaign
              </Button>
              <Button variant="secondary" onClick={handleEdit}>
                <FaEdit className="mr-2" /> Edit
              </Button>
            </>
          )}
          {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
            <Button variant="danger" onClick={handleDelete}>
              <FaTrash className="mr-2" /> Delete
            </Button>
          )}
        </div>
      </div>

      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-4" />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{campaign.name}</h2>
                {campaign.description && (
                  <p className="text-gray-600 mt-1">{campaign.description}</p>
                )}
              </div>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(campaign.status)}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaEnvelope className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Campaign Type</div>
                  <div className="font-medium">{formatCampaignType(campaign.type)}</div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <FaCalendarAlt className="text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">
                    {campaign.status === 'scheduled' ? 'Scheduled Date' : 
                     campaign.status === 'active' || campaign.status === 'completed' ? 'Sent Date' : 
                     'Created Date'}
                  </div>
                  <div className="font-medium">
                    {campaign.status === 'scheduled' ? formatDate(campaign.scheduledDate) : 
                     campaign.status === 'active' || campaign.status === 'completed' ? formatDate(campaign.sentDate) : 
                     formatDate(campaign.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <FaUsers className="text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Audience Size</div>
                  <div className="font-medium">{campaign.audience?.length || 0} recipients</div>
                </div>
              </div>

              {(campaign.status === 'active' || campaign.status === 'completed') && (
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <FaChartBar className="text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Performance</div>
                    <Link to={`/campaigns/${id}/analytics`} className="font-medium text-blue-600 hover:text-blue-800">
                      View Analytics
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {campaign.content && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Campaign Content</h3>
                {campaign.content.subject && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-500">Subject</div>
                    <div className="font-medium">{campaign.content.subject}</div>
                  </div>
                )}
                {campaign.content.body && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Body</div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: campaign.content.body }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Campaign Metrics</h3>
            
            {(campaign.status === 'active' || campaign.status === 'completed') ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500">Sent</div>
                    <div className="font-medium">{campaign.metrics?.sent || 0}</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500">Delivered</div>
                    <div className="font-medium">
                      {campaign.metrics?.delivered || 0} 
                      <span className="text-xs text-gray-500 ml-1">
                        ({campaign.metrics?.sent ? Math.round((campaign.metrics.delivered / campaign.metrics.sent) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${campaign.metrics?.sent ? Math.round((campaign.metrics.delivered / campaign.metrics.sent) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500">Opened</div>
                    <div className="font-medium">
                      {campaign.metrics?.opened || 0}
                      <span className="text-xs text-gray-500 ml-1">
                        ({campaign.metrics?.delivered ? Math.round((campaign.metrics.opened / campaign.metrics.delivered) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ 
                        width: `${campaign.metrics?.delivered ? Math.round((campaign.metrics.opened / campaign.metrics.delivered) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500">Clicked</div>
                    <div className="font-medium">
                      {campaign.metrics?.clicked || 0}
                      <span className="text-xs text-gray-500 ml-1">
                        ({campaign.metrics?.opened ? Math.round((campaign.metrics.clicked / campaign.metrics.opened) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${campaign.metrics?.opened ? Math.round((campaign.metrics.clicked / campaign.metrics.opened) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link to={`/campaigns/${id}/analytics`}>
                    <Button variant="secondary" className="w-full">
                      <FaChartBar className="mr-2" /> View Detailed Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaChartBar className="mx-auto text-gray-300 text-5xl mb-4" />
                <p className="text-gray-500">Metrics will be available after the campaign is sent.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {campaign.audience && campaign.audience.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Audience</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    {(campaign.status === 'active' || campaign.status === 'completed') && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivered
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Opened
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clicked
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaign.audience.map((recipient, index) => (
                    <tr key={recipient._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {recipient.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {recipient.email}
                        </div>
                      </td>
                      {(campaign.status === 'active' || campaign.status === 'completed') && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {recipient.delivered ? (
                                <FaCheck className="text-green-500" />
                              ) : (
                                <FaTimes className="text-red-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {recipient.opened ? (
                                <FaEye className="text-green-500" />
                              ) : (
                                <FaTimes className="text-red-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {recipient.clicked ? (
                                <FaMousePointer className="text-green-500" />
                              ) : (
                                <FaTimes className="text-red-500" />
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Campaign"
        message={`Are you sure you want to delete the campaign "${campaign.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Confirm Send Dialog */}
      <ConfirmDialog
        isOpen={showSendDialog}
        title="Send Campaign"
        message={`Are you sure you want to send the campaign "${campaign.name}" to ${campaign.audience?.length || 0} recipients? This action cannot be undone.`}
        confirmText={sendingCampaign ? "Sending..." : "Send"}
        cancelText="Cancel"
        onConfirm={confirmSend}
        onCancel={() => setShowSendDialog(false)}
        confirmDisabled={sendingCampaign}
      />
    </div>
  );
};

export default CampaignDetail;
