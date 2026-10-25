
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Bot,
  Clock,
  ArrowRight,
  LogOut,
  UserRound,
  CheckCircle2,
  Sparkles,
  MoveUpRight,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import api from "../api/axios";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        const data = response.data;

        if (active) {
          setUser(data.user ?? data.data?.user ?? data);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setAuthChecked(true);
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await api.post("/auth/logout");
      setUser(null);
      setMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen overflow-hidden bg-[#faf9f6] text-[#183b32]">
      {/* Navigation */}
      <nav className="relative z-20 border-b border-[#183b32]/10 bg-[#faf9f6]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#214e41] text-white shadow-sm">
              <CalendarDays size={23} strokeWidth={1.8} />
            </span>
            <span className="text-2xl font-bold tracking-tight">
              Omni<span className="text-[#78977b]">Book</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/services"
              className="text-sm font-medium text-[#5d7068] transition hover:text-[#214e41]"
            >
              Explore services
            </Link>

            <Link
              to="/ai-assistant"
              className="text-sm font-medium text-[#5d7068] transition hover:text-[#214e41]"
            >
              AI assistant
            </Link>

            {authChecked && user && (
              <>
                <Link
                  to={isAdmin ? "/admin" : "/appointments"}
                  className="text-sm font-medium text-[#5d7068] transition hover:text-[#214e41]"
                >
                  {isAdmin ? "Admin dashboard" : "My appointments"}
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-2 rounded-full border border-[#214e41]/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-[#214e41]/5 disabled:opacity-50"
                >
                  <LogOut size={15} />
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            )}

            {authChecked && !user && (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold transition hover:text-[#78977b]"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[#214e41] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#183b32]"
                >
                  Get started <ArrowRight size={16} />
                </Link>
              </>
            )}

            {!authChecked && (
              <span className="text-sm text-[#5d7068]">
                Checking login...
              </span>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#214e41]/15 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {menuOpen && (
          <div className="absolute left-0 right-0 top-full border-b border-[#214e41]/10 bg-[#faf9f6] px-5 py-5 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <MobileLink to="/services" onClick={closeMenu}>
                Explore services
              </MobileLink>

              <MobileLink to="/ai-assistant" onClick={closeMenu}>
                AI assistant
              </MobileLink>

              {authChecked && user && (
                <>
                  <MobileLink
                    to={isAdmin ? "/admin" : "/appointments"}
                    onClick={closeMenu}
                  >
                    {isAdmin ? "Admin dashboard" : "My appointments"}
                  </MobileLink>

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              )}

              {authChecked && !user && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-xl border border-[#214e41]/20 px-4 py-3 text-center text-sm font-semibold"
                  >
                    Log in
                  </Link>

                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="rounded-xl bg-[#214e41] px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Get started
                  </Link>
                </div>
              )}

              {!authChecked && (
                <p className="px-4 py-3 text-sm text-[#5d7068]">
                  Checking login...
                </p>
              )}
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero */}
        <section className="relative px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:px-12 lg:pt-28">
          <div className="pointer-events-none absolute -right-40 -top-24 h-[430px] w-[430px] rounded-full bg-[#e6ebdf] opacity-70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-32 h-[350px] w-[350px] rounded-full bg-[#f2e7d6] opacity-60 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#214e41]/10 bg-white/80 px-4 py-2 text-sm font-medium text-[#476a58] shadow-sm">
                <Sparkles size={16} />
                A simpler way to manage your time
              </div>

              <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-[1.08] tracking-[-0.055em] text-[#183b32] sm:text-6xl lg:text-7xl">
                Your time.
                <br />
                Your choice.
                <br />
                <span className="font-serif italic font-normal text-[#78977b]">
                  Your appointment.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-[#64746c] sm:text-lg">
                Discover services, find a time that works for you, and make
                every appointment effortless—with a little help from AI.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#214e41] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#214e41]/15 transition hover:-translate-y-0.5 hover:bg-[#183b32]"
                >
                  Explore services <ArrowRight size={17} />
                </Link>

                <Link
                  to="/ai-assistant"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#214e41]/15 bg-white/80 px-7 py-4 text-sm font-semibold text-[#214e41] transition hover:border-[#214e41]/40 hover:bg-white"
                >
                  <Bot size={18} /> Ask AI assistant
                </Link>
              </div>

              {user && (
                <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-[#214e41]/10 bg-white/80 px-4 py-3 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6ebdf] text-[#214e41]">
                    <UserRound size={19} />
                  </span>

                  <div>
                    <p className="text-xs text-[#78867e]">Welcome back</p>
                    <p className="text-sm font-semibold text-[#183b32]">
                      {user.name || "Great to see you again"}
                    </p>
                  </div>

                  <CheckCircle2 size={18} className="ml-3 text-[#78977b]" />
                </div>
              )}

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#64746c]">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#78977b]" />
                  Simple scheduling
                </span>

                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#78977b]" />
                  AI assistance
                </span>
              </div>
            </div>

            {/* Decorative appointment preview */}
            <div className="relative mx-auto w-full max-w-[510px]">
              <div className="absolute -right-3 top-8 h-28 w-28 rounded-full border border-[#78977b]/30 sm:-right-7" />
              <div className="absolute -bottom-5 -left-4 h-24 w-24 rounded-full bg-[#e7d8c3]/70 blur-2xl" />

              <div className="relative rounded-[2rem] border border-white bg-white/80 p-4 shadow-2xl shadow-[#183b32]/10 backdrop-blur-sm sm:p-7">
                <div className="flex items-center justify-between border-b border-[#183b32]/10 pb-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8a9990]">
                      Your schedule
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#183b32]">
                      Plan with ease
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8eee5] text-[#214e41]">
                    <CalendarDays size={23} />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#183b32]">
                      Choose your day
                    </p>
                    <p className="mt-1 text-xs text-[#8a9990]">
                      A little time for what matters
                    </p>
                  </div>

                  <CalendarDays size={18} className="text-[#78977b]" />
                </div>

                <div className="mt-5 grid grid-cols-7 gap-2">
                  {[
                    ["M", "12"],
                    ["T", "13"],
                    ["W", "14"],
                    ["T", "15"],
                    ["F", "16"],
                    ["S", "17"],
                    ["S", "18"],
                  ].map(([day, date], index) => (
                    <div
                      key={`${day}-${date}`}
                      className={`rounded-2xl py-3 text-center ${
                        index === 2
                          ? "bg-[#214e41] text-white shadow-md shadow-[#214e41]/20"
                          : "bg-[#f5f6f1] text-[#64746c]"
                      }`}
                    >
                      <p className="text-[10px]">{day}</p>
                      <p className="mt-2 text-sm font-semibold">{date}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-7">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#183b32]">
                      A smoother day
                    </p>

                    <span className="rounded-full bg-[#e8eee5] px-3 py-1 text-xs font-medium text-[#476a58]">
                      Stay organized
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#214e41]/10 bg-[#faf9f6] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8eee5] text-[#214e41]">
                        <Clock size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#183b32]">
                          Your next appointment
                        </p>
                        <p className="mt-1 text-xs text-[#78867e]">
                          Find a time that suits you
                        </p>
                      </div>

                      <ArrowRight size={17} className="text-[#78977b]" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#214e41] p-4 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Bot size={21} />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold">Need a little help?</p>
                    <p className="mt-1 text-xs text-white/70">
                      Let AI help you explore your options
                    </p>
                  </div>

                  <Sparkles size={18} className="text-[#d6e4c9]" />
                </div>
              </div>

              <div className="absolute -left-5 top-1/3 hidden items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl shadow-[#183b32]/10 sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8eee5] text-[#214e41]">
                  <ShieldCheck size={19} />
                </span>

                <div>
                  <p className="text-xs font-semibold text-[#183b32]">
                    Simple & convenient
                  </p>
                  <p className="mt-1 text-[11px] text-[#78867e]">
                    All in one place
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#78977b]">
                Made for your everyday
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#183b32] sm:text-4xl">
                Less planning. More living.
              </h2>

              <p className="mt-4 leading-7 text-[#64746c]">
                Everything you need to discover services and stay on top of
                your schedule, all in one place.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <Feature
                icon={<CalendarDays size={23} />}
                number="01"
                title="Easy appointments"
                description="Browse services and choose your preferred date and time without the hassle."
              />

              <Feature
                icon={<Bot size={23} />}
                number="02"
                title="AI assistance"
                description="Tell our AI assistant what you need and get help exploring suitable services."
              />

              <Feature
                icon={<Clock size={23} />}
                number="03"
                title="Your bookings, organized"
                description="Keep track of your appointments and cancel eligible bookings when plans change."
              />
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="px-5 pb-20 sm:px-8 lg:px-12">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#214e41] px-7 py-14 text-white sm:px-12 sm:py-16 lg:px-16">
            <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-2 -top-12 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-white/5 blur-2xl" />

            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d6e4c9]">
                  Your next step starts here
                </p>

                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Make room for what matters.
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-white/70">
                  Discover our services and find an appointment that fits
                  your day.
                </p>
              </div>

              <Link
                to="/services"
                className="inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-full bg-[#faf9f6] px-7 py-4 text-sm font-semibold text-[#214e41] transition hover:-translate-y-0.5 hover:bg-white md:self-center"
              >
                Browse services <MoveUpRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#183b32]/10 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <CalendarDays size={21} className="text-[#78977b]" />
            OmniBook
          </Link>

          <p className="text-sm text-[#78867e]">
            © {new Date().getFullYear()} OmniBook. One platform. Every appointment.
          </p>

          <Link
            to="/services"
            className="text-sm font-medium text-[#476a58] transition hover:text-[#183b32]"
          >
            Explore services <span aria-hidden="true">→</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-xl px-4 py-3 text-sm font-medium text-[#5d7068] transition hover:bg-[#214e41]/5 hover:text-[#214e41]"
    >
      {children}
    </Link>
  );
}

function Feature({ icon, number, title, description }) {
  return (
    <article className="group rounded-3xl border border-[#214e41]/10 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#78977b]/40 hover:shadow-xl hover:shadow-[#183b32]/5 sm:p-8">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8eee5] text-[#214e41] transition group-hover:bg-[#214e41] group-hover:text-white">
          {icon}
        </div>

        <span className="font-serif text-sm italic text-[#9aaa9f]">
          {number}
        </span>
      </div>

      <h3 className="mt-7 text-xl font-semibold tracking-tight text-[#183b32]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[#718078]">
        {description}
      </p>
    </article>
  );
}

export default Home;
