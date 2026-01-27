import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClassProvider } from './context/ClassContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ClassDetail from './pages/ClassDetail';
import AttendanceSession from './pages/AttendanceSession';

function App() {
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

export default App;
