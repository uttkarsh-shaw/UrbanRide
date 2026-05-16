import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import UserDashboard from "../pages/UserDashboard";
import DriverDashboard from "../pages/DriverDashboard";
import CreateRide from "../pages/CreateRide";
import RideHistory from "../pages/RideHistory";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../component/protectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-ride"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <CreateRide />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ride-history"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <RideHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver/dashboard"
        element={
          <ProtectedRoute allowedRoles={["driver"]}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
