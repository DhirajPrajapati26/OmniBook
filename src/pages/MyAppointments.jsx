
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalendarDays,
  RefreshCw,
  XCircle,
  Clock,
  ArrowRight,
  Leaf,
} from "lucide-react";
import api from "../api/axios";

function MyAppointments() {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [cancelling, setCancelling] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/bookings/my");
      setAppointments(response.data.bookings || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const cancelAppointment = async (id) => {
    if (
      !window.confirm("Are you sure you want to cancel this appointment?")
    ) {
      return;
    }

    setCancelling(id);
    setError("");
    setMessage("");

    try {
      await api.patch(`/bookings/${id}/cancel`);
      setMessage("Appointment cancelled.");
      await fetchAppointments();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not cancel appointment."
      );
    } finally {
      setCancelling("");
    }
  };

  const statusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-[#e8eee5] text-[#285b3b]";
      case "completed":
        return "bg-[#e9eee9] text-[#536b58]";
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-amber-50 text-amber-800";
    }
  };

  const filters = ["All", "Upcoming", "Completed", "Cancelled"];

  const filteredAppointments = useMemo(() => {
    const now = new Date();

    return appointments.filter((item) => {
      const status = item.status?.toLowerCase();
      const appointmentDate = item.startTime
        ? new Date(item.startTime)
        : null;

      switch (activeFilter) {
        case "Upcoming":
          return (
            ["pending", "confirmed"].includes(status) &&
            appointmentDate &&
            !Number.isNaN(appointmentDate.getTime()) &&
            appointmentDate >= now
          );

        case "Completed":
          return status === "completed";

        case "Cancelled":
          return status === "cancelled";

        default:
          return true;
      }
    });
  }, [appointments, activeFilter]);

  const filterCounts = useMemo(() => {
    const now = new Date();

    return {
      All: appointments.length,
      Upcoming: appointments.filter((item) => {
        const date = item.startTime ? new Date(item.startTime) : null;

        return (
          ["pending", "confirmed"].includes(item.status?.toLowerCase()) &&
          date &&
          !Number.isNaN(date.getTime()) &&
          date >= now
        );
      }).length,
      Completed: appointments.filter(
        (item) => item.status?.toLowerCase() === "completed"
      ).length,
      Cancelled: appointments.filter(
        (item) => item.status?.toLowerCase() === "cancelled"
      ).length,
    };
  }, [appointments]);

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-8 text-[#263a31] sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#214e41]"
            >
              <Leaf size={17} /> OmniBook
            </Link>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-[#78977b]">
              Your schedule
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              My appointments
            </h1>

            <p className="mt-2 text-[#718078]">
              Review and manage your upcoming bookings.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#214e41] px-5 py-3 font-semibold text-white transition hover:bg-[#173b30]"
          >
            Book a service <ArrowRight size={17} />
          </Link>
        </header>

        {message && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-[#d5e2d3] bg-[#f0f6ee] p-4 text-sm text-[#285b3b]"
          >
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {!loading && appointments.length > 0 && (
          <div
            className="mt-8 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter appointments"
          >
            {filters.map((filter) => {
              const selected = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    selected
                      ? "border-[#214e41] bg-[#214e41] text-white"
                      : "border-[#e0e5dc] bg-white text-[#647168] hover:border-[#9db3a0] hover:text-[#214e41]"
                  }`}
                >
                  {filter}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      selected
                        ? "bg-white/15 text-white"
                        : "bg-[#f0f3ed] text-[#647168]"
                    }`}
                  >
                    {filterCounts[filter]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-[#718078]">
            <RefreshCw
              size={23}
              className="mx-auto mb-3 animate-spin text-[#78977b]"
            />
            Loading appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-[#d9dfd6] bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8eee5] text-[#214e41]">
              <CalendarDays size={29} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#263a31]">
              No appointments yet
            </h2>

            <p className="mt-2 text-sm text-[#718078]">
              Once you book a service, your appointments will appear here.
            </p>

            <Link
              to="/services"
              className="mt-5 inline-flex items-center gap-2 font-semibold text-[#214e41] hover:underline"
            >
              Explore services <ArrowRight size={16} />
            </Link>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-[#d9dfd6] bg-white px-6 py-12 text-center">
            <CalendarDays
              size={28}
              className="mx-auto text-[#78977b]"
            />

            <h2 className="mt-4 font-bold text-[#263a31]">
              No {activeFilter.toLowerCase()} appointments
            </h2>

            <p className="mt-2 text-sm text-[#718078]">
              There are no appointments in this category.
            </p>

            <button
              type="button"
              onClick={() => setActiveFilter("All")}
              className="mt-4 font-semibold text-[#214e41] hover:underline"
            >
              View all appointments
            </button>
          </div>
        ) : (
          <>
            <p className="mt-5 text-sm text-[#718078]" aria-live="polite">
              Showing {filteredAppointments.length}{" "}
              {filteredAppointments.length === 1
                ? "appointment"
                : "appointments"}
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {filteredAppointments.map((item) => (
                <article
                  key={item._id}
                  className="rounded-3xl border border-[#e5e7df] bg-white p-6 shadow-[0_8px_28px_rgba(33,78,65,0.04)] transition hover:shadow-[0_12px_32px_rgba(33,78,65,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8eee5] text-[#214e41]">
                        <CalendarDays size={21} />
                      </div>

                      <h2 className="text-lg font-bold text-[#263a31]">
                        {item.service?.name || "Appointment"}
                      </h2>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                        item.status
                      )}`}
                    >
                      {item.status || "Pending"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-[#edf0e9] pt-5 text-sm text-[#647168]">
                    <p className="flex items-center gap-2">
                      <CalendarDays
                        size={16}
                        className="shrink-0 text-[#78977b]"
                      />
                      {item.startTime
                        ? new Date(item.startTime).toLocaleString("en-IN")
                        : "Date not available"}
                    </p>

                    <p className="flex items-center gap-2">
                      <Clock size={16} className="text-[#78977b]" />
                      Duration: {item.service?.duration ?? "—"} minutes
                    </p>

                    <p className="font-semibold text-[#263a31]">
                      Price: ₹
                      {item.totalAmount ?? item.service?.price ?? "—"}
                    </p>
                  </div>

                  {!["cancelled", "completed"].includes(
                    item.status?.toLowerCase()
                  ) && (
                    <button
                      type="button"
                      onClick={() => cancelAppointment(item._id)}
                      disabled={cancelling === item._id}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      <XCircle size={16} />
                      {cancelling === item._id
                        ? "Cancelling..."
                        : "Cancel appointment"}
                    </button>
                  )}
                </article>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={fetchAppointments}
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#718078] hover:text-[#214e41] disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh appointments
        </button>
      </div>
    </main>
  );
}

export default MyAppointments;
