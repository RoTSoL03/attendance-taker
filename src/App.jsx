import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClassProvider } from './context/ClassContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ClassDetail from './pages/ClassDetail';
import AttendanceSession from './pages/AttendanceSession';
import Auth from './pages/Auth';
import JoinClass from './pages/JoinClass';
import StudentLobby from './pages/StudentLobby';
import VirtualClassroom from './pages/VirtualClassroom';

function AppContent() {
  const { user } = useAuth();

  //   if (!user) {
  //     return <Auth />;
  //   }

  return (
    <ClassProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            user ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : <Navigate to="/auth" />
          } />
          <Route path="/class/:classId" element={
            user ? (
              <Layout>
                <ClassDetail />
              </Layout>
            ) : <Navigate to="/auth" />
          } />
          <Route path="/class/:classId/session" element={user ? <AttendanceSession /> : <Navigate to="/auth" />} />
          <Route path="/class/:classId/live" element={user ? <VirtualClassroom /> : <Navigate to="/auth" />} />

          <Route path="/join" element={<JoinClass />} />
          <Route path="/lobby" element={<StudentLobby />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to={user ? "/" : "/join"} replace />} />
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
