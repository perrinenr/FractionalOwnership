import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";

const paymentMethods = [
  "WALLET",
  "BANK_TRANSFER",
  "CARD",
  "CRYPTO",
  "ACH",
  "WIRE",
];

export default function DealDetails() {
  const { dealId } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("WALLET");

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

  const getFundingData = (dealData) => {
    const raised = formatDecimal(dealData?.fundingProgress?.amountRaised);
    const target = formatDecimal(dealData?.investmentTerms?.targetRaise);

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
  const fetchDealDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get(`/deals/${dealId}`, {
        withCredentials: true,
      });

      setDeal(res.data.deal || res.data);
    } catch (err) {
      console.error("Error loading deal details:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load deal details from the database."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchDealDetails();
}, [dealId]);

  const handleInvest = async (e) => {
    e.preventDefault();

    try {
      setInvesting(true);
      setError("");
      setSuccess("");

      const res = await API.post(
        `/deals/${dealId}/invest`,
        {
          amount: Number(amount),
          paymentDetails: {
            method: paymentMethod,
          },
        },
        {
          withCredentials: true,
        }
      );

      setSuccess(res.data.message || "Investment completed successfully");

      const refreshed = await API.get(`/deals/${dealId}`, {
        withCredentials: true,
      });

      setDeal(refreshed.data.deal);
      setAmount("");
      navigate("/Portfolio");
    } catch (err) {
      console.error("Investment error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Investment failed"
      );
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface text-on-surface flex">
        <aside className="h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex flex-col p-4 gap-2 shrink-0">
          <div className="mb-8 px-2">
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              Investor Workplace
            </h2>
          </div>
        </aside>

        <main className="flex-1 flex items-center justify-center h-screen">
          <p className="text-lg font-bold text-primary">Loading deal...</p>
        </main>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="bg-surface text-on-surface flex">
        <main className="flex-1 flex items-center justify-center h-screen">
          <p className="text-lg font-bold text-red-600">
            {error || "Deal not found"}
          </p>
        </main>
      </div>
    );
  }

  const company = deal.companyId || {};
  const funding = getFundingData(deal);

  const currency = deal.investmentTerms?.currency || "USD";
  const minInvestment = formatDecimal(deal.investmentTerms?.minInvestment);
  const maxInvestment = formatDecimal(deal.investmentTerms?.maxInvestment);
  const equity = deal.investmentTerms?.equityOfferedPct;

  const image =
    deal.image ||
    deal.imageUrl ||
    company?.details?.coverImageUrl ||
    company?.details?.logoUrl ||
    DEFAULT_IMAGE;

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
          <h1 className="text-xl font-bold tracking-tight text-slate-900 manrope">
            Investor Workspace
          </h1>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl w-full p-8">
          <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-secondary-container px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                  {deal.status || "OPEN"}
                </span>

                <span className="text-sm font-medium text-on-surface-variant">
                  Deal #{deal.dealNumber || deal._id}
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
                {deal.title || company.name || "Investment Opportunity"}
              </h1>

              <p className="mt-2 text-on-surface-variant">
                {company.name || "Company details"}
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                to="/exploredeals"
                className="flex items-center gap-2 rounded-xl bg-surface-container-lowest px-5 py-2.5 text-sm font-bold text-on-surface shadow-sm transition-colors hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Back
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-[0_8px_32px_0_rgba(24,28,30,0.04)]">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Target Raise
                  </p>
                  <h4 className="text-2xl font-bold tracking-tight text-primary">
                    {formatMoney(funding.target, currency)}
                  </h4>
                </div>

                <div className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-[0_8px_32px_0_rgba(24,28,30,0.04)]">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Amount Raised
                  </p>
                  <h4 className="text-2xl font-bold tracking-tight text-primary">
                    {formatMoney(funding.raised, currency)}
                  </h4>
                </div>

                <div className="rounded-[2rem] bg-surface-container-lowest p-6 shadow-[0_8px_32px_0_rgba(24,28,30,0.04)]">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Funding Progress
                  </p>
                  <h4 className="text-2xl font-bold tracking-tight text-primary">
                    {funding.percentage}%
                  </h4>

                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full bg-secondary"
                      style={{ width: `${funding.percentage}%` }}
                    />
                  </div>

                  <p className="mt-2 text-[10px] text-on-surface-variant">
                    Remaining: {formatMoney(funding.remaining, currency)}
                  </p>
                </div>
              </div>

              <section className="space-y-6">
                <div className="relative h-80 w-full overflow-hidden rounded-[2rem] shadow-[0_8px_32px_0_rgba(24,28,30,0.04)]">
                  <img
                    alt="Company Visual"
                    className="h-full w-full object-cover"
                    src={image}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest opacity-80">
                      {deal.sector ||
                        company?.classification?.sector ||
                        company?.sector ||
                        "Business"}
                    </p>
                    <h3 className="text-3xl font-bold">
                      {company.name || deal.title}
                    </h3>
                  </div>
                </div>

                <div className="rounded-[2rem] bg-surface-container-lowest p-8 shadow-[0_8px_32px_0_rgba(24,28,30,0.04)]">
                  <h2 className="mb-6 text-xl font-bold tracking-tight text-primary">
                    Investment Opportunity
                  </h2>

                  <p className="text-base leading-relaxed text-on-surface-variant">
                    {deal.description ||
                      company?.details?.description ||
                      company?.details?.shortDescription ||
                      "No description available for this company."}
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-6 border-t border-outline-variant/10 pt-8 md:grid-cols-2">
                    <div>
                      <h5 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Company Information
                      </h5>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Company
                          </span>
                          <span className="font-bold text-primary">
                            {company.name || "N/A"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Country
                          </span>
                          <span className="font-bold text-primary">
                            {company.incorporationCountry || "N/A"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Website
                          </span>
                          <span className="font-bold text-primary">
                            {company?.details?.website || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Investment Terms
                      </h5>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Min Investment
                          </span>
                          <span className="font-bold text-primary">
                            {formatMoney(minInvestment, currency)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Max Investment
                          </span>
                          <span className="font-bold text-primary">
                            {maxInvestment
                              ? formatMoney(maxInvestment, currency)
                              : "No limit"}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">
                            Equity Offered
                          </span>
                          <span className="font-bold text-secondary">
                            {equity || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="xl:col-span-4">
              <form
                onSubmit={handleInvest}
                className="space-y-6 xl:sticky xl:top-28"
              >
                <div className="rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-[0_8px_32px_0_rgba(24,28,30,0.04)]">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold">Investment Panel</h3>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      info
                    </span>
                  </div>

                  {error && (
                    <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 rounded-xl bg-secondary/10 p-3 text-sm font-bold text-secondary">
                      {success}
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Investment Amount
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">
                        $
                      </span>
                      <input
                        type="number"
                        min={minInvestment}
                        max={maxInvestment || funding.remaining}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full rounded-2xl border-none bg-surface-container py-4 pl-10 pr-4 text-lg font-bold focus:ring-2 focus:ring-primary/10"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Payment Method
                    </label>

                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-2xl border-none bg-surface-container px-4 py-4 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/10"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-8 space-y-4">
                    <div className="flex justify-between py-2 text-sm">
                      <span className="text-on-surface-variant">
                        Min. Investment
                      </span>
                      <span className="font-semibold">
                        {formatMoney(minInvestment, currency)}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 text-sm">
                      <span className="text-on-surface-variant">
                        Remaining Amount
                      </span>
                      <span className="font-semibold text-secondary">
                        {formatMoney(funding.remaining, currency)}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 text-sm">
                      <span className="text-on-surface-variant">
                        Payment Method
                      </span>
                      <span className="font-semibold">
                        {paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={investing}
                    className="w-full rounded-2xl bg-gradient-to-br from-primary to-primary-container py-4 text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {investing ? "Processing..." : "Invest Now"}
                  </button>

                  <p className="mt-6 text-center text-[10px] leading-relaxed text-on-surface-variant">
                    By clicking "Invest Now" you confirm this investment and the
                    selected payment method.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}