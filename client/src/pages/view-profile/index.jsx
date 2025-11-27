import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context/useAuth";
import { getProfileService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Edit3,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar as CalendarIcon,
  FileText,
  Globe,
  Github,
  Linkedin,
  BookOpen,
  Award,
  Users,
  Shield,
  ArrowLeft,
  Lock,
  Star,
  Trophy,
  Target
} from "lucide-react";

function ViewProfilePage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
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
    gender: "",
    dateOfBirth: "",
    socialLinks: {
      facebook: "",
      linkedin: "",
      github: "",
      website: ""
    }
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
    ratings: 0
  });

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-green-50/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Enrolled Courses</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleStats.enrolledCourses}</p>
              </div>
            </Card>
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-green-50/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Completed</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleStats.completedCourses}</p>
              </div>
            </Card>
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-green-50/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Certificates</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleStats.certificates}</p>
              </div>
            </Card>
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-green-50/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-green-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleStats.progress}%</p>
              </div>
            </Card>
          </div>
        );

      case "instructor":
        return (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-red-50/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-red-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-2">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Courses Created</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleStats.coursesCreated}</p>
              </div>
            </Card>
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-red-50/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-red-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Students</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleStats.totalStudents}</p>
              </div>
            </Card>
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-red-50/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-red-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-red-500 to-red-600 p-2">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Average Rating</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleStats.ratings || 4.8}</p>
              </div>
            </Card>
          </div>
        );

      case "admin":
        return (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-purple-50/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Users</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleStats.totalUsers}</p>
              </div>
            </Card>
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-purple-50/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-2">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Courses</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleStats.totalCourses}</p>
              </div>
            </Card>
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white to-purple-50/50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-2">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">System Health</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{roleStats.systemHealth}</p>
              </div>
            </Card>
          </div>
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

      <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-r from-white via-white to-green-50/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-transparent to-red-400/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-green-400/10 rounded-full blur-2xl" />
            <CardContent className="relative p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-red-400 opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-xl" />
                    <Avatar className="relative h-24 w-24 border-4 border-white shadow-2xl transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage src={profileData.avatar} alt={profileData.fullName} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                        {profileData.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">{profileData.fullName}</h1>
                    <p className="text-lg text-gray-600">{profileData.email}</p>
                    <div className="flex items-center gap-3">
                      {renderRoleBadge()}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Joined {auth?.user?.createdAt ? new Date(auth.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "Recently"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate(auth?.user?.role === 'student' ? '/profile/edit' : `/${auth?.user?.role}/profile/edit`)}
                    className="gradient-green text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/${auth?.user?.role}/profile/change-password`)}
                    className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Information Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-green-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Email</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 break-all">{profileData.email || "Not provided"}</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-green-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Phone</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{profileData.phone || "Not provided"}</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-green-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Location</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{profileData.location || "Not provided"}</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-green-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Gender</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{profileData.gender || "Not specified"}</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-green-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <CalendarIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Date of Birth</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : "Not provided"}
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-green-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardContent className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-2">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Bio</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{profileData.bio || "No bio provided"}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Links */}
        {(profileData.website || profileData.linkedin || profileData.github) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Links</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {profileData.website && (
                <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-2">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Website</span>
                    </div>
                    <a
                      href={profileData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:text-blue-700 break-all"
                    >
                      {profileData.website}
                    </a>
                  </CardContent>
                </Card>
              )}

              {profileData.linkedin && (
                <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-blue-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-2">
                        <Linkedin className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">LinkedIn</span>
                    </div>
                    <a
                      href={profileData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:text-blue-700 break-all"
                    >
                      LinkedIn Profile
                    </a>
                  </CardContent>
                </Card>
              )}

              {profileData.github && (
                <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-400/5 to-gray-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardContent className="relative p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 p-2">
                        <Github className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">GitHub</span>
                    </div>
                    <a
                      href={profileData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-gray-900 hover:text-gray-700 break-all"
                    >
                      GitHub Profile
                    </a>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Activity & Stats Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Activity & Statistics</h2>
          {renderRoleSpecificStats()}
        </div>
      </div>
    </div>
  );
}

export default ViewProfilePage;