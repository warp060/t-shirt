import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { CheckCircle2, Truck, ShieldCheck, CreditCard, Wallet, Smartphone, Landmark, IndianRupee } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const directItem = location.state?.directItem;
  
  const checkoutItems = directItem ? [directItem] : items;
  const checkoutTotal = directItem ? (directItem.price * directItem.quantity) : totalPrice;

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'online'
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  
  const razorpayKeyId = "rzp_test_SjhDR53RB1qMBr";

  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.name || '',
        email: profile.email || user.email || ''
      }));
    }
  }, [user, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOnlinePayment = async () => {
    try {
      setLoading(true);
      // 1. Create order on server
      const order = await api.post('/payment/create-order', {
        amount: checkoutTotal,
        currency: 'INR'
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "Abbas Threads",
        description: selectedApp ? `Payment via ${selectedApp}` : "Purchase from Abbas Threads",
        image: "https://t-shirtmart24.vercel.app/logo.png",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on server
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // 4. Create actual order in DB
            const orderData = {
              userId: user?.id,
              items: checkoutItems,
              totalAmount: checkoutTotal,
              status: 'paid',
              address: formData,
              paymentMethod: 'online',
              paymentDetails: { 
                provider: 'razorpay',
                app: selectedApp,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id
              }
            };

            await api.post('/orders', orderData);
            clearCart();
            setOrderComplete(true);
            toast.success("Payment Successful!");
          } catch (error: any) {
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment Failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Payment init error:", error);
      toast.error("Failed to initialize payment. Try again later.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to place an order");
      navigate('/auth');
      return;
    }

    if (paymentMethod === 'online') {
      handleOnlinePayment();
      return;
    }

    setLoading(true);
    
    try {
      const orderData = {
        userId: user.id,
        items: checkoutItems,
        totalAmount: checkoutTotal,
        status: 'pending',
        address: formData,
        paymentMethod: 'cod',
        paymentDetails: { provider: 'cod' }
      };

      await api.post('/orders', orderData);
      clearCart();
      setOrderComplete(true);
      toast.success("Order placed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="flex flex-col items-center gap-6">
          <CheckCircle2 className="h-20 w-20 text-green-500 animate-in zoom-in duration-500" />
          <h1 className="text-4xl font-bold tracking-tight">Thank you for your order!</h1>
          <p className="text-muted-foreground max-w-md">
            Your order has been placed successfully. We'll send you an email confirmation with your order details and tracking information.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/orders')}>View Order History</Button>
            <Button variant="outline" onClick={() => navigate('/')}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <h1 className="mb-8 text-2xl sm:text-3xl font-bold tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Shipping Form */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <Truck className="h-5 w-5 text-primary" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} className="h-11" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} className="h-11" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Street Address</label>
                  <Input name="street" placeholder="123 Main St, Apartment 4B" value={formData.street} onChange={handleInputChange} className="h-11" required />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input name="city" placeholder="Mumbai" value={formData.city} onChange={handleInputChange} className="h-11" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Input name="state" placeholder="Maharashtra" value={formData.state} onChange={handleInputChange} className="h-11" required />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <label className="text-sm font-medium">Zip Code</label>
                    <Input name="zipCode" placeholder="400001" value={formData.zipCode} onChange={handleInputChange} className="h-11" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} className="h-11" required />
                </div>

                <div className="pt-6 border-t">
                  <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    Payment Method
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Primary Selection: COD vs Online */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div 
                        className={`group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted bg-card hover:border-primary/50 hover:bg-muted/50'}`}
                        onClick={() => {
                          setPaymentMethod('cod');
                          setSelectedApp(null);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${paymentMethod === 'cod' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}`}>
                            <Truck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Cash on Delivery</p>
                            <p className="text-[10px] text-muted-foreground">Pay when you receive</p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${paymentMethod === 'online' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted bg-card hover:border-primary/50 hover:bg-muted/50'}`}
                        onClick={() => {
                          setPaymentMethod('online');
                          if (!selectedApp) setSelectedApp('phonepe');
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${paymentMethod === 'online' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}`}>
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Online Payment</p>
                            <p className="text-[10px] text-muted-foreground">Automatic & Secure</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Online Sub-options */}
                    {paymentMethod === 'online' && (
                      <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Select Payment App</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {/* PhonePe */}
                          <div 
                            className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all h-20 ${selectedApp === 'phonepe' ? 'border-primary bg-primary/10 shadow-sm' : 'border-muted bg-card hover:border-primary/30'}`}
                            onClick={() => setSelectedApp('phonepe')}
                          >
                            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19 2H5C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H19C20.6569 22 22 20.6569 22 19V5C22 3.34315 20.6569 2 19 2Z" fill="#5F259F"/>
                              <path d="M16.5 7.5L12 12L7.5 7.5V10.5L12 15L16.5 10.5V7.5Z" fill="white"/>
                              <path d="M12 15V18.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <span className="text-[10px] font-bold">PhonePe</span>
                          </div>

                          {/* Google Pay */}
                          <div 
                            className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all h-20 ${selectedApp === 'gpay' ? 'border-primary bg-primary/10 shadow-sm' : 'border-muted bg-card hover:border-primary/30'}`}
                            onClick={() => setSelectedApp('gpay')}
                          >
                            <svg viewBox="0 0 48 48" className="h-8 w-8">
                              <path fill="#4285F4" d="M46.12 24.5c0-1.58-.14-3.11-.41-4.5H24v8.52h12.4c-.53 2.87-2.16 5.31-4.6 6.95v5.77h7.45c4.35-4 6.87-9.88 6.87-16.74z"/>
                              <path fill="#34A853" d="M24 47c6.21 0 11.41-2.06 15.22-5.59l-7.45-5.77c-2.06 1.38-4.71 2.2-7.77 2.2-5.98 0-11.05-4.04-12.86-9.48H3.64v5.97C7.45 42.06 15.17 47 24 47z"/>
                              <path fill="#FBBC05" d="M11.14 28.36c-.46-1.38-.72-2.85-.72-4.36s.26-2.98.72-4.36V13.67H3.64C2.11 16.79 1.25 20.29 1.25 24s.86 7.21 2.39 10.33l7.5-5.97z"/>
                              <path fill="#EA4335" d="M24 10.75c3.38 0 6.41 1.16 8.79 3.44l6.59-6.59C35.39 3.73 30.19 1.5 24 1.5c-8.83 0-16.55 4.94-20.36 12.17l7.5 5.97c1.81-5.44 6.88-9.48 12.86-9.48z"/>
                            </svg>
                            <span className="text-[10px] font-bold">GPay</span>
                          </div>

                          {/* Paytm */}
                          <div 
                            className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all h-20 ${selectedApp === 'paytm' ? 'border-primary bg-primary/10 shadow-sm' : 'border-muted bg-card hover:border-primary/30'}`}
                            onClick={() => setSelectedApp('paytm')}
                          >
                            <div className="bg-[#00BAF2] rounded-lg p-1.5 px-2">
                              <span className="text-white font-extrabold text-xs italic tracking-tighter">Paytm</span>
                            </div>
                            <span className="text-[10px] font-bold">Paytm</span>
                          </div>

                          {/* Other */}
                          <div 
                            className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all h-20 ${selectedApp === 'other' ? 'border-primary bg-primary/10 shadow-sm' : 'border-muted bg-card hover:border-primary/30'}`}
                            onClick={() => setSelectedApp('other')}
                          >
                            <Smartphone className="h-8 w-8 text-primary" />
                            <span className="text-[10px] font-bold">Others</span>
                          </div>
                        </div>

                        <div className="bg-muted/30 p-4 rounded-xl border flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                          <p className="text-[11px] text-muted-foreground">
                            You will be redirected to a secure Razorpay gateway to complete your payment via **{selectedApp?.toUpperCase()}**.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] mt-8" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Complete Purchase • ₹${checkoutTotal.toLocaleString('en-IN')}`
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <Card className="sticky top-24 border-none shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-muted">
                {checkoutItems.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted shadow-sm">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground mb-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
              <hr className="opacity-50" />
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{checkoutTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-extrabold pt-2 border-t mt-2">
                  <span>Total</span>
                  <span className="text-primary">₹{checkoutTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="rounded-xl bg-muted/40 p-4 space-y-3 mt-6 border border-muted-foreground/10">
                <div className="flex items-center gap-3 text-xs">
                  <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                    <Truck className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">Delivery: 3-5 business days</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">Secure transaction guaranteed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
