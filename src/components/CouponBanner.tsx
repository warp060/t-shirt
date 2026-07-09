import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Ticket } from 'lucide-react';

interface CouponBannerProps {
  title?: string;
  offerText: string;
}

export const CouponBanner = ({ title = "SPECIAL OFFER", offerText = "50% OFF ALL T-SHIRTS! , ENDS SOON ..." }: CouponBannerProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Parse the offer text to extract the main offer if it has a colon like "Summer Sale: 50% OFF"
  const displayText = offerText.includes(':') ? offerText.split(':')[1].trim() : offerText;

  return (
    <div className="relative w-full max-w-[420px] mx-auto my-10 perspective-1000 group">
      <motion.div
        className="w-full relative preserve-3d cursor-pointer shadow-2xl rounded-xl"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 20 }}
        onHoverStart={() => setIsFlipped(true)}
        onHoverEnd={() => setIsFlipped(false)}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ minHeight: '130px' }}
      >
        {/* Front of card (Metallic Cover) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden bg-gradient-to-br from-zinc-400 via-zinc-500 to-zinc-600 border border-white/30 flex flex-col items-center justify-center p-5">
          
          {/* Shimmer sweeping effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer skew-x-12 z-0"></div>
          
          {/* Lightning Icon */}
          <Zap className="absolute top-3 right-3 w-6 h-6 text-zinc-800 fill-zinc-800/80 z-10" />
          
          <h3 className="text-[15px] font-black text-white tracking-[0.25em] uppercase z-10 drop-shadow-md">
            {title}
          </h3>
          
          <h2 className="text-[19px] sm:text-[22px] font-black text-zinc-900 my-1 z-10 text-center tracking-tight leading-tight">
            {displayText}
          </h2>
          
          <p className="text-[11px] font-bold text-white/90 tracking-[0.2em] uppercase mt-2 z-10 animate-pulse opacity-90">
            TAP OR HOVER TO REVEAL
          </p>
        </div>

        {/* Back of card (Revealed Coupon) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 border border-white/30 flex flex-col items-center justify-center p-4 shadow-inner">
          
          {/* Background glowing rings */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -ml-10 -mb-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="flex items-center gap-2 mb-1 z-10">
            <Ticket className="w-5 h-5 text-white" />
            <h3 className="text-[12px] font-black text-white/90 tracking-widest uppercase">
              SECRET CODE UNLOCKED
            </h3>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md px-8 py-2 rounded-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-10 my-1.5">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-widest drop-shadow-lg">
              SAVE50
            </h2>
          </div>
          
          <p className="text-[11px] font-bold text-white/80 uppercase mt-1 z-10 tracking-widest">
            Auto-applied at checkout!
          </p>
        </div>
      </motion.div>
    </div>
  );
};
