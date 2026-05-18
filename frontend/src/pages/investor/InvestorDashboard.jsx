import { useEffect, useMemo, useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function Dashboard() {
  const [wallet, setWallet] = useState({
    balance: 0,
    currency: "USD",
    lockedBalance: 0,
    totalInvested: 0,
    totalReturns: 0,
  });
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const getNumber = (value) => {
    if (value === undefined || value === null) return 0;

    if (typeof value === "object" && value.$numberDecimal) {
      return Number(value.$numberDecimal);
    }

    return Number(value) || 0;
  };

  const formatMoney = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(getNumber(amount));
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get(
          "/investors/dashboard",
          {
            withCredentials: true,
          }
        );

        setWallet({
          balance: 0,
          currency: "USD",
          lockedBalance: 0,
          totalInvested: 0,
          totalReturns: 0,
          ...(res.data.wallet || {}),
        });
      } catch (err) {
        console.error("Error loading investor dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const balance = getNumber(wallet.balance);
  const lockedBalance = getNumber(wallet.lockedBalance);
  const totalInvested = getNumber(wallet.totalInvested);
  const totalReturns = getNumber(wallet.totalReturns);

  const availableBalance = Math.max(balance - lockedBalance, 0);

  const returnRate = useMemo(() => {
    if (totalInvested <= 0) return 0;
    return (totalReturns / totalInvested) * 100;
  }, [totalInvested, totalReturns]);

  const investedProgress = useMemo(() => {
    const total = balance + totalInvested + Math.abs(totalReturns);
    if (total <= 0) return 0;
    return Math.min(Math.round((totalInvested / total) * 100), 100);
  }, [balance, totalInvested, totalReturns]);

  const returnsProgress = useMemo(() => {
    const total = balance + totalInvested + Math.abs(totalReturns);
    if (total <= 0) return 0;
    return Math.min(Math.round((Math.abs(totalReturns) / total) * 100), 100);
  }, [balance, totalInvested, totalReturns]);

  const balanceProgress = useMemo(() => {
    const total = balance + totalInvested + Math.abs(totalReturns);
    if (total <= 0) return 0;
    return Math.min(Math.round((balance / total) * 100), 100);
  }, [balance, totalInvested, totalReturns]);

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
    <div className="bg-surface text-on-surface flex">
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
            className="flex items-center gap-3 px-3 py-2.5 bg-white text-emerald-700 shadow-sm rounded-lg transition-transform duration-200"
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
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1 transition-transform duration-200 rounded-lg"
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

        <div className="p-8 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-on-surface-variant text-sm font-medium tracking-wide">
                INVESTOR OVERVIEW
              </span>
              <h2 className="text-3xl font-extrabold text-primary manrope -mt-1">
                Dashboard
              </h2>
            </div>

            <div className="hidden md:flex gap-3">
              <div className="px-4 py-2 bg-surface-container-low rounded-xl flex items-center gap-2 text-on-surface-variant border border-outline-variant/10">
                <span className="material-symbols-outlined text-sm">
                  account_balance
                </span>
                <span className="text-sm font-medium">
                  Currency: {wallet.currency || "USD"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] flex flex-col gap-1 border border-outline-variant/5">
              <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Your Balance
              </span>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-primary manrope">
                  {loading ? "Loading..." : formatMoney(balance, wallet.currency)}
                </span>
              </div>

            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] flex flex-col gap-1 border border-outline-variant/5">
              <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Total Invested
              </span>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-primary manrope">
                  {loading
                    ? "Loading..."
                    : formatMoney(totalInvested, wallet.currency)}
                </span>
              </div>

              <div className="mt-4 w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${investedProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] flex flex-col gap-1 border border-outline-variant/5">
              <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Total Returns
              </span>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-secondary manrope">
                  {loading
                    ? "Loading..."
                    : `${totalReturns >= 0 ? "+" : ""}${formatMoney(
                        totalReturns,
                        wallet.currency
                      )}`}
                </span>
              </div>

              <div className="mt-4 w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-700"
                  style={{ width: `${returnsProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] flex flex-col gap-1 border border-outline-variant/5">
              <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
                Locked Balance
              </span>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-primary manrope">
                  {loading
                    ? "Loading..."
                    : formatMoney(lockedBalance, wallet.currency)}
                </span>
              </div>

              <div className="mt-4 flex gap-1">
                <div className="h-1 flex-1 bg-secondary rounded-full"></div>
                <div className="h-1 flex-1 bg-secondary rounded-full"></div>
                <div className="h-1 flex-1 bg-surface-container rounded-full"></div>
                <div className="h-1 flex-1 bg-surface-container rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5 min-h-[400px] flex flex-col">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-xl font-bold text-primary manrope">
                    Portfolio Growth
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    Visual overview of your investment activity
                  </p>
                </div>

                <div className="flex bg-surface-container p-1 rounded-lg">
                  <button className="px-4 py-1 text-xs font-bold text-primary bg-white rounded-md shadow-sm">
                    1Y
                  </button>
                  <button className="px-4 py-1 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
                    5Y
                  </button>
                  <button className="px-4 py-1 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">
                    All
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

            <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-primary manrope">
                      Investment Performance
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      Based on your invested capital and returns
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-secondary">
                    monitoring
                  </span>
                </div>

                <div className="flex items-center justify-center mb-8">
                  <div className="relative w-44 h-44 rounded-full bg-surface-container flex items-center justify-center">
                    <div className="absolute inset-3 rounded-full border-[14px] border-secondary/30"></div>
                    <div className="absolute inset-3 rounded-full border-[14px] border-secondary border-r-transparent border-b-transparent rotate-45"></div>

                    <div className="text-center z-10">
                      <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">
                        ROI
                      </p>
                      <p className="text-3xl font-black text-primary manrope">
                        {loading ? "..." : `${returnRate.toFixed(1)}%`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">
                      Available Balance
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {loading
                        ? "..."
                        : formatMoney(availableBalance, wallet.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">
                      Capital Invested
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {loading
                        ? "..."
                        : formatMoney(totalInvested, wallet.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">
                      Lifetime Returns
                    </span>
                    <span className="text-sm font-bold text-secondary">
                      {loading
                        ? "..."
                        : `${totalReturns >= 0 ? "+" : ""}${formatMoney(
                            totalReturns,
                            wallet.currency
                          )}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-white">
                      tips_and_updates
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-primary manrope">
                      Investor Tip
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Keep balance available for upcoming deals
                    </p>
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Your dashboard updates from your wallet data. When you invest,
                  your total invested increases. When you receive distributions,
                  your total returns and balance increase.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5 overflow-hidden mb-10">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-primary manrope">
                Wallet Summary
              </h3>

              <Link
                to="/wallet"
                className="text-sm font-bold text-secondary flex items-center gap-1"
              >
                VIEW WALLET
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Metric
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    Description
                  </th>
                  <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/10">
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-semibold text-primary">
                      Available Balance
                    </p>
                  </td>

                  <td className="px-8 py-6 text-sm text-on-surface-variant">
                    Money available for new investments or withdrawals
                  </td>

                  <td className="px-8 py-6 text-right text-sm font-bold text-primary">
                    {loading
                      ? "..."
                      : formatMoney(availableBalance, wallet.currency)}
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-semibold text-primary">
                      Locked Balance
                    </p>
                  </td>

                  <td className="px-8 py-6 text-sm text-on-surface-variant">
                    Money reserved or temporarily unavailable
                  </td>

                  <td className="px-8 py-6 text-right text-sm font-bold text-primary">
                    {loading
                      ? "..."
                      : formatMoney(lockedBalance, wallet.currency)}
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-semibold text-primary">
                      Lifetime Returns
                    </p>
                  </td>

                  <td className="px-8 py-6 text-sm text-on-surface-variant">
                    Total gains received from distributions and returns
                  </td>

                  <td className="px-8 py-6 text-right text-sm font-bold text-secondary">
                    {loading
                      ? "..."
                      : `${totalReturns >= 0 ? "+" : ""}${formatMoney(
                          totalReturns,
                          wallet.currency
                        )}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}