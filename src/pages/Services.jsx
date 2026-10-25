
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  ArrowRight,
  RefreshCw,
  LogOut,
  UserRound,
  Leaf,
} from "lucide-react";
import api from "../api/axios";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/services");
        setServices(response.data.services || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load services. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        const currentUser = response.data.user || response.data.data?.user || null;
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    fetchServices();
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setError(err.response?.data?.message || "Unable to log out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#263a31]">
      <nav className="border-b border-[#e5e7df] bg-[#fdfdfa]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-[#214e41]">
            <span className="rounded-xl bg-[#214e41] p-2 text-white">
              <CalendarDays size={22} />
            </span>
            OmniBook
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {!authLoading && (
              user ? (
                <>
                  <Link
                    to={user.role === "admin" ? "/admin" : "/appointments"}
                    className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#4c5e52] hover:bg-[#edf1e9] sm:flex"
                  >
                    <UserRound size={17} />
                    {user.role === "admin" ? "Dashboard" : "My appointments"}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#dfe4db] px-3 py-2 text-sm font-semibold text-[#46564c] hover:bg-[#f0f2ed] sm:px-4"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#46564c] hover:bg-[#edf1e9] sm:px-4">
                    Login
                  </Link>
                  <Link to="/signup" className="rounded-xl bg-[#214e41] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173b30]">
                    Sign up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dbe4d8] bg-[#edf2e9] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#426b55]">
            <Leaf size={14} /> Explore our services
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#214e41] sm:text-5xl">
            Find the right appointment.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#718078]">
            Browse available services, compare durations and prices, and choose a time that works for you.
          </p>
        </div>

        {loading && (
          <div className="py-16 text-center text-[#718078]">
            <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-[#78977b]" />
            Loading services...
          </div>
        )}

        {error && !loading && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-3 inline-flex items-center gap-2 font-semibold">
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-[#d9dfd6] bg-white p-10 text-center">
            <CalendarDays size={36} className="mx-auto text-[#78977b]" />
            <h2 className="mt-4 text-lg font-bold text-[#263a31]">No services available yet</h2>
            <p className="mt-2 text-sm text-[#718078]">
              Please check again after the administrator adds services.
            </p>
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service._id}
                className="group flex flex-col rounded-3xl border border-[#e5e7df] bg-white p-6 shadow-[0_8px_28px_rgba(33,78,65,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(33,78,65,0.09)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8eee5] text-[#214e41] transition group-hover:bg-[#214e41] group-hover:text-white">
                  <CalendarDays size={24} />
                </div>
                <h2 className="mt-5 text-xl font-bold text-[#263a31]">{service.name}</h2>
                <p className="mt-2 min-h-12 flex-1 text-sm leading-6 text-[#718078]">
                  {service.description || "Book this service at a convenient time."}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-[#edf0e9] pt-4">
                  <span className="flex items-center gap-1.5 text-sm text-[#718078]">
                    <Clock size={16} /> {service.duration} min
                  </span>
                  <span className="text-lg font-bold text-[#214e41]">₹{service.price}</span>
                </div>

                <Link
                  to={`/book/${service._id}`}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#214e41] px-4 py-3 font-semibold text-white transition hover:bg-[#173b30]"
                >
                  Book appointment <ArrowRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#e5e7df] px-5 py-6 text-center text-xs text-[#7c877e]">
        OmniBook · One platform. Every appointment.
      </footer>
    </div>
  );
}

export default Services;
