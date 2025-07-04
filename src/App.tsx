import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Workflow from "./pages/Workflow";
import WorkflowTest from "./pages/Workflow/WorkflowTest";
import WorkflowAnalysis from "./pages/Workflow/WorkflowAnalysis";
import WorkflowDevelopment from "./pages/Workflow/WorkflowDevelopment";
import WorkflowTeamDesign from "./pages/Workflow/WorkflowTeamDesign";
import WorkflowProjectOffice from "./pages/Workflow/WorkflowProjectOffice";
import PrivateRoute from "./components/PrivateRoute";
import IntegrationsPage from "./pages/IntegrationsPage";
import Login from "./pages/AuthPages/Login";
import LogsPage from "./pages/AnalyticsLogs";
import './styles/button-animation.css';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/integrations" element={<IntegrationsPage />} />
            
            {/* Workflow Routes */}
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/workflow/test" element={<WorkflowTest />} />
            <Route path="/workflow/analysis" element={<WorkflowAnalysis />} />
            <Route path="/workflow/development" element={<WorkflowDevelopment />} />
            <Route path="/workflow/team-design" element={<WorkflowTeamDesign />} />
            <Route path="/workflow/project-office" element={<WorkflowProjectOffice />} />
            {/* Analytics Logs Route */}
            <Route path="/analytics/logs" element={<LogsPage />} />
          </Route>
        </Route>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
