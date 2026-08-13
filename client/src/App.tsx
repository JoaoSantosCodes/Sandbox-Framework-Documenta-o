import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Phase18 from "./pages/Phase18";
import Plugins from "./pages/Plugins";
import Phases from "./pages/Phases";
import Manifesto from "./pages/Manifesto";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/fase-18"} component={Phase18} />
      <Route path={"/plugins"} component={Plugins} />
      <Route path={"/fases"} component={Phases} />
      <Route path={"/manifesto"} component={Manifesto} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
