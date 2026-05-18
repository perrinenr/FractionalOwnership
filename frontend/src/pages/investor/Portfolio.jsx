import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await API.get("/ownership/portfolio", {
          withCredentials: true,
        });

        setHoldings(res.data);
      } catch (err) {
        console.error("Portfolio fetch error: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  return (
    <div className="bg-surface text-on-surface flex">
      {/* LEFT SIDEBAR - same style as other investor pages */}
      <aside className="h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex flex-col p-4 gap-2 shrink-0">
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">
                account_balance_wallet
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Investor Workplace
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Investor Access
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            to="/InvestorDashboard"
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1 transition-transform duration-200 rounded-lg"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium text-sm">Dashboard</span>
          </Link>

          <Link
            to="/exploredeals"
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1 transition-transform duration-200 rounded-lg"
          >
            <span className="material-symbols-outlined">explore</span>
            <span className="font-medium text-sm">Explore Deals</span>
          </Link>

          <Link
            to="/portfolio"
            className="flex items-center gap-3 px-3 py-2.5 bg-white text-emerald-700 shadow-sm rounded-lg transition-transform duration-200"
          >
            <span className="material-symbols-outlined">
              account_balance_wallet
            </span>
            <span className="font-medium text-sm">Portfolio</span>
          </Link>

          <Link
            to="/wallet"
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1 transition-transform duration-200 rounded-lg"
          >
            <span className="material-symbols-outlined">account_balance</span>
            <span className="font-medium text-sm">Wallet</span>
          </Link>

          <Link
            to="/profilesetting"
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1 transition-transform duration-200 rounded-lg"
          >
            <span className="material-symbols-outlined">person</span>
            <span className="font-medium text-sm">Profile</span>
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT - same content as before */}
      <main className="flex-1 flex flex-col relative min-w-0 h-screen overflow-y-auto">
         <header className="sticky top-0 w-full z-50 h-16 px-8 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 manrope">
              Investor Workspace
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>

           
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl p-8">
          <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-primary">
                Investment Portfolio
              </h1>
            </div>
          </header>

          <section className="overflow-hidden rounded-[2rem] border border-outline-variant/15 bg-surface-container-low shadow-[0_8px_32px_0_rgba(24,28,30,0.04)]">
            <div className="flex flex-col gap-4 border-b border-outline-variant/10 bg-surface-container-lowest p-8 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-bold text-primary">
                Active Investments
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Company Name
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Total Shares
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Ownership %
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Total Invested
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Current Value
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Unrealized G/L
                    </th>
                    <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Total Returns
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-8 py-10 text-center font-bold text-primary"
                      >
                        Loading portfolio...
                      </td>
                    </tr>
                  ) : (
                    holdings.map((item) => (
                      <tr
                        key={item.id}
                        className="group cursor-pointer transition-colors hover:bg-surface-container-low/30"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-bold text-primary transition-colors group-hover:text-secondary">
                                {item.name}
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                Investment
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-6 text-right font-semibold text-primary">
                          {Number(item.shares).toFixed(2)}
                        </td>

                        <td className="px-6 py-6 text-right">
                          <span className="rounded-full px-3 py-1 text-xs font-bold text-primary">
                            {Number(item.ownership).toFixed(2)}%
                          </span>
                        </td>

                        <td className="px-6 py-6 text-right font-medium text-on-surface-variant">
                          ${Number(item.invested).toLocaleString()}
                        </td>

                        <td className="px-6 py-6 text-right font-bold text-primary">
                          ${Number(item.currentValue).toLocaleString()}
                        </td>

                        <td className="px-6 py-6 text-right">
                          <p
                            className={
                              Number(item.gainPercent) >= 0
                                ? "text-secondary font-bold"
                                : "text-error font-bold"
                            }
                          >
                            {Number(item.gainPercent) > 0
                              ? `+${Number(item.gainPercent).toFixed(2)}%`
                              : `${Number(item.gainPercent).toFixed(2)}%`}
                          </p>

                          <p
                            className={`text-xs ${
                              Number(item.gainAmount) >= 0
                                ? "text-secondary"
                                : "text-error"
                            }`}
                          >
                            {Number(item.gainAmount) > 0
                              ? `+$${Number(item.gainAmount).toFixed(2)}`
                              : `$${Number(item.gainAmount).toFixed(2)}`}
                          </p>
                        </td>

                        <td className="px-8 py-6 text-right">
                          <p className="font-bold text-primary">
                            {Number(item.multiple).toFixed(2)}x
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}