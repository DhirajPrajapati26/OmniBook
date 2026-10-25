
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import api from "../api/axios";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await api.post("/auth/signup", form);
      navigate("/login", {
        state: { message: "Account created! Please log in." },
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#e5e7df] bg-white py-3.5 pl-11 pr-4 text-sm text-[#263b32] outline-none transition placeholder:text-[#a0a79f] focus:border-[#78977b] focus:ring-4 focus:ring-[#e8eee5]";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf9f6] px-4 py-8 sm:px-6 lg:py-12">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#e8eee5] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[#f0e9dc] opacity-70 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#e9e8df] bg-white shadow-[0_24px_80px_rgba(33,78,65,0.09)] md:min-h-[650px] md:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#214e41] p-10 text-white md:flex lg:p-12">
          <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 top-32 h-48 w-48 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#78977b]/20 blur-2xl" />

          <Link to="/" className="relative flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <CalendarDays size={23} />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              OmniBook<span className="text-[#c9d8c6]">.</span>
            </span>
          </Link>

          <div className="relative py-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-sm text-[#e0e9dc]">
              <Sparkles size={15} />
              A better way to book
            </div>

            <h1 className="max-w-md text-4xl font-semibold leading-[1.15] tracking-tight lg:text-5xl">
              Make time for
              <br />
              <span className="text-[#c9d8c6]">what matters.</span>
            </h1>

            <p className="mt-6 max-w-sm text-base leading-7 text-[#d0ddd3]">
              Create your account to discover services, organize your
              appointments, and make scheduling a little simpler.
            </p>

            <div className="mt-9 space-y-4">
              <div className="flex items-center gap-3 text-sm text-[#e2ebe2]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <CheckCircle2 size={17} />
                </span>
                Keep your appointments organized
              </div>

              <div className="flex items-center gap-3 text-sm text-[#e2ebe2]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Clock3 size={17} />
                </span>
                Spend less time coordinating
              </div>
            </div>
          </div>

          <p className="relative text-sm text-[#c9d8c6]">
            One platform. Every appointment.
          </p>
        </div>

        {/* Signup form */}
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <Link to="/" className="mb-9 flex w-fit items-center gap-3 md:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#214e41] text-white">
              <CalendarDays size={23} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#214e41]">
                OmniBook
              </h1>
              <p className="text-xs text-[#7d897f]">
                One platform. Every appointment.
              </p>
            </div>
          </Link>

          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#78977b]">
              Get started today
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-[#263b32] sm:text-4xl">
              Create account
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#7d847c]">
              Join OmniBook and bring your appointments together in one place.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[#39483e]"
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#89968b]"
                />

                <input
                  id="name"
                  className={inputClass}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#39483e]"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#89968b]"
                />

                <input
                  id="email"
                  className={inputClass}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#39483e]"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#89968b]"
                />

                <input
                  id="password"
                  className={inputClass}
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <p className="mt-2 text-xs text-[#92988f]">
                Use at least 8 characters for your password.
              </p>
            </div>

            {message && (
              <p
                className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-600"
                role="alert"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#214e41] py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#193d32] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#dce8da] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && (
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#ecece5]" />
            <span className="text-xs text-[#9a9f97]">ALREADY A MEMBER?</span>
            <div className="h-px flex-1 bg-[#ecece5]" />
          </div>

          <p className="text-center text-sm text-[#737c73]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#214e41] underline decoration-[#b7cbb4] underline-offset-4 transition hover:text-[#52745b]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
