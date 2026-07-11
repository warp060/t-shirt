import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { Package, Truck, MapPin, Clock, Check } from 'lucide-react';

interface OrderTrackerProps {
  order: Order;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order }) => {
  const steps = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: MapPin },
  ];

  const currentStepIndex = steps.findIndex(step => step.status === order.status);
  const isCancelled = order.status === 'cancelled';

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 py-4 px-2">
      <div className="relative">
        <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[2px] -translate-y-1/2 bg-gray-200" />
        
        <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[2px] -translate-y-1/2 overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000 ease-in-out" 
            style={{ width: mounted && !isCancelled ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' }}
          />
        </div>
      
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isPast = !isCancelled && (index < currentStepIndex || (index === steps.length - 1 && index === currentStepIndex));
            const isCurrent = !isCancelled && index === currentStepIndex && !isPast;
            
            return (
              <div key={step.status} className="flex flex-col items-center gap-3 flex-1 z-10">
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

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600 font-bold">Order Cancelled</p>
          <p className="text-sm text-red-500/80 mt-1">This order was cancelled and the items have been returned to stock.</p>
        </div>
      )}
    </div>
  );
};
