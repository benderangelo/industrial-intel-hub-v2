import { Globe, Database, Swords, Cpu, Radar, Settings, Map, Rocket, ClipboardList, BookOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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

const navItems = [
  { title: "Dashboard", url: "/", icon: Globe },
  { title: "Portfolio Directory", url: "/portfolio", icon: Database },
  { title: "Competitor Benchmarking", url: "/benchmarking", icon: Swords },
  { title: "Engineering Subsystems", url: "/subsystems", icon: Cpu },
  { title: "Regional Intelligence", url: "/regional-intelligence", icon: Map },
  { title: "Next Gen Roadmap", url: "/next-gen-roadmap", icon: Rocket },
  { title: "Field Intelligence", url: "/field-intelligence", icon: ClipboardList },
  { title: "Web Scanner", url: "/scanner", icon: Radar },
  { title: "Guia da Plataforma", url: "/guide", icon: BookOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

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
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Navigation</SidebarGroupLabel>
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
