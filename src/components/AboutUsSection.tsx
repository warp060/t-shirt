import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Award, Zap, ShieldCheck, Play, X, Heart, Truck, RefreshCcw, Headset, Shirt, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';

// Magnetic Button Component
const MagneticButton = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
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
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      {React.cloneElement(children as React.ReactElement, { onClick, className: `${(children as React.ReactElement).props.className} ${className}` })}
    </motion.div>
  );
};

// Counter Component
const Counter = ({ from, to, suffix = "", duration = 2 }: { from: number, to: number, suffix?: string, duration?: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        setCount(Math.floor(progress * (to - from) + from));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, from, to, duration]);

  return (
    <span ref={nodeRef} className="tabular-nums font-bold">
      {count}{suffix}
    </span>
  );
};

export const AboutUsSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Pause video when out of viewport for performance
  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, delay: custom * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }
    })
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.9, delay: custom * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }
    })
  };

  return (
    <section id="about-us" className="relative w-full pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-white text-zinc-900 font-sans" style={{ position: 'relative' }} ref={containerRef}>
      {/* Background Ornaments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-b from-[#D4AF37]/5 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-100/80 blur-[100px]" />
        
        {/* Subtle Floating Particles */}
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[45%] w-2 h-2 rounded-full bg-[#D4AF37]/30"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.1, 0.4, 0.1] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[60%] right-[30%] w-3 h-3 rounded-full bg-[#D4AF37]/20"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Cinematic Video (55%) */}
          <motion.div 
            className="w-full lg:w-[55%] relative group"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={isInView ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-[28px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] transition-shadow duration-[400ms] aspect-[4/5] sm:aspect-[3/2] lg:aspect-[4/5] xl:aspect-[3/4]">
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10 transition-opacity duration-[400ms] group-hover:opacity-80" />
              
              {/* Video with Lazy Loading and Pause/Play functionality */}
              <video 
                ref={videoRef}
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.03]"
                src="/about-video.mp4?t=1"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <button 
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-500 hover:scale-110 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                >
                  <Play className="w-8 h-8 ml-1" />
                </button>
              </div>

            </div>
          </motion.div>

          {/* Right Column: Content (45%) */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center perspective-[1000px]">
            
            {/* Badge */}
            <motion.div 
              custom={0} variants={textVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
              className="mb-8"
            >
              <span className="inline-flex items-center text-[10px] sm:text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">
                <span className="w-8 h-[1px] bg-[#D4AF37] mr-4" />
                ABOUT ABBAS THREADS
              </span>
            </motion.div>

            {/* Heading (Line by Line Reveal) */}
            <h2 className="text-4xl sm:text-5xl lg:text-[4rem] font-black tracking-tight text-zinc-900 leading-[1.05] mb-8">
              <div className="overflow-hidden">
                <motion.div custom={1} variants={lineVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}>
                  Crafted for
                </motion.div>
              </div>
              <div className="overflow-hidden pb-2">
                <motion.div custom={2} variants={lineVariants} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500">
                  Every Style.
                </motion.div>
              </div>
            </h2>

            {/* Quote */}
            <motion.div 
              custom={3} variants={textVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
              className="pl-6 border-l-2 border-[#D4AF37] mb-8"
            >
              <p className="text-xl sm:text-2xl font-serif italic text-zinc-800 leading-snug">
                "Every stitch reflects our commitment to quality and timeless style."
              </p>
            </motion.div>

            {/* Brand Story */}
            <motion.p 
              custom={4} variants={textVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
              className="text-base sm:text-lg text-zinc-600 leading-relaxed mb-12"
            >
              At ABBAS THREADS, every T-shirt is crafted to combine premium comfort, modern style, and lasting quality. We carefully select quality fabrics and deliver custom printing with precision, ensuring every product reflects confidence, individuality, and craftsmanship. Our mission is to provide stylish apparel with a seamless shopping experience, secure checkout, and reliable delivery across Tamil Nadu.
            </motion.p>


            {/* Premium Statistics Cards */}
            <motion.div 
              custom={6} variants={textVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-12 pb-12 border-b border-zinc-100"
            >
              {[
                { icon: Shirt, value: "50+", title: "Premium Designs", desc: "Crafted for every style." },
                { icon: Gem, value: "Premium", title: "Cotton Quality", desc: "The finest fabrics." },
                { icon: ShieldCheck, value: "Secure", title: "Checkout & Payments", desc: "100% safe shopping." },
                { icon: Truck, value: "Fast", title: "Tamil Nadu Delivery", desc: "Right to your doorstep." }
              ].map((stat, idx) => (
                <div key={idx} className="group relative flex flex-col p-5 rounded-[20px] bg-white border border-zinc-100 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[#D4AF37]/30 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-[12px] bg-zinc-50 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37]/10 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-500">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900">{stat.value}</span>
                  </div>
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-zinc-900 mb-1">{stat.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{stat.desc}</p>
                </div>
              ))}
            </motion.div>

            {/* Buttons */}
            <motion.div 
              custom={7} variants={textVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
              className="flex flex-col sm:flex-row items-center gap-6 mb-12"
            >
              <MagneticButton>
                <Link to="/products" className="group relative inline-flex items-center justify-center px-10 py-5 text-sm font-bold text-white transition-all duration-300 bg-zinc-900 rounded-[24px] hover:bg-black shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.4)] overflow-hidden">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative flex items-center gap-3">
                    Explore Collection
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </MagneticButton>

              <button onClick={() => setIsVideoModalOpen(true)} className="group flex items-center gap-3 text-sm font-bold text-zinc-900 hover:text-[#D4AF37] transition-colors duration-300">
                <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/5 transition-all duration-300 group-hover:scale-110">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                Watch Our Story
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div 
              custom={8} variants={textVariants} initial="hidden" animate={isInView ? "visible" : "hidden"}
              className="flex items-center gap-3 pt-2"
            >
              <div className="flex items-center gap-1 text-[#D4AF37]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 fill-current drop-shadow-sm" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-700 tracking-tight">Loved by 10,000+ Customers</span>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-[24px] overflow-hidden shadow-2xl border border-white/10"
            >
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <video 
                autoPlay 
                controls 
                className="w-full h-full object-contain bg-black"
                src="/about-video.mp4?t=1"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
