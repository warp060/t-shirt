import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Clock, Tag, Gift, ArrowRight, Star } from 'lucide-react';

const MagneticButton = ({ children, className, disabled }: { children: React.ReactNode, className?: string, disabled?: boolean }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
};

export const VIPSection = ({ email, setEmail, handleSubscribe, isSubscribing }: any) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: custom * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }
    })
  };

  return (
    <section ref={containerRef} className="relative w-full py-[70px] lg:py-[120px] bg-[#111111] text-white overflow-hidden font-sans">

      {/* Background Gold Gradients & Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-[#D4AF37]/5 to-transparent blur-[120px] opacity-50" />

        {/* Floating Particles */}
        <motion.div
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-2 h-2 rounded-full bg-[#D4AF37]"
        />
        <motion.div
          animate={{ y: [0, 40, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[30%] right-[25%] w-3 h-3 rounded-full bg-[#D4AF37]"
        />
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] right-[15%] w-1.5 h-1.5 rounded-full bg-white"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-[900px] text-center flex flex-col items-center">

        {/* Badge */}
        <motion.div custom={0} variants={fadeUpVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-8 backdrop-blur-sm">
            ✨ Exclusive Member Club
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          custom={1} variants={fadeUpVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.15] sm:leading-[1.1]"
        >
          Become an ABBAS THREADS Insider
        </motion.h2>

        {/* Description */}
        <motion.p
          custom={2} variants={fadeUpVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-[600px] mx-auto mb-12 leading-relaxed"
        >
          Join our exclusive community and be the first to discover new collections, limited edition drops, member-only discounts, and premium fashion updates.
        </motion.p>

        {/* Benefit Chips */}
        <motion.div
          custom={3} variants={fadeUpVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-14"
        >
          {[
            { icon: Clock, label: "Early Access" },
            { icon: Tag, label: "Exclusive Discounts" },
            { icon: Sparkles, label: "Limited Edition Drops" },
            { icon: Gift, label: "Member Rewards" }
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-white/5 border border-white/5 hover:border-[#D4AF37]/30 hover:bg-white/10 transition-all duration-300 cursor-default group">
              <benefit.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 group-hover:text-[#D4AF37] transition-colors" />
              <span className="text-[11px] sm:text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">{benefit.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Form Container */}
        <motion.div
          custom={4} variants={fadeUpVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="w-full max-w-[500px]"
        >
          <form
            onSubmit={handleSubscribe}
            className="relative flex items-center w-full bg-white/5 border border-white/10 p-1.5 rounded-[9999px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus-within:border-[#D4AF37]/50 focus-within:ring-1 focus-within:ring-[#D4AF37]/50 transition-all duration-300"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubscribing}
              className="flex-1 bg-transparent border-none text-white px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base focus:outline-none focus:ring-0 placeholder:text-zinc-600 w-full"
            />

            <MagneticButton
              disabled={isSubscribing}
              className="group relative flex-shrink-0 inline-flex items-center justify-center h-[42px] sm:h-[52px] px-5 sm:px-8 rounded-full bg-white text-black font-bold text-[13px] sm:text-sm transition-all duration-300 hover:bg-[#D4AF37] hover:text-white overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50"
            >
              {/* Ripple Effect */}
              <span className="absolute inset-0 w-full h-full bg-black/10 scale-0 group-hover:scale-150 rounded-full transition-transform duration-500 ease-out origin-center opacity-0 group-hover:opacity-100" />

              <span className="relative z-10 flex items-center gap-2">
                {isSubscribing ? 'Joining...' : 'Join Free'}
                {!isSubscribing && (
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                )}
              </span>
            </MagneticButton>
          </form>
        </motion.div>

        {/* Trust Row */}
        <motion.div
          custom={5} variants={fadeUpVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center mt-10 gap-3"
        >
          <div className="flex items-center gap-1 text-[#D4AF37]">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-4 h-4 fill-current drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            ))}
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Join thousands of fashion enthusiasts who trust ABBAS THREADS.
          </span>
        </motion.div>

      </div>
    </section>
  );
};
