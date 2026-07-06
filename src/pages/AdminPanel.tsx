import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Product, Order, UserProfile, CustomDesign, Review } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Plus, Pencil, Trash2, Package, Users, ShoppingBag, LayoutDashboard, Palette, Star, Upload, Image as ImageIcon, RefreshCw, AlertCircle, CheckCircle2, DollarSign, Mail, Calendar, FileText, Save, Type, AlignLeft, Home as HomeIcon, Paintbrush, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

interface PageContentItem {
  id?: number;
  page_id: string;
  content_key: string;
  content_value: string;
}

const PAGE_SECTIONS = [
  {
    pageId: 'home',
    label: 'Home Page',
    icon: <HomeIcon className="h-4 w-4" />,
    description: 'Hero section, features, newsletter, and category headings',
    fields: [
      { key: 'hero_badge', label: 'Hero Badge Text', type: 'text', placeholder: 'e.g. New Collection 2026' },
      { key: 'hero_title', label: 'Hero Title', type: 'text', placeholder: 'Main heading on hero section' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'Description below the hero title' },
      { key: 'hero_cta_primary', label: 'Primary Button Text', type: 'text', placeholder: 'e.g. Shop Now' },
      { key: 'hero_cta_secondary', label: 'Secondary Button Text', type: 'text', placeholder: 'e.g. Oversized Fit' },
      { key: 'featured_title', label: 'Featured Section Title', type: 'text', placeholder: 'e.g. Featured Products' },
      { key: 'featured_subtitle', label: 'Featured Section Subtitle', type: 'text', placeholder: 'e.g. Our most popular styles' },
      { key: 'categories_title', label: 'Categories Section Title', type: 'text', placeholder: 'e.g. Shop by Category' },
      { key: 'feature_1_title', label: 'Feature 1 — Title', type: 'text', placeholder: 'e.g. Free Shipping' },
      { key: 'feature_1_desc', label: 'Feature 1 — Description', type: 'text', placeholder: 'e.g. On orders over ₹4000' },
      { key: 'feature_2_title', label: 'Feature 2 — Title', type: 'text', placeholder: 'e.g. Secure Payment' },
      { key: 'feature_2_desc', label: 'Feature 2 — Description', type: 'text', placeholder: 'e.g. 100% secure checkout' },
      { key: 'feature_3_title', label: 'Feature 3 — Title', type: 'text', placeholder: 'e.g. Premium Quality' },
      { key: 'feature_3_desc', label: 'Feature 3 — Description', type: 'text', placeholder: 'e.g. Best-in-class fabrics' },
      { key: 'feature_4_title', label: 'Feature 4 — Title', type: 'text', placeholder: 'e.g. Fast Delivery' },
      { key: 'feature_4_desc', label: 'Feature 4 — Description', type: 'text', placeholder: 'e.g. Ships within 24 hours' },
      { key: 'newsletter_title', label: 'Newsletter Title', type: 'text', placeholder: 'e.g. Join the Thread Club' },
      { key: 'newsletter_subtitle', label: 'Newsletter Subtitle', type: 'textarea', placeholder: 'Newsletter description text' },
    ]
  },
  {
    pageId: 'custom_printing',
    label: 'Custom Printing Page',
    icon: <Paintbrush className="h-4 w-4" />,
    description: 'Custom t-shirt printing page title and subtitle',
    fields: [
      { key: 'page_title', label: 'Page Title', type: 'text', placeholder: 'e.g. Custom T-Shirt Printing' },
      { key: 'page_subtitle', label: 'Page Subtitle', type: 'textarea', placeholder: 'Description under the page title' },
    ]
  },
  {
    pageId: 'navbar',
    label: 'Navigation & Branding',
    icon: <Globe className="h-4 w-4" />,
    description: 'Brand name and announcement bar',
    fields: [
      { key: 'brand_name', label: 'Brand Name', type: 'text', placeholder: 'e.g. ABBAS THREADS' },
      { key: 'announcement_bar', label: 'Announcement Bar Text', type: 'text', placeholder: 'Leave empty to hide' },
    ]
  },
  {
    pageId: 'promotions',
    label: 'Promotions & Flash Sales',
    icon: <AlertCircle className="h-4 w-4" />,
    description: 'Configure real-time countdown timers and site-wide sales',
    fields: [
      { key: 'promo_active', label: 'Enable Flash Sale?', type: 'text', placeholder: 'Type "yes" to enable' },
      { key: 'promo_text', label: 'Promo Main Text', type: 'text', placeholder: 'e.g. 50% OFF ALL T-SHIRTS' },
      { key: 'promo_front_title', label: 'Front Card Title', type: 'text', placeholder: 'e.g. SPECIAL OFFER' },
      { key: 'promo_front_desc', label: 'Front Card Footer', type: 'text', placeholder: 'e.g. Tap or hover to reveal' },
      { key: 'promo_back_title', label: 'Back Card Title', type: 'text', placeholder: 'e.g. ENDS SOON' },
      { key: 'promo_back_desc', label: 'Back Card Description', type: 'text', placeholder: 'e.g. Don\'t miss this exclusive deal!' },
      { key: 'promo_btn_text', label: 'Back Button Text', type: 'text', placeholder: 'e.g. Claim Now' },
      { key: 'promo_end_date', label: 'Sale End Date & Time', type: 'text', placeholder: 'e.g. 2026-07-11 11:59 PM' },
    ]
  }
];

export const AdminPanel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [customDesigns, setCustomDesigns] = useState<CustomDesign[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [pageContent, setPageContent] = useState<PageContentItem[]>([]);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [savingPages, setSavingPages] = useState(false);
  const [activePageSection, setActivePageSection] = useState('home');

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
    category: 'Men',
    image_url: '',
    stock: 0
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image too large (max 10MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64);
        if (isEditing && editingProduct) {
          setEditingProduct({ ...editingProduct, image_url: compressed });
        } else {
          setNewProduct({ ...newProduct, image_url: compressed });
        }
        toast.success("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Fetch everything in parallel so one failure doesn't block others
      const [productsRes, ordersRes, usersRes, customRes, reviewsRes, subscribersRes] = await Promise.allSettled([
        api.get('/products'),
        api.get('/admin/orders'),
        api.get('/admin/users'),
        api.get('/admin/custom-designs'),
        api.get('/admin/reviews'),
        api.get('/admin/subscribers')
      ]);

      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value);
      } else {
        console.error("Products fetch failed:", productsRes.reason);
        toast.error("Products error: " + (productsRes.reason.message || "Access Denied"));
      }

      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value);
      } else {
        console.error("Orders fetch failed:", ordersRes.reason);
        toast.error("Orders error: " + (ordersRes.reason.message || "Access Denied"));
      }

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value);
      } else {
        console.error("Users fetch failed:", usersRes.reason);
        toast.error("Users error: " + (usersRes.reason.message || "Access Denied"));
      }

      if (customRes.status === 'fulfilled') {
        setCustomDesigns(customRes.value);
      }

      if (reviewsRes.status === 'fulfilled') {
        setReviews(reviewsRes.value);
      } else {
        console.error("Reviews fetch failed:", reviewsRes.reason);
        toast.error("Reviews error: " + (reviewsRes.reason.message || "Access Denied"));
      }

      if (subscribersRes.status === 'fulfilled') {
        setSubscribers(subscribersRes.value);
      }

      // Fetch page content manually inside here to not break Promise.allSettled if table doesn't exist
      try {
        const pageContentRes = await api.get('/page-content');
        if (Array.isArray(pageContentRes)) {
          setPageContent(pageContentRes);
          const contentMap: Record<string, string> = {};
          pageContentRes.forEach((item: PageContentItem) => {
            contentMap[`${item.page_id}::${item.content_key}`] = item.content_value || '';
          });
          setEditedContent(contentMap);
        }
      } catch (err) {
        console.error("Page content fetch failed:", err);
      }

    } catch (error) {
      console.error("Critical error in Admin fetchData:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, curr) => acc + (parseFloat(curr.total_amount) || 0), 0);

  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', newProduct);
      setNewProduct({ name: '', price: 0, description: '', category: 'Men', image_url: '', stock: 0 });
      fetchData(); // Refresh list immediately
      toast.success('Product added successfully!');
    } catch (error: any) {
      toast.error(error.message || "Failed to add product");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await api.put(`/products/${editingProduct.id}`, editingProduct);
      setEditingProduct(null);
      fetchData(); // Refresh list immediately
      toast.success('Product updated successfully!');
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData(); // Refresh list immediately
      toast.success('Product deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      fetchData(); // Refresh list immediately
      toast.success('Order status updated!');
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const toggleUserRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const updateCustomDesignStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/custom-designs/${id}/status`, { status });
      fetchData();
      toast.success('Custom design status updated!');
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDeleteCustomDesign = async (id: number) => {
    if (!confirm("Delete this custom design request?")) return;
    try {
      await api.delete(`/admin/custom-designs/${id}`);
      fetchData();
      toast.success('Request deleted');
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete review");
    }
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!confirm("Are you sure you want to remove this subscriber?")) return;
    try {
      await api.delete(`/admin/subscribers/${id}`);
      fetchData();
      toast.success('Subscriber removed');
    } catch (error: any) {
      toast.error(error.message || "Failed to remove subscriber");
    }
  };

  // CMS Handlers
  const getContentValue = (pageId: string, key: string): string => {
    return editedContent[`${pageId}::${key}`] ?? '';
  };

  const setContentValue = (pageId: string, key: string, value: string) => {
    setEditedContent(prev => ({ ...prev, [`${pageId}::${key}`]: value }));
  };

  const hasUnsavedChanges = (pageId: string): boolean => {
    const section = PAGE_SECTIONS.find(s => s.pageId === pageId);
    if (!section) return false;
    return section.fields.some(field => {
      const currentValue = pageContent.find(p => p.page_id === pageId && p.content_key === field.key)?.content_value ?? '';
      const editedValue = editedContent[`${pageId}::${field.key}`] ?? '';
      return currentValue !== editedValue;
    });
  };

  const handleSavePageContent = async (pageId: string) => {
    setSavingPages(true);
    try {
      const section = PAGE_SECTIONS.find(s => s.pageId === pageId);
      if (!section) return;
      const items = section.fields.map(field => ({
        page_id: pageId,
        content_key: field.key,
        content_value: editedContent[`${pageId}::${field.key}`] ?? ''
      }));
      await api.put('/admin/page-content', { items });
      toast.success(`${section.label} content saved!`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save page content");
    } finally {
      setSavingPages(false);
    }
  };



  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary ring-4 ring-primary/5">
            <LayoutDashboard className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Control panel for managing your store products, orders, customers, and designs.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {refreshing ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 rounded-lg animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Syncing data...
            </span>
          ) : (
            <Button variant="outline" size="sm" onClick={fetchData} className="text-xs flex items-center gap-1.5 font-medium border-border/60 hover:bg-muted/50 transition-all cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Live Sync Active
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {/* Card 1: Products */}
        <div
          onClick={() => setActiveTab('products')}
          className="group relative flex flex-col items-center justify-center text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-4 sm:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03),0_12px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_4px_16px_-6px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.7)] hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] cursor-pointer"
        >
          {/* Top: Rounded icon circle */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background dark:group-hover:bg-white dark:group-hover:text-zinc-950 shadow-sm border border-black/[0.03] dark:border-white/[0.04] mb-2 sm:mb-4">
            <Package className="h-6 w-6" />
          </div>
          {/* Bottom: Texts centered */}
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">{products.length}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground transition-colors duration-300 mt-2">Total Products</span>
          <span className="text-xs text-muted-foreground/75 mt-0.5 sm:mt-1 font-medium group-hover:text-muted-foreground transition-colors duration-300 hidden sm:inline-block">Items active</span>
        </div>

        {/* Card 2: Orders */}
        <div
          onClick={() => setActiveTab('orders')}
          className="group relative flex flex-col items-center justify-center text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-4 sm:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03),0_12px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_4px_16px_-6px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.7)] hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] cursor-pointer"
        >
          {/* Top: Rounded icon circle */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background dark:group-hover:bg-white dark:group-hover:text-zinc-950 shadow-sm border border-black/[0.03] dark:border-white/[0.04] mb-2 sm:mb-4">
            <ShoppingBag className="h-6 w-6" />
          </div>
          {/* Bottom: Texts centered */}
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">{orders.length}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground transition-colors duration-300 mt-2">Total Orders</span>
          <span className="text-xs text-muted-foreground/75 mt-0.5 sm:mt-1 font-medium group-hover:text-muted-foreground transition-colors duration-300 hidden sm:inline-block">Received logs</span>
        </div>

        {/* Card 3: Revenue */}
        <div
          onClick={() => setActiveTab('orders')}
          className="group relative flex flex-col items-center justify-center text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-4 sm:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03),0_12px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_4px_16px_-6px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.7)] hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] cursor-pointer"
        >
          {/* Top: Rounded icon circle */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background dark:group-hover:bg-white dark:group-hover:text-zinc-950 shadow-sm border border-black/[0.03] dark:border-white/[0.04] mb-2 sm:mb-4">
            <DollarSign className="h-6 w-6" />
          </div>
          {/* Bottom: Texts centered */}
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">₹{totalRevenue.toLocaleString('en-IN')}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground transition-colors duration-300 mt-2">Total Revenue</span>
          <span className="text-xs text-muted-foreground/75 mt-0.5 sm:mt-1 font-medium group-hover:text-muted-foreground transition-colors duration-300 hidden sm:inline-block">Gross earnings</span>
        </div>

        {/* Card 4: Avg Value */}
        <div
          onClick={() => setActiveTab('orders')}
          className="group relative flex flex-col items-center justify-center text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-4 sm:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03),0_12px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_4px_16px_-6px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.7)] hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] cursor-pointer"
        >
          {/* Top: Rounded icon circle */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background dark:group-hover:bg-white dark:group-hover:text-zinc-950 shadow-sm border border-black/[0.03] dark:border-white/[0.04] mb-2 sm:mb-4">
            <span className="text-xl font-bold">₹</span>
          </div>
          {/* Bottom: Texts centered */}
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">₹{avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground transition-colors duration-300 mt-2">Average Order</span>
          <span className="text-xs text-muted-foreground/75 mt-0.5 sm:mt-1 font-medium group-hover:text-muted-foreground transition-colors duration-300 hidden sm:inline-block">Average ticket value</span>
        </div>

        {/* Card 5: Custom Designs */}
        <div
          onClick={() => setActiveTab('custom')}
          className="group relative flex flex-col items-center justify-center text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-4 sm:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03),0_12px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_4px_16px_-6px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.7)] hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] cursor-pointer"
        >
          {/* Top: Rounded icon circle */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background dark:group-hover:bg-white dark:group-hover:text-zinc-950 shadow-sm border border-black/[0.03] dark:border-white/[0.04] mb-2 sm:mb-4">
            <Palette className="h-6 w-6" />
          </div>
          {/* Bottom: Texts centered */}
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">{customDesigns.length}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground transition-colors duration-300 mt-2">Custom Designs</span>
          <span className="text-xs text-muted-foreground/75 mt-0.5 sm:mt-1 font-medium group-hover:text-muted-foreground transition-colors duration-300 hidden sm:inline-block">Requests submitted</span>
        </div>

        {/* Card 6: Reviews */}
        <div
          onClick={() => setActiveTab('reviews')}
          className="group relative flex flex-col items-center justify-center text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-4 sm:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03),0_12px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_4px_16px_-6px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.7)] hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] cursor-pointer"
        >
          {/* Top: Rounded icon circle */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background dark:group-hover:bg-white dark:group-hover:text-zinc-950 shadow-sm border border-black/[0.03] dark:border-white/[0.04] mb-2 sm:mb-4">
            <Star className="h-6 w-6" />
          </div>
          {/* Bottom: Texts centered */}
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">{reviews.length}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground transition-colors duration-300 mt-2">Customer Reviews</span>
          <span className="text-xs text-muted-foreground/75 mt-0.5 sm:mt-1 font-medium group-hover:text-muted-foreground transition-colors duration-300 hidden sm:inline-block">Feedback comments</span>
        </div>

        {/* Card 7: Subscribers */}
        <div
          onClick={() => setActiveTab('subscribers')}
          className="group relative flex flex-col items-center justify-center text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-4 sm:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03),0_12px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_4px_16px_-6px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.7)] hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] cursor-pointer"
        >
          {/* Top: Rounded icon circle */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background dark:group-hover:bg-white dark:group-hover:text-zinc-950 shadow-sm border border-black/[0.03] dark:border-white/[0.04] mb-2 sm:mb-4">
            <Mail className="h-6 w-6" />
          </div>
          {/* Bottom: Texts centered */}
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">{subscribers.length}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground transition-colors duration-300 mt-2">Subscribed Users</span>
          <span className="text-xs text-muted-foreground/75 mt-0.5 sm:mt-1 font-medium group-hover:text-muted-foreground transition-colors duration-300 hidden sm:inline-block">Newsletter list</span>
        </div>

        {/* Card 8: Pages */}
        <div
          onClick={() => setActiveTab('pages')}
          className="group relative flex flex-col items-center justify-center text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-4 sm:p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03),0_12px_40px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08),0_4px_16px_-6px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.7)] hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background dark:group-hover:bg-white dark:group-hover:text-zinc-950 shadow-sm border border-black/[0.03] dark:border-white/[0.04] mb-2 sm:mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">{PAGE_SECTIONS.length}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground transition-colors duration-300 mt-2">Pages</span>
          <span className="text-xs text-muted-foreground/75 mt-0.5 sm:mt-1 font-medium group-hover:text-muted-foreground transition-colors duration-300 hidden sm:inline-block">Content modification</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Navigation Tabs - Mobile Select Dropdown */}
        <div className="block md:hidden mb-6">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground block mb-2">
            Navigation Menu
          </label>
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full h-11 px-4 bg-muted/60 dark:bg-zinc-900/60 border border-border/40 backdrop-blur-sm rounded-xl focus:ring-1 focus:ring-primary text-sm font-semibold flex items-center justify-between shadow-sm cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-md shadow-lg py-1">
              <SelectItem value="products" className="py-2.5 px-3.5 text-sm font-medium rounded-lg cursor-pointer transition-colors">Products</SelectItem>
              <SelectItem value="orders" className="py-2.5 px-3.5 text-sm font-medium rounded-lg cursor-pointer transition-colors">Orders</SelectItem>
              <SelectItem value="users" className="py-2.5 px-3.5 text-sm font-medium rounded-lg cursor-pointer transition-colors">Users</SelectItem>
              <SelectItem value="custom" className="py-2.5 px-3.5 text-sm font-medium rounded-lg cursor-pointer transition-colors">Custom Designs</SelectItem>
              <SelectItem value="reviews" className="py-2.5 px-3.5 text-sm font-medium rounded-lg cursor-pointer transition-colors">Reviews</SelectItem>
              <SelectItem value="subscribers" className="py-2.5 px-3.5 text-sm font-medium rounded-lg cursor-pointer transition-colors">Subscribers</SelectItem>
              <SelectItem value="pages" className="py-2.5 px-3.5 text-sm font-medium rounded-lg cursor-pointer transition-colors">Pages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation Tabs - Desktop Widescreen Triggers */}
        <TabsList className="hidden md:flex mb-8 w-full justify-start h-auto p-1.5 bg-muted/60 dark:bg-zinc-900/60 border border-border/40 backdrop-blur-sm rounded-xl">
          <TabsTrigger value="products" className="py-2.5 px-4.5 text-xs sm:text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer">Products</TabsTrigger>
          <TabsTrigger value="orders" className="py-2.5 px-4.5 text-xs sm:text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer">Orders</TabsTrigger>
          <TabsTrigger value="users" className="py-2.5 px-4.5 text-xs sm:text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer">Users</TabsTrigger>
          <TabsTrigger value="custom" className="py-2.5 px-4.5 text-xs sm:text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer">Custom Designs</TabsTrigger>
          <TabsTrigger value="reviews" className="py-2.5 px-4.5 text-xs sm:text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer">Reviews</TabsTrigger>
          <TabsTrigger value="subscribers" className="py-2.5 px-4.5 text-xs sm:text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer">Subscribers</TabsTrigger>
          <TabsTrigger value="pages" className="py-2.5 px-4.5 text-xs sm:text-sm font-semibold rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer">Pages</TabsTrigger>
        </TabsList>

        {/* Tab 1: Products */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Manage Inventory</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Create, edit, or remove catalog items</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="cursor-pointer font-semibold shadow-sm"><Plus className="mr-1.5 h-4 w-4" /> Add Product</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4 pt-2">
                  <Input placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required className="h-10" />
                  <Input type="number" placeholder="Price" value={newProduct.price || ''} onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} required className="h-10" />

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Product Image</label>
                    <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/40 ${newProduct.image_url ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e)}
                      />
                      {newProduct.image_url ? (
                        <div className="relative w-full aspect-square max-h-[140px] rounded overflow-hidden">
                          <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground text-center">Click to upload product image</p>
                        </>
                      )}
                    </div>
                    <Input
                      placeholder="Or paste Image URL"
                      value={newProduct.image_url && !newProduct.image_url.startsWith('data:') ? newProduct.image_url : ''}
                      onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  <Input type="number" placeholder="Stock Quantity" value={newProduct.stock || ''} onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} required className="h-10" />
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
                    placeholder="Product Description"
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    required
                  />
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value as any })}
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Oversized">Oversized</option>
                    <option value="Printed">Printed</option>
                  </select>
                  <Button type="submit" className="w-full h-10 font-bold cursor-pointer">Save Product</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm bg-card/30 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40 dark:bg-zinc-900/40">
                  <TableRow>
                    <TableHead className="w-[85px] py-4">Image</TableHead>
                    <TableHead className="py-4">Name</TableHead>
                    <TableHead className="py-4">Category</TableHead>
                    <TableHead className="py-4">Price</TableHead>
                    <TableHead className="py-4">Stock</TableHead>
                    <TableHead className="py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id} className="hover:bg-muted/20 dark:hover:bg-zinc-900/20 transition-colors">
                      <TableCell className="py-3">
                        <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shadow-inner">
                          {product.image_url ? (
                            <img src={product.image_url} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground/90 py-3 max-w-[220px] truncate">
                        {product.name}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                          {product.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground py-3">
                        ₹{product.price.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{product.stock}</span>
                          {product.stock <= 5 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                              <AlertCircle className="h-2.5 w-2.5" />
                              Low
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Dialog open={!!editingProduct && editingProduct.id === product.id} onOpenChange={(open) => !open && setEditingProduct(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer transition-colors"><Pencil className="h-4 w-4" /></Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md rounded-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-lg font-bold">Edit Product</DialogTitle>
                              </DialogHeader>
                              {editingProduct && (
                                <form onSubmit={handleUpdateProduct} className="space-y-4 pt-2">
                                  <Input placeholder="Product Name" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} required className="h-10" />
                                  <Input type="number" placeholder="Price" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} required className="h-10" />

                                  <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground">Product Image</label>
                                    <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/40 ${editingProduct.image_url ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}>
                                      <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, true)}
                                      />
                                      {editingProduct.image_url ? (
                                        <div className="relative w-full aspect-square max-h-[140px] rounded overflow-hidden">
                                          <img src={editingProduct.image_url} alt="Preview" className="w-full h-full object-contain" />
                                        </div>
                                      ) : (
                                        <>
                                          <Upload className="h-6 w-6 text-muted-foreground" />
                                          <p className="text-xs text-muted-foreground text-center">Click to change product image</p>
                                        </>
                                      )}
                                    </div>
                                    <Input
                                      placeholder="Or paste Image URL"
                                      value={editingProduct.image_url && !editingProduct.image_url.startsWith('data:') ? editingProduct.image_url : ''}
                                      onChange={e => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                                      className="h-10"
                                    />
                                  </div>

                                  <Input type="number" placeholder="Stock Quantity" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })} required className="h-10" />
                                  <textarea
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
                                    placeholder="Product Description"
                                    value={editingProduct.description}
                                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    required
                                  />
                                  <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-10"
                                    value={editingProduct.category}
                                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                                  >
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Oversized">Oversized</option>
                                    <option value="Printed">Printed</option>
                                  </select>
                                  <Button type="submit" className="w-full h-10 font-bold cursor-pointer">Update Product</Button>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer transition-colors" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No products found. Add your first item.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Orders */}
        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Order Logs</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Track and update customer order states</p>
            </div>
          </div>

          <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm bg-card/30 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40 dark:bg-zinc-900/40">
                  <TableRow>
                    <TableHead className="py-4">Order ID</TableHead>
                    <TableHead className="py-4">Customer</TableHead>
                    <TableHead className="py-4">Amount</TableHead>
                    <TableHead className="py-4">Payment</TableHead>
                    <TableHead className="py-4">Status</TableHead>
                    <TableHead className="py-4">Date</TableHead>
                    <TableHead className="py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} className="hover:bg-muted/20 dark:hover:bg-zinc-900/20 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold py-4 text-primary">{order.id}</TableCell>
                      <TableCell className="py-4 font-medium">{order.address.fullName}</TableCell>
                      <TableCell className="py-4 font-semibold text-foreground">₹{order.total_amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-muted text-muted-foreground border border-border uppercase tracking-wider">
                          {order.paymentMethod || 'cod'}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        {order.status === 'delivered' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Delivered
                          </span>
                        )}
                        {order.status === 'shipped' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Shipped
                          </span>
                        )}
                        {order.status === 'processing' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Processing
                          </span>
                        )}
                        {order.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" style={{ animationDuration: '3s' }} />
                            Pending
                          </span>
                        )}
                        {order.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Cancelled
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-xs text-muted-foreground font-medium">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <Dialog open={!!selectedOrder && selectedOrder.id === order.id} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)} className="h-8 text-xs font-semibold border-border/60 hover:bg-muted/50 cursor-pointer transition-colors">Receipt</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md rounded-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-lg font-bold">Invoice Details</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6 pt-2">
                                  <div className="flex justify-between items-center border-b border-border/40 pb-4">
                                    <div>
                                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">Order Ref</span>
                                      <h3 className="font-mono text-sm font-extrabold text-foreground">{selectedOrder.id}</h3>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">Date Placed</span>
                                      <p className="text-sm font-medium text-foreground">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-sm">
                                    <div>
                                      <span className="text-xs text-muted-foreground block mb-0.5 font-medium">Customer Name</span>
                                      <span className="font-semibold text-foreground">{selectedOrder.address.fullName}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground block mb-0.5 font-medium">Email Address</span>
                                      <span className="font-medium text-foreground truncate block">{selectedOrder.address.email || 'N/A'}</span>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-xs text-muted-foreground block mb-0.5 font-medium">Shipping Address</span>
                                      <span className="text-foreground text-xs leading-relaxed font-medium">
                                        {selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.zipCode}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground block mb-0.5 font-medium">Payment Method</span>
                                      <span className="capitalize font-semibold inline-flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {selectedOrder.paymentMethod || 'cod'}
                                      </span>
                                    </div>
                                    {selectedOrder.paymentDetails?.upiId && (
                                      <div>
                                        <span className="text-xs text-muted-foreground block mb-0.5 font-medium">UPI ID Reference</span>
                                        <span className="text-primary font-mono text-xs font-semibold">{selectedOrder.paymentDetails.upiId}</span>
                                      </div>
                                    )}
                                    {selectedOrder.cancel_reason && (
                                      <div className="col-span-2 bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">
                                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mb-0.5">Cancellation Reason</span>
                                        <span className="text-rose-600 dark:text-rose-400 text-xs italic">{selectedOrder.cancel_reason}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="border-t border-border/40 pt-4">
                                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground mb-3">Order Summary</h4>
                                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                                      {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-border/30 last:border-0">
                                          <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{item.name}</span>
                                            <span className="text-xs text-muted-foreground font-medium">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</span>
                                          </div>
                                          <span className="font-semibold text-foreground">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex justify-between items-center font-extrabold text-base border-t border-border/40 pt-4 mt-3 text-foreground">
                                      <span>Total Amount</span>
                                      <span className="text-primary text-lg">₹{selectedOrder.total_amount.toLocaleString('en-IN')}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Select onValueChange={(val: string) => updateOrderStatus(order.id, val)} defaultValue={order.status}>
                            <SelectTrigger className="w-[125px] h-8 text-xs font-semibold border-border/60 cursor-pointer">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No orders recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Users */}
        <TabsContent value="users" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Customer Database</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Toggle administrative access or review accounts</p>
          </div>

          <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm bg-card/30 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40 dark:bg-zinc-900/40">
                  <TableRow>
                    <TableHead className="py-4">Name</TableHead>
                    <TableHead className="py-4">Email Address</TableHead>
                    <TableHead className="py-4">Access Level</TableHead>
                    <TableHead className="py-4">Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} className="hover:bg-muted/20 dark:hover:bg-zinc-900/20 transition-colors">
                      <TableCell className="font-semibold text-foreground py-4">{user.name}</TableCell>
                      <TableCell className="py-4 font-medium text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="py-4">
                        <button
                          onClick={() => toggleUserRole(user.id, user.role)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border shadow-sm cursor-pointer ${user.role === 'admin'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          {user.role === 'admin' ? 'Administrator' : 'Customer'}
                        </button>
                      </TableCell>
                      <TableCell className="py-4 text-xs text-muted-foreground font-semibold">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        No registered users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Custom Designs */}
        <TabsContent value="custom" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Printing Requests</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Manage custom fabric layout designs and mockups</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customDesigns.map((design) => (
              <div key={design.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <img src={design.image_url} alt="Custom Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white text-xs leading-relaxed">{design.description || "No description provided."}</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    {design.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-emerald-50 shadow-sm border border-emerald-400/20 capitalize">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </span>
                    )}
                    {design.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-amber-50 shadow-sm border border-amber-400/20 capitalize">
                        <AlertCircle className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                    {design.status === 'processing' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500 text-blue-50 shadow-sm border border-blue-400/20 capitalize animate-pulse">
                        <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
                        Processing
                      </span>
                    )}
                    {design.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500 text-rose-50 shadow-sm border border-rose-400/20 capitalize">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="mb-4">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 block mb-1">Design Spec</span>
                      <p className="text-sm font-semibold text-foreground/90 line-clamp-3 leading-relaxed">{design.description || "No description provided."}</p>
                    </div>

                    <div className="flex flex-col gap-2.5 mb-5 border-t border-border/40 pt-4 text-xs">
                      <div className="flex items-center gap-2 text-foreground/80">
                        <div className="p-1 bg-secondary rounded-md">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="font-bold">{design.user_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="p-1 bg-secondary rounded-md">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="truncate max-w-[180px] font-medium">{design.user_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="p-1 bg-secondary rounded-md">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{new Date(design.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-border/40 pt-4">
                    <Select onValueChange={(val: any) => updateCustomDesignStatus(design.id, val)} defaultValue={design.status}>
                      <SelectTrigger className="flex-1 h-9 text-xs font-semibold border-border/60 hover:bg-muted/50 transition-colors cursor-pointer">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer" onClick={() => handleDeleteCustomDesign(design.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {customDesigns.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground bg-card/20 rounded-2xl border border-dashed border-border/60">
                <Palette className="h-10 w-10 mx-auto mb-3 opacity-30 text-indigo-500" />
                <p className="text-sm font-semibold">No custom design requests found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 5: Reviews */}
        <TabsContent value="reviews" className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Customer Reviews</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Moderate or remove customer satisfaction reviews</p>
          </div>

          <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm bg-card/30 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40 dark:bg-zinc-900/40">
                  <TableRow>
                    <TableHead className="py-4">Product</TableHead>
                    <TableHead className="py-4">Customer</TableHead>
                    <TableHead className="py-4">Rating</TableHead>
                    <TableHead className="w-[45%] py-4">Comment</TableHead>
                    <TableHead className="py-4">Date</TableHead>
                    <TableHead className="py-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review: any) => (
                    <TableRow key={review.id} className="hover:bg-muted/20 dark:hover:bg-zinc-900/20 transition-colors">
                      <TableCell className="font-semibold text-primary py-4">{review.product_name}</TableCell>
                      <TableCell className="py-4 font-semibold text-foreground/80">{review.user_name}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1 text-sm font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 px-2 py-0.5 rounded-full w-fit">
                          <span>{review.rating}</span>
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 italic font-medium">"{review.comment}"</p>
                      </TableCell>
                      <TableCell className="py-4 text-xs text-muted-foreground font-semibold">
                        {new Date(review.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer transition-colors"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reviews.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        No product reviews submitted yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 6: Subscribers */}
        <TabsContent value="subscribers" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Newsletter Subscribers</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Collect and export mailing list emails</p>
            </div>
            <Button variant="outline" onClick={() => {
              const emails = subscribers.map(s => s.email).join(', ');
              navigator.clipboard.writeText(emails);
              toast.success("Copied all emails to clipboard!");
            }} className="cursor-pointer font-semibold border-border/60 hover:bg-muted/50 transition-colors">
              Copy All Emails
            </Button>
          </div>

          <div className="border border-border/50 rounded-xl overflow-hidden shadow-sm bg-card/30 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40 dark:bg-zinc-900/40">
                  <TableRow>
                    <TableHead className="py-4">Mailing Address</TableHead>
                    <TableHead className="py-4">Subscription Date</TableHead>
                    <TableHead className="py-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((sub: any) => (
                    <TableRow key={sub.id} className="hover:bg-muted/20 dark:hover:bg-zinc-900/20 transition-colors">
                      <TableCell className="font-semibold text-foreground/90 py-4 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{sub.email}</span>
                      </TableCell>
                      <TableCell className="py-4 text-xs text-muted-foreground font-semibold">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer transition-colors"
                          onClick={() => handleDeleteSubscriber(sub.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subscribers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                        No newsletter subscribers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <div className="flex flex-col gap-1.5 mb-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Page Modification</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">Modify website content text instantly without touching code.</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {PAGE_SECTIONS.map(section => (
              <button
                key={section.pageId}
                onClick={() => setActivePageSection(section.pageId)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                  activePageSection === section.pageId 
                    ? 'bg-foreground text-background border-foreground shadow-sm' 
                    : 'bg-card border-border hover:border-foreground/30 hover:bg-muted/50 text-muted-foreground'
                }`}
              >
                {section.icon}
                {section.label}
                {hasUnsavedChanges(section.pageId) && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse ml-1" />
                )}
              </button>
            ))}
          </div>

          {PAGE_SECTIONS.filter(s => s.pageId === activePageSection).map(section => (
            <Card key={section.pageId} className="border-border/50 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-border/50 bg-muted/20 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {section.icon}
                    {section.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                </div>
                <Button 
                  onClick={() => handleSavePageContent(section.pageId)}
                  disabled={savingPages || !hasUnsavedChanges(section.pageId)}
                  className="font-bold text-sm h-10 px-5 transition-all shadow-sm flex-shrink-0"
                >
                  {savingPages ? (
                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                  )}
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {section.fields.map(field => (
                  <div key={field.key} className="space-y-2 max-w-3xl">
                    <label className="flex items-center justify-between text-sm font-semibold text-foreground/90">
                      <span className="flex items-center gap-1.5">
                        {field.type === 'textarea' ? <AlignLeft className="h-3.5 w-3.5 text-muted-foreground/60" /> : <Type className="h-3.5 w-3.5 text-muted-foreground/60" />}
                        {field.label}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground/40 bg-muted/50 px-1.5 py-0.5 rounded">{field.key}</span>
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={getContentValue(section.pageId, field.key)}
                        onChange={e => setContentValue(section.pageId, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 min-h-[100px] resize-y placeholder:text-muted-foreground/40"
                      />
                    ) : (
                      <Input
                        value={getContentValue(section.pageId, field.key)}
                        onChange={e => setContentValue(section.pageId, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="h-10 border-input bg-background focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

      </Tabs>
    </div>
  );
};
