import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../component/Navbar";
import { AuthContext } from "../context/authContextValue";

const activeStatuses = ["pending", "accepted", "ongoing"];

const statusStyles = {
  pending: "bg-amber-400 text-black",
  accepted: "bg-green-500 text-black",
  ongoing: "bg-blue-500 text-white",
  completed: "bg-zinc-700 text-white"
};

const formatFare = (ride) => {
  const fare = ride.estimatedFare ?? ride.fare;
  return fare > 0 ? `Rs ${fare}` : "Not assigned";
};

const formatFinalFare = (ride) => {
  return ride.status === "completed" && ride.fare > 0
    ? `Rs ${ride.fare}`
    : "Pending";
};

const formatDistance = (distance) => {
  return distance ? `${distance} KM` : "Not assigned";
};

function UserDashboard() {
  const { user } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await API.get("/rides/my-rides");
        setRides(response.data.rides || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Failed to load your rides"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const stats = useMemo(
    () => ({
      total: rides.length,
      pending: rides.filter((ride) => ride.status === "pending").length,
      accepted: rides.filter((ride) => ride.status === "accepted").length
    }),
    [rides]
  );

  const activeRide = rides.find((ride) => activeStatuses.includes(ride.status));
  const recentRides = rides.slice(0, 3);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <section className="rounded-[32px] border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-black p-7 shadow-2xl md:p-10">
          <p className="mb-3 font-semibold uppercase tracking-wide text-green-400">
            Rider dashboard
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            Book a new ride and track every request from the same MongoDB ride
            history.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/create-ride"
              className="rounded-2xl bg-white px-7 py-4 font-bold text-black transition hover:bg-zinc-200"
            >
              Book Ride
            </Link>
            <Link
              to="/ride-history"
              className="rounded-2xl border border-zinc-700 px-7 py-4 font-bold transition hover:bg-zinc-900"
            >
              Ride History
            </Link>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard label="Total Rides" value={stats.total} />
          <StatCard label="Pending Requests" value={stats.pending} />
          <StatCard label="Accepted Rides" value={stats.accepted} />
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-zinc-500">
                  Current request
                </p>
                <h2 className="text-3xl font-bold">Active Ride</h2>
              </div>
            </div>

            {loading ? (
              <EmptyState message="Loading your active ride..." />
            ) : error ? (
              <EmptyState message={error} />
            ) : activeRide ? (
              <RideSummary ride={activeRide} />
            ) : (
              <EmptyState message="No active ride right now. Book a ride to create a pending request." />
            )}
          </div>

          <div className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-zinc-500">
                  Latest rides
                </p>
                <h2 className="text-3xl font-bold">Recent Activity</h2>
              </div>
              <Link
                to="/ride-history"
                className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-800"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                <EmptyState message="Loading rides..." />
              ) : recentRides.length === 0 ? (
                <EmptyState message="No rides found yet." />
              ) : (
                recentRides.map((ride) => (
                  <RideSummary key={ride._id} ride={ride} compact />
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm uppercase tracking-wide text-zinc-500">{label}</p>
      <h3 className="mt-3 text-4xl font-bold">{value}</h3>
    </div>
  );
}

function RideSummary({ ride, compact = false }) {
  const statusClass = statusStyles[ride.status] || "bg-zinc-700 text-white";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/35 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <p className="text-sm text-zinc-500">Pickup</p>
          <h3 className="truncate text-xl font-bold">{ride.pickup}</h3>
        </div>
        <span
          className={`w-fit rounded-full px-4 py-2 text-sm font-bold capitalize ${statusClass}`}
        >
          {ride.status}
        </span>
      </div>

      <div className={compact ? "mt-4" : "mt-6"}>
        <p className="text-sm text-zinc-500">Drop</p>
        <h3 className="text-xl font-bold">{ride.drop}</h3>
      </div>

      {compact ? (
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-400">
          <span>{formatDistance(ride.distance)}</span>
          <span>{formatFare(ride)}</span>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-zinc-500">Distance</p>
            <h4 className="font-semibold">{formatDistance(ride.distance)}</h4>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Estimated Fare</p>
            <h4 className="font-semibold">{formatFare(ride)}</h4>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Driver</p>
            <h4 className="font-semibold">
              {ride.driver?.name || "Waiting for driver"}
            </h4>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Final Fare</p>
            <h4 className="font-semibold">{formatFinalFare(ride)}</h4>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-zinc-400">
      {message}
    </div>
  );
}

export default UserDashboard;
