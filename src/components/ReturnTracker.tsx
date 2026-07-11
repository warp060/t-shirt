import React from 'react';
import { ReturnRequest } from '../types';
import { ClipboardList, CheckCircle2, Truck, RefreshCcw, DollarSign, XCircle, Check } from 'lucide-react';
import { Badge } from './ui/badge';

interface ReturnTrackerProps {
  returnRequest: ReturnRequest;
}

export const ReturnTracker: React.FC<ReturnTrackerProps> = ({ returnRequest }) => {
  const steps = [
    { status: 'pending_review', label: 'Under Review', icon: ClipboardList },
    { status: 'approved', label: 'Approved', icon: CheckCircle2 },
    { status: 'return_received', label: 'Item Received', icon: Truck },
    { status: 'refund_processing', label: 'Processing Refund', icon: RefreshCcw },
    { status: 'refunded', label: 'Refunded', icon: DollarSign },
  ];

  // Map the current status to a step index
  let currentStepIndex = steps.findIndex(step => step.status === returnRequest.status);
  const isRejected = returnRequest.status === 'rejected';

  // If the current status is not found but it's not rejected, it might be an older status or edge case.
  if (currentStepIndex === -1 && !isRejected) {
    currentStepIndex = 0; // default to first step
  }

  return (
    <div className="space-y-8 py-4">
      {/* Visual Timeline */}
      <div className="relative pt-4 pb-2 px-1">
        <div className="w-full relative">
          <div className="absolute top-5 left-[10%] right-[10%] h-1 -translate-y-1/2 rounded-full bg-muted" />
          <div className="absolute top-5 left-[10%] right-[10%] h-1 -translate-y-1/2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-1000" 
              style={{ width: isRejected ? '0%' : `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isPast = !isRejected && (index < currentStepIndex || (index === steps.length - 1 && index === currentStepIndex));
              const isCurrent = !isRejected && index === currentStepIndex && !isPast;
              
              return (
                <div key={step.status} className="flex flex-col items-center gap-2 relative z-10 flex-1">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isPast 
                        ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/30' 
                        : isCurrent
                          ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-md shadow-orange-500/30 ring-4 ring-orange-500/20 scale-110'
                          : 'bg-background border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    {isPast ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-tight text-center leading-tight ${
                    isPast ? 'text-green-700' : isCurrent ? 'text-orange-600' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isRejected && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center animate-in fade-in slide-in-from-top-2 mt-6">
          <div className="flex justify-center mb-2">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive font-bold text-lg">Return Rejected</p>
          <p className="text-sm text-destructive/80 mt-1 font-medium">{returnRequest.rejection_reason || "Your return request did not meet our policy guidelines."}</p>
        </div>
      )}

      {/* Return Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-4">
          <div className="border rounded-xl p-4 bg-muted/30">
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-3">Return Details</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="text-sm font-semibold">#ORD-{returnRequest.order_id.toString().padStart(6, '0')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Requested On</p>
                <p className="text-sm font-semibold">{new Date(returnRequest.created_at).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm font-semibold">{returnRequest.reason}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded-xl p-4 bg-muted/30 h-full">
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-3">Product Information</p>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-background rounded-lg border overflow-hidden flex-shrink-0">
                <img src={returnRequest.product_image} alt={returnRequest.product_name} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold line-clamp-2">{returnRequest.product_name}</p>
                <p className="text-sm text-primary font-bold mt-1">₹{returnRequest.product_price}</p>
                <Badge variant="outline" className="mt-2 capitalize shadow-sm">Status: {returnRequest.status.replace('_', ' ')}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
