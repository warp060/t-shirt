import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  const category = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (searchQuery) params.search = searchQuery;
        
        const queryString = new URLSearchParams(params).toString();
        const data = await api.get(`/products${queryString ? `?${queryString}` : ''}`);
        
        let filtered = Array.isArray(data) ? [...data] : [];

        if (category && category !== 'All') {
          filtered = filtered.filter((p: Product) => 
            p.category.toLowerCase() === category.toLowerCase()
          );
        }

        if (sortBy === 'price-low') {
          filtered.sort((a: Product, b: Product) => a.price - b.price);
        } else if (sortBy === 'price-high') {
          filtered.sort((a: Product, b: Product) => b.price - a.price);
        } else {
          filtered.sort((a: Product, b: Product) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
        }

        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sortBy, searchQuery]);

  const FilterContent = () => (
    <div className="space-y-10">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Categories</h3>
          {category && category !== 'All' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 text-[10px] font-bold text-primary hover:bg-transparent" 
              onClick={() => {
                searchParams.delete('category');
                setSearchParams(searchParams);
              }}
            >
              RESET
            </Button>
          )}
        </div>
        <div className="grid gap-1.5">
          {['All', 'Men', 'Women', 'Oversized', 'Printed'].map((cat) => {
            const isActive = category === cat || (!category && cat === 'All');
            return (
              <Button
                key={cat}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`group justify-between h-12 px-5 rounded-2xl transition-all duration-300 border-2 ${
                  isActive 
                  ? 'bg-primary/5 text-primary border-primary/20 shadow-sm shadow-primary/5' 
                  : 'border-transparent hover:bg-muted hover:border-muted-foreground/10 text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => {
                  if (cat === 'All') {
                    searchParams.delete('category');
                  } else {
                    searchParams.set('category', cat);
                  }
                  setSearchParams(searchParams);
                }}
              >
                <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{cat}</span>
                {isActive ? (
                  <div className="w-2 h-2 rounded-full bg-primary animate-in zoom-in duration-500 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 group-hover:bg-muted-foreground/40 transition-colors" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Price Range</h3>
        </div>
        <div className="grid gap-1.5">
          {[
            { label: 'Under ₹1000', value: '0-1000' },
            { label: '₹1000 - ₹2500', value: '1000-2500' },
            { label: 'Over ₹2500', value: '2500-plus' }
          ].map((range) => (
            <Button 
              key={range.value}
              variant="ghost" 
              className="justify-start h-12 px-5 rounded-2xl border-2 border-transparent hover:bg-muted hover:border-muted-foreground/10 font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
            >
              <span className="text-sm">{range.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="pt-10 pb-4">
        <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/20">
          <p className="text-[10px] text-muted-foreground font-medium text-center uppercase tracking-widest leading-loose">
            Premium Threads <br/>
            <span className="text-primary/60">Selected for you</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
              {searchQuery ? `Search results for "${searchQuery}"` : category ? `${category} Collection` : 'All T-shirts'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Showing {products.length} products</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden h-10 w-10">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
                <SheetHeader className="p-8 border-b text-left space-y-1">
                  <SheetTitle className="text-2xl font-black tracking-tighter">FILTERS</SheetTitle>
                  <SheetDescription className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Refine your selection
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-8">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block">
            <div className="sticky top-24 pr-8 border-r border-border/50 min-h-[calc(100vh-8rem)]">
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <h3 className="text-xl font-semibold">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
