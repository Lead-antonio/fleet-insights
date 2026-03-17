import { LayoutDashboard, Car, Settings, LogOut, UserCircle, Users, ChevronDown, UserCog, Shield, Lock, Truck, Layers, Map } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { permission } from 'process';
import { ProtectedAction } from '../auth/ProtectedAction';

export function AppSidebar() {
  const { can, isAdmin  } = usePermissions();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [adminOpen, setAdminOpen] = useState(location.pathname === '/users' || location.pathname === '/roles' || location.pathname === '/permissions');
  const [settingsOpen, setSettingsOpen] = useState(location.pathname === '/settings' || location.pathname === '/audit');
  const [vehiculeOpen, setVehiculeOpen] = useState(location.pathname === '/vehicule-types' || location.pathname === '/vehicles');

  const handleLogout = async () => {
    await logout();
  };


  const menuItems = [
    { title: t.nav.dashboard, url: '/', icon: LayoutDashboard, permission: 'dashboard.read' },
    { title: t.profile.title, url: '/profile', icon: UserCircle, permission: 'user.profile' },
    { title: t.customer.title, url: '/customers', icon: UserCircle, permission: 'customer.read' },
  ];

  const adminSubItems = [
    { title: t.users.title, url: '/users', icon: Users, permission: 'user.read' },
    {title: t.roles.title, url: '/roles', icon: Shield, permission: 'role.read' },
    {title: t.permissions.title, url: '/permissions', icon: Lock, permission: 'permission.read' },
  ];

  const vehiculeSubItems = [
    {title: t.vehiculeTypes.title, url: '/vehicule-types', icon: Layers, permission: 'vehicule-type.read' },
    { title: t.nav.vehicles, url: '/vehicles', icon: Truck, permission: 'vehicle.read' },
  ];

  const settingSubItems = [
    {title: t.audit.title, url: '/audit', icon: Shield, permission: 'audit.read' },
    { title: t.nav.settings, url: '/settings', icon: Settings, permission: 'settings.read' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return isAdmin || can(item.permission);
  });

  const filteredAdminSubItems = adminSubItems.filter(item =>
    isAdmin || can(item.permission)
  );

  const filteredSettingSubItems = settingSubItems.filter(item =>
    isAdmin || can(item.permission)
  );

  const filteredVehiculeSubItems = vehiculeSubItems.filter(item => isAdmin || can(item.permission));

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg  flex items-center justify-center">
            <img src="/m-tec.png" alt="" />
          </div>
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
              {filteredMenuItems.map((item) => (
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

            <ProtectedAction permission={["vehicule.read", "vehicule-type.read"]} requiredAll={true}>
              <SidebarMenuItem className="list-none">
                  <Collapsible open={vehiculeOpen} onOpenChange={setVehiculeOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center gap-3">
                          <Car className="w-5 h-5" />
                          <span>{t.nav.vehicles}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu className="pl-4">
                        {filteredVehiculeSubItems.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={location.pathname === item.url}
                              className="w-full"
                            >
                              <NavLink to={item.url} className="flex items-center gap-3 rounded-lg transition-colors">
                                <item.icon className="w-5 h-5" />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
              </SidebarMenuItem>
            </ProtectedAction>

            <ProtectedAction permission={["user.profile", "role.read", "permission.read"]} requiredAll={true}>
              <SidebarMenuItem className="list-none">
                  <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center gap-3">
                          <UserCog className="w-5 h-5" />
                          <span>{t.users.manage_user}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu className="pl-4">
                        {filteredAdminSubItems.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={location.pathname === item.url}
                              className="w-full"
                            >
                              <NavLink to={item.url} className="flex items-center gap-3 rounded-lg transition-colors">
                                <item.icon className="w-5 h-5" />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
              </SidebarMenuItem>
            </ProtectedAction>

            <ProtectedAction permission={["audit.read", "settings.read"]} requiredAll={true}>
              <SidebarMenuItem className="list-none">
                  <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center gap-3">
                          <Settings className="w-5 h-5" />
                          <span>{t.settings.title}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenu className="pl-4">
                        {filteredSettingSubItems.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={location.pathname === item.url}
                              className="w-full"
                            >
                              <NavLink to={item.url} className="flex items-center gap-3 rounded-lg transition-colors">
                                <item.icon className="w-5 h-5" />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
              </SidebarMenuItem>
            </ProtectedAction>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenuButton asChild className="w-full" onClick={handleLogout}>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors cursor-pointer">
            <LogOut className="w-5 h-5" />
            <span>{t.nav.logout}</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
