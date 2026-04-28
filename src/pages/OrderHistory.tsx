import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { Order } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Package, Truck, CheckCircle2, Clock, CreditCard, Smartphone, Wallet, QrCode, ArrowRight, Star } from 'lucide-react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { OrderTracker } from '../components/OrderTracker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

export const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [reviewingItem, setReviewingItem] = useState<{productId: number, name: string} | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewingItem) return;

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        userId: user.id,
        productId: reviewingItem.productId,
        rating,
        comment
      });
      toast.success("Thank you for your review!");
      setReviewingItem(null);
      setComment('');
      setRating(5);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await api.get(`/orders/${user.id}`);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing': return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">Processing</Badge>;
      case 'shipped': return <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">Shipped</Badge>;
      case 'delivered': return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cod': return <Truck className="h-4 w-4" />;
      case 'phonepe': return <Smartphone className="h-4 w-4 text-purple-600" />;
      case 'gpay': return <Wallet className="h-4 w-4 text-blue-600" />;
      case 'paytm': return <Smartphone className="h-4 w-4 text-cyan-600" />;
      case 'upi': return <QrCode className="h-4 w-4 text-primary" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Order History</h1>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-16 bg-muted/50" />
              <CardContent className="p-6 space-y-4">
                <div className="h-6 w-1/4 bg-muted rounded" />
                <div className="flex gap-4">
                  <div className="h-20 w-20 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-muted rounded" />
                    <div className="h-4 w-1/4 bg-muted rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        <Badge variant="outline" className="px-3 py-1">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </Badge>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/20">
          <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No orders found</h2>
          <p className="text-muted-foreground max-w-xs mx-auto mb-8">
            You haven't placed any orders yet. Explore our collection and find something you love!
          </p>
          <Button onClick={() => navigate('/products')} className="gap-2">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-5 px-6">
                <div className="grid grid-cols-2 sm:flex gap-6 sm:gap-12">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Order Placed</p>
                    <p className="text-sm font-semibold">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Total Amount</p>
                    <p className="text-sm font-bold text-primary">₹{order.total_amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Payment Method</p>
                    <div className="flex items-center gap-1.5 text-sm font-semibold capitalize">
                      {getPaymentIcon(order.payment_method)}
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Order ID</p>
                  <p className="text-sm font-mono font-medium text-muted-foreground">#ORD-{order.id.toString().padStart(6, '0')}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:bg-destructive/10 h-8 px-3"
                      onClick={async () => {
                        if (confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                          try {
                            await api.post(`/orders/${order.id}/cancel`, {});
                            toast.success("Order cancelled successfully");
                            // Refresh list locally
                            setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
                          } catch (error: any) {
                            toast.error(error.message || "Failed to cancel order");
                          }
                        }
                      }}
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex gap-5 group">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted border group-hover:border-primary/50 transition-colors">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">Quantity: <span className="font-medium text-foreground">{item.quantity}</span></p>
                            {item.size && <p className="text-sm text-muted-foreground">Size: <span className="font-medium text-foreground">{item.size}</span></p>}
                          </div>
                          <p className="text-lg font-bold">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="mt-4 flex gap-3">
                          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate(`/product/${item.productId}`)}>Buy Again</Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs"
                            onClick={() => setReviewingItem({ productId: item.productId, name: item.name })}
                          >
                            Write Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Shipping Address</p>
                    <p className="text-sm font-medium">{order.address.fullName}</p>
                    <p className="text-xs text-muted-foreground">{order.address.street}, {order.address.city}, {order.address.state} - {order.address.zipCode}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 sm:flex-none">Download Invoice</Button>
                    <Button className="flex-1 sm:flex-none" onClick={() => setTrackingOrder(order)}>Track Order</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Tracker Modal */}
      <Dialog open={!!trackingOrder} onOpenChange={(open) => !open && setTrackingOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Tracker</DialogTitle>
            <DialogDescription>
              Real-time updates for Order #ORD-{trackingOrder?.id.toString().padStart(6, '0')}
            </DialogDescription>
          </DialogHeader>
          {trackingOrder && <OrderTracker order={trackingOrder} />}
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={!!reviewingItem} onOpenChange={(open) => !open && setReviewingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {reviewingItem?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReviewSubmit} className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Rate your product</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Thoughts</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="How was the quality and fit?..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setReviewingItem(null)}>Cancel</Button>
              <Button type="submit" className="flex-1 font-bold" disabled={submitting}>
                {submitting ? "Submitting..." : "Post Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
