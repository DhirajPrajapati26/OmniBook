
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ArrowLeft,
  RefreshCw,
  Clock,
  UserRound,
  IndianRupee,
  ClipboardList,
  Save,
  Leaf,
} from "lucide-react";
import api from "../api/axios";

const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("All");
  const [statusChanges, setStatusChanges] = useState({});
  const [savingId, setSavingId] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await api.get("/bookings/admin/all");
      const bookings = response.data.bookings;
      if (!Array.isArray(bookings)) {
        throw new Error("The server returned an invalid appointments list.");
      }
      setAppointments(bookings);
      setStatusChanges({});
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load appointments. Check your admin login and backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = (id, status) => {
    setStatusChanges((previous) => ({ ...previous, [id]: status }));
    setNotice("");
    setError("");
  };

  const updateStatus = async (appointment) => {
    const id = appointment._id;
    const status = statusChanges[id] ?? appointment.status ?? "Pending";

    if (!STATUSES.includes(status)) {
      setError("Please select a valid appointment status.");
      return;
    }
    if (status === appointment.status) {
      setNotice("No status changes to save.");
      return;
    }
    if (savingId) return;

    setSavingId(id);
    setError("");
    setNotice("");

    try {
      const response = await api.patch(`/bookings/admin/${id}/status`, { status });
      const updatedBooking = response.data.booking;

      setAppointments((previous) =>
        previous.map((item) =>
          item._id === id
            ? { ...item, ...(updatedBooking || {}), status: updatedBooking?.status || status }
            : item
        )
      );
      setStatusChanges((previous) => {
        const updated = { ...previous };
        delete updated[id];
        return updated;
      });
      setNotice(response.data.message || `Appointment status updated to ${status}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update appointment status. Please try again.");
    } finally {
      setSavingId("");
    }
  };

  const filteredAppointments =
    filter === "All"
      ? appointments
      : appointments.filter(
          (appointment) => appointment.status?.toLowerCase() === filter.toLowerCase()
        );

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusStyle = (status) => {
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

  const countStatus = (status) =>
    appointments.filter((item) => item.status?.toLowerCase() === status.toLowerCase()).length;

  const inputClass =
    "rounded-xl border border-[#dfe4db] bg-white px-3 py-2 text-sm outline-none focus:border-[#78977b] focus:ring-2 focus:ring-[#e8eee5]";

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#263a31]">
      <header className="border-b border-[#e5e7df] bg-[#fdfdfa]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/admin" className="flex items-center gap-3">
            <span className="rounded-xl bg-[#214e41] p-2.5 text-white">
              <CalendarDays size={22} />
            </span>
            <span className="text-xl font-bold tracking-tight text-[#214e41]">
              OmniBook <span className="font-medium text-[#78977b]">Admin</span>
            </span>
          </Link>
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#526157] hover:bg-[#edf1e9]">
            <ArrowLeft size={17} /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#78977b]">Administration</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#214e41] sm:text-4xl">
              Manage appointments
            </h1>
            <p className="mt-2 text-[#718078]">
              View bookings and manage customer appointment statuses.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchAppointments}
            disabled={loading || Boolean(savingId)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe4db] bg-white px-4 py-3 text-sm font-semibold text-[#46564c] hover:bg-[#f0f2ed] disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard icon={ClipboardList} title="Total appointments" value={appointments.length} />
          <StatCard icon={Clock} title="Pending" value={countStatus("Pending")} />
          <StatCard icon={CalendarDays} title="Confirmed" value={countStatus("Confirmed")} />
        </div>

        {(notice || error) && (
          <div
            role={error ? "alert" : "status"}
            className={`mt-5 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[#d5e2d3] bg-[#f0f6ee] text-[#285b3b]"
            }`}
          >
            {error || notice}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-3xl border border-[#e5e7df] bg-white shadow-[0_8px_28px_rgba(33,78,65,0.04)]">
          <div className="flex flex-col gap-4 border-b border-[#edf0e9] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-[#263a31]">Appointment records</h2>
              <p className="mt-1 text-sm text-[#718078]">
                {filteredAppointments.length} appointment{filteredAppointments.length === 1 ? "" : "s"}
              </p>
            </div>
            <select
              aria-label="Filter appointments by status"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className={inputClass}
            >
              <option value="All">All statuses</option>
              {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#718078]">
              <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-[#78977b]" />
              Loading appointments...
            </div>
          ) : error && appointments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button type="button" onClick={fetchAppointments} className="mt-4 rounded-xl bg-[#214e41] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173b30]">
                Try again
              </button>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays size={38} className="mx-auto text-[#9aab9b]" />
              <h3 className="mt-4 font-semibold text-[#263a31]">No appointments found</h3>
              <p className="mt-2 text-sm text-[#718078]">Appointments matching this filter will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-[#f5f6f1] text-xs uppercase tracking-wide text-[#718078]">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Service</th>
                    <th className="px-5 py-4">Date &amp; time</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Current status</th>
                    <th className="px-5 py-4">Update status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0e9]">
                  {filteredAppointments.map((appointment) => {
                    const customer = appointment.user || {};
                    const service = appointment.service || {};
                    const selectedStatus = statusChanges[appointment._id] ?? appointment.status ?? "Pending";
                    const isSaving = savingId === appointment._id;

                    return (
                      <tr key={appointment._id} className="transition hover:bg-[#fbfcf9]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-[#e8eee5] p-2 text-[#214e41]">
                              <UserRound size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-[#263a31]">{customer.name || "Unknown customer"}</p>
                              <p className="mt-1 text-xs text-[#718078]">{customer.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-[#46564c]">{service.name || "Service unavailable"}</td>
                        <td className="px-5 py-4 text-[#647168]">
                          <p>{formatDate(appointment.appointmentDate || appointment.startTime)}</p>
                          <p className="mt-1 text-xs text-[#718078]">{formatTime(appointment.startTime)}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-[#263a31]">
                          <span className="inline-flex items-center"><IndianRupee size={14} />{appointment.totalAmount ?? service.price ?? 0}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(appointment.status)}`}>
                            {appointment.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              aria-label={`Status for ${customer.name || "appointment"}`}
                              value={selectedStatus}
                              disabled={Boolean(savingId)}
                              onChange={(event) => handleStatusChange(appointment._id, event.target.value)}
                              className={inputClass}
                            >
                              {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                            <button
                              type="button"
                              onClick={() => updateStatus(appointment)}
                              disabled={Boolean(savingId) || selectedStatus === appointment.status}
                              title="Save status"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#214e41] px-3 py-2 text-white hover:bg-[#173b30] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                              Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-6 flex items-center gap-2 text-xs text-[#849087]">
          <Leaf size={14} /> OmniBook · One platform. Every appointment.
        </p>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-[#e5e7df] bg-white p-5 shadow-[0_8px_28px_rgba(33,78,65,0.04)]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#718078]">{title}</p>
        <div className="rounded-xl bg-[#e8eee5] p-2.5 text-[#214e41]"><Icon size={20} /></div>
      </div>
      <p className="mt-4 text-3xl font-bold text-[#214e41]">{value}</p>
    </div>
  );
}

export default ManageAppointments;
