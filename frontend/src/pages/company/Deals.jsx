import React, { useMemo, useState,useEffect  } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API from "../../api/axios";


const navItems = [
  { label: "Dashboard", icon: "dashboard", to: "/company-dashboard" },
  { label: "My Deals", icon: "handshake", to: "/company-deals", active: true },
  { label: "Distributions", icon: "payments", to: "/company-distributions" },
  { label: "Wallet", icon: "account_balance_wallet", to: "/company-wallet" },
  { label: "Profile", icon: "person", to:"/profile" },
];

const filters = ["ALL", "OPEN", "FUNDED", "PENDING_REVIEW"];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const getStatusLabel = (status) => {
  switch (status) {
    case "OPEN":
      return "Open";
    case "FUNDED":
      return "Funded";
    case "PENDING_REVIEW":
      return "Pending Review";
    default:
      return status;
  }
};

const getStatusClasses = (status) => {
  switch (status) {
    case "OPEN":
      return "bg-secondary-fixed text-on-secondary-fixed-variant";
    case "FUNDED":
      return "bg-surface-container-highest text-on-surface-variant";
    case "PENDING_REVIEW":
      return "bg-primary-fixed text-on-primary-fixed-variant";
    default:
      return "bg-surface-container text-on-surface-variant";
  }
};

export default function MyDealsPage() {
    const [deals, setDeals] = useState([]);

useEffect(() => {
  const fetchDeals = async () => {
    try {
      const res = await API.get(
        "/deals/mydeals",
        { withCredentials: true }
      );

      setDeals(res.data.deals);
console.log("DEALS:", res.data);
console.log("STATUSES:", res.data.deals.map(d => d.status));
    } catch (err) {
      console.log(err);
    }
    
  };

  fetchDeals();
  
}, []);

  const [activeFilter, setActiveFilter] = useState("ALL");

  const filteredDeals = useMemo(() => {
    if (activeFilter === "ALL") return deals;
return deals.filter((deal) => deal.status?.toUpperCase()=== activeFilter);
  }, [activeFilter,deals]);

  const totalTargetRaise = useMemo(
  () =>
    deals.reduce((sum, deal) => {
      const val = Number(deal.investmentTerms?.targetRaise?.$numberDecimal || 0);
      return sum + val;
    }, 0),
  [deals]
);

  const averageFunding = useMemo(() => {
  if (!deals.length) return 0;

  return Math.round(
    deals.reduce((sum, deal) => {
      return sum + (deal.fundingProgress?.percentageRaised || 0);
    }, 0) / deals.length
  );
}, [deals]);

 const activeDealsCount = useMemo(
  () => deals.filter((d) => d.status === "OPEN").length,
  [deals]
);
  const pendingReviewCount = useMemo(
  () => deals.filter((d) => d.status === "PENDING_REVIEW").length,
  [deals]
);

  return (
    
    <div className="bg-surface text-on-surface flex min-h-screen">
      <aside className="hidden lg:flex h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex-col p-4 gap-2 shrink-0 sticky top-0">
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">
                business_center
              </span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Fractional Company
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Business Access
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
  {navItems.map((item) => (
    <Link
      key={item.label}
      to={item.to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-transform duration-200 ${
        item.active
          ? "bg-white text-emerald-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-200/50 hover:translate-x-1"
      }`}
    >
      <span className="material-symbols-outlined">{item.icon}</span>
      <span className="font-medium text-sm">{item.label}</span>
    </Link>
  ))}
</nav>

        <div className="mt-auto border-t border-slate-200/50 pt-4">
          
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 w-full z-40 h-16 px-4 md:px-8 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-8 min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-headline whitespace-nowrap">
              Company Workspace
            </h1>

           
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button className="hidden sm:inline-flex p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>

            <div className="hidden md:block h-6 w-[1px] bg-outline-variant mx-1"></div>

         
           
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-on-surface-variant text-sm font-medium tracking-wide uppercase">
                Deals Workspace
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary font-headline">
                Deal Management
              </h2>
              
            </div>

           <Link
  to="/company-create-deal"
  className="px-6 py-3 bg-primary-container text-white rounded-xl font-semibold shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 w-fit"
>
  <span className="material-symbols-outlined">add</span>
  Create New Deal
</Link>
          </section>


          <section className="bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5 overflow-hidden">
            <div className="px-4 md:px-6 lg:px-8 py-6 border-b border-outline-variant/10">
              <div className="flex flex-wrap gap-3">
                {filters.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest"
                      }`}
                    >
                      {filter === "ALL"
                        ? "All Deals"
                        : getStatusLabel(filter)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden md:grid grid-cols-12 px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low">
              <div className="col-span-4">Deal Details</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Target Raise</div>
              <div className="col-span-2">Funding</div>
              <div className="col-span-2 text-right">Notes</div>
            </div>

            <div className="divide-y divide-outline-variant/10">
              {filteredDeals.map((deal) => (
                <div
                  key={deal._id}
                  className="grid grid-cols-1 md:grid-cols-12 items-center px-4 md:px-8 py-5 hover:bg-surface-container-low/50 transition-colors"
                >
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined">
                        {deal.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-primary">{deal.title}</p>
                      <p className="text-xs text-on-surface-variant font-medium">
                        {deal.id}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 pt-4 md:pt-0">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${getStatusClasses(
                        deal.status
                      )}`}
                    >
                      {getStatusLabel(deal.status)}
                    </span>
                  </div>

                  <div className="col-span-2 pt-4 md:pt-0">
                    <p className="font-bold text-primary">
  {formatCurrency(
    Number(deal.investmentTerms?.targetRaise?.$numberDecimal || 0)
  )}
</p>
                  </div>

                  <div className="col-span-2 pt-4 md:pt-0 flex flex-col gap-2 md:pr-8">
                    <div className="flex justify-between text-xs font-bold text-primary">
                      <span>
  {deal.fundingProgress?.percentageRaised || 0}%
</span>
                    </div>
                    <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-secondary h-full rounded-full"
                        style={{ width: `${deal.funding}%` }}
                      />
                    </div>
                  </div>

                  <div className="col-span-2 pt-4 md:pt-0 text-right">
                    <div className="col-span-2 pt-4 md:pt-0 text-right">
  <div className="text-sm text-gray-600">
    {deal.adminReview?.notes || "No notes"}
  </div>
</div>
                  </div>
                </div>
              ))}

              {!filteredDeals.length && (
                <div className="px-8 py-12 text-center text-on-surface-variant">
                  No deals found for this filter.
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 relative overflow-hidden rounded-2xl h-[320px] group">
              <img
                alt="Modern architectural building"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPvCCp1_Dgp5kl_1qsjHAM-vdeuktxlQcFY9wwxnJq4R8fy4Pe0gdE1Af42r9Yvkkqg3Z5MRCZkQ5bn1H5zvhXERbgyXvPPuOJItwyyc8tf4HIMPXifJ975WO7m3bN-DUqks9bfdXDYbLgLPVm15NVMz4rOUq5hY8ilib60a55WcQIDp7GM7RsL2xeXtlb7EiJxouqe_d2vgiLQ0kxyR3xKKNeuWt7YsSoRwr5kdJSZ4JET499I-grVBrIrtNErNMsubTRW1vnrCI4"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 to-transparent flex flex-col justify-end p-8 md:p-10">
                <span className="text-secondary-fixed font-bold text-xs uppercase tracking-widest mb-2">
                  Market Alert
                </span>
                <h3 className="text-white text-2xl md:text-3xl font-extrabold font-headline leading-tight max-w-xl">
                  Commercial yields expected to rise 15% in Q4.
                </h3>
                <p className="text-white/70 mt-4 text-sm font-medium">
                  Read the latest internal insight on emerging logistics hubs
                  and new investor demand.
                </p>
              </div>
            </div>

            <div className="bg-primary p-8 rounded-2xl flex flex-col justify-center text-center shadow-[0_8px_32px_rgba(24,28,30,0.08)]">
              <span className="material-symbols-outlined text-secondary-fixed text-5xl mb-6">
                workspace_premium
              </span>
              <h3 className="text-white text-2xl font-bold font-headline mb-4">
                Elite Tier Status
              </h3>
              <p className="text-white/70 text-sm mb-8">
                You funded $10M+ this month. Reduced placement fees are now
                available on your next three deals.
              </p>
              <button className="text-secondary-fixed font-bold text-sm hover:underline">
                View Benefits
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}