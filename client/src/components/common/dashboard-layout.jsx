import { useContext, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate, Outlet, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { AuthContext } from "@/context/auth-context";
import logoImage from "@/assets/logo.jpg";
import NotificationDropdown from "../common/notification-dropdown";
import {
  Menu,
  X,
  User,
  LogOut,
  Home,
  BarChart3,
  BookOpen,
  Users,
  Shield,
  MessageCircle,
  FileQuestion,
  TvMinimalPlay,
  Compass,
} from "lucide-react";

function DashboardLayout({ userRole = "student" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetCredentials } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  // Helper function to navigate with tab parameter
  const navigateWithTab = (basePath, tab) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (tab) {
      newSearchParams.set("tab", tab);
    } else {
      newSearchParams.delete("tab");
    }
    const queryString = newSearchParams.toString();
    navigate(`${basePath}${queryString ? `?${queryString}` : ""}`);
  };

  // Role-specific navigation items
  const getNavigationItems = () => {
    const commonItems = [
      {
        label: "Home",
        action: () => navigateWithTab(userRole === "student" ? "/home" : `/${userRole}`, null),
        icon: <Home className="h-4 w-4" />,
        roles: ["student", "instructor", "admin"],
      },
      {
        label: "Messages",
        action: () => navigate("/chat"),
        icon: <MessageCircle className="h-4 w-4" />,
        roles: ["student", "instructor", "admin"],
      },
    ];

    const roleSpecificItems = {
      student: [
        {
          label: "Explore Courses",
          action: () => navigate("/courses"),
          icon: <Compass className="h-4 w-4" />,
        },
        {
          label: "My Courses",
          action: () => navigate("/student-courses"),
          icon: <BookOpen className="h-4 w-4" />,
        },
      ],
      instructor: [
        {
          label: "Dashboard",
          action: () => navigateWithTab(`/${userRole}`, "dashboard"),
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          label: "Courses",
          action: () => navigateWithTab(`/${userRole}`, "courses"),
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          label: "Quizzes",
          action: () => navigate(`/${userRole}/quiz-management`),
          icon: <FileQuestion className="h-4 w-4" />,
        },
      ],
      admin: [
        {
          label: "Dashboard",
          action: () => navigateWithTab(`/${userRole}`, "dashboard"),
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          label: "User Management",
          action: () => navigateWithTab(`/${userRole}`, "users"),
          icon: <Users className="h-4 w-4" />,
        },
        {
          label: "Course Approval",
          action: () => navigateWithTab(`/${userRole}`, "courses"),
          icon: <Shield className="h-4 w-4" />,
        },
      ],
    };

    const profileItem = {
      label: "Profile",
      action: () => navigate(`/${userRole}/profile`),
      icon: <User className="h-4 w-4" />,
      roles: ["student", "instructor", "admin"],
    };

    return [
      ...commonItems.filter(item => item.roles.includes(userRole)),
      ...(roleSpecificItems[userRole] || []),
      profileItem,
    ];
  };

  const navigationItems = getNavigationItems();

  const getRoleDisplayName = () => {
    switch (userRole) {
      case "student":
        return "Student";
      case "instructor":
        return "Instructor";
      case "admin":
        return "Admin";
      default:
        return "User";
    }
  };

  const getRoleTagline = () => {
    switch (userRole) {
      case "student":
        return "Curated growth for students across Bangladesh";
      case "instructor":
        return "Manage your cohorts and course performance";
      case "admin":
        return "Keep DeshGory humming with thoughtful oversight";
      default:
        return "Welcome to DeshGory";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_50%)]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-10 w-72 h-72 rounded-full blur-3xl opacity-40 animate-float" style={{ background: "linear-gradient(135deg, hsla(var(--brand-red)/0.3), hsla(var(--brand-gold)/0.4))" }} />
        <div className="absolute top-24 left-[-60px] w-60 h-60 rounded-full blur-3xl opacity-35 animate-float" style={{ background: "linear-gradient(155deg, hsla(var(--brand-green)/0.45), hsla(var(--brand-green-bright)/0.25))" }} />
      </div>

      {/* Header */}
      <header className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-6" role="banner">
        <div className="glass-effect rounded-3xl px-4 sm:px-8 py-5 sm:py-6 border border-white/50 shadow-[0_25px_65px_rgba(15,41,28,0.16)] overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to={userRole === "student" ? "/home" : `/${userRole}`}
                className="flex items-center gap-3 nav-link rounded-2xl px-2 py-1"
                aria-label="Go to dashboard"
              >
                <img
                  src={logoImage}
                  alt="DeshGory logo"
                  className="h-10 w-10 rounded-2xl object-cover shadow-lg"
                />
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{getRoleDisplayName()}</p>
                  <p className="font-bold text-xl text-foreground">DeshGory</p>
                </div>
              </Link>
              <div className="hidden md:flex items-center gap-3">
                <span className="chip">Nation Powered Learning</span>
                <span className="text-sm text-muted-foreground">
                  {getRoleTagline()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationDropdown />
              {userRole === "student" && (
                <Button
                  variant="soft"
                  className="hidden sm:inline-flex text-xs sm:text-sm"
                  onClick={() => navigate("/student-courses")}
                >
                  Continue learning
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-2xl border border-white/60"
                aria-label="Toggle menu"
                onClick={() => setSidebarOpen((prev) => !prev)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/40 pt-4">
            <nav className="hidden md:flex flex-wrap items-center gap-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.label}
                  variant="secondary"
                  size="sm"
                  className="rounded-2xl bg-white/90 text-sm"
                  onClick={item.action}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-3 text-sm">
              {userRole === "student" && (
                <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-muted-foreground shadow-inner">
                  <TvMinimalPlay className="h-4 w-4 text-primary" />
                  <span>2 new lessons unlocked today</span>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="rounded-2xl border-[hsla(var(--brand-red)/0.35)] text-[hsl(var(--brand-red))] hover:bg-[hsla(var(--brand-red)/0.08)]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {sidebarOpen && (
          <div className="mt-3 rounded-2xl border border-white/40 glass-effect p-4 space-y-3 md:hidden animate-slide-up">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setSidebarOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-3 bg-white/80 text-left text-sm font-medium text-foreground shadow-sm"
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
                <span className="text-muted-foreground">Go</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 animate-fade-in">
        <section className="mx-auto max-w-7xl w-full">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

DashboardLayout.propTypes = {
  userRole: PropTypes.oneOf(["student", "instructor", "admin"]),
};

export default DashboardLayout;