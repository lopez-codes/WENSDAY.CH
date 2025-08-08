import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
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
          <Route path="/subscribe" component={Subscribe} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
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
