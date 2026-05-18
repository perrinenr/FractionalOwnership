import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import API from "../../api/axios";

const navItems = [
  { icon: "dashboard", label: "Dashboard", path: "/admin-dashboard", active: false },
  { icon: "handshake", label: "Pending Deals", path: "/pending-deals", active: false },
  { icon: "business", label: "Pending Companies", path: "/pending-companies", active: false },
  { icon: "verified_user", label: "KYC Review", path: "/kyc-review", active: true, filled: true },
  { icon: "history_edu", label: "Audit Logs", path: "/audit-logs", active: false },
  {icon: "person", label: "Profile", path: "/admin-profile", active: false },

];

function Icon({ name, className = "", filled = false, weight = 400 }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
    >
      {name}
    </span>
  );
}

export default function AdminKYCReview() {
  const [queueItems, setQueueItems] = useState([]);
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  const documents = selectedInvestor?.kyc?.documents || [];

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const res = await API.get("/investors");

        const pending = res.data.filter(
          (c) => c.kyc?.status !== "APPROVED" && c.kyc?.status !== "REJECTED"
        );

        setQueueItems(pending);

        if (pending.length > 0) {
          setSelectedInvestor(pending[0]);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      }
    };

    fetchInvestors();
  }, []);

  const reviewKyc = async (id, decision) => {
    try {
      await API.put(
        `/investors/${id}/decision`,
        { decision, notes: "" },
        { withCredentials: true }
      );

      setQueueItems((prev) => prev.filter((c) => c._id !== id));
      setSelectedInvestor(null);
      if (decision === "approve") {
      toast.success("KYC Approved successfully ");
    } else {
      toast("KYC Rejected ");
    }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 flex">

      {/* SIDEBAR */}
      <aside className="h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex flex-col p-4 gap-2 sticky top-0">
        <div className="mb-8 px-2">
          <h2 className="text-lg font-black">Fractional Admin</h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Institutional Access
          </p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={
                item.active
                  ? "flex items-center gap-3 px-3 py-2.5 bg-white text-emerald-700 shadow-sm rounded-lg"
                  : "flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 rounded-lg"
              }
            >
              <Icon name={item.icon} filled={item.filled} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* TOPBAR */}
        <header className="sticky top-0 z-50 h-16 px-8 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <h1 className="text-xl font-bold">KYC Review</h1>

          <div className="flex gap-3">
            <Icon name="notifications" className="text-slate-500" />
            <Icon name="help_outline" className="text-slate-500" />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">

          {/* TITLE */}
          <section>
            <h1 className="text-4xl font-extrabold">KYC Verification Queue</h1>
            <p className="text-slate-500 mt-2">
              Review investor identity documents and approve onboarding.
            </p>
          </section>

          {/* GRID */}
          <section className="grid grid-cols-12 gap-6">

            {/* LEFT LIST */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Pending Investors ({queueItems.length})
              </h2>

              {queueItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedInvestor(item)}
                  className={`p-5 rounded-2xl cursor-pointer transition ${
                    selectedInvestor?._id === item._id
                      ? "bg-white border-l-4 border-emerald-600 shadow-sm"
                      : "bg-white/60 hover:bg-white"
                  }`}
                >
                  <p className="font-bold text-slate-900">
                    {item.userId?.email}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    KYC Review Pending
                  </p>
                </div>
              ))}
            </div>

            {/* RIGHT DETAILS */}
            <div className="col-span-12 lg:col-span-8">

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200">

                {/* HEADER */}
                <div className="p-8 border-b border-slate-100">
                  <h2 className="text-2xl font-bold">
                    {selectedInvestor?.userId?.email}
                  </h2>
                  <p className="text-emerald-600 font-medium mt-1">
                    Reviewing KYC
                  </p>
                </div>

                {/* DOCUMENTS */}
                <div className="p-8 space-y-4">
                  <h3 className="text-sm font-bold uppercase text-slate-500">
                    Documents
                  </h3>

                  {documents.length === 0 ? (
                    <p className="text-slate-500">No documents uploaded</p>
                  ) : (
                    documents.map((doc, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <p className="font-semibold">{doc.type}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* ACTIONS */}
                <div className="p-6 border-t bg-slate-50 flex justify-between">
                  <button
                    onClick={() =>
                      reviewKyc(selectedInvestor?._id, "reject")
                    }
                    className="px-6 py-3 rounded-xl  text-black font-bold"
                  >
                     Reject KYC
                  </button>

                  <button
                    onClick={() =>
                      reviewKyc(selectedInvestor?._id, "approve")
                    }
                    className="px-6 py-3 rounded-xl bg-green-600 text-white font-bold"
                  >
                    Approve KYC
                  </button>
                </div>

              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}