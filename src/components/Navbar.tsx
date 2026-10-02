import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal";
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
import { useNavDestinations, isPathActive } from "@/components/layout/nav-items";

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: groupedNotifications } = useGroupedNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const clearAll = useClearAllNotifications();

  const navItems = useNavDestinations();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-white text-lg">
              C
            </div>
            <span className="font-bold text-xl text-slate-900 hidden sm:inline-block">
              CollarConnect
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search collar connect..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white text-sm h-9 rounded-full"
            />
          </form>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(location.pathname, item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <NotificationList
                groupedNotifications={groupedNotifications}
                onMarkAllRead={() => markAllRead.mutate()}
                onClearAll={() => setClearDialogOpen(true)}
              />
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1 h-9 rounded-full hover:bg-slate-100">
                <UserAvatar className="w-7 h-7" />
                <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">Me</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-muted-foreground" onClick={handleSignOut}>
                Sign Out
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Clear Notifications Confirmation Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your notifications will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearAll.mutate();
                setClearDialogOpen(false);
              }}
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </header>
  );
};
