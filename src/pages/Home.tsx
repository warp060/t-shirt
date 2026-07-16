import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RefreshCcw, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { AboutUsSection } from '../components/AboutUsSection';
import { VIPSection } from '../components/VIPSection';

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
    <div className="flex items-center gap-1.5 sm:gap-2 font-mono mt-2 justify-center sm:justify-start">
      <div className="flex flex-col items-center">
        <span className="text-lg sm:text-xl font-bold leading-none">{timeLeft.days.toString().padStart(2, '0')}</span>
        <span className="text-[8px] sm:text-[9px] uppercase tracking-widest opacity-80 mt-1">Days</span>
      </div>
      <span className="text-lg sm:text-xl font-bold opacity-50 leading-none -mt-3">:</span>
      <div className="flex flex-col items-center">
        <span className="text-lg sm:text-xl font-bold leading-none">{timeLeft.hours.toString().padStart(2, '0')}</span>
        <span className="text-[8px] sm:text-[9px] uppercase tracking-widest opacity-80 mt-1">Hrs</span>
      </div>
      <span className="text-lg sm:text-xl font-bold opacity-50 leading-none -mt-3">:</span>
      <div className="flex flex-col items-center">
        <span className="text-lg sm:text-xl font-bold leading-none">{timeLeft.minutes.toString().padStart(2, '0')}</span>
        <span className="text-[8px] sm:text-[9px] uppercase tracking-widest opacity-80 mt-1">Mins</span>
      </div>
      <span className="text-lg sm:text-xl font-bold opacity-50 leading-none -mt-3">:</span>
      <div className="flex flex-col items-center">
        <span className="text-lg sm:text-xl font-bold leading-none">{timeLeft.seconds.toString().padStart(2, '0')}</span>
        <span className="text-[8px] sm:text-[9px] uppercase tracking-widest opacity-80 mt-1">Secs</span>
      </div>
    </div>
  );
};


export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});
  const [promoContent, setPromoContent] = useState<Record<string, string>>({});
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/products');
        setFeaturedProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };
    const fetchContent = async () => {
      try {
        const [homeData, promoData] = await Promise.all([
          api.get('/page-content/home'),
          api.get('/page-content/promotions').catch(() => ({}))
        ]);
        setContent(homeData);
        setPromoContent(promoData);
      } catch (error) {
        console.error("Error fetching page content:", error);
      }
    };
    fetchProducts();
    fetchContent();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSubscribing(true);
    try {
      const response = await api.post('/subscribe', { email });
      toast.success(response.message || "Subscribed successfully!");
      setEmail(''); // Clear input
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[85dvh] sm:h-[80vh] w-full overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src="/hero-bg-premium.png"
            alt="Hero Background"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="container relative mx-auto flex h-full flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 pb-8 sm:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl pt-28 lg:pt-0 w-full"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground shadow-lg">{content.hero_badge || 'New Collection 2026'}</Badge>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-balance text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
              {content.hero_title || 'WEAR THE VIBE.'}
            </h1>
            {promoContent.promo_active?.toLowerCase() === 'yes' && promoContent.promo_text ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-[5px] mb-8 perspective-1000 z-10 max-w-lg w-full"
              >
                <div
                  className="relative w-full h-[260px] sm:h-[160px] group preserve-3d cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front Side */}
                  <div className={`absolute w-full h-full backface-hidden transition-transform duration-700 transform-style-3d group-hover:rotate-y-180 ${isFlipped ? 'rotate-y-180' : ''} bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-5 flex flex-col justify-center items-center text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]`}>
                    <div className="absolute top-4 right-4 animate-pulse">
                      <Zap className="text-primary w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-widest uppercase mb-1 opacity-90">{promoContent.promo_front_title || 'Special Offer'}</h3>
                    <p className="text-xl sm:text-2xl font-extrabold text-primary drop-shadow-md leading-tight truncate max-w-full">
                      {promoContent.promo_text.split(':').pop() || promoContent.promo_text}
                    </p>
                    <p className="text-white/60 text-[10px] sm:text-xs mt-2 tracking-[0.2em] uppercase font-semibold">{promoContent.promo_front_desc || 'Tap or hover to reveal'}</p>
                  </div>
                  {/* Back Side */}
                  <div className={`absolute w-full h-full backface-hidden transition-transform duration-700 transform-style-3d group-hover:rotate-y-0 ${isFlipped ? 'rotate-y-0' : 'rotate-y-180'} bg-primary rounded-2xl border border-primary-foreground/20 p-5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-6 sm:gap-0 shadow-[0_0_40px_rgba(var(--primary),0.3)]`}>
                    <div className="text-center sm:text-left mb-0 flex-1">
                      <h3 className="text-xl sm:text-2xl font-black text-primary-foreground uppercase mb-1">{promoContent.promo_back_title || 'Ends Soon'}</h3>
                      <p className="text-primary-foreground/90 font-medium text-sm">{promoContent.promo_back_desc || "Don't miss this exclusive deal!"}</p>
                      {promoContent.promo_end_date && (
                        <div className="mt-3 text-primary-foreground flex justify-center sm:justify-start">
                          <CountdownTimer endDate={promoContent.promo_end_date} />
                        </div>
                      )}
                    </div>
                    <Link to="/products" onClick={(e) => e.stopPropagation()}>
                      <Button variant="secondary" size="lg" className="font-bold shadow-xl hover:scale-105 transition-transform whitespace-nowrap">
                        {promoContent.promo_btn_text || 'Claim Now'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <p className="mb-8 text-base text-white font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-lg md:text-xl max-w-lg leading-relaxed">
                {content.hero_subtitle || 'Premium Customized T-Shirts for Your Business. Submit your own unique designs to our Custom Service and let us bring your vision to life.'}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="h-12 px-8 text-lg w-full sm:w-auto shadow-2xl">
                  {content.hero_cta_primary || 'Shop Now'} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products?category=Oversized">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg bg-black/20 backdrop-blur-md border-white/50 text-white hover:bg-black/40 w-full sm:w-auto shadow-xl transition-all">
                  {content.hero_cta_secondary || 'Oversized Fit'}
                </Button>
              </Link>
            </div>
          </motion.div>


        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
          {[
            { icon: Truck, title: content.feature_1_title || "Free Shipping", desc: content.feature_1_desc || "On orders over ₹4000", link: "/products" },
            { icon: ShieldCheck, title: content.feature_2_title || "Secure Payment", desc: content.feature_2_desc || "100% secure checkout", link: "/" },
            { icon: Zap, title: content.feature_4_title || "Fast Delivery", desc: content.feature_4_desc || "Ships within 24 hours", link: "/products" },
            { icon: RefreshCcw, title: content.feature_5_title || "Easy Returns", desc: content.feature_5_desc || "5-day return policy", link: "/products" }
          ].map((feature, i) => (
            <Link
              key={i}
              to={feature.link}
              className="group relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 rounded-2xl border border-border p-4 sm:p-6 bg-card hover:bg-gradient-to-br hover:from-card hover:to-primary/5 shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 hover:border-primary/40 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
              <div className="relative rounded-2xl bg-primary/10 p-3 sm:p-4 text-primary group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm group-hover:shadow-primary/30">
                <feature.icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="relative flex flex-col justify-center h-full">
                <h3 className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none mt-1 group-hover:text-foreground/80 transition-colors duration-300">{feature.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20 relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{content.featured_title || 'Featured Products'}</h2>
            <p className="text-sm sm:text-base text-muted-foreground">{content.featured_subtitle || 'Our most popular styles this week.'}</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline flex items-center">
            View All Products <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-16 relative z-10">
        <h2 className="mb-8 text-2xl sm:text-3xl font-bold tracking-tight text-center">{content.categories_title || 'Shop by Category'}</h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {[
            { name: "Men", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80" },
            { name: "Women", img: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80" },
            { name: "Oversized", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80" }
          ].map((cat, i) => (
            <Link key={i} to={`/products?category=${cat.name}`} className="group relative h-64 sm:h-80 overflow-hidden rounded-2xl shadow-md">
              <img
                src={cat.img}
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{cat.name}</h3>
                <p className="text-[10px] sm:text-sm text-gray-300">Explore Collection</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <AboutUsSection />

      {/* VIP Membership Section */}
      <VIPSection 
        email={email} 
        setEmail={setEmail} 
        handleSubscribe={handleSubscribe} 
        isSubscribing={isSubscribing} 
      />
    </div>
  );
};
