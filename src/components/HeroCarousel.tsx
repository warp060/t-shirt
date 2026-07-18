import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from "@/components/ui/badge";

const CountdownTimer = ({ endDate }: { endDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!endDate) return;
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

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (!isActive) return null;

  return (
    <div className="flex flex-nowrap items-center gap-1.5 xs:gap-2 sm:gap-3 font-mono mt-2 mb-6 justify-start">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hrs', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds }
      ].map((item, idx) => (
        <React.Fragment key={idx}>
          <div className="flex flex-col items-center bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <span className="text-lg xs:text-xl sm:text-2xl font-black leading-none text-white drop-shadow-md">{item.value.toString().padStart(2, '0')}</span>
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] uppercase tracking-widest text-[#D4AF37] mt-1 font-bold">{item.label}</span>
          </div>
          {idx < 3 && <span className="text-xl font-bold opacity-50 -mt-2 text-white">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export const HeroCarousel = ({ content, promoContent }: { content: any, promoContent: any }) => {
  const AUTO_PLAY_INTERVAL = 4500;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30, watchDrag: true },
    [
      Fade(),
      Autoplay({ delay: AUTO_PLAY_INTERVAL, stopOnInteraction: false })
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  // 4 Unique Images with dynamic content from Admin Panel
  const slides = [
    {
      id: 1,
      src: content?.hero_slide_1_image || '/hero-bg-premium.png',
      badge: content?.hero_badge || 'New Collection 2026',
      title: content?.hero_title || 'WEAR THE VIBE.',
      desc: content?.hero_subtitle || 'Your Design. Our Craft. Premium custom T-shirts made for your brand.',
      buttons: [
        { text: content?.hero_cta_primary || 'Shop Now', link: '/products', primary: true },
        { text: content?.hero_cta_secondary || 'Oversized Fit', link: '/products?category=Oversized', primary: false }
      ]
    },
    {
      id: 2,
      src: content?.hero_slide_2_image || '/hero-slide2.png',
      badge: content?.hero_slide_2_badge || 'NEW ARRIVALS',
      title: content?.hero_slide_2_title || 'Premium Comfort. Everyday Style.',
      desc: content?.hero_slide_2_desc || 'Experience premium cotton, modern fits, and all-day comfort.',
      buttons: [
        { text: content?.hero_slide_2_cta || 'Explore Collection', link: '/products', primary: true }
      ]
    },
    {
      id: 3,
      src: content?.hero_slide_3_image || '/hero-slide3.png',
      badge: content?.hero_slide_3_badge || 'LIMITED TIME OFFER',
      title: content?.hero_slide_3_title || 'FLASH SALE – 50% OFF',
      desc: content?.hero_slide_3_desc || 'Flat 50% OFF on selected premium T-shirts.',
      showTimer: true,
      buttons: [
        { text: content?.hero_slide_3_cta || 'Shop Sale', link: '/products?sale=true', primary: true }
      ]
    },
    {
      id: 4,
      src: content?.hero_slide_4_image || '/hero-slide4.png',
      badge: content?.hero_slide_4_badge || 'CUSTOM PRINTING',
      title: content?.hero_slide_4_title || 'Your Design. Your Identity.',
      desc: content?.hero_slide_4_desc || 'Create personalized premium T-shirts with professional-quality printing.',
      buttons: [
        { text: content?.hero_slide_4_cta || 'Customize Now', link: '/custom-printing', primary: true }
      ]
    }
  ];

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      emblaApi.plugins().autoplay?.reset();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      emblaApi.plugins().autoplay?.reset();
    }
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
      emblaApi.plugins().autoplay?.reset();
    }
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') scrollNext();
      if (e.key === 'ArrowLeft') scrollPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollNext, scrollPrev]);

  // Pause Autoplay on Hover
  const handleMouseEnter = () => emblaApi?.plugins().autoplay?.stop();
  const handleMouseLeave = () => emblaApi?.plugins().autoplay?.play();

  // Premium Custom Easing defined by user
  const customEasing = [0.22, 1, 0.36, 1];

  const badgeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.1, duration: 0.5, ease: customEasing } }
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5, ease: customEasing } }
  };

  const descVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.3, duration: 0.5, ease: customEasing } }
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5, ease: customEasing } }
  };

  return (
    <section
      className="group relative min-h-[85dvh] sm:min-h-[90vh] w-full bg-black"
    >

      {/* Embla Viewport */}
      <div className="overflow-hidden w-full h-full absolute inset-0" ref={emblaRef}>
        <div className="flex w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative flex-[0_0_100%] min-w-0 w-full h-full"
              style={{ transform: 'translate3d(0, 0, 0)' }}
            >
              {/* Independent Background Media Layer */}
              <div className="absolute inset-0 overflow-hidden w-full h-full bg-black pointer-events-none">
                {/* 
                  GPU ACCELERATED KEN BURNS
                  will-change and translate3d ensure 60fps smoothness and prevent CLS.
                  Image scales from 1.0 to 1.08 over 10 seconds smoothly when active.
                */}
                <motion.div
                  initial={{ scale: 1.0 }}
                  animate={{ scale: index === selectedIndex ? 1.08 : 1.0 }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="w-full h-full"
                  style={{ willChange: 'transform, opacity', transform: 'translate3d(0,0,0)' }}
                >
                  <img
                    src={slide.src}
                    alt={slide.title}
                    loading="eager" // Preload ALL images as requested to guarantee instant swaps
                    className="w-full h-full object-cover origin-center"
                    style={{ transform: 'translate3d(0,0,0)' }}
                  />
                </motion.div>

                {/* Cinematic Gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 z-10 pointer-events-none" />
              </div>

              {/* Text Layer (Staggered Animations, completely independent from background) */}
              <div className="container relative z-30 mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center pt-24 pb-32 sm:pb-40 pointer-events-none">
                <AnimatePresence mode="wait">
                  {index === selectedIndex && (
                    <motion.div className="max-w-2xl w-full pointer-events-auto">

                      {/* Badge (150ms delay) */}
                      <motion.div variants={badgeVariants} initial="hidden" animate="visible" exit="hidden">
                        {slide.id === 1 ? (
                          <Badge className="mb-4 bg-primary text-primary-foreground shadow-lg px-4 py-1.5 text-xs font-bold uppercase tracking-widest">{slide.badge}</Badge>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-6 backdrop-blur-md shadow-lg">
                            ✨ {slide.badge}
                          </span>
                        )}
                      </motion.div>

                      {/* Heading (300ms delay) */}
                      <motion.h1
                        variants={headingVariants} initial="hidden" animate="visible" exit="hidden"
                        className={`mb-6 font-extrabold tracking-tight text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] ${slide.id === 1 ? 'text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl text-balance uppercase' : 'text-4xl sm:text-5xl lg:text-6xl leading-[1.1]'}`}
                      >
                        {slide.title}
                      </motion.h1>

                      {/* Description (500ms delay) */}
                      {slide.desc && (
                        <motion.p
                          variants={descVariants} initial="hidden" animate="visible" exit="hidden"
                          className={`mb-8 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] max-w-lg leading-relaxed tracking-wide ${slide.id === 1 ? 'text-white/90 font-light text-lg sm:text-xl md:text-2xl' : 'font-normal text-sm sm:text-base lg:text-lg text-zinc-300'}`}
                        >
                          {slide.desc}
                        </motion.p>
                      )}

                      {/* Timer (500ms delay to match description) */}
                      {slide.showTimer && promoContent?.promo_end_date && (
                        <motion.div variants={descVariants} initial="hidden" animate="visible" exit="hidden">
                          <CountdownTimer endDate={promoContent.promo_end_date} />
                        </motion.div>
                      )}

                      {/* Buttons (700ms delay) */}
                      <motion.div variants={buttonVariants} initial="hidden" animate="visible" exit="hidden" className="flex flex-col sm:flex-row gap-6 mt-6">
                        {slide.buttons.map((btn, idx) => (
                          <Link key={idx} to={btn.link} className="w-full sm:w-auto">
                            <Button
                              size="lg"
                              variant={btn.primary ? "default" : "outline"}
                              className={`h-12 sm:h-14 px-8 text-sm sm:text-base font-bold w-full transition-all duration-300 group overflow-hidden relative shadow-2xl rounded-full ${btn.primary
                                ? (slide.id === 1 ? "bg-white text-black hover:bg-transparent hover:text-white border-2 border-white" : "bg-white text-black hover:bg-[#D4AF37] hover:text-white hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] border-none")
                                : (slide.id === 1 ? "bg-black/20 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white hover:text-black" : "bg-black/20 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-black")
                                }`}
                            >
                              <span className="relative z-10 flex items-center justify-center">
                                {btn.text} {btn.primary && <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
                              </span>
                              {/* Ripple */}
                              {btn.primary && (
                                <span className="absolute inset-0 w-full h-full bg-black/10 scale-0 group-hover:scale-150 rounded-full transition-transform duration-500 ease-out origin-center opacity-0 group-hover:opacity-100" />
                              )}
                            </Button>
                          </Link>
                        ))}
                      </motion.div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls - Completely detached from the slides */}
      <div
        className="absolute bottom-8 left-0 right-0 z-40 px-4 sm:px-8 flex justify-between items-end container mx-auto pointer-events-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        {/* Progress Dots */}
        <div className="flex gap-2 pb-4 pointer-events-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className="relative w-12 sm:w-16 h-1 rounded-full bg-white/20 overflow-hidden cursor-pointer group"
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-white group-hover:bg-[#D4AF37] transition-colors"
                initial={{ width: '0%' }}
                animate={{ width: idx === selectedIndex ? '100%' : idx < selectedIndex ? '100%' : '0%' }}
                transition={{ duration: idx === selectedIndex ? AUTO_PLAY_INTERVAL / 1000 : 0.3, ease: 'linear' }}
                style={{ willChange: 'width' }}
              />
            </button>
          ))}
        </div>

        {/* Hover Arrows (Desktop only) */}
        <div className="hidden sm:flex gap-3 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={scrollPrev}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-300 shadow-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-300 shadow-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

