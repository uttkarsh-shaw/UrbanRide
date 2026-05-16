import { useCallback, useEffect, useMemo, useState } from "react";
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
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(date))
    : "Just now";

const formatFare = (ride) => {
  const fare = ride.estimatedFare ?? ride.fare;
  return fare > 0 ? `Rs ${fare}` : "Pending";
};

const formatDistance = (distance) => {
  return distance ? `${distance} KM` : "Not assigned";
};

function DriverDashboard() {
  const [online, setOnline] = useState(true);
  const [pendingRides, setPendingRides] = useState([]);
  const [driverRides, setDriverRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingRideId, setAcceptingRideId] = useState(null);
  const [deletingRideId, setDeletingRideId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const [pendingResponse, driverResponse] = await Promise.all([
        API.get("/rides/pending"),
        API.get("/rides/driver-rides")
      ]);

      setPendingRides(pendingResponse.data.rides || []);
      setDriverRides(driverResponse.data.rides || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to load ride requests"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(
    () => ({
      pending: pendingRides.length,
      accepted: driverRides.filter((ride) => ride.status === "accepted").length,
      completed: driverRides.filter((ride) => ride.status === "completed").length
    }),
    [pendingRides, driverRides]
  );

  const updateAvailability = async () => {
    const nextValue = !online;
    setOnline(nextValue);

    try {
      await API.patch("/driver/availability", { isAvailable: nextValue });
      setNotice(nextValue ? "You are online." : "You are offline.");
    } catch (requestError) {
      setOnline(!nextValue);
      setNotice(
        requestError.response?.data?.message || "Failed to update availability"
      );
    }
  };

  const acceptRide = async (rideId) => {
    setAcceptingRideId(rideId);
    setNotice("");

    try {
      const response = await API.post("/rides/accept", { rideId });
      const acceptedRide = response.data.ride;

      setPendingRides((current) =>
        current.filter((ride) => ride._id !== rideId)
      );
      setDriverRides((current) => [
        acceptedRide,
        ...current.filter((ride) => ride._id !== rideId)
      ]);
      setNotice("Ride accepted successfully.");
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || "Failed to accept ride");
    } finally {
      setAcceptingRideId(null);
    }
  };

  const deleteRide = async (rideId) => {
    setDeletingRideId(rideId);
    setNotice("");

    try {
      await API.delete(`/rides/delete/${rideId}`);
      setPendingRides((current) =>
        current.filter((ride) => ride._id !== rideId)
      );
      setNotice("Ride request rejected and deleted.");
    } catch (requestError) {
      setNotice(requestError.response?.data?.message || "Failed to delete ride");
    } finally {
      setDeletingRideId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <section className="rounded-[32px] border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-black p-7 shadow-2xl md:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div>
              <p className="mb-3 font-semibold uppercase tracking-wide text-green-400">
                Driver panel
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                Accept real ride requests from the pending queue.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                Every card below is loaded from MongoDB. Accepting or rejecting a
                ride updates the dashboard immediately.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => loadDashboard({ silent: true })}
                disabled={refreshing}
                className="rounded-full border border-zinc-700 px-5 py-3 font-semibold transition hover:bg-zinc-900 disabled:opacity-60"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                type="button"
                onClick={updateAvailability}
                className={`rounded-full px-5 py-3 font-bold transition ${
                  online ? "bg-green-500 text-black" : "bg-red-500 text-white"
                }`}
              >
                {online ? "Online" : "Offline"}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard label="Pending Requests" value={stats.pending} />
          <StatCard label="Accepted Rides" value={stats.accepted} />
          <StatCard label="Completed Rides" value={stats.completed} />
        </section>

        {(notice || error) && (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-200">
            {notice || error}
          </div>
        )}

        <section className="mt-10">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm uppercase tracking-wide text-zinc-500">
                Pending rides
              </p>
              <h2 className="text-3xl font-bold">Ride Requests</h2>
            </div>
            <p className="text-zinc-400">
              {pendingRides.length} request{pendingRides.length === 1 ? "" : "s"}
            </p>
          </div>

          {loading ? (
            <EmptyState message="Loading pending ride requests..." />
          ) : pendingRides.length === 0 ? (
            <EmptyState message="No pending ride requests available." />
          ) : (
            <div className="space-y-5">
              {pendingRides.map((ride) => (
                <RideRequestCard
                  key={ride._id}
                  ride={ride}
                  online={online}
                  accepting={acceptingRideId === ride._id}
                  deleting={deletingRideId === ride._id}
                  onAccept={() => acceptRide(ride._id)}
                  onDelete={() => deleteRide(ride._id)}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 pb-10">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-wide text-zinc-500">
              Your accepted rides
            </p>
            <h2 className="text-3xl font-bold">Driver Ride History</h2>
          </div>

          {driverRides.length === 0 ? (
            <EmptyState message="Accepted rides will appear here." />
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {driverRides.slice(0, 4).map((ride) => (
                <DriverRideCard key={ride._id} ride={ride} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function RideRequestCard({
  ride,
  online,
  accepting,
  deleting,
  onAccept,
  onDelete
}) {
  return (
    <div className="rounded-[28px] border border-zinc-800 bg-zinc-900 p-6 transition hover:border-green-500">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm text-zinc-500">Passenger</p>
              <h3 className="text-2xl font-bold">
                {ride.user?.name || "Unknown rider"}
              </h3>
              {ride.user?.email && (
                <p className="mt-1 text-sm text-zinc-500">{ride.user.email}</p>
              )}
            </div>
            <span className="w-fit rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-black">
              Pending
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <LocationBlock label="Pickup" value={ride.pickup} />
            <LocationBlock label="Drop" value={ride.drop} />
            <LocationBlock
              label="Distance"
              value={formatDistance(ride.distance)}
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-zinc-500">
            <span>Requested {formatDate(ride.createdAt)}</span>
            <span>Estimated fare {formatFare(ride)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <button
            type="button"
            onClick={onAccept}
            disabled={!online || accepting || deleting}
            className="rounded-2xl bg-white px-7 py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {accepting ? "Accepting..." : online ? "Accept Ride" : "Go Online"}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={accepting || deleting}
            className="rounded-2xl border border-red-500/60 px-7 py-4 font-bold text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Reject Ride"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DriverRideCard({ ride }) {
  const statusClass = statusStyles[ride.status] || "bg-zinc-700 text-white";

  return (
    <div className="rounded-[24px] border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Passenger</p>
          <h3 className="text-xl font-bold">
            {ride.user?.name || "Unknown rider"}
          </h3>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${statusClass}`}
        >
          {ride.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LocationBlock label="Pickup" value={ride.pickup} />
        <LocationBlock label="Drop" value={ride.drop} />
        <LocationBlock label="Distance" value={formatDistance(ride.distance)} />
        <LocationBlock label="Estimated Fare" value={formatFare(ride)} />
      </div>
    </div>
  );
}

function LocationBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/35 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <h4 className="mt-1 font-semibold text-white">{value}</h4>
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

function EmptyState({ message }) {
  return (
    <div className="rounded-[24px] border border-dashed border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-400">
      {message}
    </div>
  );
}

export default DriverDashboard;
