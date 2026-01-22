import { LayoutDashboard, Car, Fuel, AlertTriangle, Wrench, BarChart3, Settings, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { t } = useLanguage();
  const location = useLocation();

  const menuItems = [
    { title: t.nav.dashboard, url: '/', icon: LayoutDashboard },
    { title: t.nav.vehicles, url: '/vehicles', icon: Car },
    { title: t.nav.settings, url: '/settings', icon: Settings },
  ];

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {/* <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center"> */}
            {/* <Car className="w-6 h-6 text-white" /> */}
            <img className="w-10 h-10" src="/icon.png" alt="" />
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">M-TEC</h1>
            <p className="text-xs text-sidebar-foreground/60">Fleet Master</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="w-full"
                  >
                    <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenuButton asChild className="w-full">
          <NavLink to="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
            <LogOut className="w-5 h-5" />
            <span>{t.nav.logout}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
