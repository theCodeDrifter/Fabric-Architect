import { useLocation, Link } from "wouter";
import {
  Box,
  FileCode2,
  FolderOpen,
  BookOpen,
  Terminal,
  ShieldCheck,
  Activity,
  Rocket,
  Settings,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { SiGithub, SiDiscord } from "react-icons/si";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const mainNavItems = [
  { title: "Network Canvas", href: "/", icon: LayoutGrid },
  { title: "Validation Studio", href: "/validation", icon: ShieldCheck },
  { title: "Config Export", href: "/export", icon: FileCode2 },
  { title: "Templates", href: "/templates", icon: FolderOpen },
  { title: "Documentation", href: "/docs", icon: BookOpen },
];

const toolsNavItems = [
  { title: "CLI Generator", href: "/cli", icon: Terminal },
  { title: "Validator", href: "/validator", icon: ShieldCheck },
  { title: "Monitor", href: "/monitor", icon: Activity },
];

const managementNavItems = [
  { title: "Deployments", href: "/deployments", icon: Rocket },
  { title: "Configuration", href: "/configuration", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-black dark:bg-white">
            <Box className="w-5 h-5 text-white dark:text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-sidebar-foreground truncate">
              Fabric Architect
            </h1>
            <p className="text-xs text-muted-foreground">v1.0.0</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover-elevate rounded px-2">
                <span>Tools</span>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {toolsNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.href}
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Link href={item.href}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="cursor-pointer hover-elevate rounded px-2">
                <span>Management</span>
                <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.href}
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Link href={item.href}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center justify-center gap-4 px-4 py-3">
          <a 
            href="https://github.com/theCodeDrifter/Fabric-Architect" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded hover-elevate"
            data-testid="link-github"
          >
            <SiGithub className="w-5 h-5 text-muted-foreground" />
          </a>
          <a 
            href="https://github.com/theCodeDrifter/Fabric-Architect" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded hover-elevate"
            data-testid="link-discord"
          >
            <SiDiscord className="w-5 h-5 text-muted-foreground" />
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
