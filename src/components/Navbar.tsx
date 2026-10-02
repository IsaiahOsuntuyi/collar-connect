import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Search,
  BookOpen,
  Calendar,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  useUnreadNotificationCount,
  useGroupedNotifications,
  useMarkAllNotificationsRead,
  useClearAllNotifications,
} from "@/hooks/useNotifications";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationList } from "@/components/notifications/NotificationList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SearchDialog } from "@/components/SearchDialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MobileMenuSheet } from "@/components/layout/MobileMenuSheet";
import { useNavDestinations, isPathActive } from "@/components/layout/nav-items";

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
}

/** Desktop-only notification popover. */
const NotificationBell = ({ currentPath }: { currentPath: string }) => {
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: groups = [] } = useGroupedNotifications();
  const { mutate: markAllRead, isPending: markingAllRead } = useMarkAllNotificationsRead();
  const { mutate: clearAll, isPending: clearingAll } = useClearAllNotifications();
  const [open, setOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const hasNotifications = groups.length > 0;

  const handleClearAll = () => {
    clearAll(undefined, {
      onSuccess: () => setClearDialogOpen(false),
    });
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex flex-col items-center justify-center px-3 py-1 min-w-[80px] border-b-2 transition-colors hover:text-foreground relative",
              currentPath === "/notifications"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground"
            )}
            aria-label="Notifications"
          >
            <div className="relative">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-2 h-4 w-4 min-w-[1.05rem] flex items-center justify-center p-0 text-[10px] leading-none"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </div>
            <span className="text-xs mt-1">Notifications</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[22rem] p-0">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => markAllRead()}
                  disabled={markingAllRead}
                >
                  Mark all as read
                </Button>
              )}
              {hasNotifications && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => setClearDialogOpen(true)}
                  disabled={clearingAll}
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
          <NotificationList groups={groups.slice(0, 12)} compact onNavigate={() => setOpen(false)} />
          <div className="border-t px-3 py-2 text-center">
            <Link to="/notifications" onClick={() => setOpen(false)} className="text-sm text-primary hover:underline">
              See all notifications
            </Link>
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your notifications. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              disabled={clearingAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearingAll ? "Clearing..." : "Clear all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const NavItem = ({ to, icon: Icon, label, isActive }: NavItemProps) => (
  <Link
    to={to}
    className={cn(
      "flex flex-col items-center justify-center px-3 py-1 min-w-[80px] border-b-2 transition-colors hover:text-foreground",
      isActive ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
    )}
  >
    <Icon className="h-6 w-6" />
    <span className="text-xs mt-1">{label}</span>
  </Link>
);

/**
 * Top bar. Full navigation row on desktop (lg+); on phones and tablets it is a
 * slim strip (logo + search, plus the hamburger on phones) because navigation
 * lives in the bottom tab bar / left sidebar at those sizes.
 */
export const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const { profile, primary, adminItems } = useNavDestinations();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error signing out", description: error.message, variant: "destructive" });
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] sm:pl-[max(1rem,env(safe-area-inset-left))] sm:pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Left: Logo + Search */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link to="/feed" className="flex-shrink-0">
              <img
                src="/ngc-transparent-logo.png"
                alt="NextGen Collar"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              />
            </Link>
            <div className="hidden sm:block min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  className="pl-9 w-full max-w-[280px] md:w-[240px] lg:w-[280px] h-9 bg-muted/50 border-0 focus-visible:bg-background"
                  onClick={() => setSearchOpen(true)}
                  readOnly
                />
              </div>
            </div>
            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden h-9 w-9"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Desktop navigation (lg and up) */}
          <nav className="hidden lg:flex items-center h-full">
            {primary.map((item) => (
              <NavItem
                key={item.label}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={isPathActive(currentPath, item.to)}
              />
            ))}

            <NotificationBell currentPath={currentPath} />

            {adminItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={isPathActive(currentPath, item.to)}
              />
            ))}

            <div className="h-10 w-px bg-border mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center px-3 py-1 min-w-[80px] border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-colors">
                  <UserAvatar
                    className="h-6 w-6"
                    fallbackClassName="text-[10px]"
                    src={profile?.avatar_url}
                    name={profile?.full_name}
                  />
                  <span className="text-xs mt-1 flex items-center gap-0.5">
                    Me
                    <ChevronDown className="h-3 w-3" />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 p-3">
                  <UserAvatar
                    className="h-12 w-12"
                    fallbackClassName="text-sm"
                    src={profile?.avatar_url}
                    name={profile?.full_name}
                  />
                  <div>
                    <p className="font-semibold text-sm">{profile?.full_name || "My Profile"}</p>
                    <p className="text-xs text-muted-foreground">View profile</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/calendar" className="cursor-pointer">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/content-hub" className="cursor-pointer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Content Hub
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    Settings & Privacy
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-muted-foreground" onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Phone: hamburger menu for everything outside the bottom tab bar */}
          <MobileMenuSheet />
        </div>
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </header>
  );
};
