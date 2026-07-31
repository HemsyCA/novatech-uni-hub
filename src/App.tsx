import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffRoute } from "@/components/StaffRoute";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Robots = lazy(() => import("./pages/Robots"));
const Competitions = lazy(() => import("./pages/Competitions"));
const Team = lazy(() => import("./pages/Team"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Print3D = lazy(() => import("./pages/Print3D"));
const Store = lazy(() => import("./pages/Store"));
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen bg-background flex items-center justify-center text-primary">
              Cargando página...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/robots" element={<Robots />} />
            <Route path="/competencias" element={<Competitions />} />
            <Route path="/equipo" element={<Team />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/print3d" element={<Print3D />} />
              <Route path="/store" element={<Store />} />
              <Route element={<StaffRoute />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
