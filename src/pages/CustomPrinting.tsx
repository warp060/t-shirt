import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Send, Image as ImageIcon, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export const CustomPrinting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a design");
      navigate('/auth');
      return;
    }
    if (!image) {
      toast.error("Please upload an image first");
      return;
    }

    console.log("Submitting custom design:", {
      userId: user.id,
      imageLength: image.length,
      description
    });

    setLoading(true);
    try {
      await api.post('/custom-designs', {
        userId: user.id,
        imageUrl: image,
        description
      });
      setSubmitted(true);
      toast.success("Design submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit design");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold">Design Submitted!</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Our team will review your design and get back to you via email within 24 hours with a quote and preview.
          </p>
          <Button onClick={() => navigate('/products')} variant="outline" className="mt-4">
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Header */}
      <section className="bg-neutral-50 dark:bg-neutral-900/50 py-16 sm:py-24 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4" variant="secondary">Personalized Apparel</Badge>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">Custom T-Shirt Printing</h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
                Bring your ideas to life! Upload your design, and we'll print it on our premium quality T-shirts with professional-grade precision.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="h-2 bg-primary w-full" />
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl">Submit Your Design</CardTitle>
                <CardDescription className="text-base">Upload an image (PNG, JPG) and tell us about your vision.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="sr-only">Choose design image</span>
                      <div className={`relative border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-accent/50 group ${image ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {image ? (
                          <div className="relative w-full max-w-md aspect-square sm:aspect-video rounded-2xl overflow-hidden shadow-xl ring-4 ring-primary/10">
                            <img src={image} alt="Preview" className="w-full h-full object-contain bg-white" />
                            <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-white font-bold bg-primary/80 px-4 py-2 rounded-lg">Change Image</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Upload className="w-10 h-10 text-primary" />
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-xl mb-1">Click to upload or drag & drop</p>
                              <p className="text-muted-foreground">High resolution PNG, JPG or WebP (max. 10MB)</p>
                            </div>
                          </>
                        )}
                      </div>
                    </label>

                    <div className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Design Details (Optional)</label>
                      <textarea
                        className="w-full min-h-[150px] rounded-2xl border border-input bg-background/50 px-5 py-4 text-base focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                        placeholder="Tell us about the placement (front/back), T-shirt color preference, or any special requests..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-xl font-black shadow-xl shadow-primary/30 gap-3 group" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing Design...
                      </span>
                    ) : (
                      <>
                        <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Submit Design Request
                      </>
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    By submitting, you agree to our Custom Order Terms & Conditions.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none bg-primary text-primary-foreground shadow-2xl overflow-hidden relative p-2">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Zap className="w-32 h-32" />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">The Abbas Advantage</CardTitle>
                <CardDescription className="text-primary-foreground/70">Why creators trust our printing service.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pb-8">
                {[
                  { icon: ShieldCheck, title: "Premium Quality", desc: "High-GSM 100% combed cotton T-shirts that feel as good as they look." },
                  { icon: Zap, title: "Fast Turnaround", desc: "Quotes within 24h and printing within 3-5 business days." },
                  { icon: ImageIcon, title: "High-Def Prints", desc: "Latest DTG technology for vibrant, soft-feel, long-lasting colors." }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{item.title}</p>
                      <p className="text-sm text-primary-foreground/80 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <div className="p-8 rounded-3xl border-2 border-dashed bg-accent/30 flex flex-col gap-6 text-center">
              <div className="space-y-2">
                <h3 className="font-bold text-xl">Need design help?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Our in-house design experts can help you refine your artwork for the best print results.</p>
              </div>
              <Button variant="outline" className="w-full h-12 font-bold rounded-xl border-primary text-primary hover:bg-primary hover:text-white">
                Chat with a Designer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-neutral-50 dark:bg-neutral-900/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-16 tracking-tight">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Upload Design", desc: "Upload your high-resolution artwork and provide any specific placement details." },
              { step: "02", title: "Review & Quote", desc: "Our team reviews your design and sends a digital preview and custom quote within 24 hours." },
              { step: "03", title: "Print & Deliver", desc: "Once approved, we print your T-shirts using premium inks and ship them to your doorstep." }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="text-8xl font-black text-primary/5 absolute -top-10 -left-4 group-hover:text-primary/10 transition-colors">{step.step}</div>
                <div className="relative z-10 space-y-4 pt-4">
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
