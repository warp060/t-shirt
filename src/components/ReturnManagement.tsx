import React, { useState, useEffect } from 'react';
import { api, API_BASE_URL } from '../lib/api';
import { ReturnRequest } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { Eye, ArrowRight, Check, X, FileText, Camera, Video, AlertTriangle, CheckCircle2 } from 'lucide-react';

const RETURN_STATUSES = [
  'pending_review',
  'approved',
  'rejected',
  'return_received',
  'refund_processing',
  'refunded'
];

export const ReturnManagement = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const getMediaUrl = (url: string | undefined | null) => {
    if (!url) return '';
    let cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:')) return cleanUrl;
    
    let base = '';
    try {
      const parsed = new URL(API_BASE_URL || 'http://localhost:5000/api');
      base = parsed.origin;
    } catch (e) {
      base = (API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    }
    
    cleanUrl = cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl;
    return base + cleanUrl;
  };

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/returns');
      setReturns(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleStatusUpdate = async (id: number, newStatus: string, reason?: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/admin/returns/${id}`, { status: newStatus, rejection_reason: reason });
      toast.success(`Return status updated to ${newStatus.replace('_', ' ')}`);
      setReturns(returns.map(r => r.id === id ? { ...r, status: newStatus as any, rejection_reason: reason } : r));
      if (showRejectModal) setShowRejectModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update return status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading returns...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Return & Refund Requests</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {returns.map(ret => (
          <Card key={ret.id} className="overflow-hidden hover:shadow-lg transition-shadow border-none shadow-md bg-card/60 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 border-b pb-4 pt-5 px-5">
              <div className="flex justify-between items-start">
                <div>
                   <CardTitle className="text-lg font-bold flex items-center gap-2">
                     #ORD-{ret.order_id.toString().padStart(6, '0')}
                   </CardTitle>
                   <p className="text-xs text-muted-foreground mt-1">
                     {new Date(ret.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                   </p>
                </div>
                <Badge variant={ret.status === 'refunded' ? 'default' : ret.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">
                  {ret.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  <img src={getMediaUrl(ret.product_image)} alt={ret.product_name} className="w-full h-full object-cover" />
                </div>
                <div>
                   <p className="font-semibold text-sm line-clamp-2">{ret.product_name}</p>
                   <p className="text-xs text-muted-foreground mt-1">{ret.user_name} ({ret.user_email})</p>
                   <p className="font-bold text-sm text-primary mt-1">₹{ret.product_price}</p>
                </div>
              </div>
              
              <div className="mb-4 text-sm bg-muted/20 p-3 rounded-lg border border-border/50">
                <p className="font-semibold text-xs text-muted-foreground mb-1">Reason</p>
                <p>{ret.reason}</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setSelectedReturn(ret)}>
                  <Eye className="w-4 h-4" /> View Evidence & Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {returns.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground">
            No return requests found.
          </div>
        )}
      </div>

      <Dialog open={!!selectedReturn} onOpenChange={(open) => !open && setSelectedReturn(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Return Details - Order #ORD-{selectedReturn?.order_id.toString().padStart(6, '0')}</DialogTitle>
          </DialogHeader>
          
          {selectedReturn && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="space-y-6">
                 {/* Product Info */}
                 <div className="flex gap-4 bg-muted/20 p-4 rounded-xl">
                   <img src={getMediaUrl(selectedReturn.product_image)} alt="product" className="w-20 h-20 rounded object-cover" />
                   <div>
                     <h3 className="font-bold">{selectedReturn.product_name}</h3>
                     <p className="text-sm text-muted-foreground">User: {selectedReturn.user_name}</p>
                     <p className="text-sm font-semibold mt-1">₹{selectedReturn.product_price}</p>
                   </div>
                 </div>

                 {/* Reason */}
                 <div>
                   <h4 className="font-semibold mb-2">Customer Reason</h4>
                   <div className="bg-muted p-4 rounded-xl text-sm">
                     <p className="font-bold mb-1">{selectedReturn.reason}</p>
                     <p className="text-muted-foreground">{selectedReturn.description || "No additional comments."}</p>
                   </div>
                 </div>

                 {/* Current Status & Actions */}
                 <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl">
                   <h4 className="font-semibold mb-3 flex items-center gap-2">Update Status</h4>
                   
                   <div className="flex flex-col gap-2 mb-4">
                     {RETURN_STATUSES.map(status => (
                        <Button 
                          key={status} 
                          variant={selectedReturn.status === status ? 'default' : 'outline'}
                          size="sm"
                          className="capitalize text-xs justify-start h-auto py-2 whitespace-normal text-left"
                          onClick={() => {
                             if(status === 'rejected') {
                               setShowRejectModal(true);
                             } else {
                               handleStatusUpdate(selectedReturn.id, status);
                             }
                          }}
                          disabled={updatingId === selectedReturn.id}
                        >
                          {selectedReturn.status === status && <Check className="w-3 h-3 mr-2" />}
                          {status.replace('_', ' ')}
                        </Button>
                     ))}
                   </div>
                   
                   {selectedReturn.status === 'refunded' && (
                     <p className="text-sm text-green-600 font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Refund completed.</p>
                   )}
                 </div>
              </div>

              {/* Evidence */}
              <div className="space-y-6">
                 <h4 className="font-semibold text-lg border-b pb-2">Provided Evidence</h4>
                 
                 {/* Photos */}
                 <div>
                   <p className="text-sm font-medium mb-3 flex items-center gap-2"><Camera className="w-4 h-4"/> Photos ({selectedReturn.images?.length || 0})</p>
                   <div className="grid grid-cols-3 gap-2">
                     {selectedReturn.images?.map((img, i) => (
                       <a key={i} href={getMediaUrl(img)} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors">
                         <img src={getMediaUrl(img)} alt="Evidence" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                       </a>
                     ))}
                   </div>
                 </div>

                 {/* Invoice */}
                 <div>
                   <p className="text-sm font-medium mb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> Invoice</p>
                   <a href={getMediaUrl(selectedReturn.invoice_image)} target="_blank" rel="noreferrer" className="block aspect-[16/9] bg-muted rounded-lg overflow-hidden border hover:border-primary transition-colors">
                     <img src={getMediaUrl(selectedReturn.invoice_image)} alt="Invoice" className="w-full h-full object-contain hover:scale-105 transition-transform" />
                   </a>
                 </div>

                 {/* Video */}
                 {selectedReturn.video && (
                   <div>
                     <p className="text-sm font-medium mb-3 flex items-center gap-2"><Video className="w-4 h-4"/> Video</p>
                     <video src={getMediaUrl(selectedReturn.video)} controls className="w-full rounded-lg border bg-black"></video>
                   </div>
                 )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
               <AlertTriangle className="w-5 h-5" /> Reject Return Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Reason for Rejection</label>
               <textarea
                 rows={3}
                 className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/20"
                 placeholder="e.g. Tags are missing, product is washed..."
                 value={rejectionReason}
                 onChange={(e) => setRejectionReason(e.target.value)}
               />
             </div>
             <div className="flex justify-end gap-3">
               <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
               <Button variant="destructive" disabled={!rejectionReason.trim()} onClick={() => {
                  if (selectedReturn) {
                     handleStatusUpdate(selectedReturn.id, 'rejected', rejectionReason);
                  }
               }}>
                 Confirm Rejection
               </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
