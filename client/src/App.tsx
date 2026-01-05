import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import NetworkCanvasPage from "@/pages/network-canvas";
import ValidationStudioPage from "@/pages/validation-studio";
import DeploymentsPage from "@/pages/deployments";
import ConfigurationPage from "@/pages/configuration";
import TemplatesPage from "@/pages/templates";
import DocumentationPage from "@/pages/documentation";
import ExportPage from "@/pages/export";
import CLIGeneratorPage from "@/pages/cli-generator";
import ValidatorPage from "@/pages/validator";
import MonitorPage from "@/pages/monitor";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={NetworkCanvasPage} />
      <Route path="/validation" component={ValidationStudioPage} />
      <Route path="/deployments" component={DeploymentsPage} />
      <Route path="/configuration" component={ConfigurationPage} />
      <Route path="/templates" component={TemplatesPage} />
      <Route path="/docs" component={DocumentationPage} />
      <Route path="/export" component={ExportPage} />
      <Route path="/cli" component={CLIGeneratorPage} />
      <Route path="/validator" component={ValidatorPage} />
      <Route path="/monitor" component={MonitorPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-background sticky top-0 z-50">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
