import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { useNavDestinations, isPathActive } from "./nav-items";

/**
 * Tablet-only vertical sidebar (768px - 1024px). Icons plus text labels.
 * AppShell offsets page content so this never overlaps.
 */
export const SideNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, primary, secondary, adminItems } = useNavDestinations();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error signing out", description: error.message, variant: "destructive" });
    } else {
      navigate("/auth");
    }
  };

  const items = [
    ...primary,
    { to: "/notifications", label: "Notifications", icon: Bell },
    ...adminItems,
  ];

  const renderItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) => {
    const isActive = isPathActive(pathname, to);
    return (
      <li key={to}>
        <Link
          to={to}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            isActive
              ? "bg-primary/10 font-semibold text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span className="relative flex-shrink-0">
            <Icon className="h-5 w-5" />
            {to === "/notifications" && unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-2 -top-1 flex h-4 min-w-[1rem] items-center justify-center p-0 text-[10px] leading-none"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </span>
          <span className="truncate">{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside
      aria-label="Primary"
      className="fixed bottom-0 left-0 top-[calc(3.5rem+env(safe-area-inset-top))] z-40 hidden w-56 flex-col border-r bg-card md:flex lg:hidden"
    >
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">{items.map(renderItem)}</ul>
        <div className="my-3 border-t" />
        <ul className="space-y-1">{secondary.map(renderItem)}</ul>
      </nav>

      <div className="border-t p-3">
        <Link
          to="/profile"
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
        >
          <UserAvatar className="h-9 w-9" src={profile?.avatar_url} name={profile?.full_name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{profile?.full_name || "My Profile"}</p>
            <p className="text-xs text-muted-foreground">View profile</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
