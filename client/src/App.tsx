import { Toaster } from "@/components/ui/sonner";
import { scrollToCurrentHash } from "@/lib/hash-scroll";
import { captureAttribution } from "@/lib/leads";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Seo from "./seo/Seo";
import { ThemeProvider } from "./contexts/ThemeContext";
import ConstructionGrowthSystems from "./pages/ConstructionGrowthSystems";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ReferralProgram from "./pages/ReferralProgram";

function Router() {
  return (
    <Switch>
      <Route path="/trade-referral-program" component={ReferralProgram} />
      <Route
        path="/construction-growth-systems"
        component={ConstructionGrowthSystems}
      />
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    captureAttribution();
    const frame = window.requestAnimationFrame(() => {
      scrollToCurrentHash();
    });

    const handleHashChange = () => scrollToCurrentHash();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Seo />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
