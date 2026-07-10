export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  description: string;
  category: 'Men' | 'Women' | 'Oversized' | 'Printed';
  image_url: string;
  stock: number;
  rating?: number;
  reviewsCount?: number;
  created_at: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
}

export interface Order {
  id: number;
  user_id: number;
  items: CartItem[];
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  address: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email?: string;
  };
  payment_method: string;
  payment_details?: any;
  cancel_reason?: string;
  created_at: string;
  updated_at?: string;
  delivered_at?: string;
}

export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  product_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CustomDesign {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  image_url: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
}

export interface ReturnRequest {
  id: number;
  order_id: number;
  product_id: number;
  user_id: number;
  reason: string;
  description: string;
  images: string[];
  video?: string | null;
  invoice_image: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'return_received' | 'refund_processing' | 'refunded';
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  // Included from joined queries
  product_name?: string;
  product_image?: string;
  product_price?: number;
  user_name?: string;
  user_email?: string;
}
