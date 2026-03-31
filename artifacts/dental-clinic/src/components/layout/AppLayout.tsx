import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, Calendar, CalendarDays, Syringe, 
  Receipt, FileText, BarChart3, Settings, 
  LogOut, Menu, X, User as UserIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Treatments", href: "/treatments", icon: Syringe },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Staff", href: "/staff", icon: UserIcon },
  { name: "Settings", href: "/settings", icon: Settings },
];

const bottomNavItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Book", href: "/appointments", icon: Calendar },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "More", href: null, icon: Menu },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const logoSrc = user?.logoUrl || `${import.meta.env.BASE_URL}images/logo.png`;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <img
            src={logoSrc}
            alt="Logo"
            className="w-9 h-9 rounded-xl object-cover bg-primary/10"
            onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/logo.png`; }}
          />
          <span className="font-display font-bold text-base text-foreground leading-tight truncate max-w-[160px]">
            {user?.clinicName || "DentalSync"}
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-foreground rounded-xl hover:bg-muted transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Slide-over Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed right-0 inset-y-0 w-72 bg-card border-l border-border flex flex-col z-50 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="w-10 h-10 rounded-xl object-cover bg-primary/10"
                    onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/logo.png`; }}
                  />
                  <div>
                    <h2 className="font-display font-bold text-base text-foreground leading-tight truncate max-w-[150px]">
                      {user?.clinicName || "DentalSync"}
                    </h2>
                    <p className="text-xs text-muted-foreground">Admin Panel</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
                {navItems.map((item) => {
                  const isActive = location.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150
                        ${isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                      `}>
                        <item.icon size={19} />
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                  onClick={handleLogout}
                >
                  <LogOut size={15} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col flex-shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-border/50">
          <img
            src={logoSrc}
            alt="Logo"
            className="w-11 h-11 rounded-xl object-cover bg-primary/10 shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}images/logo.png`; }}
          />
          <div>
            <h2 className="font-display font-bold text-base text-foreground leading-tight truncate max-w-[150px]">
              {user?.clinicName || "DentalSync"}
            </h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href} className="block">
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150
                  ${isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                `}>
                  <item.icon size={18} className="flex-shrink-0" />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="bg-muted/50 rounded-xl p-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 h-8"
              onClick={handleLogout}
            >
              <LogOut size={14} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex h-14 bg-background/80 backdrop-blur-md border-b border-border items-center justify-between px-6 z-10 sticky top-0">
          <div className="text-sm text-muted-foreground capitalize font-medium">
            {location.split('/')[1] || 'Dashboard'}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{user?.name}</span>
            <span className="text-xs">·</span>
            <span>{user?.clinicName}</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 px-2 pb-safe">
        <div className="flex justify-around items-stretch h-16">
          {[
            { name: "Home", href: "/dashboard", icon: LayoutDashboard },
            { name: "Patients", href: "/patients", icon: Users },
            { name: "Appts", href: "/appointments", icon: Calendar },
            { name: "Billing", href: "/billing", icon: Receipt },
            { name: "Settings", href: "/settings", icon: Settings },
          ].map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href} className="flex-1">
                <div className={`flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {isActive && (
                    <div className="absolute w-10 h-1 bg-primary rounded-b-full" style={{ top: 0 }} />
                  )}
                  <item.icon size={20} className={isActive ? "text-primary" : ""} />
                  <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
