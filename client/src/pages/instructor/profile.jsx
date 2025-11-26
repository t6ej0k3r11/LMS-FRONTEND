import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context/useAuth";
import {
  getProfileService,
  updateProfileService,
  updateNotificationPreferencesService,
  uploadAvatarService
} from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Edit3,
  Camera,
  Globe,
  Github,
  Linkedin,
  BookOpen,
  Users,
  TrendingUp,
  Bell,
  Shield,
  Trash2,
  Save,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

function InstructorProfilePage() {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    avatar: "",
    socialLinks: {
      facebook: "",
      linkedin: "",
      github: "",
      website: ""
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      courseUpdates: true,
      marketingEmails: false
    }
  });

  const [roleStats, setRoleStats] = useState({
    coursesCreated: 0,
    totalStudents: 0,
    earnings: 0
  });

  useEffect(() => {
    if (auth?.user) {
      // Initialize profile data from auth user
      setProfileData(prev => ({
        ...prev,
        fullName: auth.user.userName || "",
        email: auth.user.userEmail || "",
        phone: auth.user.phone || "",
        bio: auth.user.bio || "",
        avatar: auth.user.avatar || ""
      }));

      // Load role-specific stats
      loadRoleStats();
    }
  }, [auth?.user]);

  const loadRoleStats = async () => {
    try {
      const response = await getProfileService();
      if (response.success) {
        setRoleStats(response.data.roleData);
        // Update profile data with fresh data from server
        setProfileData(prev => ({
          ...prev,
          ...response.data.user,
          preferences: response.data.user.preferences || prev.preferences
        }));
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await updateProfileService(profileData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setIsEditing(false);
        // Reload profile data
        loadRoleStats();
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      // Extract specific error message from response
      let errorMessage = "Failed to update profile";
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Display first validation error
          errorMessage = errorData.errors[0].message || errorData.errors[0];
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handlePreferenceChange = async (preferenceKey, checked) => {
    // Update local state immediately for UI responsiveness
    setProfileData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [preferenceKey]: checked }
    }));

    try {
      const response = await updateNotificationPreferencesService({
        ...profileData.preferences,
        [preferenceKey]: checked
      });
      if (response.success) {
        toast({
          title: "Success",
          description: "Notification preferences updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      // Revert the change on error
      setProfileData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [preferenceKey]: !checked }
      }));
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive"
      });
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileData(prev => ({ ...prev, avatar: e.target.result }));
        };
        reader.readAsDataURL(file);

        // Upload to server
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await uploadAvatarService(formData);
        if (response.success) {
          const newAvatarUrl = response.data.secure_url;
          // Update with permanent URL
          setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));

          // Save the avatar to profile
          try {
            await updateProfileService({ avatar: newAvatarUrl });
            toast({
              title: "Success",
              description: "Avatar uploaded and saved successfully",
            });
          } catch (profileError) {
            console.error("Error saving avatar to profile:", profileError);
            toast({
              title: "Warning",
              description: "Avatar uploaded but failed to save. Please save your profile manually.",
              variant: "destructive"
            });
          }
        } else {
          // Revert to original avatar on error
          setProfileData(prev => ({ ...prev, avatar: auth.user?.avatar || "" }));
          toast({
            title: "Error",
            description: response.message || "Failed to upload avatar",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Avatar upload error:", error);
        // Revert to original avatar
        setProfileData(prev => ({ ...prev, avatar: auth.user?.avatar || "" }));
        toast({
          title: "Error",
          description: "Failed to upload avatar",
          variant: "destructive"
        });
      }
    }
  };

  const renderRoleBadge = () => {
    return (
      <Badge className="bg-green-100 text-green-800 capitalize">
        {auth?.user?.role}
      </Badge>
    );
  };

  const renderRoleSpecificStats = () => {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="stats-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            Courses Created
          </div>
          <p className="text-2xl font-bold text-foreground">{roleStats.coursesCreated}</p>
        </Card>
        <Card className="stats-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            Total Students
          </div>
          <p className="text-2xl font-bold text-foreground">{roleStats.totalStudents}</p>
        </Card>
        <Card className="stats-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-primary" />
            Earnings
          </div>
          <p className="text-2xl font-bold text-foreground">${roleStats.earnings}</p>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.avatar} alt={profileData.fullName} />
                  <AvatarFallback className="text-lg">
                    {profileData.fullName?.charAt(0)?.toUpperCase() || "I"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
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
              <div>
                <h1 className="text-2xl font-bold text-foreground">{profileData.fullName}</h1>
                <p className="text-muted-foreground">{profileData.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  {renderRoleBadge()}
                  <span className="text-sm text-muted-foreground">
                    Joined {auth?.user?.createdAt ? new Date(auth.user.createdAt).toLocaleDateString() : "Recently"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-primary"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="edit">Edit Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Role-specific Stats */}
            {renderRoleSpecificStats()}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Published new course: Advanced React</p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Received 5-star review on JavaScript course</p>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed for security reasons</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={profileData.linkedin}
                      onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      value={profileData.github}
                      onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex gap-4">
                <Button onClick={handleSaveProfile} className="btn-primary">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={profileData.preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    checked={profileData.preferences.pushNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Course Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about course enrollments and reviews</p>
                  </div>
                  <Switch
                    checked={profileData.preferences.courseUpdates}
                    onCheckedChange={(checked) => handlePreferenceChange('courseUpdates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and newsletters</p>
                  </div>
                  <Switch
                    checked={profileData.preferences.marketingEmails}
                    onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Two-Factor Authentication
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" disabled>
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default InstructorProfilePage;