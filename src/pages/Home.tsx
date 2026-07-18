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
import { HeroCarousel } from '../components/HeroCarousel';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});
  const [promoContent, setPromoContent] = useState<Record<string, string>>({});

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
      <HeroCarousel content={content} promoContent={promoContent} />

      {/* Our Collections */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20 relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{content.featured_title || 'Our Collections'}</h2>
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

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-8">
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
