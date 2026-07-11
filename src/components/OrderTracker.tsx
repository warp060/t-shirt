import React from 'react';
import { Order } from '../types';
import { Package, Truck, CheckCircle2, Clock, MapPin, Check } from 'lucide-react';
import { Badge } from './ui/badge';

interface OrderTrackerProps {
  order: Order;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ order }) => {
  const steps = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(step => step.status === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="space-y-8 py-4">
      {/* Visual Timeline */}
      <div className="relative">
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 -translate-y-1/2 rounded-full bg-muted" />
          <div className="absolute top-5 left-[12.5%] right-[12.5%] h-1 -translate-y-1/2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-1000" 
              style={{ width: isCancelled ? '0%' : `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
        
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isPast = !isCancelled && (index < currentStepIndex || (index === steps.length - 1 && index === currentStepIndex));
            const isCurrent = !isCancelled && index === currentStepIndex && !isPast;
            
            return (
              <div key={step.status} className="flex flex-col items-center gap-2 flex-1 z-10">
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
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-tight text-center leading-tight ${
                  isPast ? 'text-green-700' : isCurrent ? 'text-orange-600' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isCancelled && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center animate-in fade-in slide-in-from-top-2">
          <p className="text-destructive font-bold">Order Cancelled</p>
          <p className="text-xs text-destructive/80 mt-1">This order was cancelled and the items have been returned to stock.</p>
        </div>
      )}

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Delivery Address</p>
              <p className="text-sm font-semibold mt-1">{order.address.fullName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {order.address.street}, {order.address.city}, {order.address.state} - {order.address.zipCode}
              </p>
              <p className="text-xs text-muted-foreground">Phone: {order.address.phone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Tracking Details</p>
              <p className="text-sm font-semibold mt-1">
                {order.status === 'delivered' ? 'Delivered on' : 'Estimated Delivery'}:
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(new Date(order.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
              <Badge variant="outline" className="mt-2 capitalize">Status: {order.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Items Summary */}
      <div className="border rounded-xl p-4 bg-muted/30">
        <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest mb-4">Package Contents</p>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="h-10 w-10 bg-background rounded border overflow-hidden">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-xs font-bold">₹{item.price.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
