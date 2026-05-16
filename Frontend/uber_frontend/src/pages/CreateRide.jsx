import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../component/Navbar";

function CreateRide() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [estimate, setEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const pickupText = pickup.trim();
    const dropText = drop.trim();

    setEstimateError("");

    if (pickupText.length < 3 || dropText.length < 3) {
      setEstimate(null);
      setEstimating(false);
      return;
    }

    let cancelled = false;
    setEstimating(true);

    const timer = setTimeout(async () => {
      try {
        const response = await API.post("/rides/estimate", {
          pickup: pickupText,
          drop: dropText
        });

        if (!cancelled) {
          setEstimate(response.data.estimate);
        }
      } catch (error) {
        if (!cancelled) {
          setEstimate(null);
          setEstimateError(
            error.response?.data?.message || "Unable to estimate this route"
          );
        }
      } finally {
        if (!cancelled) {
          setEstimating(false);
        }
      }
    }, 900);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pickup, drop]);

  const handleCreateRide = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!estimate) {
      setMessage("Please wait for the distance and fare estimate.");
      return;
    }

    try {
      setLoading(true);

      await API.post("/rides/create", {
        pickup: pickup.trim(),
        drop: drop.trim()
      });

      setPickup("");
      setDrop("");
      setEstimate(null);
      setEstimateError("");
      setMessage("Ride request created with pending status.");
      navigate("/user/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create ride");
    } finally {
      setLoading(false);
    }
  };

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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-[32px] border border-zinc-800 bg-zinc-900 p-6 md:p-8">
            <p className="mb-3 font-semibold uppercase tracking-wide text-green-400">
              Book your ride
            </p>

            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Where are you going?
            </h1>

            <p className="mb-8 text-zinc-400">
              Enter pickup and drop locations. The request is saved to MongoDB
              as a pending ride.
            </p>

            <form onSubmit={handleCreateRide} className="space-y-5">
              <div>
                <label className="mb-2 block font-semibold">
                  Pickup Location
                </label>
                <input
                  type="text"
                  placeholder="Enter pickup location"
                  value={pickup}
                  onChange={(event) => setPickup(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-5 py-4 outline-none transition focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold">Drop Location</label>
                <input
                  type="text"
                  placeholder="Enter drop location"
                  value={drop}
                  onChange={(event) => setDrop(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800 px-5 py-4 outline-none transition focus:border-green-500"
                />
              </div>

              {message && (
                <div className="rounded-2xl border border-zinc-800 bg-black/35 p-4 text-zinc-300">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || estimating || !estimate}
                className="w-full rounded-2xl bg-white py-4 font-bold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating Ride..."
                  : estimating
                    ? "Estimating Fare..."
                    : "Book Ride"}
              </button>
            </form>
          </section>

          <section className="rounded-[32px] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-6 md:p-8">
            <h2 className="mb-6 text-3xl font-bold">Ride Preview</h2>

            <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-6">
              <div className="space-y-6">
                <PreviewRow label="Pickup" value={pickup || "Your pickup"} />
                <PreviewRow label="Drop" value={drop || "Your drop location"} />
                <PreviewRow
                  label="Distance"
                  value={
                    estimating
                      ? "Estimating..."
                      : estimate
                        ? `${estimate.distance} KM`
                        : "Auto calculated"
                  }
                />
              </div>

              {estimateError && (
                <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-300">
                  {estimateError}
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                  <p className="text-sm uppercase tracking-wide text-zinc-500">
                    Estimated fare
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-green-400">
                    {estimating
                      ? "..."
                      : estimate
                        ? `Rs ${estimate.estimatedFare}`
                        : "Rs 0"}
                  </h3>
                  <p className="mt-3 text-zinc-400">
                    {estimate
                      ? `Rs ${estimate.baseFare} base + Rs ${estimate.ratePerKm}/KM`
                      : "Calculated from pickup and drop"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                  <p className="text-sm uppercase tracking-wide text-zinc-500">
                    Status after booking
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-amber-300">
                    pending
                  </h3>
                  <p className="mt-3 text-zinc-400">
                    Drivers will see this request in their pending ride queue.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div>
      <p className="text-sm text-zinc-500">{label}</p>
      <h3 className="mt-1 break-words text-2xl font-bold">{value}</h3>
    </div>
  );
}

export default CreateRide;
