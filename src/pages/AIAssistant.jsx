
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  UserRound,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Leaf,
} from "lucide-react";
import api from "../api/axios";

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! Tell me what service you need or ask me about our available services. I can also help you book an appointment.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessageContent = async (value) => {
    const content = value.trim();
    if (!content || loading) return;

    setMessages((previous) => [...previous, { role: "user", content }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      
const response = await api.post("/ai/chat", { message: content });
const data = response.data;

const reply = data.reply || data.message || "";

const claimsBookingSuccess =
  /\b(you have successfully booked|appointment booked successfully|booking confirmed|appointment confirmed|your appointment has been booked)\b/i.test(
    reply
  );

// Never display an AI-generated success claim as if it were a real booking.
const safeReply =
  claimsBookingSuccess && data.bookingCreated !== true
    ? "I couldn't verify that an appointment was saved. No booking confirmation is available yet. Please tell me the service, date, and time you want to book."
    : reply || "I couldn't generate a reply. Please try again.";

setMessages((previous) => [
  ...previous,
  {
    role: "assistant",
    content: safeReply,
    pendingConfirmation: data.pendingConfirmation === true,
    bookingCreated: data.bookingCreated === true,
    bookingId: data.bookingId || null,
    proposedAppointment: data.proposedAppointment || null,
  },
]);

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to contact the AI assistant. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    await sendMessageContent(input);
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-8 text-[#263a31] sm:py-12">
      <div className="mx-auto flex max-w-3xl flex-col">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#426b55] hover:text-[#214e41]"
        >
          <ArrowLeft size={16} /> Back home
        </Link>

        <header className="mt-6 flex items-center gap-4">
          <div className="rounded-2xl bg-[#e8eee5] p-3 text-[#214e41]">
            <Bot size={27} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                AI Booking Assistant
              </h1>
              <Leaf className="hidden text-[#78977b] sm:block" size={19} />
            </div>
            <p className="mt-1 text-sm text-[#718078]">
              Ask about services or arrange an appointment.
            </p>
          </div>
        </header>

        <section className="mt-7 flex min-h-[55vh] flex-col overflow-hidden rounded-3xl border border-[#e5e7df] bg-white shadow-[0_12px_40px_rgba(33,78,65,0.07)]">
          <div className="flex-1 space-y-6 p-4 sm:p-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8eee5] text-[#214e41]">
                    <Bot size={18} />
                  </div>
                )}

                <div className="flex max-w-[88%] flex-col gap-3">
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-[#214e41] text-white"
                        : "rounded-bl-md bg-[#f3f4ef] text-[#34463c]"
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.pendingConfirmation && (
                    <div className="rounded-2xl border border-[#d5e2d3] bg-[#f5f8f2] p-4">
                      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#214e41]">
                        <Clock size={17} /> Confirm your appointment
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => sendMessageContent("yes")}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#214e41] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#173b30] disabled:opacity-50"
                        >
                          <CheckCircle2 size={16} /> Confirm booking
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => sendMessageContent("no")}
                          className="rounded-xl border border-[#d9dfd6] bg-white px-4 py-2.5 text-sm font-semibold text-[#46564c] hover:bg-[#f4f5f0] disabled:opacity-50"
                        >
                          Choose another time
                        </button>
                      </div>
                    </div>
                  )}

                  {message.bookingCreated && (
                    <div className="rounded-2xl border border-[#cfe0cd] bg-[#f0f6ee] p-4 text-sm text-[#285b3b]">
                      <p className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 size={17} />
                        Appointment booked successfully
                      </p>
                      {message.bookingId && (
                        <p className="mt-2 break-all text-xs">
                          Booking ID: {message.bookingId}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e9ebe6] text-[#526157]">
                    <UserRound size={18} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <p className="text-sm text-[#718078]">
                Assistant is thinking...
              </p>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          <form
            onSubmit={sendMessage}
            className="flex gap-3 border-t border-[#edf0e9] bg-[#fdfdfa] p-3 sm:p-4"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about services or booking..."
              aria-label="Message the AI assistant"
              className="min-w-0 flex-1 rounded-xl border border-[#dfe4db] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#78977b] focus:ring-4 focus:ring-[#e8eee5]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center rounded-xl bg-[#214e41] px-4 text-white transition hover:bg-[#173b30] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={19} />
            </button>
          </form>
        </section>

        <p className="mt-4 text-xs leading-5 text-[#78837b]">
          Your appointment is created only after you confirm and the server
          validates the booking. Prices and times are subject to the
          availability checks performed by the application.
        </p>
      </div>
    </main>
  );
}

export default AIAssistant;
