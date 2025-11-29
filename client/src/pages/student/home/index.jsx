import { useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { courseCategories } from "@/config";
import banner from "/banner-img.png";
import { StudentContext } from "@/context/student-context";
import { AuthContext } from "@/context/auth-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import {
  Sparkles,
  Users,
  Clock3,
  ArrowUpRight,
  ShieldCheck,
  Target,
} from "lucide-react";

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } = useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🧭 Navigate to Courses Page (by category)
  const handleNavigateToCoursesPage = (categoryId) => {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      category: [categoryId],
    };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/courses");
  };

  // 📘 Handle course click (navigate based on purchase)
  const handleCourseNavigate = async (courseId) => {
    try {
      const response = await checkCoursePurchaseInfoService(courseId, auth?.user?._id);

      if (response?.success) {
        if (response.data.enrolled) {
          navigate(`/course-progress/${courseId}`);
        } else {
          navigate(`/course/details/${courseId}`);
        }
      } else {
        console.warn("Course navigation failed:", response?.message);
      }
    } catch (error) {
      console.error("Error navigating course:", error);
    }
  };

  // 📦 Fetch all available courses
  useEffect(() => {
    async function fetchAllStudentViewCourses() {
      try {
        const response = await fetchStudentViewCourseListService();
        if (response?.success) {
          setStudentViewCoursesList(response.data);
        } else {
          console.warn("Failed to fetch courses:", response?.message);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }

    fetchAllStudentViewCourses();
  }, [setStudentViewCoursesList]);

  const highlightStats = useMemo(() => {
    const totalCourses = studentViewCoursesList?.length || 0;
    const totalHours = Math.max(120, totalCourses * 6);
    return [
      {
        label: "Certified Paths",
        value: `${Math.max(12, totalCourses)}+`,
        icon: ShieldCheck,
        description: "Industry-backed syllabuses",
      },
      {
        label: "Learner Community",
        value: "12.4K",
        icon: Users,
        description: "Active Bangladeshi students",
      },
      {
        label: "Guided Hours",
        value: `${totalHours}+`,
        icon: Clock3,
        description: "Interactive lessons",
      },
    ];
  }, [studentViewCoursesList?.length]);

  // =======================
  // 💻 JSX Rendering
  // =======================
  return (
    <div className="min-h-screen space-y-10 sm:space-y-14">
      {/* 🏠 Hero Section */}
      <section className="section-shell relative overflow-hidden">
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,_hsla(var(--brand-red)/0.25),_transparent_50%)]" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-primary shadow-inner">
              <Sparkles className="h-4 w-4 text-[hsl(var(--brand-red))]" />
              Crafted for Bangladesh
            </div>
            <div>
              <h1 className="text-balance text-4xl sm:text-5xl xl:text-6xl font-bold text-foreground">
                Modern Skills with a Bangladeshi Heart
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Join an inspired community of lifelong learners and master career-ready courses in Bangla and English, wrapped in a comforting national palette.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="btn-primary" onClick={() => navigate("/courses")}>
                Explore courses
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate("/student-courses")}>
                Continue learning
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {highlightStats.map(({ label, value, icon: Icon, description }) => (
                <div key={label} className="stats-card">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                  <p className="text-3xl font-bold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="relative rounded-[36px] bg-white/80 shadow-[0_40px_90px_rgba(3,106,78,0.18)] p-4">
              <div className="absolute -top-8 -right-6 h-32 w-32 rounded-full bg-[hsla(var(--brand-red)/0.3)] blur-3xl" />
              <img
                src={banner}
                alt="Learning banner"
                width={640}
                height={460}
                className="relative z-10 w-full rounded-[28px] object-cover"
              />
              <div className="relative z-10 -mt-10 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-lg">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    <p className="text-xs uppercase tracking-wide">Active Cohort</p>
                    <p className="text-lg font-semibold text-foreground">UX Strategy Lab</p>
                  </div>
                  <span className="rounded-full bg-[hsla(var(--brand-green)/0.12)] px-3 py-1 text-xs text-primary">
                    Live now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📚 Course Categories */}
      <section className="px-4 lg:px-0">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Discover</p>
            <h2 className="text-3xl font-bold text-foreground">Guided learning pathways</h2>
            <p className="text-muted-foreground">Choose a curated category and we will pre-fill the filters for you.</p>
          </div>
          <div className="grid-auto-fit">
            {courseCategories.map((categoryItem) => (
              <button
                key={categoryItem.id}
                onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
                className="brand-card flex items-center justify-between px-5 py-4 text-left transition-all duration-300 hover:translate-y-[-4px]"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Category</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{categoryItem.label}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-primary" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 Featured Courses */}
      <section className="px-4 lg:px-0" aria-labelledby="featured-courses-heading">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-2 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Featured</p>
            <h2 id="featured-courses-heading" className="text-3xl font-bold text-foreground">
              Trending cohorts this week
            </h2>
          </div>
          <div className="responsive-grid">
            {studentViewCoursesList?.length > 0 ? (
              studentViewCoursesList.map((courseItem) => (
                <div
                  key={courseItem._id}
                  onClick={() => handleCourseNavigate(courseItem._id)}
                  className="group relative cursor-pointer overflow-hidden rounded-[30px] border border-white/60 bg-white/80 p-0 shadow-[0_30px_60px_rgba(3,106,78,0.12)] transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={courseItem.image}
                      alt={courseItem.title}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = "/banner-img.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-primary">
                      {courseItem.category?.toUpperCase?.() || "Blended"}
                    </div>
                  </div>
                  <div className="space-y-3 px-5 py-6">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{courseItem.instructorName}</span>
                      <span className="flex items-center gap-1 text-primary">
                        <Target className="h-4 w-4" /> Guided
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground leading-snug">
                      {courseItem.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-muted-foreground">Investment</p>
                        <p className="text-2xl font-bold text-[hsl(var(--brand-green))]">
                          ৳{courseItem.pricing}
                        </p>
                      </div>
                      <Button size="sm" className="btn-primary">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="brand-card mx-auto max-w-xl space-y-3 p-6">
                  <h3 className="text-2xl font-semibold text-foreground">Courses are brewing</h3>
                  <p className="text-muted-foreground">
                    New Bangladesh-friendly cohorts are being crafted. Check back shortly for fresh drops!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🌱 Journey Section */}
      <section className="px-4 pb-12 lg:px-0">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-white/40 bg-white/85 p-6 sm:p-10 shadow-[0_35px_70px_rgba(27,55,41,0.15)]">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Journey</p>
            <h2 className="text-3xl font-bold text-foreground">Your learning pathway inside LMS Bangla</h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {["Enroll", "Practice", "Showcase"].map((phase, index) => (
              <div key={phase} className="rounded-[30px] border border-white/50 bg-white/80 p-6 text-left shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Phase {index + 1}</span>
                  <span className="timeline-accent block h-1.5 w-16 rounded-full" />
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-foreground">{phase}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {index === 0 && "Select a curated program and unlock mentor-guided cohorts."}
                  {index === 1 && "Complete hands-on activities, live quizzes, and group sessions."}
                  {index === 2 && "Build a professional showcase that highlights your learning journey."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudentHomePage;
