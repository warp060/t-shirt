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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Custom T-Shirt Printing</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Bring your ideas to life! Upload your design, and we'll print it on our premium quality T-shirts with professional-grade precision.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Submit Your Design</CardTitle>
                <CardDescription>Upload an image (PNG, JPG) and tell us about your vision.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="sr-only">Choose design image</span>
                      <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent/50 ${image ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}`}>
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {image ? (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                            <img src={image} alt="Preview" className="w-full h-full object-contain" />
                            <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                              <Upload className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-center">
                              <p className="font-semibold text-lg">Click to upload or drag & drop</p>
                              <p className="text-sm text-muted-foreground">PNG, JPG or WebP (max. 10MB)</p>
                            </div>
                          </>
                        )}
                      </div>
                    </label>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Design Details (Optional)</label>
                      <textarea
                        className="w-full min-h-[120px] rounded-xl border border-input bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Tell us about the placement, T-shirt color preference, or any special requests..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 gap-2" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Design Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none bg-primary text-primary-foreground shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-24 h-24" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Why Choose Us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Premium Quality</p>
                    <p className="text-sm opacity-80">High-GSM 100% cotton T-shirts that feel as good as they look.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Zap className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Fast Turnaround</p>
                    <p className="text-sm opacity-80">Quotes within 24h and printing within 2-3 business days.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ImageIcon className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold">High-Def Prints</p>
                    <p className="text-sm opacity-80">Latest DTG technology for vibrant, long-lasting colors.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 rounded-2xl border border-dashed flex flex-col gap-4 text-center">
              <h3 className="font-bold">Need help with your design?</h3>
              <p className="text-sm text-muted-foreground">Our design experts can help you refine your vision. Chat with us on WhatsApp for instant help.</p>
              <Button variant="outline" className="w-full">Chat with Designer</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
