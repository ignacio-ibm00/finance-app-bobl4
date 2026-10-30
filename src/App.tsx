import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <AppShell>
      <ErrorBoundary>
        <DashboardPage />
      </ErrorBoundary>
    </AppShell>
  );
}
