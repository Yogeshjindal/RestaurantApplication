import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './Pages/Home';
import NotFound from './Pages/NotFound';
import Success from './Pages/Success';
import Login from './Pages/Login';
import AdminLogin from './Pages/AdminLogin';
import StaffLogin from './Pages/StaffLogin';
import AdminDashboard from './Pages/AdminDashboard';
import StaffDashboard from './Pages/StaffDashboard';
import { AuthProvider } from './context/AuthContext';
import './App.css'

const App = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/success' element={<Success/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/admin/login' element={<AdminLogin/>}/>
            <Route path='/staff/login' element={<StaffLogin/>}/>
            <Route path='/admin/dashboard' element={<AdminDashboard/>}/>
            <Route path='/staff/dashboard' element={<StaffDashboard/>}/>
            <Route path='*' element={<NotFound/>}/>
          </Routes>
          <Toaster/>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App