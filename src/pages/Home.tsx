import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, RefreshCcw, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { Badge } from "@/components/ui/badge";

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

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

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-black text-white">
        <div className="absolute inset-0 opacity-60">
          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80"
            alt="Hero Background"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="container relative mx-auto flex h-full flex-col justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">New Collection 2026</Badge>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl">
              WEAR THE <span className="text-primary">VIBE</span>.
            </h1>
            <p className="mb-8 text-lg text-gray-300 md:text-xl">
              Premium quality T-shirts designed for those who value comfort and style. Discover our latest oversized and graphic collections.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="h-12 px-8 text-lg">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products?category=Oversized">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20">
                  Oversized Fit
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders over ₹4000" },
            { icon: ShieldCheck, title: "Secure Payment", desc: "100% secure checkout" },
            { icon: RefreshCcw, title: "Easy Returns", desc: "30-day return policy" },
            { icon: Zap, title: "Fast Delivery", desc: "Ships within 24 hours" }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border p-6 bg-card shadow-sm">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-muted-foreground">Our most popular styles this week.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
            View All Products
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold tracking-tight text-center">Shop by Category</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { name: "Men", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80" },
            { name: "Women", img: "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80" },
            { name: "Oversized", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80" }
          ].map((cat, i) => (
            <Link key={i} to={`/products?category=${cat.name}`} className="group relative h-80 overflow-hidden rounded-2xl">
              <img
                src={cat.img}
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                <p className="text-sm text-gray-300">Explore Collection</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Join the Thread Club</h2>
          <p className="mb-8 text-primary-foreground/80">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
          <div className="mx-auto flex max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-md border-none bg-white px-4 py-2 text-black focus:outline-none"
            />
            <Button variant="secondary">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
};
