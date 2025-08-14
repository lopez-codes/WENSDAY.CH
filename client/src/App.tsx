import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Ecosystem from "@/pages/ecosystem";
import StylesOverview from "@/pages/styles-overview";
import Crowdfunding from "@/pages/crowdfunding";
import SettingsPage from "@/pages/settings";
import Subscribe from "@/pages/subscribe";
import PostFinanceSubscribe from "@/pages/postfinance-subscribe";
import SubscriptionSuccess from "@/pages/subscription-success";
import SubscriptionFailed from "@/pages/subscription-failed";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/ecosystem" component={Ecosystem} />
          <Route path="/styles-overview" component={StylesOverview} />
          <Route path="/crowdfunding" component={Crowdfunding} />
          <Route path="/subscribe" component={Subscribe} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/ecosystem" component={Ecosystem} />
          <Route path="/styles-overview" component={StylesOverview} />
          <Route path="/crowdfunding" component={Crowdfunding} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/postfinance-subscribe" component={PostFinanceSubscribe} />
          <Route path="/subscription-success" component={SubscriptionSuccess} />
          <Route path="/subscription-failed" component={SubscriptionFailed} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
