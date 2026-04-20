import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { User, Mail, Calendar, Shield, Edit, Save, X, Package, Heart } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export const Profile = () => {
  const { user, profile, isAdmin, login } = useAuth(); // login is needed to update local session
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: profile?.name || '',
    email: profile?.email || ''
  });

  if (!user || !profile) {
    return <LoadingSpinner size="lg" text="Loading profile..." />;
  }

  const handleSave = async () => {
    if (!editData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/users/${user.id}`, editData);
      
      // Update local context
      const updatedUser = { ...user, ...editData };
      const token = localStorage.getItem('token') || '';
      login(updatedUser, token);

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async () => {
    const newRole = isAdmin ? 'customer' : 'admin';
    setLoading(true);
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      
      // Update local session
      const updatedUser = { ...user, role: newRole };
      const token = localStorage.getItem('token') || '';
      login(updatedUser, token);
      
      toast.success(`You are now an ${newRole}!`);
      window.location.reload(); // Refresh to update all context reliably
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle role");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: profile.name,
      email: profile.email
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Your account details and preferences
                  </CardDescription>
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.name}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{profile.role}</span>
                  {isAdmin && (
                    <Badge variant="default" className="ml-auto">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>

              {/* Join Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Member Since</label>
                <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Access your account features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/orders">
              <Button
                variant="outline"
                className="w-full justify-start"
              >
                <Package className="h-4 w-4 mr-2" />
                View Order History
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = '/cart'}
            >
              <Heart className="h-4 w-4 mr-2" />
              View Shopping Cart
            </Button>

            {isAdmin && (
              <>
                <div className="border-t my-3" />
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/admin'}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
            <CardDescription>
              Your account activity summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Status</span>
              <Badge variant="default">
                Active
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Type</span>
              <Badge variant={isAdmin ? "default" : "outline"}>
                {isAdmin ? "Administrator" : "Customer"}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Member For</span>
              <span className="text-sm font-medium">
                {Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>

            {isAdmin && (
              <>
                <div className="border-t my-4" />
                <Button 
                  variant="outline" 
                  className="w-full text-xs" 
                  onClick={handleToggleAdmin}
                  disabled={loading}
                >
                  {isAdmin ? "Switch to Customer View" : "Switch to Admin Mode (Dev)"}
                </Button>
              </>
            )}

            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Need help? Contact our support team</p>
              <p className="font-medium text-primary mt-1">support@abbasthreads.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};