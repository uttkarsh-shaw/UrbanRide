import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContextValue";

function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 text-zinc-300">
          Loading session...
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath =
      user.role === "driver" ? "/driver/dashboard" : "/user/dashboard";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
