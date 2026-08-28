import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import Home from "./pages/Home";
import MetaPixelInit from "./components/MetaPixelInit";
import WhatsAppButton from "./components/WhatsAppButton";
import { captureUtmParams } from "@/lib/utm";

// Capture UTM parameters, gclid, fbclid, referrer on first page load
captureUtmParams();



// Home is directly imported (not lazy) to eliminate waterfall delay on mobile
// The skeleton in index.html provides visual feedback while the entry bundle loads

// Lazy load all other routes to reduce initial JS bundle
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ServicePage = lazy(() => import("./pages/ServicePage"));
const SuburbPage = lazy(() => import("./pages/SuburbPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const ServiceAreasPage = lazy(() => import("./pages/ServiceAreasPage"));
const CostCalculator = lazy(() => import("./pages/CostCalculator"));
const BeforeAfterGallery = lazy(() => import("./pages/BeforeAfterGallery"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const GetQuote = lazy(() => import("./pages/GetQuote"));
const ReferralPage = lazy(() => import("./pages/ReferralPage"));
const GuidePage = lazy(() => import("./pages/GuidePage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const FinishesVisualizer = lazy(() => import("./pages/FinishesVisualizer"));
const SurveyPage = lazy(() => import("./pages/SurveyPage"));
const MyQuote = lazy(() => import("./pages/MyQuote"));
const Visualiser = lazy(() => import("./pages/Visualiser"));

/** Minimal loading fallback for lazy routes */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-brand-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-body)" }}>
          Loading...
        </p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/blog/:slug"} component={BlogPost} />
        <Route path={"/services/:serviceSlug"} component={ServicePage} />
        <Route path={"/areas"} component={ServiceAreasPage} />
        <Route path={"/calculator"} component={CostCalculator} />
        <Route path={"/areas/:suburbSlug"} component={SuburbPage} />
        <Route path={"/reviews"} component={ReviewsPage} />
        <Route path={"/gallery/before-after"} component={BeforeAfterGallery} />
          <Route path={"/projects"} component={ProjectsPage} />
        <Route path={"/get-quote"} component={GetQuote} />
        <Route path={"/referral"} component={ReferralPage} />
        <Route path={"/guide"} component={GuidePage} />
        <Route path={"/lp/:slug"} component={LandingPage} />
        <Route path={"/privacy"} component={PrivacyPolicy} />
        <Route path={"/terms"} component={TermsOfService} />
        <Route path={"/faq"} component={FAQPage} />
        <Route path={"/finishes"} component={FinishesVisualizer} />
        <Route path={"/survey/:token"} component={SurveyPage} />
        <Route path={"/my-quote"} component={MyQuote} />
        <Route path={"/visualiser"} component={Visualiser} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <MetaPixelInit />
          <Router />
          {/* WhatsApp floating button — desktop only (mobile has it in StickyMobileCTA) */}
          <WhatsAppButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
