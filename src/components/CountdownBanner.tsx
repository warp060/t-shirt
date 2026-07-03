import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CountdownBannerProps {
  text: string;
  endDate: string; // ISO string e.g. "2026-07-11T23:59:00"
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownBanner = ({ text, endDate }: CountdownBannerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const targetDate = new Date(endDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsActive(false);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsActive(true);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer(); // Initial call
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!isActive) return null;

  return (
    <div className="w-full relative overflow-hidden bg-black text-white border-b border-white/10">
      {/* Subtle sweeping light effect for luxury feel */}
      <motion.div 
        animate={{ x: ['-200%', '200%'] }} 
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="absolute inset-0 z-0 w-1/2 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-12"
      />

      <div className="container relative z-10 mx-auto px-2 py-1.5 sm:py-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-8 lg:gap-12">
          
          <div className="flex items-center justify-center w-full px-2 overflow-hidden">
            <motion.p 
              key={text}
              variants={{
                hidden: { opacity: 1 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.04 }
                }
              }}
              initial="hidden"
              animate="visible"
              className="text-[9px] sm:text-xs font-semibold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-zinc-300 text-center leading-tight sm:leading-normal max-w-full truncate sm:overflow-visible sm:whitespace-normal"
            >
              {text.split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { opacity: 0, filter: 'blur(2px)' },
                    visible: { opacity: 1, filter: 'blur(0px)' }
                  }}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-zinc-500 hidden sm:block" />
            <div className="flex items-center gap-1 sm:gap-2 font-mono font-medium">
              <TimeUnit value={timeLeft.days} label="D" />
              <span className="text-zinc-600 text-xs sm:text-base -mt-1 sm:-mt-2.5">:</span>
              <TimeUnit value={timeLeft.hours} label="H" />
              <span className="text-zinc-600 text-xs sm:text-base -mt-1 sm:-mt-2.5">:</span>
              <TimeUnit value={timeLeft.minutes} label="M" />
              <span className="text-zinc-600 text-xs sm:text-base -mt-1 sm:-mt-2.5">:</span>
              <TimeUnit value={timeLeft.seconds} label="S" />
            </div>
          </div>

          <Link to="/products" className="group hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all px-4 py-1.5 rounded-none border border-white/20 hover:border-white hover:bg-white hover:text-black">
            Shop Now <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className="flex flex-col items-center justify-center w-6 sm:w-10">
      <div className="flex items-center justify-center w-full">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -5, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="tabular-nums text-white text-xs sm:text-base font-light tracking-wider"
          >
            {value.toString().padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[7px] sm:text-[9px] text-zinc-500 font-medium tracking-[0.15em] mt-0.5">{label}</span>
    </div>
  );
};
