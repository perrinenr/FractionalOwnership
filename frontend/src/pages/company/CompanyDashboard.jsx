import React from "react";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";



const navItems = [
  { label: "Dashboard", icon: "dashboard", to: "/company-dashboard", active: true },
  { label: "My Deals", icon: "handshake", to: "/company-deals" },
  { label: "Distributions", icon: "payments", to: "/company-distributions" },
  { label: "Wallet", icon: "account_balance_wallet", to: "/company-wallet" },
  { label: "Profile", icon: "person", to: "/profile" },
];

export default function BusinessDashboard() {
  const [deals, setDeals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await API.get("/deals/mydeals", {
          withCredentials: true,
        });
        console.log("DEALS FROM BACKEND:", res.data.deals);
        setDeals(res.data.deals);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDeals();
  }, []);

 const totalRaised = deals.reduce((sum, deal) => {
  const raw = deal.fundingProgress?.amountRaised;

  const value = raw?.$numberDecimal
    ? parseFloat(raw.$numberDecimal)
    : Number(raw || 0);

  return sum + value;
}, 0);

const totalInvestors = deals.reduce((sum, deal) => {
  return sum + Number(deal.fundingProgress?.investorCount || 0);
}, 0);

const handleLogout = async () => {
  try {
    await API.post("/users/logout", {}, { withCredentials: true });
  } catch (err) {
    console.log("Logout backend error:", err);
  }

  localStorage.removeItem("token");
  localStorage.removeItem("role");

  navigate("/", { replace: true });
};

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
          <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1 transition-transform duration-200 rounded-lg"
          >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium text-sm">Log Out</span>
          </button>
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
          <div className="flex items-end justify-between">
            <div>
              <span className="text-on-surface-variant text-sm font-medium tracking-wide">
                COMPANY OVERVIEW
              </span>
              <h2 className="text-3xl font-extrabold text-primary manrope -mt-1">
                Performance Dashboard
              </h2>
            </div>

           
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] flex flex-col gap-1 border border-outline-variant/5">
              <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Total Capital Raised
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-primary manrope">
                  ${totalRaised.toLocaleString()}
                </span>
              </div>
              <div className="mt-4 w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[78%]"></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] flex flex-col gap-1 border border-outline-variant/5">
              <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Total Investors
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-primary manrope">
                  {totalInvestors}

                </span>
                <span className="text-secondary text-xs font-bold flex items-center">
                  <span className="material-symbols-outlined text-[14px] mr-1">
                    add
                  </span>
                </span>
              </div>
            
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] flex flex-col gap-1 border border-outline-variant/5">
              <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                {deals.length} Active Deals
              </span>
              <div className="flex items-baseline gap-2 mt-2"></div>
              <div className="mt-4 flex gap-1">
                <div className="h-1 flex-1 bg-secondary rounded-full"></div>
                <div className="h-1 flex-1 bg-secondary rounded-full"></div>
                <div className="h-1 flex-1 bg-secondary rounded-full"></div>
                <div className="h-1 flex-1 bg-surface-container rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5 min-h-[400px] flex flex-col">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-xl font-bold text-primary manrope">
                    Fundraising Growth
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    Monthly capital inflow across company listings
                  </p>
                </div>

                <div className="flex bg-surface-container p-1 rounded-lg">
                  <button className="px-4 py-1 text-xs font-bold text-primary bg-white rounded-md shadow-sm">
                    Volume
                  </button>
                  <button className="px-4 py-1 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
                    Investors
                  </button>
                </div>
              </div>

              <div className="flex-1 relative flex items-end gap-4 px-4 h-64">
                <div className="group relative flex-1 bg-primary/5 hover:bg-primary/10 transition-colors rounded-t-lg h-[40%] flex flex-col justify-end items-center">
                  <div className="w-full bg-primary h-[80%] rounded-t-lg opacity-40"></div>
                  <span className="absolute -bottom-8 text-[10px] font-bold text-on-surface-variant">
                    JAN
                  </span>
                </div>
                <div className="group relative flex-1 bg-primary/5 hover:bg-primary/10 transition-colors rounded-t-lg h-[55%] flex flex-col justify-end items-center">
                  <div className="w-full bg-primary h-[85%] rounded-t-lg opacity-50"></div>
                  <span className="absolute -bottom-8 text-[10px] font-bold text-on-surface-variant">
                    FEB
                  </span>
                </div>
                <div className="group relative flex-1 bg-primary/5 hover:bg-primary/10 transition-colors rounded-t-lg h-[45%] flex flex-col justify-end items-center">
                  <div className="w-full bg-primary h-[75%] rounded-t-lg opacity-60"></div>
                  <span className="absolute -bottom-8 text-[10px] font-bold text-on-surface-variant">
                    MAR
                  </span>
                </div>
                <div className="group relative flex-1 bg-primary/5 hover:bg-primary/10 transition-colors rounded-t-lg h-[70%] flex flex-col justify-end items-center">
                  <div className="w-full bg-primary h-[90%] rounded-t-lg opacity-70"></div>
                  <span className="absolute -bottom-8 text-[10px] font-bold text-on-surface-variant">
                    APR
                  </span>
                </div>
                <div className="group relative flex-1 bg-primary/5 hover:bg-primary/10 transition-colors rounded-t-lg h-[60%] flex flex-col justify-end items-center">
                  <div className="w-full bg-primary h-[82%] rounded-t-lg opacity-80"></div>
                  <span className="absolute -bottom-8 text-[10px] font-bold text-on-surface-variant">
                    MAY
                  </span>
                </div>
                <div className="group relative flex-1 bg-primary/5 hover:bg-primary/10 transition-colors rounded-t-lg h-[85%] flex flex-col justify-end items-center">
                  <div className="w-full bg-primary h-[95%] rounded-t-lg"></div>
                  <span className="absolute -bottom-8 text-[10px] font-bold text-on-surface-variant">
                    JUN
                  </span>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-8"></div>
          </div>

          <div className="grid grid-cols-12 gap-8 pb-12">
            <div className="col-span-12 lg:col-span-12 bg-surface-container-low p-8 rounded-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-primary manrope">
                  Featured Company Listings
                </h3>
                <button className="text-sm font-bold text-secondary flex items-center gap-1">
                  VIEW ALL
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative rounded-xl overflow-hidden h-48 group">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="modern resort"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzpf7iWO8eIdiz-uYi2p8ldQ_K2dOglRZpIoQ5rhYvR_rTYGHG2zlUVFqh-ncVUO_QtfRIOYG1AVug55ERpfJYDkDmtuA6VcyTyfafHoSkpj-jHpq4vAgs1LFPgtcIM7cZ0eSxAWgVgpD_SgoM97r8X77ULZU3Bz34NJjxGMmi-XsbQ9d6MRL993ADSBzUv8zr5zizr2YUx-HE8QnOFSooVfMlaUvdaIfAfyn4cLN9Rbo-8OLV00IMELsVURcZFKD65LBLzGbR5IJf"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-5">
                    <span className="text-[10px] text-secondary-fixed-dim font-bold tracking-widest uppercase">
                      Hospitality
                    </span>
                    <h4 className="text-white font-bold manrope">
                      Grand Canyon Resort IV
                    </h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-white/60 text-xs">
                        Raised: $12.4M
                      </span>
                      <span className="text-secondary-fixed text-xs font-bold">
                        92%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden h-48 group">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="solar installation"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhMXsjGw5oTn2a1S12-Vtc9U7jYSpzKaYeMaXcSmX3_tMYomgoz90ZkuEaKyUeaxFxS6pd9gg3WzSbfD6cKsquy0j_5zlaxslhcaRom4ELLO6LZL0iSmtV4R-EAvVRf_fJ2H2_ZGWWlFjy2EdS4Hx_DCcTRV5HUajc8MLHws3dMHZQxIn_LPSaOjMIwANY6JRmeN66xSXWfUxNj6_NB6FYmGNZ_d6Qimdsr8l9eAoZQSaxN2KE_boe67h9E96x68F16ex6MOLexjQe"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-5">
                    <span className="text-[10px] text-secondary-fixed-dim font-bold tracking-widest uppercase">
                      Infrastructure
                    </span>
                    <h4 className="text-white font-bold manrope">
                      Solar Grid II - Nevada
                    </h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-white/60 text-xs">
                        Raised: $6.7M
                      </span>
                      <span className="text-secondary-fixed text-xs font-bold">
                        45%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden h-48 group">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="technology hub"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3ElAfVoAzzIK2fprBK_y-H_o0oLOE0el8MYRD-oG4KYAJMgNa5S0UogWBbFKjaUn2gYbbYcVAmOztkL8gSg83MJlDkieGvQSscJZ8dU6KVwyifc1k3_xxmWiunUwkxOwCrSOMAnL08gihTeX_DzdxCGinOHamLv32Qiwjp6moH4Ca0iZ3wS0jiTi83U1hSioTipK52SP6Yz3SYLRE7tvUgkx5RlCtExe-2gj0yZ0X-hjYS2TT0cKThCCMWcxZ2drIAO3H0Ud2c9a3"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-5">
                    <span className="text-[10px] text-secondary-fixed-dim font-bold tracking-widest uppercase">
                      Technology
                    </span>
                    <h4 className="text-white font-bold manrope">
                      Fintech Hub London
                    </h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-white/60 text-xs">
                        Raised: $9.8M
                      </span>
                      <span className="text-secondary-fixed text-xs font-bold">
                        100%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5 overflow-hidden mb-10">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-primary manrope">
                Active Deal Performance
              </h3>
              <button className="text-sm font-bold text-secondary flex items-center gap-1">
                EXPORT
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
              </button>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Asset Name
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Utilization %
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Projected IRR
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Investor Count
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/10">
                {deals.map((deal) => {
                  const amountRaised = Number(
                    deal.fundingProgress?.amountRaised?.$numberDecimal || 0
                  );

                  const percentage = deal.fundingProgress?.percentageRaised || 0;
                  const investors = deal.fundingProgress?.investorCount || 0;

                  return (
                    <tr
                      key={deal._id}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <p className="font-semibold text-primary">
                          {deal.title}
                        </p>
                      </td>

                      <td className="px-8 py-6 text-sm font-medium">
                        {deal.status}
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold">
                            {percentage}%
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-sm font-bold text-secondary">
                        ${amountRaised.toLocaleString()}
                      </td>

                      <td className="px-8 py-6">{investors}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}