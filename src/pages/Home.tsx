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

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.get('/products');
        setFeaturedProducts(data.slice(0, 4));
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };
    fetchProducts();
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
      <section className="relative h-[70vh] sm:h-[80vh] w-full overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src="/hero-bg-premium.png"
            alt="Hero Background"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="container relative mx-auto flex h-full flex-col justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground shadow-lg">New Collection 2026</Badge>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-balance text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
              WEAR THE <span className="text-white">VIBE</span>.
            </h1>
            <p className="mb-8 text-base text-white font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-lg md:text-xl max-w-lg leading-relaxed">
              Premium Customized T-Shirts for Your Business. Submit your own unique designs to our Custom Service and let us bring your vision to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products">
                <Button size="lg" className="h-12 px-8 text-lg w-full sm:w-auto shadow-2xl">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products?category=Oversized">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg bg-black/20 backdrop-blur-md border-white/50 text-white hover:bg-black/40 w-full sm:w-auto shadow-xl transition-all">
                  Oversized Fit
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
            { icon: Truck, title: "Free Shipping", desc: "On orders over ₹4000", link: "/products" },
            { icon: ShieldCheck, title: "Secure Payment", desc: "100% secure checkout", link: "/" },
            { icon: Zap, title: "Premium Quality", desc: "Best-in-class fabrics", link: "/products" },
            { icon: Zap, title: "Fast Delivery", desc: "Ships within 24 hours", link: "/products" }
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
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Our most popular styles this week.</p>
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
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl sm:text-3xl font-bold tracking-tight text-center">Shop by Category</h2>
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

      {/* Newsletter */}
      <section className="bg-primary py-12 sm:py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl sm:text-3xl font-bold">Join the Thread Club</h2>
          <p className="mb-8 text-sm sm:text-base text-primary-foreground/80 max-w-md mx-auto">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
          <form onSubmit={handleSubscribe} className="mx-auto flex flex-col sm:flex-row max-w-md gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubscribing}
              className="flex-1 rounded-md border-none bg-white px-4 py-2 text-black focus:outline-none h-11 disabled:opacity-50"
            />
            <Button type="submit" variant="secondary" className="h-11 font-bold" disabled={isSubscribing}>
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};
