import { Link } from "react-router-dom";
import { useEffect,useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import API from "../../api/axios";
const navItems = [
  { icon: "dashboard", label: "Dashboard",path:"/admin-dashboard", active: false },
  { icon: "handshake", label: "Pending Deals",path:"/pending-deals", active: false },
  { icon: "business", label: "Pending Companies", path:"/pending-companies",active: true, filled: true },
  { icon: "verified_user", label: "KYC Review",path:"/kyc-review", active: false },
  { icon: "history_edu", label: "Audit Logs", path:"/audit-logs",active: false },
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

export default function AdminPendingCompanies() {
  const [companies,setCompanies]=useState([]);
  const [selectedCompany,setSelectedCompany]=useState(null);
  const [showNote, setShowNote] = useState(true);
  useEffect(()=>{
    const fetchCompanies = async()=>{
      try{
        const res = await API.get("/company");

        const pending=res.data.filter(
          (c) => c.status !== "APPROVED" && c.status !== "REJECTED"
        );
        setCompanies(pending);

        if(pending.length>0){
          setSelectedCompany(pending[0]);
        }
      }catch(err){
       console.error("FULL ERROR:", err);
      console.error("RESPONSE DATA:", err.response?.data);
      console.error("STATUS:", err.response?.status);
      }
    };
    fetchCompanies();
  },[]);
  const handleReview = async (id, decision) => {
  try {
    const res = await API.put(
      `/company/${id}/decision`,
      {
        decision,
        notes:"" // "approve" or "reject"
      },
      {
        withCredentials: true,
      }
    );
    setCompanies((prev) => prev.filter((c) => c._id !== id));
    setSelectedCompany(null);
    setShowNote(false);
    if (decision === "approve") {
      toast.success("Company Approved successfully ");
    } else {
      toast("Company Rejected ");
    }

  } catch (err) {
   toast.error(err.response?.data?.message || err.message);
    if (err.response) {
    alert(err.response.data.message); 
  } else {
    alert("Server error");
  }
  }
};
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
          <div className="flex items-center gap-4 flex-1">
           <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Pending Companies
            </h1>
          </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Icon name="notifications" />
            </button>

            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Icon name="help_outline" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Header section */}
          <section>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-primary leading-tight">
                  Verification Queue
                </h1>
                <p className="text-on-surface-variant mt-2 max-w-2xl">
                  Review institutional applications for fractional asset ownership.
                  All approvals require verified incorporation documentation.
                </p>
              </div>
            </div>
          </section>

          {/* Main grid */}
          <section className="grid grid-cols-12 gap-6">
            {/* Left column */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant px-1">
                Awaiting Review ({companies.length})
              </h2>

              {companies.map((company) => (
  <div
    key={company._id}
    onClick={() => setSelectedCompany(company)}
    className={`p-5 rounded-2xl cursor-pointer transition-all ${
      selectedCompany?._id === company._id
        ? "bg-white border-l-4 border-emerald-600 shadow-sm"
        : "bg-surface-container hover:bg-surface-container-high opacity-80 hover:opacity-100"
    }`}
  >
    {/* Top */}
    <div className="mb-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white font-bold text-lg">
        {company.name?.charAt(0)}
      </div>

      {selectedCompany?._id !== company._id && (
        <div className="h-px flex-1 bg-outline-variant/20"></div>
      )}
    </div>

    {/* Name */}
    <h3 className="font-bold text-lg text-primary">
      {company.name}
    </h3>

    {/* Registration */}
    <p className="text-xs text-on-surface-variant mb-3">
      Reg: {company.registrationNumber || "N/A"}
    </p>

    {/* Bottom */}
    <div className="flex justify-between items-center text-[11px] font-medium text-on-surface-variant">
      <span>
        {company.createdAt
          ? new Date(company.createdAt).toLocaleDateString()
          : ""}
      </span>

      <span className="flex items-center gap-1">
        <Icon name="public" className="text-[14px]" />
        {company.incorporationCountry || "N/A"}
      </span>
    </div>
  </div>
))}
</div>
            {/* Right column */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              {/* Detail card */}
              <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/10">
                {/* Top */}
                <div className="p-8 border-b border-surface-container-high flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-extrabold text-primary mb-1">
                      {selectedCompany?.name}
                    </h2>
                    
                  </div>

                  
                </div>

                {/* Data */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Legal Entity Name
                      </label>
                      <p className="text-lg font-bold text-primary">
                        {selectedCompany?.name}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Registration Number
                      </label>
                      <p className="text-lg font-bold text-primary">{selectedCompany?.registrationNumber}</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Tax ID / VAT
                      </label>
                      <p className="text-lg font-bold text-primary">{selectedCompany?.classification.businessType}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        Registered Address
                      </label>
                      <p className="text-base font-medium text-primary">
                        {selectedCompany?.details.shortDescription}
                  
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                        CEO
                      </label>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm font-semibold text-primary">
                          {selectedCompany?.team[0].name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="px-8 pb-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                     Documentation Sent
                  </h3>

                  {selectedCompany?.documents?.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {selectedCompany.documents.map((doc) => (
      <div
        key={doc._id}
        className="group flex items-center gap-4 p-4 rounded-2xl bg-surface-container hover:border-emerald-600/30 border border-transparent transition-all"
      >
        {/* Icon based on type */}
        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
          <Icon
            name={
              doc.type === "INCORPORATION"
                ? "description"
                : doc.type === "FINANCIALS"
                ? "bar_chart"
                : doc.type === "LEGAL"
                ? "gavel"
                : "article"
            }
            className="text-2xl"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="font-bold text-primary text-sm">
            {doc.name}
          </p>

          <p className="text-xs text-on-surface-variant">
            {doc.type} •{" "}
            {doc.uploadedAt
              ? new Date(doc.uploadedAt).toLocaleDateString()
              : ""}
          </p>
        </div>
      
      </div>
    ))}
  </div>
) : (
  <p className="text-sm text-on-surface-variant">
    No documents uploaded.
  </p>
)}
   </div>

                {/* Actions */}
                <div className="p-8 bg-surface-container/50 border-t border-surface-container-high">
                  <div className="flex flex-col gap-6">
                    {showNote && (<div>
                      <label className="block text-sm font-bold text-primary mb-2">
                        Internal Verification Note
                      </label>
                      <textarea
                        placeholder="Add internal notes about this company review..."
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px] resize-none"
                      />
                    </div>
  )}

                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => selectedCompany && handleReview(selectedCompany._id, "approve")} className="px-6 py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
                          <Icon name="check_circle" />
                          Approve Company
                        </button>
                      </div>

                      <button  onClick={() => selectedCompany && handleReview(selectedCompany._id, "reject")}className="px-6 py-3 rounded-xl text-error font-bold flex items-center justify-center gap-2 hover:bg-error/5 transition-all w-fit">
                        <Icon name="cancel" />
                        Deny Application
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              
              </div>
          </section>
        </div>
      </main>
    </div>
  );
}