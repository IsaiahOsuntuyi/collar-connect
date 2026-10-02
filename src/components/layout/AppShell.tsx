import { Navbar } from "@/components/Navbar";
import { SideNav } from "./SideNav";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Responsive application shell.
 * - Phone (<768px): slim top strip + fixed bottom tab bar + hamburger menu.
 * - Tablet (768-1024px): compact top strip + fixed left vertical sidebar.
 * - Desktop (>=1024px): full top navigation bar.
 *
 * Content offsets live here so individual pages need no navigation padding.
 */
export const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="min-h-screen min-h-[100dvh]">
      <Navbar />
      <SideNav />
      <div className="md:pl-56 md:pr-4 lg:pl-0 lg:pr-0">
        <div className="pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
};
