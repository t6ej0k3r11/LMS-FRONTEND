import {
  TvMinimalPlay,
  BookOpen,
  Compass,
  Menu,
  X,
  MessageCircle,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import logoImage from "@/assets/logo.jpg";
import NotificationDropdown from "../common/notification-dropdown";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  const navItems = [
    {
      label: "Explore Courses",
      action: () => navigate("/courses"),
      icon: <Compass className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "My Courses",
      action: () => navigate("/student-courses"),
      icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Messages",
      action: () => navigate("/chat"),
      icon: <MessageCircle className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Profile",
      action: () => navigate("/profile"),
      icon: <User className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  return (
    <header className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-6" role="banner">
      <div className="glass-effect rounded-3xl px-4 sm:px-8 py-5 sm:py-6 border border-white/50 shadow-[0_25px_65px_rgba(15,41,28,0.16)] overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="flex items-center gap-3 nav-link rounded-2xl px-2 py-1"
              aria-label="Go to home page"
            >
              <img
                src={logoImage}
                alt="DeshGory logo"
                className="h-10 w-10 rounded-2xl object-cover shadow-lg"
              />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">DeshGory</p>
                <p className="font-bold text-xl text-foreground">DeshGory</p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-3">
              <span className="chip">Nation Powered Learning</span>
              <span className="text-sm text-muted-foreground">
                Curated growth for students across Bangladesh
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <Button
              variant="soft"
              className="hidden sm:inline-flex text-xs sm:text-sm"
              onClick={() => navigate("/student-courses")}
            >
              Continue learning
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-2xl border border-white/60"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/40 pt-4">
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="secondary"
                size="sm"
                className="rounded-2xl bg-white/90 text-sm"
                onClick={() => {
                  item.action();
                  setMenuOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-muted-foreground shadow-inner">
              <TvMinimalPlay className="h-4 w-4 text-primary" />
              <span>2 new lessons unlocked today</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="rounded-2xl border-[hsla(var(--brand-red)/0.35)] text-[hsl(var(--brand-red))] hover:bg-[hsla(var(--brand-red)/0.08)]"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="mt-3 rounded-2xl border border-white/40 glass-effect p-4 space-y-3 md:hidden animate-slide-up">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action();
                setMenuOpen(false);
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
  );
}

export default StudentViewCommonHeader;
