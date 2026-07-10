import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api, API_BASE_URL } from '../lib/api';
import { Order, Product } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Upload, X, CheckCircle2, AlertCircle, FileText, Camera, Video } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const RETURN_REASONS = [
  "Wrong Size",
  "Wrong Product Received",
  "Damaged Product",
  "Defective Product",
  "Missing Item",
  "Quality Issue",
  "Color Different From Ordered",
  "Received Different Design",
  "Other"
];

export const ReturnRequestForm = () => {
  const { orderId, productId } = useParams<{ orderId: string, productId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [productItem, setProductItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [invoice, setInvoice] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const fetchOrderAndProduct = async () => {
      try {
        const orders: Order[] = await api.get(`/orders/${user?.id}`);
        const foundOrder = orders.find(o => o.id === Number(orderId));
        if (foundOrder) {
          setOrder(foundOrder);
          const item = foundOrder.items.find(i => i.productId === Number(productId));
          if (item) setProductItem(item);
          else toast.error("Product not found in this order.");
        } else {
          toast.error("Order not found.");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Could not load order details.");
      } finally {
        setLoading(false);
      }
    };
    if (user && orderId && productId) {
      fetchOrderAndProduct();
    }
  }, [user, orderId, productId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'video' | 'invoice') => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    if (type === 'photos') {
      const newPhotos = [...photos, ...files];
      if (newPhotos.length > 10) {
        toast.error("Maximum 10 photos allowed.");
        setPhotos(newPhotos.slice(0, 10));
      } else {
        setPhotos(newPhotos);
      }
    } else if (type === 'video') {
      const v = files[0];
      if (v.size > 30 * 1024 * 1024) { // Roughly checking size for 30s video, but this is arbitrary limit (30MB)
        toast.error("Video file is too large.");
        return;
      }
      setVideo(v);
    } else if (type === 'invoice') {
      setInvoice(files[0]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) return toast.error("Please select a return reason.");
    if (reason === "Other" && !otherReason) return toast.error("Please specify the reason.");
    if (photos.length < 3) return toast.error("At least 3 clear photos are required.");
    if (!invoice) return toast.error("Original invoice photo is mandatory.");
    if (!agreed) return toast.error("You must agree to the return conditions.");

    const finalReason = reason === "Other" ? otherReason : reason;

    const formData = new FormData();
    formData.append('orderId', orderId!);
    formData.append('productId', productId!);
    formData.append('reason', finalReason);
    formData.append('description', description);
    
    photos.forEach(photo => formData.append('photos', photo));
    if (video) formData.append('video', video);
    formData.append('invoice', invoice);

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/returns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit return request.');
      }
      
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center">Loading...</div>;
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold">Return Request Submitted</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Your return request for Order #ORD-{order?.id.toString().padStart(6, '0')} has been submitted. Our team will review it and get back to you shortly.
          </p>
          <Button onClick={() => navigate('/orders')} variant="outline" className="mt-4">
            Back to Orders
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Request Return</h1>
        <p className="text-muted-foreground">Please provide details about the item you wish to return.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Return Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Reason Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Why are you returning this?</label>
                  <select 
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select a reason...</option>
                    {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {reason === "Other" && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-semibold">Please specify</label>
                    <input 
                      type="text"
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-semibold">Additional Comments (Optional)</label>
                  <textarea 
                    className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows={3}
                    placeholder="Describe the issue in more detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Evidence Uploads */}
                <div className="space-y-5 pt-4 border-t">
                  <h3 className="font-semibold text-lg">Required Evidence</h3>
                  <p className="text-xs text-muted-foreground">To process your return quickly, we need some visual proof.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Photos */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2"><Camera className="h-4 w-4"/> Product Photos (Min 3)*</label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Click to upload photos</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'photos')} />
                      </label>
                      {photos.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {photos.map((p, i) => (
                            <div key={i} className="relative w-12 h-12 rounded bg-muted overflow-hidden border">
                              <img src={URL.createObjectURL(p)} alt="preview" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {photos.length < 3 && photos.length > 0 && <p className="text-xs text-red-500">Need {3 - photos.length} more photo(s)</p>}
                    </div>

                    {/* Invoice */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4"/> Invoice Photo*</label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">{invoice ? invoice.name : 'Upload original invoice'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'invoice')} />
                      </label>
                    </div>

                    {/* Video */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-semibold flex items-center gap-2"><Video className="h-4 w-4"/> Short Video (Optional, max 30s)</label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">{video ? video.name : 'Upload a short video demonstrating the issue'}</span>
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, 'video')} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="bg-muted/40 p-4 rounded-xl border border-muted">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-primary"/> Return Conditions</h4>
                    <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                      <li>Product must be unused, unwashed, and in its original condition.</li>
                      <li>All original tags must still be attached.</li>
                      <li>The original invoice/receipt must be placed inside the return package.</li>
                      <li>Products without the original invoice/receipt will not be accepted.</li>
                      <li>Damaged products caused by customer misuse are not eligible.</li>
                    </ul>
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <span className="text-sm text-foreground/90 leading-tight">
                      I confirm that the product is unused, all original tags are attached, and the original invoice is included. I agree to the return conditions.
                    </span>
                  </label>
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={submitting || photos.length < 3 || !invoice || !agreed}>
                  {submitting ? "Submitting Request..." : "Submit Return Request"}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Product Info */}
        <div className="md:col-span-1">
          <Card className="sticky top-24 border-none shadow-xl bg-card/50 backdrop-blur overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-lg">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {productItem && (
                <div className="p-6 space-y-4">
                  <div className="aspect-square rounded-xl bg-muted overflow-hidden border">
                    <img src={productItem.image} alt={productItem.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{productItem.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">Quantity: {productItem.quantity}</span>
                      <span className="font-bold">₹{productItem.price}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t text-sm">
                    <p className="text-muted-foreground mb-1">Order Number</p>
                    <p className="font-mono font-medium">#ORD-{orderId?.padStart(6, '0')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
