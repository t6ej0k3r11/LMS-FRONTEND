import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/auth-context";
import { LogOut } from "lucide-react";
import logoImage from "@/assets/logo.jpg";
import { useContext } from "react";

function WaitingForApproval() {
  const { resetCredentials } = useContext(AuthContext);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  return (
    <div className="relative flex h-full min-h-screen bg-[radial-gradient(circle_at_top,_hsla(var(--brand-green)/0.18),_transparent_60%)]">
      <aside className="hidden lg:block w-64 glass-effect border-r border-white/20 px-6 py-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="DeshGory logo"
                className="h-12 w-12 rounded-2xl shadow-lg object-cover"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Instructor</p>
                <h2 className="text-2xl font-bold text-foreground">DeshGory</h2>
              </div>
            </div>
          </div>
          <nav className="space-y-2 sm:space-y-3">
            <Button
              className="w-full justify-start rounded-2xl transition-all duration-300 text-sm hover:scale-[1.01] bg-white/5 text-foreground hover:bg-white/20"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Instructor HQ</p>
              <h1 className="text-3xl font-bold text-foreground">Account Status</h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Your instructor application is being reviewed.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[hsl(var(--brand-green))] to-[hsl(var(--brand-red))] flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Waiting for Approval</h2>
                <p className="text-muted-foreground">
                  Your instructor account is under review. You will receive an email when approved.
                </p>
              </div>
              <Button onClick={handleLogout} variant="outline" className="rounded-2xl">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WaitingForApproval;