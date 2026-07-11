import React, { useEffect, useState } from 'react';
import { ReturnRequest } from '../types';
import { ClipboardList, FileCheck, Truck, RefreshCcw, Banknote, Check } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

interface ReturnTrackerProps {
  returnRequest: ReturnRequest;
}

export const ReturnTracker: React.FC<ReturnTrackerProps> = ({ returnRequest }) => {
  const steps = [
    { status: 'pending_review', label: 'Under Review', icon: ClipboardList },
    { status: 'approved', label: 'Approved', icon: FileCheck },
    { status: 'return_received', label: 'Item Received', icon: Truck },
    { status: 'refund_processing', label: 'Processing Refund', icon: RefreshCcw },
    { status: 'refunded', label: 'Refunded', icon: Banknote },
  ];

  let currentStepIndex = steps.findIndex(step => step.status === returnRequest.status);
  const isRejected = returnRequest.status === 'rejected';

  if (currentStepIndex === -1 && !isRejected) {
    currentStepIndex = 0;
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    const step = steps.find(s => s.status === status);
    return step ? step.label : status.replace('_', ' ');
  };

  const getMediaUrl = (url: string | undefined | null) => {
    if (!url) return '';
    let cleanUrl = url.replace(/\\/g, '/');
    if (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:')) return cleanUrl;
    
    let base = '';
    try {
      const parsed = new URL(API_BASE_URL || 'http://localhost:5000/api');
      base = parsed.origin;
    } catch(e) {
      base = 'http://localhost:5000';
    }
    return `${base}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`;
  };

  return (
    <div className="space-y-10 py-4 px-2">
      <div className="relative pt-4 pb-2 px-1">
        <div className="w-full relative">
          <div className="absolute top-5 left-[10%] right-[10%] h-[2px] -translate-y-1/2 bg-gray-200" />
          
          <div className="absolute top-5 left-[10%] right-[10%] h-[2px] -translate-y-1/2 overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-1000 ease-in-out" 
              style={{ width: mounted && !isRejected ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' }}
            />
          </div>
          
          <div className="relative flex justify-between mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isPast = !isRejected && (index < currentStepIndex || (index === steps.length - 1 && index === currentStepIndex));
              const isCurrent = !isRejected && index === currentStepIndex && !isPast;
              
              return (
                <div key={step.status} className="flex flex-col items-center gap-3 relative z-10 flex-1">
                  <div className="relative flex justify-center items-center">
                    {isCurrent && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl scale-[2.5] animate-pulse pointer-events-none" />
                      </>
                    )}
                    <div 
                      className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                        mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
                      } ${
                        isPast 
                          ? 'bg-green-600 text-white shadow-sm' 
                          : isCurrent
                            ? 'bg-white border-[3px] border-green-600 text-green-600 shadow-md scale-110'
                            : 'bg-white border-2 border-gray-200 text-gray-300'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      {isPast ? (
                        <Check className="h-5 w-5" strokeWidth={3} />
                      ) : (
                        <Icon className="h-5 w-5" strokeWidth={isCurrent ? 2.5 : 2} />
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold tracking-wider uppercase text-center transition-all duration-500 max-w-[70px] leading-tight mt-1 ${
                    mounted ? 'opacity-100' : 'opacity-0'
                  } ${
                    isPast ? 'text-green-800' : isCurrent ? 'text-green-700' : 'text-gray-400'
                  }`}
                  style={{ transitionDelay: `${index * 100 + 100}ms` }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Return Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Order ID</p>
              <p className="font-bold text-gray-900 text-base">#ORD-{returnRequest.order_id.toString().padStart(6, '0')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Requested On</p>
              <p className="font-semibold text-gray-900">{formatDate(returnRequest.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Reason</p>
              <p className="font-semibold text-gray-900">{returnRequest.reason}</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Product Information</h3>
          <div className="flex gap-4">
            <img 
              src={getMediaUrl(returnRequest.product_image)} 
              alt={returnRequest.product_name || "Product"} 
              className="w-20 h-20 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
            />
            <div className="flex flex-col">
              <p className="font-bold text-gray-900 line-clamp-2">{returnRequest.product_name || 'Item Returned'}</p>
              {returnRequest.product_price && (
                <p className="font-bold text-gray-900 mt-1">₹{Number(returnRequest.product_price).toFixed(2)}</p>
              )}
              <div className="mt-auto pt-2">
                <span className="inline-flex bg-gray-100 border border-gray-200 text-gray-800 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  Status: {getStatusLabel(returnRequest.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
