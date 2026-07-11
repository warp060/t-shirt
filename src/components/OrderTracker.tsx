import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { Package, Truck, MapPin, Clock, Check } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
  const extraItemsCount = order.items ? order.items.length - 1 : 0;

  return (
    <div className="space-y-10 py-4 px-2">
      <div className="relative pt-4 pb-2 px-1">
        <div className="w-full relative">
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[2px] -translate-y-1/2 bg-gray-200" />
          
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[2px] -translate-y-1/2 overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-1000 ease-in-out" 
              style={{ width: mounted && !isCancelled ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' }}
            />
          </div>
        
          <div className="relative flex justify-between mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isPast = !isCancelled && (index < currentStepIndex || (index === steps.length - 1 && index === currentStepIndex));
              const isCurrent = !isCancelled && index === currentStepIndex && !isPast;
              
              return (
                <div key={step.status} className="flex flex-col items-center gap-3 flex-1 z-10 relative">
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

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600 font-bold">Order Cancelled</p>
          <p className="text-sm text-red-500/80 mt-1">This order was cancelled and the items have been returned to stock.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Order Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Order ID</p>
              <p className="font-bold text-gray-900 text-base">#ORD-{order.id.toString().padStart(6, '0')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Placed On</p>
              <p className="font-semibold text-gray-900">{formatDate(order.created_at)}</p>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment</p>
                <p className="font-semibold text-gray-900">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="font-bold text-gray-900 text-base">₹{Number(order.total_amount).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">Product Information</h3>
          {firstItem ? (
            <div className="flex gap-4">
              <img 
                src={getMediaUrl(firstItem.image)} 
                alt={firstItem.name} 
                className="w-20 h-20 rounded-lg object-cover bg-gray-100 border border-gray-100 shrink-0"
              />
              <div className="flex flex-col">
                <p className="font-bold text-gray-900 line-clamp-2">{firstItem.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">Size: {firstItem.size || 'Standard'} • Qty: {firstItem.quantity}</p>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="font-bold text-gray-900">₹{Number(firstItem.price).toFixed(2)}</span>
                  {extraItemsCount > 0 && (
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      +{extraItemsCount} more item{extraItemsCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500 font-medium">No product info available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
