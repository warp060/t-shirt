import { Product } from '../types';

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Classic White Essential',
    price: 1999,
    description: 'A premium 100% cotton white T-shirt. Perfect for everyday wear, featuring a comfortable fit and durable fabric.',
    category: 'Men',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    stock: 50,
    rating: 4.8,
    reviewsCount: 124,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Midnight Black Oversized',
    price: 2799,
    description: 'Streetwear-inspired oversized T-shirt in deep black. Heavyweight cotton for that premium structured look.',
    category: 'Oversized',
    image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    stock: 30,
    rating: 4.9,
    reviewsCount: 89,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Vintage Rose Graphic',
    price: 2399,
    description: 'Soft pink T-shirt with a vintage-style floral graphic on the back. Relaxed fit for women.',
    category: 'Women',
    image_url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80',
    stock: 25,
    rating: 4.7,
    reviewsCount: 56,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Abstract Art Print',
    price: 2599,
    description: 'Unique abstract art print on a premium cream-colored base. A statement piece for any wardrobe.',
    category: 'Printed',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    stock: 15,
    rating: 4.6,
    reviewsCount: 42,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Navy Blue Classic',
    price: 1999,
    description: 'Timeless navy blue crew neck. Pre-shrunk cotton ensures a perfect fit wash after wash.',
    category: 'Men',
    image_url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    stock: 40,
    rating: 4.5,
    reviewsCount: 98,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Sage Green Boxy Tee',
    price: 2299,
    description: 'Modern boxy fit in a trendy sage green color. Minimalist design with a small chest pocket.',
    category: 'Women',
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    stock: 20,
    rating: 4.8,
    reviewsCount: 67,
    created_at: new Date().toISOString()
  }
];
