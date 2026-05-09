import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, LogOut, Package, Heart, LayoutGrid, Shirt, Zap, Layers, Instagram, Twitter, Facebook, ChevronRight, Settings, Palette, Linkedin, MessageCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { Button, buttonVariants } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from './ui/sheet';
import { api } from '../lib/api';
import { cn } from '../lib/utils';

const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} transition-all duration-300 group-hover:scale-110 drop-shadow-sm`}>
    <circle cx="50" cy="50" r="48" fill="#E8E9EB" />
    <path id="brandCurve" d="M 22,42 A 28,28 0 0,1 78,42" fill="none" />
    <text className="text-[6px] font-black uppercase tracking-[0.1em] fill-black/80">
      <textPath href="#brandCurve" startOffset="50%" textAnchor="middle">ABBAS THREADS</textPath>
    </text>
    <text x="50" y="72" textAnchor="middle" style={{ fontFamily: "'Times New Roman', Times, serif" }} className="text-[46px] font-bold fill-black">AT</text>
  </svg>
);

export const Navbar = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState<boolean | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  useEffect(() => {
    const checkApi = async () => {
      try {
        await api.get('/health');
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
    setSearchTerm('');
    setIsMobileSearchOpen(false);
    setIsSheetOpen(false);
  };

  const handleLogout = async () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {isMobileSearchOpen ? (
          <div className="flex-1 flex items-center gap-2 md:hidden animate-in slide-in-from-right duration-200">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(false)}>
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                type="search"
                placeholder="Search T-shirts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </form>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 md:gap-8">
              <Link to="/" className="flex items-center gap-2 md:gap-4 group">
                <Logo className="w-9 h-9 md:w-10 md:h-10" />
                <div className="hidden md:flex flex-col">
                  <span className="text-xl font-bold tracking-tight text-foreground leading-none uppercase">ABBAS THREADS</span>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-[0.25em] uppercase leading-none mt-1">
                    PREMIUM STORE
                  </span>
                </div>
              </Link>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link to="/products" className="transition-colors hover:text-primary">Shop All</Link>
                <Link to="/products?category=Men" className="transition-colors hover:text-primary">Men</Link>
                <Link to="/products?category=Women" className="transition-colors hover:text-primary">Women</Link>
                <Link to="/products?category=Oversized" className="transition-colors hover:text-primary">Oversized</Link>
                <Link to="/custom-printing" className="transition-colors hover:text-primary font-semibold text-primary/80">Our Service</Link>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="flex md:hidden"
                onClick={() => setIsMobileSearchOpen(true)}
                title="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
              <form onSubmit={handleSearch} className="hidden md:flex relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary" onClick={handleSearch} />
                <input
                  type="search"
                  placeholder="Search T-shirts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch(e as any);
                    }
                  }}
                  className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </form>

              <Link
                to="/cart"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
                title="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-[10px]">
                    {totalItems}
                  </Badge>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    to="/orders"
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden md:flex")}
                    title="My Orders"
                  >
                    <Package className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/profile"
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden md:flex")}
                    title="My Profile"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden md:flex")}
                      title="Admin Panel"
                    >
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </Link>
                  )}
                  <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="hidden md:flex">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Link to="/auth" className={buttonVariants({ size: "sm" })}>
                  Login
                </Link>
              )}

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger
                  render={
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  }
                />
                <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 flex flex-col">
                  <SheetHeader className="p-6 border-b text-left">
                    <Link to="/" className="flex items-center gap-4 group">
                      <Logo className="w-12 h-12" />
                      <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-foreground leading-none uppercase">ABBAS THREADS</span>
                        <span className="text-[10px] font-bold text-muted-foreground tracking-[0.25em] uppercase leading-none mt-1">
                          PREMIUM STORE
                        </span>
                      </div>
                    </Link>
                  </SheetHeader>

                  <div className="px-6 py-4 border-b bg-muted/30">
                    <form onSubmit={(e) => {
                      handleSearch(e);
                    }} className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="search"
                        placeholder="Search T-shirts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </form>
                  </div>

                  <div className="flex-1 overflow-y-auto py-6">
                    {user && (
                      <div className="px-6 mb-8">
                        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                              {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold truncate max-w-[150px]">
                                {profile?.full_name || 'Welcome Back!'}
                              </span>
                              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      <section className="px-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Collections</h3>
                        <div className="grid gap-1">
                          <MobileNavLink to="/products" icon={<LayoutGrid className="h-4 w-4" />} label="Shop All" />
                          <MobileNavLink to="/products?category=Men" icon={<Shirt className="h-4 w-4" />} label="Men" />
                          <MobileNavLink to="/products?category=Women" icon={<Shirt className="h-4 w-4" />} label="Women" />
                          <MobileNavLink to="/products?category=Oversized" icon={<Zap className="h-4 w-4" />} label="Oversized" />
                          <MobileNavLink to="/products?category=Printed" icon={<Layers className="h-4 w-4" />} label="Printed" />
                          <MobileNavLink to="/custom-printing" icon={<Palette className="h-4 w-4" />} label="Our Service" className="text-primary bg-primary/5" />
                        </div>
                      </section>

                      <section className="px-6">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Account</h3>
                        <div className="grid gap-1">
                          {user ? (
                            <>
                              <MobileNavLink to="/profile" icon={<User className="h-4 w-4" />} label="Profile" />
                              <MobileNavLink to="/orders" icon={<Package className="h-4 w-4" />} label="Orders" />
                              {isAdmin && (
                                <MobileNavLink to="/admin" icon={<Settings className="h-4 w-4" />} label="Admin Panel" className="text-primary font-semibold" />
                              )}
                            </>
                          ) : (
                            <Link to="/auth">
                              <Button className="w-full justify-start h-11 px-4 gap-3 rounded-lg">
                                <User className="h-4 w-4" />
                                Login / Signup
                              </Button>
                            </Link>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>

                  <div className="p-6 border-t bg-muted/20">
                    {user && (
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-11 px-4 gap-3 rounded-lg mb-6"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>
                    )}

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-center gap-4">
                        <a href="https://instagram.com/_.abu._0" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background border border-border hover:border-primary/50 hover:text-primary transition-all">
                          <Instagram className="h-4 w-4" />
                        </a>
                        <a href="https://wa.me/919036122083" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background border border-border hover:border-primary/50 hover:text-[#25D366] transition-all">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background border border-border hover:border-primary/50 hover:text-[#0A66C2] transition-all">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest">
                        Abbas Threads © 2026
                      </p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

const MobileNavLink = ({ to, icon, label, className = "" }: { to: string, icon: React.ReactNode, label: string, className?: string }) => (
  <SheetClose
    render={
      <Link
        to={to}
        className={cn(
          "flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-all duration-200 group",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground group-hover:text-primary transition-colors">
            {icon}
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </Link>
    }
  />
);

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-4 group">
              <Logo className="w-12 h-12" />
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground leading-none uppercase">ABBAS THREADS</span>
                <span className="text-[10px] font-bold text-muted-foreground tracking-[0.25em] uppercase leading-none mt-1">
                  PREMIUM STORE
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium quality T-shirts designed for comfort and style. Express yourself with our unique prints and fits.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Shop</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link to="/products?category=Men" className="hover:text-primary transition-colors">Men's Collection</Link></li>
              <li><Link to="/products?category=Women" className="hover:text-primary transition-colors">Women's Collection</Link></li>
              <li><Link to="/products?category=Oversized" className="hover:text-primary transition-colors">Oversized Fit</Link></li>
              <li><Link to="/products?category=Printed" className="hover:text-primary transition-colors">Graphic Tees</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Support</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Connect</h3>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <a href="https://instagram.com/_.abu._0" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-background border border-border hover:border-primary/50 hover:text-primary hover:-translate-y-1 transition-all">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://wa.me/919036122083" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-background border border-border hover:border-primary/50 hover:text-[#25D366] hover:-translate-y-1 transition-all">
                  <MessageCircle className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-background border border-border hover:border-primary/50 hover:text-[#0A66C2] hover:-translate-y-1 transition-all">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">Follow us for latest updates and drops.</p>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <p>© 2026 Developed by Mohammed Abbas R.Y | All rights reserved</p>
          <a
            href="https://wa.me/916369906810"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1 font-medium transition-all hover:translate-x-1"
          >
            Need a business website? Let's build it <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};
