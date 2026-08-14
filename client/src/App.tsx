import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Phase18 from "./pages/Phase18";
import Spec from "./pages/Spec";
import Plugins from "./pages/Plugins";
import Phases from "./pages/Phases";
import Manifesto from "./pages/Manifesto";
import Manual from "./pages/Manual";
import Guide from "./pages/Guide";
import MessageRouter from "./pages/MessageRouter";
import Decisions from "./pages/Decisions";
import Phase17 from "@/pages/Phase17";
import Phase19 from "@/pages/Phase19";
import History from "./pages/History";
import Roadmap from "./pages/Roadmap";
import Phase19Umg from "@/pages/Phase19Umg";
import Phase20 from "@/pages/Phase20";
import Pendencias from "@/pages/Pendencias";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/fase-18"} component={Phase18} />
      <Route path={"/especificacao"} component={Spec} />
      <Route path={"/plugins"} component={Plugins} />
      <Route path={"/fases"} component={Phases} />
      <Route path={"/manifesto"} component={Manifesto} />
      <Route path={"/manual"} component={Manual} />
      <Route path={"/guia-cpp"} component={Guide} />
      <Route path={"/message-router"} component={MessageRouter} />
      <Route path={"/decisoes"} component={Decisions} />
      <Route path="/fase-19" component={Phase19} />
      <Route path="/historico" component={History} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/fase-19-umg" component={Phase19Umg} />
      <Route path="/fase-20" component={Phase20} />
      <Route path="/pendencias" component={Pendencias} />
          <Route path="/fase-17" component={Phase17} />
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
        switchable
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
