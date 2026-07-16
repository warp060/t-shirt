import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Zap } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { useCart } from '../lib/cart';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  const currentPrice = Number(product.price);
  const originalPrice = product.original_price ? Number(product.original_price) : currentPrice;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const handleBuyNow = () => {
    if (product.stock > 0) {
      addItem(product);
      navigate('/checkout');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
        <Link to={`/product/${product.id}`}>
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="destructive" className="absolute left-2 top-2">
                Only {product.stock} left
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="secondary" className="absolute left-2 top-2">
                Out of Stock
              </Badge>
            )}
            <Badge variant="outline" className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm">
              {product.category}
            </Badge>
          </div>
        </Link>
        <CardContent className="p-3 sm:p-4 pb-2">
          <div className="flex items-center justify-between mb-1 gap-2">
            <Link to={`/product/${product.id}`} className="hover:underline flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-lg truncate">{product.name}</h3>
            </Link>
            <div className="flex items-center gap-1 text-[10px] sm:text-sm font-medium whitespace-nowrap">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{product.rating || 4.5}</span>
            </div>
          </div>

          {hasDiscount ? (
            <>
              <div className="flex items-center gap-1.5 mb-2 mt-0.5">
                <p className="text-xl sm:text-2xl font-bold text-foreground">₹{currentPrice.toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground line-through font-medium">₹{originalPrice.toLocaleString('en-IN')}</p>
                <p className="text-sm font-bold text-[#4CAF50]">{discountPercentage}% off</p>
              </div>
              <div className="inline-block bg-[#f4f0ff] text-[#7837d9] px-2 py-0.5 text-[11px] font-semibold rounded mb-1">
                Top Discount of the Sale
              </div>
            </>
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-foreground mb-2 mt-0.5">₹{currentPrice.toLocaleString('en-IN')}</p>
          )}
        </CardContent>
        <CardFooter className="p-3 sm:p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-9 sm:h-10 text-[10px] sm:text-xs px-2 gap-1.5 border-primary/20 hover:bg-primary/5 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Cart</span>
          </Button>

          <Button
            className="flex-[2.5] h-9 sm:h-10 text-[10px] sm:text-sm font-bold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95 gap-1.5 overflow-hidden relative group"
            onClick={handleBuyNow}
            disabled={product.stock === 0}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current group-hover:scale-110 transition-transform duration-300" />
            Buy at ₹{currentPrice.toLocaleString('en-IN')}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={`h-9 w-9 sm:h-10 sm:w-10 shrink-0 border-primary/20 hover:bg-red-50 hover:border-red-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-95 ${isLiked ? 'bg-red-50 border-red-200' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setIsLiked(!isLiked);
            }}
          >
            <Heart className={`h-4 w-4 transition-all duration-300 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-primary group-hover:text-red-500'}`} />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
