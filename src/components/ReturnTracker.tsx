import React, { useEffect, useState } from 'react';
import { ReturnRequest } from '../types';
import { ClipboardList, FileCheck, Truck, RefreshCcw, Banknote, Check } from 'lucide-react';

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

  return (
    <div className="space-y-8 py-4 px-2">
      <div className="relative pt-4 pb-2 px-1">
        <div className="w-full relative">
          <div className="absolute top-5 left-[10%] right-[10%] h-[2px] -translate-y-1/2 bg-gray-200" />
          
          <div className="absolute top-5 left-[10%] right-[10%] h-[2px] -translate-y-1/2 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-in-out" 
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
                        {/* Active step pulsing animation in matching green */}
                        <div className="absolute inset-0 rounded-full bg-emerald-400/30 blur-[6px] scale-[1.5] animate-pulse" />
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30 scale-[1.2]" />
                      </>
                    )}
                    <div 
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                        mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
                      } ${
                        isPast 
                          ? 'bg-emerald-500 text-white shadow-md' 
                          : isCurrent
                            ? 'bg-white border-[2.5px] border-emerald-500 text-emerald-600 shadow-lg scale-110'
                            : 'bg-white border-2 border-gray-200 text-gray-300'
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      {isPast ? (
                        <Check className="h-5 w-5" strokeWidth={2.5} />
                      ) : (
                        <Icon className="h-4 w-4" strokeWidth={isCurrent ? 2.5 : 2} />
                      )}
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold tracking-wider uppercase text-center transition-all duration-500 ${
                    mounted ? 'opacity-100' : 'opacity-0'
                  } ${
                    isPast ? 'text-emerald-700' : isCurrent ? 'text-emerald-600' : 'text-gray-400'
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
