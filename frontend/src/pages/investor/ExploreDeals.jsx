import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";


const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";

export default function ExploreDeals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDecimal = (value) => {
    if (value === undefined || value === null) return 0;

    if (typeof value === "object" && value.$numberDecimal) {
      return Number(value.$numberDecimal);
    }

    return Number(value) || 0;
  };

  const formatMoney = (amount, currency = "USD") => {
    const number = formatDecimal(amount);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const getFundingData = (deal) => {
    const raised = formatDecimal(deal?.fundingProgress?.amountRaised);
    const target = formatDecimal(deal?.investmentTerms?.targetRaise);

    if (!target || target <= 0) {
      return {
        raised: 0,
        target: 0,
        remaining: 0,
        percentage: 0,
      };
    }

    const percentage = Math.min(Math.round((raised / target) * 100), 100);
    const remaining = Math.max(target - raised, 0);

    return {
      raised,
      target,
      remaining,
      percentage,
    };
  };

  useEffect(() => {
    const fetchActiveDeals = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get(
          "/deals/activedeals",
          {
            withCredentials: true,
          }
        );

        setDeals(res.data.deals || res.data || []);
      } catch (err) {
        console.error("Error fetching active deals:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load deals from the database."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActiveDeals();
  }, []);

  const totalRaised = useMemo(() => {
    return deals.reduce((sum, deal) => {
      return sum + getFundingData(deal).raised;
    }, 0);
  }, [deals]);

  const totalTarget = useMemo(() => {
    return deals.reduce((sum, deal) => {
      return sum + getFundingData(deal).target;
    }, 0);
  }, [deals]);

  const totalRemaining = useMemo(() => {
    return Math.max(totalTarget - totalRaised, 0);
  }, [totalTarget, totalRaised]);

  const averageFunding = useMemo(() => {
    if (!deals.length) return 0;

    const totalPercentage = deals.reduce((sum, deal) => {
      return sum + getFundingData(deal).percentage;
    }, 0);

    return Math.round(totalPercentage / deals.length);
  }, [deals]);

  const averageMinInvestment = useMemo(() => {
    if (!deals.length) return 0;

    const totalMin = deals.reduce((sum, deal) => {
      return sum + formatDecimal(deal?.investmentTerms?.minInvestment);
    }, 0);

    return totalMin / deals.length;
  }, [deals]);

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
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1 transition-transform duration-200 rounded-lg"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-medium text-sm">Dashboard</span>
          </Link>

          <Link
            to="/exploredeals"
            className="flex items-center gap-3 px-3 py-2.5 bg-white text-emerald-700 shadow-sm rounded-lg transition-transform duration-200"
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
                INVESTMENT MARKETPLACE
              </span>

              <h2 className="text-3xl font-extrabold text-primary manrope -mt-1">
                Explore Deals
              </h2>
            </div>

            <div className="hidden md:flex gap-3">
              <div className="px-4 py-2 bg-surface-container-low rounded-xl flex items-center gap-2 text-on-surface-variant border border-outline-variant/10">
                <span className="material-symbols-outlined text-sm">
                  verified
                </span>

                <span className="text-sm font-medium">
                  Approved opportunities only
                </span>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex min-h-[320px] items-center justify-center bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5">
              <p className="text-lg font-bold text-primary">
                Loading deals...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 p-8 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-red-100">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-600">
                  error
                </span>

                <p className="font-bold text-red-600">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && deals.length === 0 && (
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    search_off
                  </span>
                </div>

                <div>
                  <p className="font-bold text-primary">
                    No active deals found.
                  </p>

                  <p className="mt-1 text-sm text-on-surface-variant">
                    There are currently no approved deals available for
                    investment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && deals.length > 0 && (
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-primary manrope">
                      Featured Opportunities
                    </h3>

                    <p className="text-sm text-on-surface-variant">
                      Browse approved deals and choose where to invest
                    </p>
                  </div>

                  <span className="text-sm font-bold text-secondary">
                    {deals.length} DEAL{deals.length > 1 ? "S" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {deals.map((deal) => {
                    const funding = getFundingData(deal);

                    const minInvestment =
                      deal?.investmentTerms?.minInvestment;

                    const equity = deal?.investmentTerms?.equityOfferedPct;

                    return (
                      <article
                        key={deal._id}
                        className="bg-white rounded-xl overflow-hidden border border-outline-variant/5 shadow-[0_8px_32px_rgba(24,28,30,0.04)] hover:shadow-xl transition-all"
                      >
                        <div className="relative h-44 overflow-hidden group">
                          <img
                            alt={deal.title || "Deal image"}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            src={
                              deal.image ||
                              deal.imageUrl ||
                              deal.companyId?.details?.coverImageUrl ||
                              deal.companyId?.details?.logoUrl ||
                              DEFAULT_IMAGE
                            }
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>

                          <div className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
                            {deal.sector ||
                              deal.companyId?.classification?.sector ||
                              deal.companyId?.sector ||
                              "Business"}
                          </div>

                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-[10px] text-secondary-fixed-dim font-bold uppercase tracking-widest">
                              {deal.companyId?.name ||
                                deal.company?.name ||
                                "Unknown Company"}
                            </p>

                            <h4 className="text-white font-bold manrope text-lg leading-tight">
                              {deal.title ||
                                deal.companyId?.name ||
                                "Investment Opportunity"}
                            </h4>
                          </div>
                        </div>

                        <div className="p-6">
                          <p className="text-sm text-on-surface-variant leading-relaxed min-h-[66px]">
                            {deal.description ||
                              deal.companyId?.details?.shortDescription ||
                              deal.companyId?.details?.description ||
                              "No description available."}
                          </p>

                          <div className="grid grid-cols-2 gap-4 mt-6">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                                Raised
                              </p>

                              <p className="text-sm font-bold text-primary">
                                {formatMoney(funding.raised)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                                Target
                              </p>

                              <p className="text-sm font-bold text-primary">
                                {formatMoney(funding.target)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                                Min Invest
                              </p>

                              <p className="text-sm font-bold text-primary">
                                {formatMoney(minInvestment || 0)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                                Equity
                              </p>

                              <p className="text-sm font-bold text-secondary">
                                {equity ? `${equity}%` : "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-bold text-on-surface-variant">
                                Funding Progress
                              </span>

                              <span className="text-sm font-bold text-secondary">
                                {funding.percentage}%
                              </span>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                              <div
                                className="h-full rounded-full bg-secondary transition-all duration-700"
                                style={{ width: `${funding.percentage}%` }}
                              />
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs">
                              <span className="font-medium text-on-surface-variant">
                                Raised: {formatMoney(funding.raised)}
                              </span>

                              <span className="font-bold text-primary">
                                Remaining: {formatMoney(funding.remaining)}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-on-surface-variant">
                              Target amount: {formatMoney(funding.target)}
                            </p>
                          </div>

                          <Link
                            to={`/DealDetails/${deal._id}`}
                            className="mt-6 block w-full rounded-xl bg-primary py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
                          >
                            Invest Now
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-8">
                <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-primary manrope">
                        Marketplace Summary
                      </h3>

                      <p className="text-sm text-on-surface-variant">
                        Current active investment opportunities
                      </p>
                    </div>

                    <span className="material-symbols-outlined text-secondary">
                      monitoring
                    </span>
                  </div>

                  <div className="space-y-5">
                    <SummaryRow label="Active Deals" value={deals.length} />

                    <SummaryRow
                      label="Total Raised"
                      value={formatMoney(totalRaised)}
                    />

                    <SummaryRow
                      label="Total Target"
                      value={formatMoney(totalTarget)}
                    />

                    <SummaryRow
                      label="Total Remaining"
                      value={formatMoney(totalRemaining)}
                      green
                    />

                    <SummaryRow
                      label="Avg. Funding"
                      value={`${averageFunding}%`}
                      green
                    />

                    <SummaryRow
                      label="Avg. Min Investment"
                      value={formatMoney(averageMinInvestment)}
                      green
                    />
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
                        Compare funding progress before investing
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    The funding bar is calculated from the real raised amount
                    divided by the target amount. Remaining amount shows how much
                    is still needed to fully fund the deal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && deals.length > 0 && (
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5 overflow-hidden mb-10">
              <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary manrope">
                  Deal Overview
                </h3>

                <span className="text-sm font-bold text-secondary flex items-center gap-1">
                  DATABASE RESULTS
                  <span className="material-symbols-outlined text-sm">
                    database
                  </span>
                </span>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      Deal
                    </th>

                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      Company
                    </th>

                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      Raised
                    </th>

                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      Progress
                    </th>

                    <th className="px-8 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-outline-variant/10">
                  {deals.map((deal) => {
                    const funding = getFundingData(deal);

                    return (
                      <tr
                        key={deal._id}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <p className="font-semibold text-primary">
                            {deal.title || "Investment Opportunity"}
                          </p>
                        </td>

                        <td className="px-8 py-6 text-sm text-on-surface-variant">
                          {deal.companyId?.name ||
                            deal.company?.name ||
                            "Unknown Company"}
                        </td>

                        <td className="px-8 py-6 text-sm font-bold text-primary">
                          {formatMoney(funding.raised)}
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                              <div className="w-28 h-2 bg-surface-container rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-secondary rounded-full"
                                  style={{ width: `${funding.percentage}%` }}
                                />
                              </div>

                              <span className="text-sm font-bold text-secondary">
                                {funding.percentage}%
                              </span>
                            </div>

                            <span className="text-xs text-on-surface-variant">
                              Remaining: {formatMoney(funding.remaining)}
                            </span>
                          </div>
                        </td>

                        <td className="px-8 py-6 text-right">
                          <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                            {deal.status || "OPEN"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SummaryRow({ label, value, green = false }) {
  return (
    <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4 last:border-b-0">
      <span className="text-sm text-on-surface-variant">{label}</span>

      <span
        className={`text-lg font-bold ${
          green ? "text-secondary" : "text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}