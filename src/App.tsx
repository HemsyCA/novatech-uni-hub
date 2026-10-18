import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StaffRoute } from "@/components/StaffRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FloatingContactButtons } from "@/components/FloatingContactButtons";
import { RouteSeo } from "@/components/RouteSeo";

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Robots = lazy(() => import("./pages/Robots"));
const Competitions = lazy(() => import("./pages/Competitions"));
const Team = lazy(() => import("./pages/Team"));
const Join = lazy(() => import("./pages/Join"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Print3D = lazy(() => import("./pages/Print3D"));
const Store = lazy(() => import("./pages/Store"));
const Admin = lazy(() => import("./pages/Admin"));
const Academia = lazy(() => import("./pages/Academia"));
const AcademiaHome = lazy(() => import("./pages/academia/AcademiaHome"));
const AcademiaGuide = lazy(() => import("./pages/academia/AcademiaGuide"));
const AcademiaBitacora = lazy(() => import("./pages/academia/AcademiaBitacora"));
const AcademiaFinalTask = lazy(() => import("./pages/academia/AcademiaFinalTask"));
const AcademiaModule = lazy(() => import("./pages/academia/AcademiaModule"));
const AcademiaLesson = lazy(() => import("./pages/academia/AcademiaLesson"));
const Conocimientos = lazy(() => import("./pages/Conocimientos"));
const ConocimientoDetalle = lazy(() => import("./pages/ConocimientoDetalle"));
const Comunidad = lazy(() => import("./pages/Comunidad"));
const AccountLayout = lazy(() => import("./components/account/AccountLayout"));
const SessionShell = lazy(() => import("./components/account/SessionShell"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteSeo />
        <FloatingContactButtons />
        <Suspense
          fallback={
            <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono text-lg">
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
            <Route path="/unete" element={<Join />} />
            {/* Públicas, pero con sesión iniciada se abren dentro de la cuenta. */}
            <Route element={<SessionShell />}>
              <Route path="/store" element={<Store />} />
              <Route path="/print3d" element={<Print3D />} />
            </Route>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AccountLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/academia" element={<Academia />}>
                  <Route index element={<AcademiaHome />} />
                  <Route path="guia" element={<AcademiaGuide />} />
                  <Route path="bitacora" element={<AcademiaBitacora />} />
                  <Route path="tarea-final" element={<AcademiaFinalTask />} />
                  <Route path=":moduleId" element={<AcademiaModule />} />
                  <Route path=":moduleId/:lessonId" element={<AcademiaLesson />} />
                </Route>
                <Route path="/conocimientos" element={<Conocimientos />} />
                <Route path="/conocimientos/:id" element={<ConocimientoDetalle />} />
                <Route path="/comunidad" element={<Comunidad />} />
                {/* La antigua zona de miembros ahora es Conocimientos Nova. */}
                <Route path="/miembros" element={<Navigate to="/conocimientos" replace />} />
                <Route element={<StaffRoute />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
