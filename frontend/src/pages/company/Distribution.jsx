import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API from "../../api/axios";


const navItems = [
  { label: "Dashboard", icon: "dashboard", to: "/company-dashboard" },
  { label: "My Deals", icon: "handshake", to: "/company-deals" },
  { label: "Distributions", icon: "payments", to: "/company-distributions", active: true },
  { label: "Wallet", icon: "account_balance_wallet", to: "/company-wallet" },
  { label: "Profile", icon: "person", to: "/profile" },
];

const filters = ["ALL"];

const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const getStatusLabel = (status) => {
  switch (status) {
    case "SCHEDULED":
      return "Scheduled";
    case "COMPLETED":
      return "Completed";
    case "PROCESSING":
      return "Processing";
    default:
      return status;
  }
};

const getStatusClasses = (status) => {
  switch (status) {
    case "COMPLETED":
      return "bg-secondary-fixed text-on-secondary-fixed-variant";
    case "SCHEDULED":
      return "bg-surface-container-highest text-on-surface-variant";
    case "PROCESSING":
      return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
    default:
      return "bg-surface-container text-on-surface-variant";
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case "REVENUE_SHARE":
      return "Revenue Share";
    case "DIVIDEND":
      return "Dividend";
    case "SPECIAL_LIQUIDITY":
      return "Special Liquidity";
    default:
      return type;
  }
};

const getTypeDot = (type) => {
  switch (type) {
    case "REVENUE_SHARE":
      return "bg-emerald-500";
    case "DIVIDEND":
      return "bg-blue-500";
    case "SPECIAL_LIQUIDITY":
      return "bg-amber-500";
    default:
      return "bg-slate-400";
  }
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function DistributionsPage() {
  const [distributions, setDistributions] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        const res = await API.get(
          "/distributions/mydistributions",
          { withCredentials: true }
        );

        setDistributions(res.data.distributions || []);
      } catch (error) {
        console.error("Error fetching distributions:", error);
      }
    };

    fetchDistributions();
  }, []);

  const filteredTransactions = useMemo(() => {
    let results = distributions;

    if (activeFilter !== "ALL") {
      results = results.filter((item) => item.status === activeFilter);
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      results = results.filter(
        (item) =>
          item.distributionNumber?.toLowerCase().includes(query) ||
          item.type?.toLowerCase().includes(query) ||
          formatDate(item.scheduledDate).toLowerCase().includes(query)
      );
    }
    return results;
  }, [distributions, activeFilter, searchTerm]);

  const nextScheduled = useMemo(() => {
    return distributions.find((item) => item.status === "SCHEDULED") || null;
  }, [distributions]);

  const totalDistributedYTD = useMemo(() => {
    return distributions
      .filter((item) => item.status === "COMPLETED")
      .reduce((sum, item) => {
        const amount = item.totalAmount?.$numberDecimal || item.totalAmount || 0;
        return sum + Number(amount);
      }, 0);
  }, [distributions]);

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
          <section className="flex items-center justify-between w-full mb-6">
  
  {/* LEFT SIDE */}
  <div>
    <span className="text-on-surface-variant text-sm font-medium tracking-wide uppercase">
      Distributions Workspace
    </span>
    <h2 className="text-3xl md:text-4xl font-extrabold text-primary font-headline">
      Distributions
    </h2>
  </div>

  {/* RIGHT SIDE BUTTON */}
 <Link to="/company-create-distribution">
  <button
    type="button"
    className="px-6 py-3 bg-primary-container text-white rounded-xl font-semibold shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
  >
    <span className="material-symbols-outlined">add</span>
    Create Distribution
  </button>
</Link>

</section>
          
          


          <section className="bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5 overflow-hidden">
          
            <div className="px-4 md:px-6 lg:px-8 py-6 border-b border-outline-variant/10">
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div className="flex flex-wrap gap-3">
                  {filters.map((filter) => {
                    const isActive = activeFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest"
                        }`}
                      >
                        {filter === "ALL"
                          ? "All Distributions"
                          : getStatusLabel(filter)}
                      </button>
                    );
                  })}
                </div>

                <div className="relative w-full lg:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                  </span>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                    placeholder="Search distributions..."
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-12 px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest bg-surface-container-low">
              <div className="col-span-3">Reference</div>
              <div className="col-span-3">Distribution Type</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Currency</div>
            </div>
            

            <div className="divide-y divide-outline-variant/10">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="grid grid-cols-1 md:grid-cols-12 items-center px-4 md:px-8 py-5 hover:bg-surface-container-low/50 transition-colors"
                >
                  <div className="col-span-3">
                    <p className="font-bold text-primary">
                      {transaction.distributionNumber}
                    </p>
                  </div>

                  <div className="col-span-3 pt-4 md:pt-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getTypeDot(transaction.type)}`}
                      ></span>
                      <span className="text-sm font-medium">
                        {getTypeLabel(transaction.type)}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 pt-4 md:pt-0">
                    <p className="font-bold text-primary">
                      {formatCurrency(
                        transaction.totalAmount?.$numberDecimal || transaction.totalAmount,
                        transaction.currency || "USD"
                      )}
                    </p>
                  </div>

                  <div className="col-span-2 pt-4 md:pt-0">
                    <p className="text-sm text-on-surface-variant font-medium">
                      {transaction.currency}
                    </p>
                  </div>

             

                  
                </div>
              ))}

              {!filteredTransactions.length && (
                <div className="px-8 py-12 text-center text-on-surface-variant">
                  No transactions found for this filter.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}