import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContextValue";

function Navbar() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === "driver" ? "/driver/dashboard" : "/user/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 px-5 py-4 text-white backdrop-blur md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="text-3xl font-bold tracking-wide">
          Uber
        </Link>

        {user && (
          <div className="hidden items-center gap-6 text-sm font-medium text-zinc-300 md:flex">
            <Link to={dashboardPath} className="transition hover:text-white">
              Dashboard
            </Link>

            {user.role === "user" && (
              <>
                <Link to="/create-ride" className="transition hover:text-white">
                  Book Ride
                </Link>
                <Link to="/ride-history" className="transition hover:text-white">
                  Ride History
                </Link>
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-zinc-400">Checking session...</span>
          ) : user ? (
            <>
              <Link
                to={dashboardPath}
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-800 md:hidden"
              >
                Dashboard
              </Link>
              <Link
                to={dashboardPath}
                className="hidden text-right leading-tight sm:block"
              >
                <span className="block text-xs uppercase tracking-wide text-zinc-500">
                  {user.role}
                </span>
                <span className="block max-w-36 truncate font-semibold text-white">
                  {user.name}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-white px-5 py-2 font-semibold text-black transition hover:bg-zinc-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-zinc-700 px-5 py-2 transition hover:bg-zinc-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-white px-5 py-2 font-semibold text-black transition hover:bg-zinc-200"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
