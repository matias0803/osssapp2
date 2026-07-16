import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppContextProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Techniques } from './pages/Techniques';
import { Workouts } from './pages/Workouts';
import { Objetivos } from './pages/Objetivos';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="tecnicas" element={<Techniques />} />
              <Route path="entrenamientos" element={<Workouts />} />
              <Route path="objetivos" element={<Objetivos />} />
              {/* Fallback route */}
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AppContextProvider>
  );
}

export default App;