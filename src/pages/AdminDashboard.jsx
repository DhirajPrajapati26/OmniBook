
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  BriefcaseBusiness,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  IndianRupee,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  ClipboardList,
  Leaf,
} from "lucide-react";
import api from "../api/axios";

const STATUS_COLORS = {
  Pending: "bg-amber-500",
  Confirmed: "bg-[#78977b]",
  Completed: "bg-emerald-600",
  Cancelled: "bg-red-500",
};

const STATUS_TEXT_COLORS = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-[#e8eee5] text-[#315c42]",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
};

const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

const currency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const getBookingDate = (appointment) =>
  appointment.startTime ||
  appointment.appointmentDate ||
  appointment.createdAt;

const SALON_TIME_ZONE = "Asia/Kolkata";

const getDateKey = (value, timeZone = SALON_TIME_ZONE) => {
  if (!value) return "";

  // Appointment dates may be stored as date-only strings; preserve their calendar day.
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};

const isSameDay = (first, second) => {
  const firstKey = getDateKey(first);
  const secondKey = getDateKey(second);

  return Boolean(firstKey && secondKey && firstKey === secondKey);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
      timeZone: SALON_TIME_ZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
    });
};

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    if (hasLoaded) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const [bookingResponse, serviceResponse] = await Promise.all([
        api.get("/bookings/admin/all"),
        api.get("/services/admin/all"),
      ]);

      setAppointments(bookingResponse.data.bookings || []);
      setServices(serviceResponse.data.services || []);
      setHasLoaded(true);
    } catch (err) {
      console.error("Dashboard loading error:", err);

      if (err.response?.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      const serverMessage = err.response?.data?.message;
      setError(
        hasLoaded
          ? `Refresh failed${serverMessage ? `: ${serverMessage}` : ". Showing the previously loaded data, which may be out of date."}`
          : serverMessage ||
          "Could not load dashboard data. Check your admin login and API routes."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const today = new Date();

  const todayAppointments = appointments.filter((appointment) =>
    isSameDay(getBookingDate(appointment), today)
  );

  const pendingCount = appointments.filter(
    (appointment) => appointment.status === "Pending"
  ).length;

  const confirmedCount = appointments.filter(
    (appointment) => appointment.status === "Confirmed"
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length;

  const cancelledCount = appointments.filter(
    (appointment) => appointment.status === "Cancelled"
  ).length;



  // Exclude cancelled appointments from this recorded-value estimate.
  const totalRevenue = appointments
    .filter((appointment) => appointment.status !== "Cancelled")
    .reduce(
      (sum, appointment) =>
        sum + Number(appointment.totalAmount || 0),
      0
    );

  const activeServices = services.filter(
    (service) => service.isActive !== false
  );

  // Count appointments by their scheduled date in the salon's timezone.
  const todayKey = getDateKey(new Date());
  const dailyBookings = Array.from({ length: 7 }, (_, index) => {
    const [year, month, day] = todayKey.split("-").map(Number);
    const calendarDate = new Date(Date.UTC(year, month - 1, day - (6 - index)));
    const dateKey = `${calendarDate.getUTCFullYear()}-${String(
      calendarDate.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(calendarDate.getUTCDate()).padStart(2, "0")}`;
    // Use midday UTC to format the label without shifting the calendar day.
    const labelDate = new Date(`${dateKey}T12:00:00.000Z`);

    const count = appointments.filter(
      (appointment) => getDateKey(getBookingDate(appointment)) === dateKey
    ).length;

    return {
      date: dateKey,
      label: labelDate.toLocaleDateString("en-IN", {
        timeZone: SALON_TIME_ZONE,
        day: "numeric",
        month: "short",
      }),
      count,
    };
  });

  const maxDailyBookings = Math.max(
    1,
    ...dailyBookings.map((day) => day.count)
  );

  // Rank services by the number of appointments referencing them.
  const serviceCounts = appointments.reduce((result, appointment) => {
    const serviceId = appointment.service?._id || appointment.service;

    if (!serviceId) return result;

    const id = String(serviceId);
    const serviceName = appointment.service?.name || "Unknown service";

    if (!result[id]) {
      result[id] = {
        id,
        name: serviceName,
        count: 0,
      };
    }

    result[id].count += 1;
    return result;
  }, {});

  const popularServices = Object.values(serviceCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxServiceBookings = Math.max(
    1,
    ...popularServices.map((service) => service.count)
  );

  const stats = [
    {
      title: "Total Appointments",
      value: appointments.length,
      icon: CalendarDays,
      description: "All recorded bookings",
      iconClass: "bg-[#e8eee5] text-[#315c42]",
    },
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      icon: Clock,
      description: "Scheduled today",
      iconClass: "bg-[#f3eee3] text-[#8a7044]",
    },
    {
      title: "Active Services",
      value: activeServices.length,
      icon: BriefcaseBusiness,
      description: "Currently available",
      iconClass: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Pending / Confirmed",
      value: pendingCount + confirmedCount,
      icon: TrendingUp,
      description: "Awaiting or scheduled",
      iconClass: "bg-[#edf0e9] text-[#536e56]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#263b32]">
      {/* Top navigation */}
      <header className="sticky top-0 z-20 border-b border-[#e9e8df] bg-[#faf9f6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#214e41] text-white shadow-sm">
              <CalendarDays size={21} />
            </div>

            <div>
              <p className="text-xl font-bold tracking-tight text-[#214e41]">
                OmniBook<span className="text-[#78977b]">.</span>
              </p>
              <p className="text-xs text-[#828a80]">Admin workspace</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={loadDashboard}
              disabled={loading || refreshing}
              className="flex items-center gap-2 rounded-xl border border-[#dedfd5] bg-white px-3 py-2.5 text-sm font-medium text-[#405347] transition hover:border-[#b7cbb4] hover:bg-[#f5f7f1] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
            >
              <RefreshCw
                size={16}
                className={loading || refreshing ? "animate-spin" : ""}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            <Link
              to="/"
              className="text-sm font-semibold text-[#52665a] transition hover:text-[#214e41]"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#214e41] text-white shadow-sm">
              <LayoutDashboard size={24} />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#78977b]">
                Overview
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[#263b32] sm:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7d847c] sm:text-base">
                Monitor appointments, manage services, and review your
                business activity in one place.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce6d8] bg-[#f0f5ed] px-3.5 py-2 text-sm font-medium text-[#315c42]">
            <span className="h-2 w-2 rounded-full bg-[#78977b]" />
            OmniBook workspace
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load dashboard</p>
              <p className="mt-1 text-sm">{error}</p>
              <button
                onClick={loadDashboard}
                className="mt-3 text-sm font-semibold underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-[#e9e8df] bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8eee5] text-[#315c42]">
              <RefreshCw size={23} className="animate-spin" />
            </div>
            <p className="mt-4 font-semibold text-[#405347]">
              Loading dashboard
            </p>
            <p className="mt-1 text-sm text-[#858b82]">
              Gathering your latest appointment and service data...
            </p>
          </div>
        ) : (
          <>
            {/* Overview cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="group rounded-2xl border border-[#e9e8df] bg-white p-5 shadow-[0_3px_14px_rgba(33,78,65,0.025)] transition hover:-translate-y-0.5 hover:border-[#d5dfd0] hover:shadow-md sm:p-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-[#737c73]">
                        {stat.title}
                      </p>

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                      >
                        <Icon size={21} />
                      </div>
                    </div>

                    <p className="mt-5 text-3xl font-semibold tracking-tight text-[#263b32]">
                      {stat.value}
                    </p>

                    <p className="mt-1.5 text-xs text-[#899087]">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Revenue overview */}
            <section className="relative mt-6 overflow-hidden rounded-3xl bg-[#214e41] p-6 text-white shadow-sm sm:p-8">
              <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-white/10" />

              <div className="relative flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#d0ddd3]">
                    <IndianRupee size={18} />
                    <p>Recorded appointment value</p>
                  </div>

                  <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {currency(totalRevenue)}
                  </p>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-[#d0ddd3]">
                    Includes Pending, Confirmed, and Completed appointments;
                    excludes Cancelled appointments. This is recorded booking
                    value, not confirmed money collected.
                  </p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#d0e0cd]">
                  <TrendingUp size={30} />
                </div>
              </div>
            </section>

            {/* Booking trend and appointment status */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-[#e9e8df] bg-white p-5 shadow-sm sm:p-6">
                <SectionHeading
                  icon={<BarChart3 size={22} />}
                  title="Appointments by Scheduled Date"
                  description="Appointments scheduled on each of the last seven days (IST)"
                />

                <div className="mt-8 flex h-48 items-end justify-around gap-3 border-b border-[#ecece5] pb-2">
                  {dailyBookings.map((day) => (
                    <div
                      key={day.date}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-semibold text-[#53665a]">
                        {day.count}
                      </span>

                      <div className="flex h-32 w-full items-end justify-center">
                        <div
                          title={`${day.count} appointments`}
                          className="w-full max-w-10 rounded-t-lg bg-[#78977b] transition-all duration-300"
                          style={{
                            height: `${Math.max(
                              day.count > 0 ? 8 : 2,
                              (day.count / maxDailyBookings) * 100
                            )}%`,
                            opacity: day.count === 0 ? 0.25 : 1,
                          }}
                        />
                      </div>

                      <span className="text-center text-xs text-[#858b82]">
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#e9e8df] bg-white p-5 shadow-sm sm:p-6">
                <SectionHeading
                  icon={<ClipboardList size={22} />}
                  title="Appointment Status"
                  description="Breakdown of all recorded bookings"
                />

                <div className="mt-7 space-y-5">
                  {STATUSES.map((status) => {
                    const count = appointments.filter(
                      (appointment) => appointment.status === status
                    ).length;

                    const percentage = appointments.length
                      ? (count / appointments.length) * 100
                      : 0;

                    return (
                      <div key={status}>
                        <div className="mb-2 flex justify-between gap-3 text-sm">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TEXT_COLORS[status]}`}
                          >
                            {status}
                          </span>

                          <span className="text-[#737c73]">
                            {count} ({Math.round(percentage)}%)
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-[#f0f0eb]">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${STATUS_COLORS[status]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Popular services */}
            <section className="mt-6 rounded-2xl border border-[#e9e8df] bg-white p-5 shadow-sm sm:p-6">
              <SectionHeading
                icon={<BriefcaseBusiness size={22} />}
                title="Popular Services"
                description="Ranked by number of recorded appointments"
              />

              {popularServices.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1f3ed] text-[#82917f]">
                    <BriefcaseBusiness size={23} />
                  </div>
                  <p className="mt-4 font-semibold text-[#405347]">
                    No service statistics yet
                  </p>
                  <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#858b82]">
                    Service booking statistics will appear here once customers
                    make appointments.
                  </p>
                </div>
              ) : (
                <div className="mt-7 space-y-5">
                  {popularServices.map((service, index) => (
                    <div key={service.id}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf1e9] text-sm font-semibold text-[#315c42]">
                            {index + 1}
                          </span>

                          <span className="truncate text-sm font-semibold text-[#34473b]">
                            {service.name}
                          </span>
                        </div>

                        <span className="shrink-0 text-xs font-medium text-[#7d847c] sm:text-sm">
                          {service.count}{" "}
                          {service.count === 1 ? "booking" : "bookings"}
                        </span>
                      </div>

                      <div className="ml-12 h-2 overflow-hidden rounded-full bg-[#f0f0eb]">
                        <div
                          className="h-full rounded-full bg-[#78977b] transition-all duration-300"
                          style={{
                            width: `${(service.count / maxServiceBookings) * 100
                              }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Management shortcuts */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-[#263b32]">
                  Quick management
                </h2>
                <p className="mt-1 text-sm text-[#7d847c]">
                  Jump directly to the areas you manage most.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <ManagementCard
                  to="/admin/services"
                  icon={<BriefcaseBusiness size={24} />}
                  title="Manage Services"
                  description="Add services, edit descriptions and prices, or deactivate services."
                  count={`${services.length} services found`}
                />

                <ManagementCard
                  to="/admin/appointments"
                  icon={<CalendarDays size={24} />}
                  title="Manage Appointments"
                  description="View customer bookings, filter records, and update appointment statuses."
                  count={`${appointments.length} appointments found`}
                />
              </div>
            </div>

            {/* Recent appointments */}
            <section className="mt-8 overflow-hidden rounded-2xl border border-[#e9e8df] bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecece5] p-5 sm:p-6">
                <div>
                  <h2 className="text-xl font-semibold text-[#263b32]">
                    Recent Appointments
                  </h2>
                  <p className="mt-1 text-sm text-[#7d847c]">
                    The latest bookings in your system.
                  </p>
                </div>

                <Link
                  to="/admin/appointments"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#315c42] transition hover:bg-[#f0f5ed]"
                >
                  View all
                  <ArrowRight size={16} />
                </Link>
              </div>

              {appointments.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f3ec] text-[#82917f]">
                    <CalendarDays size={24} />
                  </div>

                  <p className="mt-4 font-semibold text-[#405347]">
                    No appointments yet
                  </p>

                  <p className="mt-1 text-sm text-[#858b82]">
                    New customer bookings will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-[#f6f7f2] text-[#707b70]">
                      <tr>
                        <th className="px-6 py-4 font-semibold">
                          Customer
                        </th>
                        <th className="px-6 py-4 font-semibold">Service</th>
                        <th className="px-6 py-4 font-semibold">
                          Date &amp; time
                        </th>
                        <th className="px-6 py-4 font-semibold">Amount</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#f0f0eb]">
                      {[...appointments]
                        .sort(
                          (a, b) =>
                            new Date(getBookingDate(b) || 0) -
                            new Date(getBookingDate(a) || 0)
                        )
                        .slice(0, 5)
                        .map((appointment) => (
                          <tr
                            key={appointment._id}
                            className="transition hover:bg-[#fafbf8]"
                          >
                            <td className="px-6 py-4">
                              <p className="font-semibold text-[#34473b]">
                                {appointment.user?.name || "Unknown customer"}
                              </p>
                              <p className="mt-1 text-xs text-[#858b82]">
                                {appointment.user?.email || "No email"}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-[#59665a]">
                              {appointment.service?.name ||
                                "Service unavailable"}
                            </td>

                            <td className="px-6 py-4 text-[#59665a]">
                              <p>
                                {formatDate(
                                  appointment.appointmentDate ||
                                  appointment.startTime
                                )}
                              </p>
                              <p className="mt-1 text-xs text-[#858b82]">
                                {appointment.startTime
                                  ? new Date(
                                    appointment.startTime
                                  ).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                  : "—"}
                              </p>
                            </td>

                            <td className="px-6 py-4 font-semibold text-[#34473b]">
                              {currency(appointment.totalAmount)}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_TEXT_COLORS[appointment.status] ||
                                  "bg-[#f0f0eb] text-[#59665a]"
                                  }`}
                              >
                                {appointment.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Additional status summary */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MiniStat
                icon={<CheckCircle2 size={19} />}
                title="Completed"
                value={completedCount}
                color="text-emerald-700 bg-emerald-50"
              />

              <MiniStat
                icon={<Clock size={19} />}
                title="Pending"
                value={pendingCount}
                color="text-amber-700 bg-amber-50"
              />

              <MiniStat
                icon={<XCircle size={19} />}
                title="Cancelled"
                value={cancelledCount}
                color="text-red-700 bg-red-50"
              />
            </div>
          </>
        )}

        <footer className="mt-12 border-t border-[#e9e8df] py-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <Link to="/" className="flex items-center gap-2">
              <Leaf size={16} className="text-[#78977b]" />
              <span className="text-sm font-semibold text-[#214e41]">
                OmniBook
              </span>
            </Link>

            <p className="text-xs text-[#92988f]">
              One platform. Every appointment.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function SectionHeading({ icon, title, description }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8eee5] text-[#315c42]">
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#263b32]">{title}</h2>
        <p className="mt-1 text-sm text-[#858b82]">{description}</p>
      </div>
    </div>
  );
}

function ManagementCard({ to, icon, title, description, count }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-[#e9e8df] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c8d8c3] hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8eee5] text-[#315c42] transition group-hover:bg-[#214e41] group-hover:text-white">
          {icon}
        </div>

        <ArrowRight
          size={20}
          className="text-[#a0a79f] transition group-hover:translate-x-1 group-hover:text-[#315c42]"
        />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-[#263b32]">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-[#7d847c]">{description}</p>

      <p className="mt-4 text-sm font-semibold text-[#315c42]">{count}</p>
    </Link>
  );
}

function MiniStat({ icon, title, value, color }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#e9e8df] bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>

      <div>
        <p className="text-sm text-[#7d847c]">{title}</p>
        <p className="mt-1 text-xl font-semibold text-[#263b32]">{value}</p>
      </div>
    </div>
  );
}
