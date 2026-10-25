
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import MyAppointments from "./pages/MyAppointments";
import AIAssistant from "./pages/AIAssistant";
import AdminDashboard from "./pages/AdminDashboard";
import ManageServices from "./pages/ManageServices";
import ManageAppointments from "./pages/ManageAppointments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/services" element={<Services />} />
        <Route path="/book/:serviceId" element={<Booking />} />
        <Route path="/appointments" element={<MyAppointments />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/services" element={<ManageServices />} />
        <Route path="/admin/appointments" element={<ManageAppointments />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
