import { useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../component/Navbar";
import { AuthContext } from "../context/authContextValue";

function Home() {
  const { user } = useContext(AuthContext);
  const dashboardPath =
    user?.role === "driver" ? "/driver/dashboard" : "/user/dashboard";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-12 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <p className="mb-4 font-semibold uppercase tracking-wide text-green-400">
            Real ride flow
          </p>

          <h1 className="max-w-3xl text-5xl font-bold leading-tight md:text-7xl">
            Book and manage rides with live MongoDB data.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Riders can create pending ride requests, while drivers can accept or
            reject them from a real backend queue.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-zinc-200"
                >
                  Go to Dashboard
                </Link>
                {user.role === "user" && (
                  <Link
                    to="/create-ride"
                    className="rounded-2xl border border-zinc-700 px-8 py-4 font-bold transition hover:bg-zinc-900"
                  >
                    Book Ride
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-2xl bg-white px-8 py-4 font-bold text-black transition hover:bg-zinc-200"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="rounded-2xl border border-zinc-700 px-8 py-4 font-bold transition hover:bg-zinc-900"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-zinc-800 bg-zinc-900 p-6 shadow-2xl md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-zinc-500">
                Ride Queue
              </p>
              <h2 className="text-3xl font-bold">How it works</h2>
            </div>
            <span className="rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-black">
              Live
            </span>
          </div>

          <div className="space-y-4">
            {[
              ["1", "Rider creates a request", "Ride is saved with pending status."],
              ["2", "Driver dashboard updates", "Pending rides are fetched from MongoDB."],
              ["3", "Driver accepts or rejects", "The queue changes instantly in the UI."]
            ].map(([step, title, description]) => (
              <div
                key={step}
                className="flex gap-4 rounded-2xl border border-zinc-800 bg-black/40 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white font-bold text-black">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
