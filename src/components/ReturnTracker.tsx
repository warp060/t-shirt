import React, { useEffect, useState } from 'react';
import { ReturnRequest } from '../types';
import { ClipboardList, CheckCircle2, Truck, RefreshCcw, DollarSign, Check } from 'lucide-react';

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

  return (
    <div className="space-y-8 py-4 px-2">
      <div className="relative pt-4 pb-2 px-1">
        <div className="w-full relative">
          <div className="absolute top-5 left-[10%] right-[10%] h-[3px] -translate-y-1/2 bg-gray-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] rounded-full" />
          
          <div className="absolute top-5 left-[10%] right-[10%] h-[3px] -translate-y-1/2 overflow-visible rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out rounded-full" 
              style={{ width: mounted && !isRejected ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' }}
            />
          </div>
          
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isPast = !isRejected && (index < currentStepIndex || (index === steps.length - 1 && index === currentStepIndex));
              const isCurrent = !isRejected && index === currentStepIndex && !isPast;
              
              return (
                <div key={step.status} className="flex flex-col items-center gap-3 relative z-10 flex-1">
                  <div className="relative flex justify-center items-center">
                    {isCurrent && (
                      <>
                        {/* Ultra-premium soft glowing aura */}
                        <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-[8px] scale-[1.5] animate-pulse" />
                        <div className="absolute inset-0 rounded-full border border-orange-300 animate-ping opacity-20 scale-[1.2]" />
                      </>
                    )}
                    <div 
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                        mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
                      } ${
                        isPast 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-400 border border-emerald-300 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]' 
                          : isCurrent
                            ? 'bg-white border-[2.5px] border-orange-500 text-orange-600 shadow-[0_4px_14px_rgba(249,115,22,0.25)]'
                            : 'bg-gray-50 border border-gray-200 text-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      {isPast ? (
                        <Check className="h-5 w-5 drop-shadow-sm" strokeWidth={2.5} />
                      ) : (
                        <Icon className="h-5 w-5" strokeWidth={isCurrent ? 2.5 : 2} />
                      )}
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold tracking-wide text-center transition-all duration-500 ${
                    mounted ? 'opacity-100' : 'opacity-0'
                  } ${
                    isPast ? 'text-emerald-700' : isCurrent ? 'text-orange-600' : 'text-gray-400'
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
    </div>
  );
};
