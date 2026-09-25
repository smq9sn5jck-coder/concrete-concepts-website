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
import { GENERATED_OTHER_TRADE_PREVIEW_ENABLED } from "@/generated/otherTradeConfig";
import {
  GOLD_COAST_PREVIEW_ENABLED,
  GOLD_COAST_PUBLISHED_ENABLED,
} from "@/generated/goldCoastConfig";
import {
  REGIONAL_SLAB_PREVIEW_ENABLED,
  REGIONAL_SLAB_PUBLISHED_ENABLED,
} from "@/generated/regionalSlabConfig";
import { getClientRegionalSlabRouteAccess } from "@/lib/regionalSlabPreviewAccess";
import { isOtherTradePreviewAvailable } from "@/lib/otherTradePreviewAccess";

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
const NeedAnotherTradePage = GENERATED_OTHER_TRADE_PREVIEW_ENABLED
  ? lazy(() => import("./pages/NeedAnotherTradePage"))
  : null;
const GuidePage = lazy(() => import("./pages/GuidePage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const FinishesVisualizer = lazy(() => import("./pages/FinishesVisualizer"));
const SurveyPage = lazy(() => import("./pages/SurveyPage"));
const MyQuote = lazy(() => import("./pages/MyQuote"));
const Visualiser = lazy(() => import("./pages/Visualiser"));
const batchOnePreviewEnabled = import.meta.env.VITE_BATCH_ONE_PREVIEW === "true";
const BatchOneReviewPage = batchOnePreviewEnabled
  ? lazy(() => import("./pages/BatchOneReviewPage"))
  : null;
const southsidePreviewEnabled = import.meta.env.VITE_SOUTHSIDE_PREVIEW === "true";
const SouthsideReviewPage = southsidePreviewEnabled
  ? lazy(() => import("./pages/SouthsideReviewPage"))
  : null;
const goldCoastRoutesEnabled = GOLD_COAST_PREVIEW_ENABLED || GOLD_COAST_PUBLISHED_ENABLED;
const GoldCoastReviewPage = GOLD_COAST_PREVIEW_ENABLED
  ? lazy(() => import("./pages/GoldCoastReviewPage"))
  : null;
const GoldCoastHubPage = goldCoastRoutesEnabled
  ? lazy(() => import("./pages/GoldCoastHubPage"))
  : null;
const GoldCoastServicePage = goldCoastRoutesEnabled
  ? lazy(() => import("./pages/GoldCoastServicePage"))
  : null;
const regionalSlabRoutesEnabled = REGIONAL_SLAB_PREVIEW_ENABLED || REGIONAL_SLAB_PUBLISHED_ENABLED;
const RegionalSlabReviewPage = REGIONAL_SLAB_PREVIEW_ENABLED
  ? lazy(() => import("./pages/RegionalSlabReviewPage"))
  : null;
const RegionalSlabHubPage = regionalSlabRoutesEnabled
  ? lazy(() => import("./pages/RegionalSlabHubPage"))
  : null;
const RegionalSlabServicePage = regionalSlabRoutesEnabled
  ? lazy(() => import("./pages/RegionalSlabServicePage"))
  : null;
const RegionalSlabGuidePage = regionalSlabRoutesEnabled
  ? lazy(() => import("./pages/RegionalSlabGuidePage"))
  : null;

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

function ReferralPreviewRedirect() {
  if (typeof window !== "undefined") window.location.replace("/need-another-trade");
  return <PageLoader />;
}

function RegionalReviewRoute() {
  return RegionalSlabReviewPage && getClientRegionalSlabRouteAccess("/regional-slab-review").available
    ? <RegionalSlabReviewPage />
    : <NotFound />;
}

function RegionalHubRoute() {
  return RegionalSlabHubPage && getClientRegionalSlabRouteAccess(window.location.pathname).available
    ? <RegionalSlabHubPage />
    : <NotFound />;
}

function RegionalServiceRoute() {
  const routeAccess = getClientRegionalSlabRouteAccess(window.location.pathname);
  if (routeAccess.access === "legacy") return <ServicePage />;
  return RegionalSlabServicePage && routeAccess.available ? <RegionalSlabServicePage /> : <NotFound />;
}

function RegionalGuideRoute() {
  return RegionalSlabGuidePage && getClientRegionalSlabRouteAccess(window.location.pathname).available
    ? <RegionalSlabGuidePage />
    : <NotFound />;
}

function NeedAnotherTradeRoute() {
  return NeedAnotherTradePage && isOtherTradePreviewAvailable()
    ? <NeedAnotherTradePage />
    : <NotFound />;
}

function ReferralRoute() {
  return isOtherTradePreviewAvailable() ? <ReferralPreviewRedirect /> : <ReferralPage />;
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/admin"} component={AdminDashboard} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/blog/:slug"} component={BlogPost} />
        {RegionalSlabReviewPage && (
          <Route path={"/regional-slab-review"} component={RegionalReviewRoute} />
        )}
        {RegionalSlabServicePage && (
          <Route path={"/services/concrete-slabs-brisbane"} component={RegionalServiceRoute} />
        )}
        {RegionalSlabServicePage && (
          <Route path={"/services/extension-slabs-brisbane"} component={RegionalServiceRoute} />
        )}
        {RegionalSlabGuidePage && (
          <Route path={"/guides/how-house-slab-quotes-work"} component={RegionalGuideRoute} />
        )}
        {RegionalSlabGuidePage && (
          <Route path={"/guides/extension-slab-readiness"} component={RegionalGuideRoute} />
        )}
        {RegionalSlabHubPage && (
          <Route path={"/areas/ipswich-ripley-house-slabs"} component={RegionalHubRoute} />
        )}
        {RegionalSlabHubPage && (
          <Route path={"/areas/sunshine-coast"} component={RegionalHubRoute} />
        )}
        {RegionalSlabServicePage && (
          <Route path={"/gold-coast/house-slabs"} component={RegionalServiceRoute} />
        )}
        {RegionalSlabServicePage && (
          <Route path={"/gold-coast/extension-slabs"} component={RegionalServiceRoute} />
        )}
        <Route path={"/services/:serviceSlug"} component={ServicePage} />
        <Route path={"/areas"} component={ServiceAreasPage} />
        {BatchOneReviewPage && (
          <Route path={"/batch-one-review"} component={BatchOneReviewPage} />
        )}
        {SouthsideReviewPage && (
          <Route path={"/southside-review"} component={SouthsideReviewPage} />
        )}
        {GoldCoastReviewPage && (
          <Route path={"/gold-coast-review"} component={GoldCoastReviewPage} />
        )}
        {GoldCoastHubPage && (
          <Route path={"/areas/gold-coast"} component={GoldCoastHubPage} />
        )}
        {GoldCoastServicePage && (
          <Route path={"/gold-coast/:slug"} component={GoldCoastServicePage} />
        )}
        <Route path={"/calculator"} component={CostCalculator} />
        <Route path={"/areas/:suburbSlug"} component={SuburbPage} />
        <Route path={"/reviews"} component={ReviewsPage} />
        <Route path={"/gallery/before-after"} component={BeforeAfterGallery} />
          <Route path={"/projects"} component={ProjectsPage} />
        <Route path={"/get-quote"} component={GetQuote} />
        {NeedAnotherTradePage && (
          <Route path={"/need-another-trade"} component={NeedAnotherTradeRoute} />
        )}
        <Route
          path={"/referral"}
          component={ReferralRoute}
        />
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
