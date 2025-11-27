import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context/useAuth";
import {
  getProfileService,
  updateProfileService,
  uploadAvatarService
} from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  X,
  Camera,
  User,
  Globe,
  Github,
  Linkedin,
  Youtube,
  BookOpen,
  Award,
  Users,
  Star,
  Shield,
  Target
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

function EditProfilePage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    gender: "",
    dateOfBirth: "",
    avatar: "",
    website: "",
    linkedin: "",
    github: "",
    youtube: "",
    facebook: ""
  });

  const [roleStats, setRoleStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
    progress: 0,
    coursesCreated: 0,
    totalStudents: 0,
    earnings: 0,
    totalUsers: 0,
    totalCourses: 0,
    systemHealth: "Good",
    ratings: 0,
    skillLevel: "Beginner",
    lessonsUploaded: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (auth?.user) {
      loadProfileData();
    }
  }, [auth?.user]);

  const loadProfileData = async () => {
    try {
      const response = await getProfileService();
      if (response.success) {
        setRoleStats(response.data.roleData);
        setProfileData(prev => ({
          ...prev,
          ...response.data.user
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

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!profileData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (profileData.phone && !/^\+?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/[\s\-()]/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (profileData.website && !/^https?:\/\/.+/.test(profileData.website)) {
      newErrors.website = "Please enter a valid URL starting with http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateProfileService(profileData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        navigate(-1); // Go back to view profile
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      let errorMessage = "Failed to update profile";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
          setProfileData(prev => ({ ...prev, avatar: e.target.result }));
        };
        reader.readAsDataURL(file);

        // Upload to server
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await uploadAvatarService(formData);
        if (response.success) {
          const newAvatarUrl = response.data.secure_url;
          setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));
          toast({
            title: "Success",
            description: "Avatar uploaded successfully",
          });
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
    const roleConfig = {
      student: {
        label: "Student",
        gradient: "linear-gradient(135deg, #0A8F63 0%, #0FCF8A 100%)",
        bg: "bg-green-50",
        text: "text-green-700"
      },
      instructor: {
        label: "Instructor",
        gradient: "linear-gradient(135deg, #E32636 0%, #FF6A7A 100%)",
        bg: "bg-red-50",
        text: "text-red-700"
      },
      admin: {
        label: "Admin",
        gradient: "linear-gradient(135deg, #E32636 0%, #0A8F63 100%)",
        bg: "bg-purple-50",
        text: "text-purple-700"
      }
    };

    const config = roleConfig[auth?.user?.role] || roleConfig.student;

    return (
      <Badge
        className={`${config.bg} ${config.text} border-0 px-3 py-1 text-sm font-medium capitalize shadow-sm`}
        style={{ background: config.gradient }}
      >
        {config.label}
      </Badge>
    );
  };

  const renderRoleSpecificStats = () => {
    switch (auth?.user?.role) {
      case "student":
        return (
          <Card className="bg-gradient-to-br from-green-50/50 to-white border-green-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <BookOpen className="h-5 w-5" />
                Student Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Courses Enrolled</p>
                    <p className="text-lg font-semibold text-gray-900">{roleStats.enrolledCourses}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Courses Completed</p>
                    <p className="text-lg font-semibold text-gray-900">{roleStats.completedCourses}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Award className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Certificates</p>
                    <p className="text-lg font-semibold text-gray-900">{roleStats.certificates}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-lg font-semibold text-gray-900">{roleStats.progress}%</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Skill Level</p>
                <p className="text-lg font-semibold text-green-800">{roleStats.skillLevel}</p>
              </div>
            </CardContent>
          </Card>
        );

      case "instructor":
        return (
          <Card className="bg-gradient-to-br from-red-50/50 to-white border-red-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Users className="h-5 w-5" />
                Instructor Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <BookOpen className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Courses Created</p>
                    <p className="text-lg font-semibold text-gray-900">{roleStats.coursesCreated}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Users className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Students Taught</p>
                    <p className="text-lg font-semibold text-gray-900">{roleStats.totalStudents}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Star className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                    <p className="text-lg font-semibold text-gray-900">{roleStats.ratings || 4.8}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Target className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Lessons Uploaded</p>
                    <p className="text-lg font-semibold text-gray-900">{roleStats.lessonsUploaded || 0}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-red-100 to-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-lg font-semibold text-red-800">${roleStats.earnings}</p>
              </div>
            </CardContent>
          </Card>
        );

      case "admin":
        return (
          <Card className="bg-gradient-to-br from-purple-50/50 to-white border-purple-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Shield className="h-5 w-5" />
                Admin Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-lg font-semibold text-gray-900">{roleStats.totalUsers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Courses</p>
                    <p className="text-lg font-semibold text-gray-900">{roleStats.totalCourses}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">System Health</p>
                <p className="text-lg font-semibold text-purple-800">{roleStats.systemHealth}</p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-10 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse" style={{ background: "linear-gradient(135deg, #0A8F63, #0FCF8A)" }} />
        <div className="absolute top-24 left-[-60px] w-60 h-60 rounded-full blur-3xl opacity-15 animate-pulse" style={{ background: "linear-gradient(155deg, #E32636, #FF6A7A)" }} />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-white via-white to-green-50/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-transparent to-red-400/5" />
            <CardContent className="relative p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-red-400 opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-xl" />
                    <Avatar className="relative h-20 w-20 border-4 border-white shadow-2xl transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage src={profileData.avatar} alt={profileData.fullName} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                        {profileData.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 gradient-green hover:shadow-lg text-white shadow-lg"
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
                    <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                    <p className="text-lg text-gray-600">Update your personal information and preferences</p>
                    <div className="flex items-center gap-3">
                      {renderRoleBadge()}
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

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5 text-green-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    className={`transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.fullName ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className={`transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
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
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.phone ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                    Gender
                  </Label>
                  <Select value={profileData.gender} onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Globe className="h-5 w-5 text-blue-600" />
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    className={`transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.website ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && <p className="text-sm text-red-600">{errors.website}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
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
                    value={profileData.github}
                    onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
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
                    value={profileData.youtube}
                    onChange={(e) => setProfileData(prev => ({ ...prev, youtube: e.target.value }))}
                    className="transition-all duration-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="https://youtube.com/channel/yourchannel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Stats */}
          {renderRoleSpecificStats()}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="gradient-green text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfilePage;