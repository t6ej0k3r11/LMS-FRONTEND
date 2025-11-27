import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context/useAuth";
import {
  getUserSettingsService,
  updateUserSettingsService,
  uploadProfilePictureService
} from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Save,
  Camera,
  User,
  Bell,
  Shield,
  Settings as SettingsIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

function AdminSettingsPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsData, setSettingsData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    role: "admin",
    notifications: {
      email: true,
      push: true
    }
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (auth?.user) {
      loadSettingsData();
    }
  }, [auth?.user]);

  const loadSettingsData = async () => {
    try {
      setIsLoading(true);
      const response = await getUserSettingsService();
      if (response.success) {
        setSettingsData({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          avatar: response.data.avatar || "",
          role: response.data.role || "admin",
          notifications: response.data.preferences || {
            email: true,
            push: true
          }
        });
      }
    } catch (error) {
      console.error("Error loading settings data:", error);
      toast({
        title: "Error",
        description: "Failed to load settings data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!settingsData.name?.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!settingsData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(settingsData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (settingsData.phone && !/^\+?[1-9][\d]{0,15}$/.test(settingsData.phone.replace(/[\s\-()]/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSettings = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        name: settingsData.name.trim(),
        phone: settingsData.phone || null,
        notifications: settingsData.notifications
      };

      const response = await updateUserSettingsService(updateData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Settings updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      let errorMessage = "Failed to update settings";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }

      try {
        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
          setSettingsData(prev => ({ ...prev, avatar: e.target.result }));
        };
        reader.readAsDataURL(file);

        // Upload to server
        const formData = new FormData();
        formData.append("profile", file);

        const response = await uploadProfilePictureService(formData);
        if (response.success) {
          const newAvatarUrl = response.data.secure_url;
          setSettingsData(prev => ({ ...prev, avatar: newAvatarUrl }));
          toast({
            title: "Success",
            description: "Profile picture uploaded successfully",
          });
        } else {
          // Revert to original avatar on error
          setSettingsData(prev => ({ ...prev, avatar: auth.user?.avatar || "" }));
          toast({
            title: "Error",
            description: response.message || "Failed to upload profile picture",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Avatar upload error:", error);
        // Revert to original avatar
        setSettingsData(prev => ({ ...prev, avatar: auth.user?.avatar || "" }));
        toast({
          title: "Error",
          description: "Failed to upload profile picture",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-10 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse" style={{ background: "linear-gradient(135deg, #8B5CF6, #A855F7)" }} />
        <div className="absolute top-24 left-[-60px] w-60 h-60 rounded-full blur-3xl opacity-15 animate-pulse" style={{ background: "linear-gradient(155deg, #0A8F63, #0FCF8A)" }} />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-white via-white to-purple-50/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 via-transparent to-green-400/5" />
            <CardContent className="relative p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-green-400 opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-xl" />
                    <Avatar className="relative h-20 w-20 border-4 border-white shadow-2xl transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage src={settingsData.avatar} alt={settingsData.name} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        {settingsData.name?.charAt(0)?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 gradient-mix hover:shadow-lg text-white shadow-lg"
                      onClick={() => document.getElementById('avatar-upload').click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
                    <p className="text-lg text-gray-600">Manage your administrative account preferences</p>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-100 text-purple-800 border-0 px-3 py-1 text-sm font-medium">
                        Admin
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5 text-purple-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={settingsData.name}
                    onChange={(e) => setSettingsData(prev => ({ ...prev, name: e.target.value }))}
                    className={`transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={settingsData.email}
                    onChange={(e) => setSettingsData(prev => ({ ...prev, email: e.target.value }))}
                    className={`transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={settingsData.phone}
                    onChange={(e) => setSettingsData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors.phone ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={settingsData.role}
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">Role cannot be changed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Bell className="h-5 w-5 text-blue-600" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settingsData.notifications.email}
                  onCheckedChange={(checked) => setSettingsData(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: checked }
                  }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={settingsData.notifications.push}
                  onCheckedChange={(checked) => setSettingsData(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Administration */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Shield className="h-5 w-5 text-red-600" />
                System Administration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Administrative Access</h4>
                <p className="text-sm text-blue-700">
                  As an administrator, you have full access to user management, course approvals,
                  system monitoring, and all administrative functions. Your settings are kept minimal
                  to maintain system security and focus on core administrative tasks.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/users")}
                  className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                >
                  <User className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/courses")}
                  className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                >
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Course Management
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="gradient-mix text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettingsPage;