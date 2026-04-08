import { Globe, Database, Swords, Cpu, Radar, Settings, Map, Rocket, ClipboardList, BookOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import caseLogo from "@/assets/CASE_Construction_logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { title: t("sidebar.dashboard"), url: "/", icon: Globe },
    { title: t("sidebar.portfolioDirectory"), url: "/portfolio", icon: Database },
    { title: t("sidebar.competitorBenchmarking"), url: "/benchmarking", icon: Swords },
    { title: t("sidebar.engineeringSubsystems"), url: "/subsystems", icon: Cpu },
    { title: t("sidebar.regionalIntelligence"), url: "/regional-intelligence", icon: Map },
    { title: t("sidebar.nextGenRoadmap"), url: "/next-gen-roadmap", icon: Rocket },
    { title: t("sidebar.fieldIntelligence"), url: "/field-intelligence", icon: ClipboardList },
    { title: t("sidebar.webScanner"), url: "/scanner", icon: Radar },
    { title: t("sidebar.platformGuide"), url: "/guide", icon: BookOpen },
    { title: t("sidebar.settings"), url: "/settings", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border px-4 py-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <img src={caseLogo} alt="CASE Construction" className="h-8 w-auto" />
            <div>
              <h1 className="text-sm font-bold tracking-wide text-foreground">CASE NEXUS</h1>
              <p className="text-[10px] text-muted-foreground">Portfolio Intelligence</p>
            </div>
          </div>
        ) : (
          <img src={caseLogo} alt="CASE Construction" className="h-8 w-8 object-contain mx-auto" />
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("sidebar.navigation")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50 transition-colors duration-200"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
