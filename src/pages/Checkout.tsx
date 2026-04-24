import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { CheckCircle2, Truck, ShieldCheck, Smartphone, Wallet, QrCode } from 'lucide-react';

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
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiId, setUpiId] = useState('');

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

  const MERCHANT_UPI_ID = "6369906810@ybl"; // Updated with your number
  const MERCHANT_NAME = "Abbas Threads";

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateUPI = (id: string) => {
    return /^[\w.-]+@[\w.-]+$/.test(id);
  };

  const generateUPILink = (method: string) => {
    const note = `Order from ${formData.fullName}`;
    const baseParams = `pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${checkoutTotal}&cu=INR&tn=${encodeURIComponent(note)}`;
    
    // Using standard UPI intent as it's the most reliable across all apps
    // but we can prepend specific schemes if the user selects a specific method
    switch(method) {
      case 'phonepe':
        return `phonepe://pay?${baseParams}`;
      case 'paytm':
        return `paytmmp://pay?${baseParams}`;
      case 'gpay':
        // GPay usually responds to upi:// on Android, but we can try specific for iOS/others
        return `upi://pay?${baseParams}`;
      default:
        return `upi://pay?${baseParams}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to place an order");
      navigate('/auth');
      return;
    }

    if (paymentMethod === 'upi' && !validateUPI(upiId)) {
      toast.error("Please enter a valid UPI ID (e.g., username@bank)");
      return;
    }

    // Handle Online Payments
    if (paymentMethod !== 'cod' && !showQR) {
      const upiLink = generateUPILink(paymentMethod);
      
      // On mobile, try to open the app directly
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = upiLink;
        
        // Show a confirmation step after a small delay
        setTimeout(() => {
          setShowQR(true);
          toast.info("Opening your payment app...");
        }, 1000);
        return;
      } else {
        // On desktop, show the QR code immediately
        setShowQR(true);
        return;
      }
    }

    setLoading(true);
    
    try {
      const orderData = {
        userId: user.id,
        items: checkoutItems,
        totalAmount: checkoutTotal,
        status: 'pending',
        address: formData,
        paymentMethod,
        paymentDetails: paymentMethod === 'upi' ? { upiId } : { provider: paymentMethod }
      };

      await api.post('/orders', orderData);
      clearCart();
      setOrderComplete(true);
      toast.success("Order placed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
      setPaymentProcessing(false);
      setShowQR(false);
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
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md px-4">
          <div className="w-full max-w-md flex flex-col items-center gap-6 p-8 bg-card rounded-2xl border shadow-2xl animate-in fade-in zoom-in duration-300 text-center">
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-2xl font-bold">
                {/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "Completing Payment..." : "Scan to Pay"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) 
                  ? "We've tried to open your UPI app. Please complete the payment there." 
                  : "Scan this QR code with any UPI app (PhonePe, GPay, Paytm) to pay"}
              </p>
            </div>

            {/* Only show QR Code on Desktop or if explicitly requested */}
            {!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
              <div className="relative p-4 bg-white rounded-xl shadow-inner border-4 border-primary/10">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateUPILink('upi'))}`} 
                  alt="UPI QR Code" 
                  className="w-48 h-48 sm:w-56 sm:h-56"
                />
              </div>
            )}

            <div className="w-full space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium">Total Amount to Pay:</p>
                <p className="text-3xl font-black text-primary italic">₹{checkoutTotal.toLocaleString('en-IN')}</p>
              </div>

              <div className="flex flex-col gap-2">
                {/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
                  <Button 
                    variant="outline"
                    onClick={() => { window.location.href = generateUPILink(paymentMethod); }}
                    className="w-full h-12 border-primary text-primary hover:bg-primary/5 mb-2"
                  >
                    Open {paymentMethod.toUpperCase()} Again
                  </Button>
                )}
                <Button 
                  onClick={(e) => {
                    const form = document.querySelector('form');
                    if (form) form.requestSubmit();
                  }}
                  className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? "Finalizing Order..." : "I've Completed the Payment"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowQR(false)}
                  disabled={loading}
                >
                  Cancel & Change Method
                </Button>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground italic px-4">
              {/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                ? "Once you finish payment in your app, return here and click the black button to place your order."
                : "Once you finish scanning and paying, click the black button to place your order."}
            </p>
          </div>
        </div>
      )}

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
                    <Wallet className="h-5 w-5 text-primary" />
                    Payment Method
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">Select your preferred payment option</p>
                    
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* COD */}
                      <div 
                        className={`group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted bg-card hover:border-primary/50 hover:bg-muted/50'}`}
                        onClick={() => setPaymentMethod('cod')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${paymentMethod === 'cod' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}`}>
                            <Truck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Cash on Delivery</p>
                            <p className="text-[11px] text-muted-foreground">Pay securely at your doorstep</p>
                          </div>
                        </div>
                      </div>

                      {/* Online Methods Label */}
                      <div className="sm:col-span-2 pt-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Online Payments (Instant & Secure)</p>
                      </div>

                      <div 
                        className={`group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${paymentMethod === 'phonepe' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted bg-card hover:border-primary/50 hover:bg-muted/50'}`}
                        onClick={() => {
                          setPaymentMethod('phonepe');
                          if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                            window.location.href = generateUPILink('phonepe');
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${paymentMethod === 'phonepe' ? 'bg-purple-600 text-white' : 'bg-muted text-muted-foreground group-hover:bg-purple-100 group-hover:text-purple-600'}`}>
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">PhonePe</p>
                            <p className="text-[11px] text-muted-foreground">Pay via PhonePe UPI/Wallet</p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${paymentMethod === 'gpay' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted bg-card hover:border-primary/50 hover:bg-muted/50'}`}
                        onClick={() => {
                          setPaymentMethod('gpay');
                          if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                            window.location.href = generateUPILink('gpay');
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${paymentMethod === 'gpay' ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                            <Wallet className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Google Pay</p>
                            <p className="text-[11px] text-muted-foreground">Fast & Secure via GPay</p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${paymentMethod === 'paytm' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted bg-card hover:border-primary/50 hover:bg-muted/50'}`}
                        onClick={() => {
                          setPaymentMethod('paytm');
                          if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                            window.location.href = generateUPILink('paytm');
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${paymentMethod === 'paytm' ? 'bg-cyan-600 text-white' : 'bg-muted text-muted-foreground group-hover:bg-cyan-100 group-hover:text-cyan-600'}`}>
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Paytm</p>
                            <p className="text-[11px] text-muted-foreground">Paytm Wallet or UPI</p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${paymentMethod === 'upi' ? 'border-primary bg-primary/5 shadow-md' : 'border-muted bg-card hover:border-primary/50 hover:bg-muted/50'}`}
                        onClick={() => setPaymentMethod('upi')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${paymentMethod === 'upi' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'}`}>
                            <QrCode className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Other UPI ID</p>
                            <p className="text-[11px] text-muted-foreground">Any UPI App (e.g. @bhumi)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {paymentMethod === 'upi' && (
                      <div className="mt-4 space-y-3 p-4 rounded-xl bg-muted/30 border animate-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Enter your UPI ID</label>
                            <Input 
                              placeholder="username@bank" 
                              value={upiId} 
                              onChange={(e) => setUpiId(e.target.value)}
                              className="bg-background h-11"
                              required={paymentMethod === 'upi'}
                            />
                            <p className="text-[10px] text-muted-foreground text-balance">A payment request will be sent to your UPI app</p>
                          </div>
                          <div className="hidden sm:flex flex-col items-center gap-1 p-2 bg-white rounded-lg border shadow-sm">
                            <div className="h-20 w-20 bg-muted flex items-center justify-center rounded">
                              <QrCode className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                            <span className="text-[8px] font-bold text-black">SCAN TO PAY</span>
                          </div>
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
