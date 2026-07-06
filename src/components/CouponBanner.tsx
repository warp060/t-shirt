import React from 'react';
import { motion } from 'motion/react';
import { Ticket, Zap } from 'lucide-react';

interface CouponBannerProps {
  title?: string;
  offerText: string;
}

export const CouponBanner = ({ title = "Exclusive Offer For You!", offerText }: CouponBannerProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-sm mx-auto my-6 filter drop-shadow-xl"
    >
      {/* The main coupon body */}
      <div className="relative flex items-center bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl overflow-hidden p-1">
        
        {/* Left cutout */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full z-10"></div>
        
        {/* Right cutout */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full z-10"></div>

        {/* Inner dashed border area */}
        <div className="flex w-full bg-white rounded-lg border-2 border-dashed border-indigo-200 overflow-hidden relative">
          
          {/* Left section (Text) */}
          <div className="flex-1 p-4 flex flex-col justify-center border-r-2 border-dashed border-indigo-200">
            <div className="flex items-center gap-1.5 mb-1 text-indigo-600 font-black tracking-wide uppercase text-[10px]">
              <Zap className="w-3 h-3 fill-indigo-600" />
              {title}
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
              {offerText.split(':').pop() || offerText}
            </h3>
            <div className="mt-2 text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Auto-applied at checkout
            </div>
          </div>

          {/* Right section (Badge/Action) */}
          <div className="w-24 sm:w-28 bg-indigo-50 flex flex-col items-center justify-center p-3 text-center">
            <Ticket className="w-6 h-6 text-indigo-600 mb-1" />
            <span className="text-xs font-bold text-indigo-700">CLAIM</span>
            <span className="text-[10px] text-indigo-500 font-medium uppercase">Now</span>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
