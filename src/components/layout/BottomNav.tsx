import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { BOTTOM_NAV, isPathActive } from "./nav-items";

/**
 * Fixed mobile-only bottom tab bar (under 768px).
 * Content spacing is handled by AppShell so nothing sits underneath it.
 */
export const BottomNav = () => {
  const { pathname } = useLocation();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden"
    >
      <ul className="grid grid-cols-5">
        {BOTTOM_NAV.map(({ to, label, icon: Icon }) => {
          const isActive = isPathActive(pathname, to);
          const showBadge = to === "/notifications" && unreadCount > 0;

          return (
            <li key={to} className="min-w-0">
              <Link
                to={to}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-0.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 h-0.5 w-8 rounded-full transition-colors",
                    isActive ? "bg-primary" : "bg-transparent"
                  )}
                />
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  {showBadge && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-1 flex h-4 min-w-[1rem] items-center justify-center p-0 text-[10px] leading-none"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </span>
                <span className={cn("truncate text-[10px]", isActive && "font-semibold")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
