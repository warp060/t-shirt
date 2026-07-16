import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product, Review } from '../types';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useCart } from '../lib/cart';
import { Star, ShoppingCart, Heart, Truck, RefreshCcw, ShieldCheck, ChevronLeft, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { api } from '../lib/api';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  // Size-based pricing surcharges
  const sizeSurcharges: Record<string, number> = {
    'S': 0,
    'M': 100,
    'L': 200,
    'XL': 300,
    'XXL': 400,
  };
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const productData = await api.get(`/products/${id}`);
      setProduct(productData);

      const reviewsData = await api.get(`/products/${id}/reviews`);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Could not load product details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-20 text-center text-primary font-bold">Loading product details...</div>;
  if (!product) return <div className="container mx-auto px-4 py-20 text-center">Product not found.</div>;

  // Compute the effective price based on selected size
  const basePrice = product ? parseFloat(String(product.price)) : 0;
  const sizePrice = basePrice + (sizeSurcharges[selectedSize] || 0);

  const handleAddToCart = () => {
    // Pass a product copy with the size-adjusted price
    const productWithSizePrice = { ...product, price: sizePrice };
    addItem(productWithSizePrice, quantity, selectedSize);
    toast.success(`${product.name} (${selectedSize}) added to cart!`);
  };

  const handleBuyNow = () => {
    const productWithSizePrice = { ...product, price: sizePrice };
    addItem(productWithSizePrice, quantity, selectedSize);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to leave a review");
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        userId: user.id,
        productId: product.id,
        rating: newRating,
        comment: newComment
      });
      toast.success("Review submitted! Thank you.");
      setNewComment('');
      setNewRating(5);
      // Refresh product and reviews
      fetchProductData();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Shop
      </Button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[3/4] overflow-hidden rounded-2xl bg-muted"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer hover:opacity-80 transition-opacity">
                <img
                  src={product.image_url}
                  alt={`${product.name} view ${i}`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <Badge className="mb-2">{product.category}</Badge>
            <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                ))}
                <span className="ml-2 text-sm font-medium">{product.rating || 4.5} ({product.reviewsCount || 42} reviews)</span>
              </div>
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm text-green-600 font-medium">In Stock</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">₹{sizePrice.toLocaleString('en-IN')}</span>
            {sizeSurcharges[selectedSize] > 0 && (
              <span className="text-sm text-muted-foreground line-through">₹{basePrice.toLocaleString('en-IN')}</span>
            )}
            {sizeSurcharges[selectedSize] > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">+₹{sizeSurcharges[selectedSize]} for {selectedSize}</span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Select Size</h3>
              <Button variant="link" size="sm" className="text-muted-foreground">Size Guide</Button>
            </div>
            <div className="flex gap-3">
              {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? 'default' : 'outline'}
                  className="h-12 w-12 rounded-full p-0"
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center justify-center rounded-lg border bg-muted/20 h-12 px-2">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-8 w-8">-</Button>
              <span className="w-10 text-center font-bold">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-8 w-8">+</Button>
            </div>
            <div className="flex-1 flex gap-2">
              <Button variant="outline" className="flex-1 h-12 gap-2 border-primary/20 hover:bg-primary/5" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden xs:inline">Add to Cart</span>
                <span className="xs:hidden">Add</span>
              </Button>
              <Button className="flex-[1.5] h-12 gap-2 font-bold shadow-xl bg-primary hover:bg-primary/90 transition-all active:scale-95" onClick={handleBuyNow}>
                <Zap className="h-5 w-5 fill-current" />
                Buy at ₹{(sizePrice * quantity).toLocaleString('en-IN')}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 border-primary/20 hover:bg-primary/5">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t pt-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 group relative cursor-help">
              <RefreshCcw className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">5-Day Returns</span>
              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-foreground text-background text-xs p-3 rounded-lg shadow-xl text-center z-10 pointer-events-none">
                Eligible for returns within 5 days of delivery.
                <br /><br />
                <span className="text-muted/80">Note: Custom printed or personalized T-shirts are non-returnable, unless damaged or defective.</span>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Reviews List */}
          <div className="flex-[2] w-full">
            <h2 className="mb-8 text-2xl font-bold">Customer Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground italic">No reviews yet. Be the first to share your thoughts!</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border p-6 bg-card transition-all hover:shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {review.user_name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold">{review.user_name}</h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="flex-1 w-full p-6 rounded-2xl border bg-muted/30">
            <h3 className="text-lg font-bold mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star className={`h-6 w-6 ${star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted hover:text-yellow-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Thoughts</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Tell others about your experience..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">You need to be logged in to leave a review.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>Login Now</Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
