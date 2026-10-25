
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Clock,
  IndianRupee,
  BriefcaseBusiness,
  Leaf,
} from "lucide-react";
import api from "../api/axios";

const emptyForm = {
  name: "",
  description: "",
  duration: 30,
  price: "",
};

function ManageServices() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/services/admin/all");
      setServices(response.data.services || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load services. Check your admin login."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setNotice("");
    setShowForm(true);
  };

  const openEditForm = (service) => {
    setForm({
      name: service.name || "",
      description: service.description || "",
      duration: service.duration || 30,
      price: service.price ?? "",
    });
    setEditingId(service._id);
    setError("");
    setNotice("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setError("");
  };

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration: Number(form.duration),
      price: Number(form.price),
    };

    if (
      !payload.name ||
      !payload.description ||
      !Number.isFinite(payload.duration) ||
      payload.duration <= 0 ||
      !Number.isFinite(payload.price) ||
      payload.price < 0
    ) {
      setError("Enter valid service details, duration, and price.");
      setSaving(false);
      return;
    }

    try {
      if (editingId) {
        await api.patch(`/services/${editingId}`, payload);
        setNotice("Service updated successfully.");
      } else {
        await api.post("/services", payload);
        setNotice("Service added successfully.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchServices();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the service. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (service) => {
    const confirmed = window.confirm(
      `Deactivate "${service.name}"? It will no longer appear as an active service.`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/services/${service._id}`);
      setNotice("Service deactivated successfully.");
      await fetchServices();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to deactivate this service."
      );
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#dfe4db] bg-white px-4 py-3 text-sm text-[#263a31] outline-none transition placeholder:text-[#9aa49c] focus:border-[#78977b] focus:ring-4 focus:ring-[#e8eee5]";

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

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[#526157] transition hover:bg-[#edf1e9]"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#78977b]">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#214e41] sm:text-4xl">
              Manage services
            </h1>
            <p className="mt-2 text-[#718078]">
              Create and maintain the services customers can book.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={fetchServices}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#dfe4db] bg-white px-4 py-3 text-sm font-semibold text-[#46564c] transition hover:bg-[#f0f2ed] disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-2 rounded-xl bg-[#214e41] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#173b30]"
            >
              <Plus size={18} />
              Add service
            </button>
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-[#d5e2d3] bg-[#f0f6ee] p-4 text-sm text-[#285b3b]"
          >
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {showForm && (
          <section className="mt-8 rounded-3xl border border-[#e5e7df] bg-white p-6 shadow-[0_8px_28px_rgba(33,78,65,0.05)] sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#78977b]">
                  Service details
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#214e41]">
                  {editingId ? "Edit service" : "Add new service"}
                </h2>
                <p className="mt-1 text-sm text-[#718078]">
                  Enter the service details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl p-2 text-[#718078] transition hover:bg-[#f0f2ed] hover:text-[#214e41]"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-[#35483d]"
                  >
                    Service name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. Personal consultation"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="duration"
                    className="text-sm font-semibold text-[#35483d]"
                  >
                    Duration (minutes)
                  </label>
                  <input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    value={form.duration}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="text-sm font-semibold text-[#35483d]"
                  >
                    Price (₹)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="500"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-semibold text-[#35483d]"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className={inputClass}
                    rows={4}
                    placeholder="Describe this service..."
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#214e41] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#173b30] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create service"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-[#dfe4db] px-6 py-3 text-sm font-semibold text-[#46564c] transition hover:bg-[#f4f5f0]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-9">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#263a31]">
                All services
              </h2>
              <p className="mt-1 text-sm text-[#718078]">
                Manage the services listed on your platform.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[#e8eee5] px-3 py-1.5 text-sm font-semibold text-[#426b55]">
              {services.length} service{services.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[#e5e7df] bg-white p-12 text-center text-[#718078]">
              <RefreshCw
                size={24}
                className="mx-auto mb-3 animate-spin text-[#78977b]"
              />
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d9dfd6] bg-white p-12 text-center">
              <BriefcaseBusiness
                size={40}
                className="mx-auto text-[#78977b]"
              />
              <h3 className="mt-4 font-bold text-[#263a31]">
                No services found
              </h3>
              <p className="mt-2 text-sm text-[#718078]">
                Add your first service to get started.
              </p>
              <button
                type="button"
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#214e41] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173b30]"
              >
                <Plus size={16} /> Add your first service
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="rounded-3xl border border-[#e5e7df] bg-white p-6 shadow-[0_8px_28px_rgba(33,78,65,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(33,78,65,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl bg-[#e8eee5] p-3 text-[#214e41]">
                      <BriefcaseBusiness size={24} />
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        service.isActive === false
                          ? "bg-[#f0f1ed] text-[#68736b]"
                          : "bg-[#e8eee5] text-[#285b3b]"
                      }`}
                    >
                      {service.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#263a31]">
                    {service.name}
                  </h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-[#718078]">
                    {service.description || "No description provided."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-4 border-t border-[#edf0e9] pt-4 text-sm text-[#647168]">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={16} className="text-[#78977b]" />
                      {service.duration} min
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#214e41]">
                      <IndianRupee size={15} />
                      {service.price}
                    </span>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(service)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe4db] px-3 py-2.5 text-sm font-semibold text-[#46564c] transition hover:bg-[#f4f5f0]"
                    >
                      <Pencil size={16} /> Edit
                    </button>

                    {service.isActive !== false && (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(service)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} /> Deactivate
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 flex items-center gap-2 text-xs text-[#849087]">
          <Leaf size={14} /> OmniBook · One platform. Every appointment.
        </p>
      </main>
    </div>
  );
}

export default ManageServices;
