import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
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
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1 gap-2">
            <Link to={`/product/${product.id}`} className="hover:underline flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-lg truncate">{product.name}</h3>
            </Link>
            <div className="flex items-center gap-1 text-[10px] sm:text-sm font-medium whitespace-nowrap">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{product.rating || 4.5}</span>
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</p>
        </CardContent>
        <CardFooter className="p-3 sm:p-4 pt-0 flex gap-2">
          <Button 
            className="flex-1 h-9 sm:h-10 text-xs sm:text-sm" 
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Add to Cart
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
            <Heart className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
