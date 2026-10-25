
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import api from "../api/axios";

function Booking() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [service, setService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const today = (() => {
    const now = new Date();
    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 10);
  })();

  useEffect(() => {
    if (!date || !serviceId) {
      setSlots([]);
      setService(null);
      setSelectedSlot(null);
      return;
    }

    let cancelled = false;

    const loadSlots = async () => {
      setLoadingSlots(true);
      setError("");
      setNotice("");
      setSlots([]);
      setService(null);
      setSelectedSlot(null);

      try {
        const response = await api.get("/bookings/slots", {
          params: { serviceId, date },
        });

        if (cancelled) return;

        setSlots(response.data.slots || []);
        setService(response.data.service || null);

        if (
          !response.data.slots?.some((slot) => slot.available)
        ) {
          setNotice(
            "No available slots for this date. Please choose another date."
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Could not load available time slots."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    };

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [date, serviceId]);

  const selectDate = (value) => {
    setDate(value);
    setSelectedSlot(null);
    setError("");
    setNotice("");
  };

  const confirmBooking = async () => {
    if (!selectedSlot || !service || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await api.post("/bookings/confirm", {
        confirmed: true,
        serviceId,
        startTime: selectedSlot.startTime,
      });

      navigate("/appointments", {
        state: {
          message: "Your appointment has been booked successfully.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Booking failed. Please select another slot and try again."
      );

      // Refresh availability in case another customer
      // booked the selected slot.
      try {
        const response = await api.get("/bookings/slots", {
          params: { serviceId, date },
        });

        setSlots(response.data.slots || []);
        setService(response.data.service || service);
        setSelectedSlot(null);

        if (
          !response.data.slots?.some((slot) => slot.available)
        ) {
          setNotice(
            "No available slots for this date. Please choose another date."
          );
        }
      } catch {
        // Keep the original booking error visible.
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-[#dfe4db] bg-white p-3.5 text-sm outline-none transition focus:border-[#78977b] focus:ring-4 focus:ring-[#e8eee5]";

  const selectedDateLabel = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const availableSlots = slots.filter((slot) => slot.available);
  const unavailableSlots = slots.filter((slot) => !slot.available);

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-8 text-[#263a31] sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#426b55] hover:text-[#214e41]"
        >
          <ArrowLeft size={16} />
          Back to services
        </Link>

        <section className="mt-6 rounded-3xl border border-[#e5e7df] bg-white p-5 shadow-[0_12px_40px_rgba(33,78,65,0.06)] sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8eee5] text-[#214e41]">
            <CalendarDays size={29} />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#78977b]">
            Make it yours
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#214e41]">
            Book an appointment
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#718078]">
            Choose a date, select an available time, and review your
            appointment before confirming.
          </p>

          <div className="mt-8 space-y-6">
            {/* Appointment date */}
            <div>
              <label
                htmlFor="date"
                className="mb-2 block text-sm font-semibold text-[#35483d]"
              >
                Appointment date
              </label>

              <input
                id="date"
                type="date"
                min={today}
                value={date}
                onChange={(event) => selectDate(event.target.value)}
                className={fieldClass}
              />
            </div>

            {/* Time slots */}
            {date && (
              <section aria-live="polite">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-[#35483d]">
                    Available time slots
                  </h2>

                  {service && (
                    <span className="text-xs text-[#718078]">
                      {service.duration} min per appointment
                    </span>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="flex items-center gap-2 py-5 text-sm text-[#718078]">
                    <LoaderCircle size={18} className="animate-spin" />
                    Loading available slots...
                  </div>
                ) : slots.length > 0 ? (
                  <div className="space-y-4">
                    {/* Show only available slots by default */}
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {availableSlots.map((slot) => {
                          const selected =
                            selectedSlot?.startTime === slot.startTime;

                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              disabled={submitting}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setError("");
                              }}
                              aria-pressed={selected}
                              className={`rounded-lg border px-2 py-3 text-sm font-medium transition ${
                                selected
                                  ? "border-[#214e41] bg-[#214e41] text-white"
                                  : "border-[#dfe4db] bg-white text-[#35483d] hover:border-[#78977b] hover:bg-[#f5f8f2]"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-xl bg-[#f6f7f3] p-4 text-sm text-[#718078]">
                        No available times for this date. Please choose
                        another date.
                      </p>
                    )}

                    {/* Expand to see unavailable slots */}
                    {unavailableSlots.length > 0 && (
                      <details className="rounded-xl border border-[#eceee9] bg-[#fafbf8] p-3">
                        <summary className="cursor-pointer text-sm font-medium text-[#718078]">
                          Show unavailable times (
                          {unavailableSlots.length})
                        </summary>

                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {unavailableSlots.map((slot) => (
                            <div
                              key={slot.startTime}
                              className="rounded-lg border border-[#eceee9] bg-[#f0f1ee] px-2 py-3 text-center text-sm text-[#9aa29a]"
                            >
                              <span className="line-through">
                                {slot.time}
                              </span>
                              <span className="mt-1 block text-xs">
                                Unavailable
                              </span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  !error && (
                    <p className="rounded-xl bg-[#f6f7f3] p-4 text-sm text-[#718078]">
                      No time slots available for this date.
                    </p>
                  )
                )}
              </section>
            )}

            {notice && (
              <p className="rounded-xl bg-[#f6f7f3] p-3 text-sm text-[#627067]">
                {notice}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {/* Appointment review */}
            {selectedSlot && service && (
              <section className="rounded-2xl border border-[#dfe7dc] bg-[#fbfcf9] p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-[#214e41]">
                  <CheckCircle2 size={19} />
                  Review your appointment
                </p>

                <div className="mt-4 space-y-3 text-sm text-[#627067]">
                  <div>
                    <p className="text-xs text-[#718078]">Service</p>
                    <p className="mt-1 font-semibold text-[#35483d]">
                      {service.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#718078]">Date</p>
                    <p className="mt-1 font-semibold text-[#35483d]">
                      {selectedDateLabel}
                    </p>
                  </div>

                  <p className="flex items-center gap-2">
                    <Clock size={16} />
                    {selectedSlot.time}
                  </p>

                  <p>Duration: {service.duration} minutes</p>

                  <p className="font-semibold text-[#214e41]">
                    Price: ₹{service.price}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={confirmBooking}
                  disabled={submitting || loadingSlots}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#214e41] py-3.5 font-semibold text-white transition hover:bg-[#173b30] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Confirm appointment
                    </>
                  )}
                </button>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Booking;
