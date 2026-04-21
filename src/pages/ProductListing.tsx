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
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold">Categories</h3>
        <div className="flex flex-col gap-2">
          {['All', 'Men', 'Women', 'Oversized', 'Printed'].map((cat) => (
            <Button
              key={cat}
              variant={category === cat || (!category && cat === 'All') ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => {
                if (cat === 'All') {
                  searchParams.delete('category');
                } else {
                  searchParams.set('category', cat);
                }
                setSearchParams(searchParams);
              }}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="mb-4 font-semibold">Price Range</h3>
        <div className="flex flex-col gap-2">
          <Button variant="ghost" className="justify-start">Under ₹1000</Button>
          <Button variant="ghost" className="justify-start">₹1000 - ₹2500</Button>
          <Button variant="ghost" className="justify-start">Over ₹2500</Button>
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
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader className="text-left">
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>Narrow down your search.</SheetDescription>
                </SheetHeader>
                <div className="mt-8">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block">
            <FilterContent />
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
