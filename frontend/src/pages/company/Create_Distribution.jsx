import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; ////////// BACKEND
import API from "../../api/axios";


const today = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});


const distributionTypes = [
  { key: "DIVIDEND", label: "DIVIDEND", icon: "account_balance_wallet" },
  { key: "REVENUE_SHARE", label: "REVENUE SHARE", icon: "analytics" },
  { key: "SPECIAL_LIQUIDITY", label: "SPECIAL LIQUIDITY", icon: "water_drop" },
];

const currencies = [
  { label: "USD - United States Dollar", value: "USD" },

];

const navItems = [
  { label: "Dashboard", icon: "dashboard", to: "/company-dashboard" },
  { label: "My Deals", icon: "handshake", to: "/company-deals" },
  { label: "Distributions", icon: "payments", to: "/company-distributions", active: true },
  { label: "Wallet", icon: "account_balance_wallet", to: "/company-wallet" },
  { label: "Profile", icon: "person", to: "/profile" },
];

const investors = [
  { name: "Investor payouts will be calculated by backend", equity: 100, verified: true },
];

const formatMoney = (value, currency = "USD") => {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

export default function CreateDistributionPage() {
  const [formData, setFormData] = useState({
    distributionType: "DIVIDEND",
    totalAmount: "",
    currency: "USD",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdDistribution, setCreatedDistribution] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  };

  const totalAmountNumber = Number(formData.totalAmount || 0);

  const investorPayouts = useMemo(() => {
    return investors.map((investor) => ({
      ...investor,
      payout: totalAmountNumber,
    }));
  }, [totalAmountNumber]);

  const handleCreateDistribution = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setCreatedDistribution(null);

      if (!formData.totalAmount || Number(formData.totalAmount) <= 0) {
        setErrorMessage("Please enter a valid total amount.");
        return;
      }

      const body = {
        totalAmount: Number(formData.totalAmount),
        type: formData.distributionType,
        currency: formData.currency,
      };

          const res = await API.post(
      "/distributions/createdistribution", ////////// CREATE DISTRIBUTION ROUTE
      body ////////// BACKEND BODY
    );


      setCreatedDistribution(res.data.distribution);
      setSuccessMessage(res.data.message || "Distribution created successfully.");

      setFormData({
        distributionType: "DIVIDEND",
        totalAmount: "",
        currency: "USD",
      });
    } catch (error) {
  console.log("FULL ERROR:", error);
  console.log("BACKEND RESPONSE:", error.response?.data);

  setErrorMessage(
    error.response?.data?.message ||
    error.message ||
    "Something went wrong while creating the distribution."
  );

    } finally {
      setLoading(false);
    }
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
        
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 w-full z-40 h-16 px-4 md:px-8 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-headline whitespace-nowrap">
            Company Workspace
          </h1>

          <div className="flex items-center gap-3 md:gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button className="hidden sm:inline-flex p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col xl:flex-row justify-between xl:items-end gap-6 mb-12">
              <div>
                <h1 className="text-3xl md:text-[2.5rem] font-bold font-headline text-on-surface leading-tight tracking-tight">
                  Create Distribution
                </h1>
                <p className="text-on-surface-variant text-base md:text-lg font-medium mt-2">
                  Create an instant payout distribution for active investors.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/company-distributions" ////////// ROUTE
                  className="px-6 py-3 rounded-xl border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container transition-colors"
                >
                  Cancel
                </Link>

                <button
                  onClick={handleCreateDistribution}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl bg-primary-container text-white font-bold shadow-lg shadow-primary/10 active:scale-95 duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Create Distribution"}
                </button>
              </div>
            </header>

            {errorMessage && (
              <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-700 font-semibold">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-emerald-700 font-semibold">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <section className="xl:col-span-7 space-y-8">
                <div className="bg-surface-container-lowest p-6 md:p-10 rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(24,28,30,0.06)] border border-outline-variant/10">
                  <h3 className="text-xl font-bold font-headline mb-8 flex items-center gap-2">
                    <span className="w-2 h-6 bg-secondary rounded-full"></span>
                    Distribution Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                        Distribution Type
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {distributionTypes.map((type) => {
                          const active = formData.distributionType === type.key;

                          return (
                            <button
                              key={type.key}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  distributionType: type.key,
                                }))
                              }
                              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-colors ${
                                active
                                  ? "border-2 border-primary bg-primary/5 text-primary"
                                  : "border border-outline-variant hover:border-primary"
                              }`}
                            >
                              <span
                                className="material-symbols-outlined mb-2"
                                style={
                                  active
                                    ? { fontVariationSettings: "'FILL' 1" }
                                    : undefined
                                }
                              >
                                {type.icon}
                              </span>

                              <span
                                className={`text-xs font-bold ${
                                  active ? "text-primary" : "text-on-surface-variant"
                                }`}
                              >
                                {type.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                        Total Amount
                      </label>

                      <div className="relative">
                        <input
                          name="totalAmount"
                          value={formData.totalAmount}
                          onChange={handleChange}
                          className="w-full bg-surface-container border-none rounded-xl py-4 pl-4 pr-16 font-headline font-bold text-lg focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                          placeholder="0.00"
                          type="number"
                          min="0"
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">
                          {formData.currency}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                        Currency
                      </label>

                      <select
  name="currency"
  value={formData.currency}
  disabled
  className="w-full bg-surface-container border-none rounded-xl py-4 px-4 font-bold opacity-70 cursor-not-allowed"
>
  <option value="USD">USD</option>
  <option value="EUR">EUR</option>
</select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase mb-2 block">
                        Execution Date
                      </label>

                      <div className="w-full p-4 rounded-xl border bg-surface-container-low text-on-surface-variant font-semibold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        {today}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase mb-2 block">
                        Status
                      </label>

                      <div className="w-full p-4 rounded-xl border bg-emerald-50 text-emerald-700 font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">
                          bolt
                        </span>
                        Instant Execution
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="xl:col-span-5 space-y-6">
                <div className="bg-primary text-white p-8 md:p-10 rounded-[2rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <span className="material-symbols-outlined text-8xl">
                      payments
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-on-primary-container text-xs font-bold uppercase tracking-widest mb-4">
                      Total Allocation Preview
                    </h3>

                    <div className="text-4xl md:text-[3.5rem] font-headline font-extrabold leading-none tracking-tighter">
                      {formatMoney(totalAmountNumber, formData.currency)}
                    </div>

                    <p className="mt-5 text-sm text-white/80 font-medium leading-relaxed">
                      The backend will automatically split this amount based on each active investor ownership percentage.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-6 md:p-8 rounded-[2rem] border border-outline-variant/10">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-bold font-headline text-on-surface">
                      Backend Payout Logic
                    </h4>

                    <span className="text-xs font-bold text-on-surface-variant bg-surface-variant px-3 py-1 rounded-full">
                      Auto
                    </span>
                  </div>

                  <div className="space-y-4">
                    {investorPayouts.map((investor) => (
                      <div
                        key={investor.name}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-outline-variant/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-700">
                              groups
                            </span>
                          </div>

                          <div>
                            <div className="text-sm font-bold text-on-surface">
                              {investor.name}
                            </div>
                            <div className="text-xs text-on-surface-variant font-medium">
                              Active ownerships only
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-headline font-bold text-on-surface">
                            {formatMoney(investor.payout, formData.currency)}
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-tighter text-secondary">
                            Auto Paid
                          </div>
                        </div>
                      </div>
                    ))}

                    {createdDistribution && (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-xs font-bold uppercase text-emerald-700 mb-1">
                          Created Distribution
                        </p>
                        <p className="text-sm font-bold text-emerald-900">
                          {createdDistribution.distributionNumber}
                        </p>
                      </div>
                    )}

                    <Link
                      to="/company-distributions" ////////// ROUTE
                      className="block text-center w-full py-4 text-sm font-bold text-on-primary-container border-2 border-dashed border-outline-variant rounded-2xl hover:border-primary hover:text-primary transition-all"
                    >
                      View All Distributions
                    </Link>
                  </div>
                </div>

                <div className="bg-secondary/5 border border-secondary/10 p-6 rounded-[2rem] flex gap-4">
                  <span
                    className="material-symbols-outlined text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    info
                  </span>

                  <div>
                    <div className="text-sm font-bold text-secondary">
                      Backend Check
                    </div>
                    <p className="text-xs text-on-secondary-fixed-variant leading-relaxed mt-1">
                      Your backend checks company balance, active ownerships, investor wallets, transactions, and then saves the distribution.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}