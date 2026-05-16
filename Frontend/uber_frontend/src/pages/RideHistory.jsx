import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../component/Navbar";

const statusStyles = {
  pending: "bg-amber-400 text-black",
  accepted: "bg-green-500 text-black",
  ongoing: "bg-blue-500 text-white",
  completed: "bg-zinc-700 text-white"
};

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(date))
    : "Not available";

const formatFare = (ride) => {
  const fare = ride.estimatedFare ?? ride.fare;
  return fare > 0 ? `Rs ${fare}` : "Pending";
};

const formatDistance = (distance) => {
  return distance ? `${distance} KM` : "Not assigned";
};

function RideHistory() {
  const navigate = useNavigate();
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
          requestError.response?.data?.message || "Failed to load ride history"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <button
          type="button"
          onClick={() => navigate("/user/dashboard")}
          className="mb-6 rounded-full border border-zinc-700 px-5 py-2 transition hover:bg-zinc-900"
        >
          Back
        </button>

        <div className="mb-10">
          <p className="mb-3 font-semibold uppercase tracking-wide text-green-400">
            Your rides
          </p>
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">
            Ride History
          </h1>
          <p className="max-w-2xl text-lg text-zinc-400">
            Every ride listed here is loaded from your MongoDB ride records.
          </p>
        </div>

        {loading ? (
          <EmptyState message="Loading rides..." />
        ) : error ? (
          <EmptyState message={error} />
        ) : rides.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-zinc-800 bg-zinc-900 p-10 text-center">
            <p className="text-zinc-400">
              No rides found yet. Book a ride to get started.
            </p>
            <Link
              to="/create-ride"
              className="mt-6 inline-flex rounded-2xl bg-white px-7 py-4 font-bold text-black transition hover:bg-zinc-200"
            >
              Book Ride
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {rides.map((ride) => (
              <RideHistoryCard key={ride._id} ride={ride} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function RideHistoryCard({ ride }) {
  const statusClass = statusStyles[ride.status] || "bg-zinc-700 text-white";

  return (
    <div className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-6 transition hover:border-green-500">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm text-zinc-500">Ride requested</p>
              <h2 className="text-2xl font-bold">
                {formatDate(ride.createdAt)}
              </h2>
            </div>
            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-bold capitalize ${statusClass}`}
            >
              {ride.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <DetailBlock label="Pickup" value={ride.pickup} />
            <DetailBlock label="Drop" value={ride.drop} />
            <DetailBlock
              label="Distance"
              value={formatDistance(ride.distance)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-black/35 p-5 lg:min-w-52">
          <p className="text-sm text-zinc-500">Driver</p>
          <h3 className="mt-1 font-bold">
            {ride.driver?.name || "Not assigned"}
          </h3>

          <p className="mt-5 text-sm text-zinc-500">Estimated Fare</p>
          <h3 className="mt-1 text-3xl font-bold text-green-400">
            {formatFare(ride)}
          </h3>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/35 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <h3 className="mt-1 break-words text-xl font-bold">{value}</h3>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-[28px] border border-dashed border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-400">
      {message}
    </div>
  );
}

export default RideHistory;
