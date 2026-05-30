import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  AppWindow,
  FileSearch,
  Sparkles,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BrandLogo } from "./brand-logo";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { firestoreService } from "@/lib/firebase/firestore.service";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Applications", url: "/apps", icon: AppWindow },
  { title: "Policy Analyzer", url: "/policy-analyzer", icon: FileSearch },
  { title: "AI Assistant", url: "/assistant", icon: Sparkles },
  { title: "Notifications", url: "/notifications", icon: Bell, badge: true },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Live unread notification count
  const { data: notifs = [] } = useQuery({
    queryKey: ["notifs"],
    queryFn: () => firestoreService.listNotifications(),
    refetchInterval: 30_000,
  });
  const unreadCount = notifs.filter((n) => !n.read).length;

  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        {collapsed ? <BrandLogo size="sm" /> : <BrandLogo size="md" />}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2.5">
                      <div className="relative shrink-0">
                        <item.icon className="h-4 w-4" />
                        {/* Notification badge on Bell icon */}
                        {"badge" in item && item.badge && unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-destructive text-[8px] text-white grid place-items-center font-bold leading-none">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>
                      {!collapsed && (
                        <span className="flex-1 flex items-center justify-between">
                          {item.title}
                          {"badge" in item && item.badge && unreadCount > 0 && (
                            <span className="ml-auto h-5 min-w-5 px-1 rounded-full bg-destructive text-[10px] text-white grid place-items-center font-bold">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 gap-2">
        {!collapsed && user && (
          <div className="glass rounded-lg p-2.5 text-xs">
            <div className="font-medium truncate">{user.displayName || user.email}</div>
            <div className="text-muted-foreground truncate">{user.email}</div>
          </div>
        )}
        <SidebarMenuButton
          onClick={async () => {
            await signOut();
            navigate({ to: "/login" });
          }}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
