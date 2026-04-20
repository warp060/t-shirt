import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, LogOut, Package, Heart } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

export const Navbar = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleLogout = async () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tighter text-primary">ABBAS THREADS</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/products" className="transition-colors hover:text-primary">Shop All</Link>
            <Link to="/products?category=Men" className="transition-colors hover:text-primary">Men</Link>
            <Link to="/products?category=Women" className="transition-colors hover:text-primary">Women</Link>
            <Link to="/products?category=Oversized" className="transition-colors hover:text-primary">Oversized</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary" onClick={handleSearch} />
            <input
              type="search"
              placeholder="Search T-shirts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </form>

          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-[10px]">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/orders">
                <Button variant="ghost" size="icon" title="My Orders">
                  <Package className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="icon" title="My Profile">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm">Login</Button>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/products" className="text-lg font-medium">Shop All</Link>
                <Link to="/products?category=Men" className="text-lg font-medium">Men</Link>
                <Link to="/products?category=Women" className="text-lg font-medium">Women</Link>
                <Link to="/products?category=Oversized" className="text-lg font-medium">Oversized</Link>
                <Link to="/products?category=Printed" className="text-lg font-medium">Printed</Link>
                <hr />
                {user ? (
                  <>
                    <Link to="/profile" className="text-lg font-medium">Profile</Link>
                    <Link to="/orders" className="text-lg font-medium">Orders</Link>
                    {isAdmin && <Link to="/admin" className="text-lg font-medium text-primary">Admin Panel</Link>}
                    <Button variant="outline" onClick={handleLogout} className="w-full justify-start">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/auth">
                    <Button className="w-full">Login / Signup</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <span className="text-xl font-bold tracking-tighter">ABBAS THREADS</span>
            <p className="text-sm text-muted-foreground">
              Premium quality T-shirts designed for comfort and style. Express yourself with our unique prints and fits.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Shop</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link to="/products?category=Men">Men's Collection</Link></li>
              <li><Link to="/products?category=Women">Women's Collection</Link></li>
              <li><Link to="/products?category=Oversized">Oversized Fit</Link></li>
              <li><Link to="/products?category=Printed">Graphic Tees</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Support</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/shipping">Shipping Policy</Link></li>
              <li><Link to="/returns">Returns & Exchanges</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Connect</h3>
            <div className="flex gap-4">
              {/* Social icons would go here */}
              <span className="text-sm text-muted-foreground">Follow us on Instagram, Twitter, and Facebook for updates.</span>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Abbas Threads. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
