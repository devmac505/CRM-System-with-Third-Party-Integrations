import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaShoppingCart, 
  FaCreditCard, 
  FaCheck, 
  FaTimes, 
  FaExchangeAlt, 
  FaFileInvoice, 
  FaPrint, 
  FaDownload 
} from 'react-icons/fa';
import { getOrderById, deleteOrder, updateOrder, processPayment } from '../../api/orderService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import Spinner from '../../components/UI/Spinner';
import ConfirmDialog from '../../components/UI/ConfirmDialog';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(id);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleEdit = () => {
    navigate(`/orders/${id}/edit`);
  };

  const handleDelete = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteOrder(id);
      navigate('/orders', { state: { message: `Order has been deleted successfully.` } });
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
      setShowConfirmDialog(false);
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      const updatedOrder = { ...order, status: newStatus };
      const response = await updateOrder(id, updatedOrder);
      setOrder(response.data);
      setSuccessMessage(`Order status updated to ${newStatus}.`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      const updatedOrder = { ...order, paymentStatus: newStatus };
      const response = await updateOrder(id, updatedOrder);
      setOrder(response.data);
      setSuccessMessage(`Payment status updated to ${newStatus.replace('_', ' ')}.`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('Failed to update payment status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleProcessPayment = () => {
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    try {
      setProcessingPayment(true);
      setPaymentError(null);
      
      // In a real application, this would integrate with Stripe or another payment processor
      // For this demo, we'll just simulate a successful payment
      const paymentData = {
        paymentMethodId: 'pm_card_visa', // This would be a real payment method ID from Stripe
        amount: order.totalAmount
      };
      
      await processPayment(id, paymentData);
      
      // Update the order with the new payment status
      const updatedOrder = { ...order, paymentStatus: 'paid' };
      const response = await updateOrder(id, updatedOrder);
      setOrder(response.data);
      
      setShowPaymentDialog(false);
      setSuccessMessage('Payment processed successfully.');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentError('Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentDialog(false);
    setPaymentError(null);
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'processing':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'completed':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'refunded':
          return 'bg-purple-100 text-purple-800 border-purple-200';
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

  // Payment status badge component
  const PaymentStatusBadge = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'paid':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'unpaid':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'partially_paid':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'refunded':
          return 'bg-purple-100 text-purple-800 border-purple-200';
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor()}`}>
        {formatStatus(status)}
      </span>
    );
  };

  if (loading && !order) {
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
          <Button variant="secondary" onClick={() => navigate('/orders')}>
            <FaArrowLeft className="mr-2" /> Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <Alert type="error" message="Order not found" />
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/orders')}>
            <FaArrowLeft className="mr-2" /> Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  // Calculate order summary
  const subtotal = order.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const tax = subtotal * 0.1; // Assuming 10% tax
  const total = order.totalAmount;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="secondary" onClick={() => navigate('/orders')} className="mr-4">
            <FaArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.print()}>
            <FaPrint className="mr-2" /> Print
          </Button>
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
        {/* Order Summary */}
        <Card className="lg:col-span-1">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="text-sm text-gray-500">#{order._id.substring(0, 8)}</div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Status:</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-base font-medium mb-3">Customer Information</h3>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-800 font-medium text-sm">
                    {order.customer?.name ? order.customer.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{order.customer?.name || 'Unknown Customer'}</p>
                  <p className="text-sm text-gray-500">{order.customer?.email || 'No email'}</p>
                </div>
              </div>
              <Link to={`/customers/${order.customer?._id}`} className="form-link text-sm">
                View Customer Profile
              </Link>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="text-base font-medium mb-3">Payment Information</h3>
              <div className="mb-2">
                <span className="text-gray-600">Payment Method:</span>
                <div className="mt-1 flex items-center">
                  <FaCreditCard className="text-gray-500 mr-2" />
                  <span className="font-medium">
                    {order.paymentMethod.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </div>
              </div>
              {order.stripePaymentId && (
                <div className="mb-2">
                  <span className="text-gray-600">Payment ID:</span>
                  <div className="mt-1 font-medium text-sm">{order.stripePaymentId}</div>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base font-medium mb-3">Order Total</h3>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Update Order Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={order.status === 'pending' ? 'primary' : 'outline'} 
                      size="sm"
                      onClick={() => handleStatusChange('pending')}
                      disabled={order.status === 'pending' || statusLoading}
                    >
                      Pending
                    </Button>
                    <Button 
                      variant={order.status === 'processing' ? 'primary' : 'outline'} 
                      size="sm"
                      onClick={() => handleStatusChange('processing')}
                      disabled={order.status === 'processing' || statusLoading}
                    >
                      Processing
                    </Button>
                    <Button 
                      variant={order.status === 'completed' ? 'success' : 'outline'} 
                      size="sm"
                      onClick={() => handleStatusChange('completed')}
                      disabled={order.status === 'completed' || statusLoading}
                    >
                      <FaCheck className="mr-1" /> Completed
                    </Button>
                    <Button 
                      variant={order.status === 'cancelled' ? 'danger' : 'outline'} 
                      size="sm"
                      onClick={() => handleStatusChange('cancelled')}
                      disabled={order.status === 'cancelled' || statusLoading}
                    >
                      <FaTimes className="mr-1" /> Cancelled
                    </Button>
                    <Button 
                      variant={order.status === 'refunded' ? 'warning' : 'outline'} 
                      size="sm"
                      onClick={() => handleStatusChange('refunded')}
                      disabled={order.status === 'refunded' || statusLoading}
                    >
                      <FaExchangeAlt className="mr-1" /> Refunded
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Update Payment Status</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={order.paymentStatus === 'unpaid' ? 'danger' : 'outline'} 
                      size="sm"
                      onClick={() => handlePaymentStatusChange('unpaid')}
                      disabled={order.paymentStatus === 'unpaid' || statusLoading}
                    >
                      Unpaid
                    </Button>
                    <Button 
                      variant={order.paymentStatus === 'partially_paid' ? 'warning' : 'outline'} 
                      size="sm"
                      onClick={() => handlePaymentStatusChange('partially_paid')}
                      disabled={order.paymentStatus === 'partially_paid' || statusLoading}
                    >
                      Partially Paid
                    </Button>
                    <Button 
                      variant={order.paymentStatus === 'paid' ? 'success' : 'outline'} 
                      size="sm"
                      onClick={() => handlePaymentStatusChange('paid')}
                      disabled={order.paymentStatus === 'paid' || statusLoading}
                    >
                      <FaCheck className="mr-1" /> Paid
                    </Button>
                    <Button 
                      variant={order.paymentStatus === 'refunded' ? 'secondary' : 'outline'} 
                      size="sm"
                      onClick={() => handlePaymentStatusChange('refunded')}
                      disabled={order.paymentStatus === 'refunded' || statusLoading}
                    >
                      <FaExchangeAlt className="mr-1" /> Refunded
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div>
                  <Button 
                    variant="primary" 
                    onClick={handleProcessPayment}
                    disabled={order.paymentStatus === 'paid' || order.paymentStatus === 'refunded'}
                    className="flex items-center"
                  >
                    <FaCreditCard className="mr-2" /> Process Payment
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    {order.paymentStatus === 'paid' 
                      ? 'This order has already been paid.' 
                      : order.paymentStatus === 'refunded'
                      ? 'This order has been refunded.'
                      : 'Process payment manually or through payment gateway.'}
                  </p>
                </div>
                
                <div>
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                  >
                    <FaFileInvoice className="mr-2" /> Generate Invoice
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Products */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              
              <div className="overflow-x-auto">
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.products.map((product, index) => (
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
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        Subtotal
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        Tax (10%)
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(tax)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                        Total
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                        {formatCurrency(total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              {order.notes ? (
                <p className="text-gray-700 whitespace-pre-line">{order.notes}</p>
              ) : (
                <p className="text-gray-500 italic">No notes available for this order.</p>
              )}
            </div>
          </Card>

          {/* Order Information */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p>{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p>{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Order"
        message={`Are you sure you want to delete this order? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />

      {/* Payment Processing Dialog */}
      <ConfirmDialog
        isOpen={showPaymentDialog}
        title="Process Payment"
        message={
          <div>
            <p className="mb-4">Process payment for order #{order._id.substring(0, 8)}?</p>
            <p className="mb-4">Total amount: {formatCurrency(order.totalAmount)}</p>
            <p className="text-sm text-gray-500">
              In a real application, this would integrate with a payment gateway like Stripe.
            </p>
            {paymentError && (
              <div className="mt-4">
                <Alert type="error" message={paymentError} />
              </div>
            )}
          </div>
        }
        confirmText={processingPayment ? "Processing..." : "Process Payment"}
        cancelText="Cancel"
        onConfirm={handleConfirmPayment}
        onCancel={handleCancelPayment}
        isDestructive={false}
      />
    </div>
  );
};

export default OrderDetail;
