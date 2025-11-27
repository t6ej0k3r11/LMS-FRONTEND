import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context/useAuth";
import {
  getUserSettingsService,
  updateUserSettingsService,
  uploadProfilePictureService,
  uploadCoverImageService
} from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Save,
  Camera,
  User,
  Bell,
  CreditCard,
  Globe,
  Github,
  Youtube,
  Facebook
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

function InstructorSettingsPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsData, setSettingsData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    expertise: "",
    avatar: "",
    coverImage: "",
    socialLinks: {
      linkedin: "",
      github: "",
      youtube: "",
      facebook: ""
    },
    payout: {
      method: "",
      number: "",
      accountHolder: ""
    },
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
          bio: response.data.bio || "",
          expertise: response.data.expertise || "",
          avatar: response.data.avatar || "",
          coverImage: response.data.coverImage || "",
          socialLinks: response.data.socialLinks || {
            linkedin: "",
            github: "",
            youtube: "",
            facebook: ""
          },
          payout: response.data.payout || {
            method: "",
            number: "",
            accountHolder: ""
          },
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
        bio: settingsData.bio || null,
        expertise: settingsData.expertise || null,
        socialLinks: {
          linkedin: settingsData.socialLinks.linkedin || null,
          github: settingsData.socialLinks.github || null,
          youtube: settingsData.socialLinks.youtube || null,
          facebook: settingsData.socialLinks.facebook || null,
        },
        notifications: settingsData.notifications,
        payout: {
          method: settingsData.payout.method || null,
          number: settingsData.payout.number || null,
          accountHolder: settingsData.payout.accountHolder || null,
        }
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

  const handleCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for cover
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive"
        });
        return;
      }

      try {
        // Upload to server
        const formData = new FormData();
        formData.append("cover", file);

        const response = await uploadCoverImageService(formData);
        if (response.success) {
          const newCoverUrl = response.data.secure_url;
          setSettingsData(prev => ({ ...prev, coverImage: newCoverUrl }));
          toast({
            title: "Success",
            description: "Cover image uploaded successfully",
          });
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to upload cover image",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Cover upload error:", error);
        toast({
          title: "Error",
          description: "Failed to upload cover image",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-10 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse" style={{ background: "linear-gradient(135deg, #E32636, #FF6A7A)" }} />
        <div className="absolute top-24 left-[-60px] w-60 h-60 rounded-full blur-3xl opacity-15 animate-pulse" style={{ background: "linear-gradient(155deg, #0A8F63, #0FCF8A)" }} />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-white via-white to-red-50/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/5 via-transparent to-green-400/5" />
            <CardContent className="relative p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-green-400 opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-xl" />
                    <Avatar className="relative h-20 w-20 border-4 border-white shadow-2xl transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage src={settingsData.avatar} alt={settingsData.name} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-red-500 to-red-600 text-white">
                        {settingsData.name?.charAt(0)?.toUpperCase() || "I"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 gradient-red hover:shadow-lg text-white shadow-lg"
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
                    <h1 className="text-3xl font-bold text-gray-900">Instructor Settings</h1>
                    <p className="text-lg text-gray-600">Manage your account preferences and instructor profile</p>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-100 text-red-800 border-0 px-3 py-1 text-sm font-medium">
                        Instructor
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
                <User className="h-5 w-5 text-red-600" />
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
                    className={`transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
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
                    className={`transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
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
                    className={`transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${errors.phone ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise" className="text-sm font-medium text-gray-700">
                    Expertise/Subject Area
                  </Label>
                  <Input
                    id="expertise"
                    value={settingsData.expertise}
                    onChange={(e) => setSettingsData(prev => ({ ...prev, expertise: e.target.value }))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g., Web Development, Data Science"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Bio/About
                </Label>
                <Textarea
                  id="bio"
                  value={settingsData.bio}
                  onChange={(e) => setSettingsData(prev => ({ ...prev, bio: e.target.value }))}
                  className="transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  placeholder="Tell students about yourself, your experience, and what you teach..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Globe className="h-5 w-5 text-blue-600" />
                Social Links & Online Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Github className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={settingsData.socialLinks.linkedin}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Label>
                  <Input
                    id="github"
                    value={settingsData.socialLinks.github}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, github: e.target.value }
                    }))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Youtube className="h-4 w-4" />
                    YouTube
                  </Label>
                  <Input
                    id="youtube"
                    value={settingsData.socialLinks.youtube}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                    }))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="https://youtube.com/channel/yourchannel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={settingsData.socialLinks.facebook}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                    }))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payout Information */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <CreditCard className="h-5 w-5 text-green-600" />
                Payout Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payoutMethod" className="text-sm font-medium text-gray-700">
                    Payout Method
                  </Label>
                  <Select
                    value={settingsData.payout.method}
                    onValueChange={(value) => setSettingsData(prev => ({
                      ...prev,
                      payout: { ...prev.payout, method: value }
                    }))}
                  >
                    <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Select payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bkash">bKash</SelectItem>
                      <SelectItem value="nagad">Nagad</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolder" className="text-sm font-medium text-gray-700">
                    Account Holder Name
                  </Label>
                  <Input
                    id="accountHolder"
                    value={settingsData.payout.accountHolder}
                    onChange={(e) => setSettingsData(prev => ({
                      ...prev,
                      payout: { ...prev.payout, accountHolder: e.target.value }
                    }))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter account holder name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoutNumber" className="text-sm font-medium text-gray-700">
                  {settingsData.payout.method === "bank" ? "Account Number" : "Mobile Number"}
                </Label>
                <Input
                  id="payoutNumber"
                  value={settingsData.payout.number}
                  onChange={(e) => setSettingsData(prev => ({
                    ...prev,
                    payout: { ...prev.payout, number: e.target.value }
                  }))}
                  className="transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={settingsData.payout.method === "bank" ? "Enter account number" : "Enter mobile number"}
                />
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

          {/* Cover Image */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Camera className="h-5 w-5 text-purple-600" />
                Cover Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Upload a cover image for your instructor profile
                </Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('cover-upload').click()}
                    className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Choose Cover Image
                  </Button>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                  {settingsData.coverImage && (
                    <p className="text-sm text-green-600">Cover image uploaded successfully</p>
                  )}
                </div>
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
              className="gradient-red text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default InstructorSettingsPage;