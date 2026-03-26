import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { NexusChat } from "@/components/NexusChat";
import { Topbar } from "@/components/Topbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy-loaded pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Benchmarking = lazy(() => import("./pages/Benchmarking"));
const Subsystems = lazy(() => import("./pages/Subsystems"));
const Scanner = lazy(() => import("./pages/Scanner"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const RegionalIntelligence = lazy(() => import("./pages/RegionalIntelligence"));
const NextGenRoadmap = lazy(() => import("./pages/NextGenRoadmap"));
const FieldIntelligence = lazy(() => import("./pages/FieldIntelligence"));
const PlatformGuide = lazy(() => import("./pages/PlatformGuide"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 minutos
      gcTime: 10 * 60 * 1000,          // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check local storage on initial render
    if (typeof window !== "undefined") {
      return localStorage.getItem("intel_hub_auth") === "true";
    }
    return false;
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem("intel_hub_auth", "true");
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <main className="flex-1 overflow-auto">
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/portfolio" element={<Portfolio />} />
                      <Route path="/benchmarking" element={<Benchmarking />} />
                      <Route path="/subsystems" element={<Subsystems />} />
                      <Route path="/subsystems/:machineId" element={<Subsystems />} />
                      <Route path="/regional-intelligence" element={<RegionalIntelligence />} />
                      <Route path="/next-gen-roadmap" element={<NextGenRoadmap />} />
                      <Route path="/field-intelligence" element={<FieldIntelligence />} />
                      <Route path="/scanner" element={<Scanner />} />
                      <Route path="/guide" element={<PlatformGuide />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>
              <NexusChat />
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
