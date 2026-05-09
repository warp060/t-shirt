import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Product, Order, UserProfile, CustomDesign } from '../types';
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
import { Plus, Pencil, Trash2, Package, Users, ShoppingBag, LayoutDashboard, Palette, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

export const AdminPanel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [customDesigns, setCustomDesigns] = useState<CustomDesign[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
      toast.success('Review deleted');
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <LayoutDashboard className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your store products, orders, and users.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-4 mb-8">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">Revenue</CardTitle>
            <div className="text-primary font-bold hidden sm:block">₹</div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold truncate">₹{totalRevenue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6">
            <CardTitle className="text-[10px] sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">Avg Value</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold truncate">₹{avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="products" className="flex-1 sm:flex-none py-2 px-4">Products</TabsTrigger>
          <TabsTrigger value="orders" className="flex-1 sm:flex-none py-2 px-4">Orders</TabsTrigger>
          <TabsTrigger value="users" className="flex-1 sm:flex-none py-2 px-4">Users</TabsTrigger>
          <TabsTrigger value="custom" className="flex-1 sm:flex-none py-2 px-4">Custom Designs</TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1 sm:flex-none py-2 px-4">Reviews</TabsTrigger>
          <TabsTrigger value="subscribers" className="flex-1 sm:flex-none py-2 px-4">Subscribers</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Manage Products</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <Input placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                  <Input type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} required />
                  <Input placeholder="Image URL" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} required />
                  <Input type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} required />
                  <textarea 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    required
                  />
                  <select 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value as any})}
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Oversized">Oversized</option>
                    <option value="Printed">Printed</option>
                  </select>
                  <Button type="submit" className="w-full">Save Product</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell><img src={product.image_url} className="h-10 w-10 object-cover rounded" /></TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>₹{product.price.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}><Pencil className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>
                          {editingProduct && (
                            <form onSubmit={handleUpdateProduct} className="space-y-4">
                              <Input placeholder="Product Name" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
                              <Input type="number" placeholder="Price" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} required />
                              <Input placeholder="Image URL" value={editingProduct.image_url} onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})} required />
                              <Input type="number" placeholder="Stock" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} required />
                              <textarea 
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" 
                                placeholder="Description"
                                value={editingProduct.description}
                                onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                                required
                              />
                              <select 
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={editingProduct.category}
                                onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}
                              >
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                                <option value="Oversized">Oversized</option>
                                <option value="Printed">Printed</option>
                              </select>
                              <Button type="submit" className="w-full">Update Product</Button>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="orders">
          <h2 className="text-xl font-bold mb-6">Manage Orders</h2>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id}</TableCell>
                  <TableCell>{order.address.fullName}</TableCell>
                  <TableCell>₹{order.total_amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{order.paymentMethod || 'cod'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>View</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Order Details</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-muted-foreground">Order ID:</span>
                                <span className="font-mono">{selectedOrder.id}</span>
                                <span className="text-muted-foreground">Customer:</span>
                                <span>{selectedOrder.address.fullName}</span>
                                <span className="text-muted-foreground">Email:</span>
                                <span>{selectedOrder.address.email}</span>
                                <span className="text-muted-foreground">Address:</span>
                                <span>{selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.zipCode}</span>
                                <span className="text-muted-foreground">Payment:</span>
                                <span className="capitalize font-medium">{selectedOrder.paymentMethod || 'cod'}</span>
                                {selectedOrder.paymentDetails?.upiId && (
                                  <>
                                    <span className="text-muted-foreground">UPI ID:</span>
                                    <span className="text-primary font-mono">{selectedOrder.paymentDetails.upiId}</span>
                                  </>
                                )}
                                {selectedOrder.cancel_reason && (
                                  <>
                                    <span className="text-destructive font-semibold">Cancel Reason:</span>
                                    <span className="text-destructive italic col-span-2">{selectedOrder.cancel_reason}</span>
                                  </>
                                )}
                                {selectedOrder.return_reason && (
                                  <>
                                    <span className="text-orange-600 font-semibold">Return Reason:</span>
                                    <span className="text-orange-600 italic col-span-2">{selectedOrder.return_reason}</span>
                                  </>
                                )}
                              </div>
                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Items</h4>
                                <div className="space-y-2">
                                  {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                      <span>{item.name} (x{item.quantity})</span>
                                      <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between font-bold border-t pt-2 mt-2">
                                    <span>Total</span>
                                    <span>₹{selectedOrder.total_amount.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Select onValueChange={(val: string) => updateOrderStatus(order.id, val)}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="return_requested">Return Req</SelectItem>
                          <SelectItem value="returned">Returned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <h2 className="text-xl font-bold mb-6">User Management</h2>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.role === 'admin' ? 'destructive' : 'outline'}
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => toggleUserRole(user.id, user.role)}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <h2 className="text-xl font-bold mb-6">Custom Design Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customDesigns.map((design) => (
              <Card key={design.id} className="overflow-hidden border-none shadow-md bg-card/50">
                <div className="aspect-square relative group">
                  <img src={design.image_url} alt="Custom Design" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <p className="text-white text-xs text-center">{design.description || "No description provided."}</p>
                  </div>
                  <Badge className="absolute top-2 right-2 capitalize" variant={design.status === 'pending' ? 'secondary' : design.status === 'completed' ? 'default' : 'outline'}>
                    {design.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Description</p>
                    <p className="text-sm line-clamp-3">{design.description || "No description provided."}</p>
                  </div>
                  <div className="flex flex-col gap-2 mb-4 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{design.user_name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{design.user_email}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">Submitted: {new Date(design.created_at).toLocaleString()}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select onValueChange={(val: any) => updateCustomDesignStatus(design.id, val)} defaultValue={design.status}>
                      <SelectTrigger className="flex-1 h-8 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCustomDesign(design.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {customDesigns.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground">
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No custom design requests found.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="reviews">
          <h2 className="text-xl font-bold mb-6">Manage Reviews</h2>
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-[40%]">Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review: any) => (
                  <TableRow key={review.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-primary">{review.product_name}</TableCell>
                    <TableCell>{review.user_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-bold mr-1">{review.rating}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2 italic">"{review.comment}"</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10" 
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {reviews.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground">
                      No reviews found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="subscribers">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Manage Subscribers</h2>
            <Button variant="outline" onClick={() => {
              const emails = subscribers.map(s => s.email).join(', ');
              navigator.clipboard.writeText(emails);
              toast.success("Copied all emails to clipboard!");
            }}>
              Copy All Emails
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub: any) => (
                  <TableRow key={sub.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{sub.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10" 
                        onClick={() => handleDeleteSubscriber(sub.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {subscribers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-20 text-muted-foreground">
                      No subscribers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
