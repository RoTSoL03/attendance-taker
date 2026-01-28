import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClassProvider } from './context/ClassContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ClassDetail from './pages/ClassDetail';
import AttendanceSession from './pages/AttendanceSession';
import Auth from './pages/Auth';

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Auth />;
  }

  return (
    <ClassProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/class/:classId" element={
            <Layout>
              <ClassDetail />
            </Layout>
          } />
          <Route path="/class/:classId/session" element={<AttendanceSession />} />
        </Routes>
      </Router>
    </ClassProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
