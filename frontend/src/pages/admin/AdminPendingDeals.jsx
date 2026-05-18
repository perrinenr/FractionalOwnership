import { Link } from "react-router-dom";
import { useEffect,useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import API from "../../api/axios";
const navItems = [
  { icon: "dashboard", label: "Dashboard",path:"/admin-dashboard", active: false },
  { icon: "handshake", label: "Pending Deals",path:"/pending-deals", active: true, filled: true },
  { icon: "business", label: "Pending Companies",path:"/pending-companies", active: false },
  { icon: "verified_user", label: "KYC Review", path:"/kyc-review", active: false },
  { icon: "history_edu", label: "Audit Logs",path:"/audit-logs" ,active: false },
  {icon: "person", label: "Profile", path: "/admin-profile", active: false },
];

const documents = [
  {
    icon: "description",
    title: "Pitch Deck v2.4",
    meta: "PDF • 12.4 MB • Updated 2 days ago",
  },
  {
    icon: "table_chart",
    title: "3-Year Financial Model",
    meta: "XLSX • 4.1 MB • Updated 5 days ago",
  },
];

const teamMembers = [
  {
    initials: "EV",
    name: "Elena Vance",
    role: "Managing Partner, Azure Fund",
  },
  {
    initials: "MT",
    name: "Marcus Thorne",
    role: "Head of Risk Analysis",
  },
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

export default function PendingDealsReview() {
  const [pendingDeals,setPendingDeals]=useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [notes, setNotes] = useState("");
  useEffect(()=>{
  const fetchDeals=async()=>{
    try{
      const res = await API.get("/deals");
      const pending=res.data.filter(
        (deal)=>deal.adminStatus==="PENDING"
      );
      setPendingDeals(pending);
    }catch(err){
       console.error("FULL ERROR:", err);
      console.error("RESPONSE DATA:", err.response?.data);
      console.error("STATUS:", err.response?.status);
    }
  };
  fetchDeals();
},[]);
const handleDecision =async(dealId,decision)=>{
  try{
   const res = await API.put(
      `/deals/${dealId}/decision`,
      {
        decision,
        notes,
      },
      {
          withCredentials: true,
      },
    );
      setPendingDeals((prev)=>prev.filter((d)=>d._id!==dealId)
      );
      setSelectedDeal(null);
      if (decision === "approve") {
      toast.success("Deal Approved successfully ");
    } else {
      toast("Deal Rejected ");
    }
    
  }catch (err) {
      toast.error(err.response?.data?.message || err.message);

      if (err.response) {
        alert(err.response.data.message);
      } else {
        alert("Server error");
      }
    }
}
  return (
    <div className="min-h-screen bg-[#f3f4f6] text-on-surface flex">
      {/* Sidebar */}
      <aside className="h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex flex-col p-4 gap-2 shrink-0 sticky top-0">
        <div className="mb-8 px-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              Fractional Admin
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              Institutional Access
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={
                item.active
                  ? "flex items-center gap-3 px-3 py-2.5 bg-white text-emerald-700 shadow-sm rounded-lg transition-transform duration-200"
                  : "flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1 transition-transform duration-200 rounded-lg"
              }
            >
              <Icon
                name={item.icon}
                filled={item.filled}
                className={item.active ? "text-emerald-700" : ""}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-50 h-16 px-8 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Pending Deals Review
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Icon name="notifications" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-secondary border border-white"></span>
            </button>

            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Icon name="help_outline" />
            </button>
          </div>
        </header>

        <div className="p-8 space-y-10">
          {/* Focused card */}
          {selectedDeal && (
  <section className="bg-surface-container-lowest rounded-2xl shadow border overflow-hidden">
    
    {/* HEADER */}
    <div className="bg-primary px-8 py-6 flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-white">
          {selectedDeal.title}
        </h2>

        <p className="text-white/70 text-sm">
          Deal ID: {selectedDeal.dealNumber}
        </p>
      </div>

      <span className="px-4 py-1.5 bg-white/10 text-white rounded-full text-xs font-semibold">
        {selectedDeal.status}
      </span>
    </div>

    {/* BODY */}
    <div className="p-8 grid grid-cols-12 gap-8">

      {/* LEFT */}
      <div className="col-span-12 lg:col-span-8">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-4">
          Financial Overview
        </h3>

        <div className="bg-gray-50 p-6 rounded-xl">
          <p className="text-sm text-gray-500">Target Raise</p>

          <p className="text-2xl font-bold text-primary">
            {selectedDeal.investmentTerms?.targetRaise?.$numberDecimal
              ? Number(selectedDeal.investmentTerms.targetRaise.$numberDecimal)
              : "-"}
          </p>
        </div>
      </div>

      {/* RIGHT - ACTIONS */}
      <div className="col-span-12 lg:col-span-4 space-y-4">

        <textarea
          rows={4}
          value={notes}
          onChange={(e)=>setNotes(e.target.value)}
          placeholder="Add review notes..."
          className="w-full border rounded-xl p-3 text-sm"
        />

        <button
          onClick={() => handleDecision(selectedDeal._id, "approve")}
          className="w-full bg-green-600 text-white py-2 rounded-lg"
        >
          Approve
        </button>

        <button
          onClick={() => handleDecision(selectedDeal._id, "reject")}
          className="w-full bg-red-600 text-white py-2 rounded-lg"
        >
          Reject
        </button>

      </div>
    </div>
  </section>
)}      {/* Table */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-extrabold text-primary">Pending Queue</h2>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0_8px_32px_rgba(24,28,30,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/10">
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        Deal ID
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        Asset Name
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant text-right">
                        Target Raise
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        Submitted
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant text-center">
                        Status
                      </th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendingDeals.map((deal) => (
                      <tr
                        key={deal._id}
                        className="border-b last:border-b-0 border-outline-variant/5 hover:bg-surface-container-low transition-colors"
                      >
                        <td className="px-6 py-5 text-xs font-mono text-on-surface-variant">
                          {deal._id}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm text-on-surface">
                              {deal.title}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right font-bold text-lg text-primary">
                          {deal.investmentTerms?.targetRaise?.$numberDecimal
    ? Number(deal.investmentTerms.targetRaise.$numberDecimal)
    : "-"}
                        </td>

                        <td className="px-6 py-5 text-sm text-on-surface-variant">
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold">
                            {deal.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <button onClick={() => setSelectedDeal(deal)}  className="border border-slate-400 px-3 py-1 rounded-md hover:bg-slate-100 transition" >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
           </section>
           </div>
      </main>
      </div>
  );
}