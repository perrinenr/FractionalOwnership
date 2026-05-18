import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

const navItems = [
  { label: "Dashboard", icon: "dashboard", to: "/InvestorDashboard" },
  { label: "Explore Deals", icon: "explore", to: "/exploredeals" },
  {
    label: "Portfolio",
    icon: "account_balance_wallet",
    to: "/portfolio",
  },
  {
    label: "Wallet",
    icon: "account_balance",
    to: "/wallet",
    active: true,
  },
  { label: "Profile", icon: "person", to: "/profilesetting" },
];

const decimalValue = (value) => {
  if (!value) return 0;
  if (value.$numberDecimal) return Number(value.$numberDecimal);
  return Number(value);
};

const formatMoney = (value, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(decimalValue(value));
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusClasses = (status) => {
  switch (status) {
    case "COMPLETED":
      return "bg-secondary-fixed text-on-secondary-fixed-variant";
    case "PENDING":
      return "bg-surface-container-highest text-on-surface-variant";
    case "PROCESSING":
      return "bg-primary-fixed text-on-primary-fixed-variant";
    case "FAILED":
      return "bg-red-100 text-red-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-surface-container text-on-surface-variant";
  }
};

const getTransactionIcon = (type) => {
  switch (type) {
    case "DISTRIBUTION":
      return "payments";
    case "DEPOSIT":
      return "account_balance";
    case "INVESTMENT":
      return "shopping_bag";
    case "WITHDRAWAL":
      return "outbound";
    case "FUNDING_RELEASE":
      return "send_money";
    default:
      return "receipt_long";
  }
};

const getAmountColor = (type) => {
  if (type === "DEPOSIT" || type === "DISTRIBUTION") return "text-secondary";
  if (type === "WITHDRAWAL" || type === "INVESTMENT") return "text-error";
  return "text-primary";
};

const getAmountPrefix = (type) => {
  if (type === "DEPOSIT" || type === "DISTRIBUTION") return "+";
  if (type === "WITHDRAWAL" || type === "INVESTMENT") return "-";
  return "";
};

export default function Wallet() {
  const [searchTerm, setSearchTerm] = useState("");

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [creatingFund, setCreatingFund] = useState(false);
  const [fundError, setFundError] = useState("");
  const [fundSuccess, setFundSuccess] = useState("");

  const [fundForm, setFundForm] = useState({
    type: "DEPOSIT",
    amount: "",
    currency: "USD",
    method: "BANK_TRANSFER",
    bankName: "",
    last4: "",
    externalReference: "",
    description: "",
  });

  const fetchWallet = async () => {
    try {
      setLoadingWallet(true);
      setErrorMessage("");

      const res = await API.get("/company/mywallet");

      setWallet(res.data.wallet || null);
    } catch (error) {
      console.log("WALLET ERROR:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.message || "Failed to load wallet.");
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      setErrorMessage("");

      const res = await API.get("/transactions/mytransactions");

      setTransactions(res.data.transactions || []);
    } catch (error) {
      console.log("TRANSACTIONS ERROR:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.message || "Failed to load transactions."
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const openFundModal = (type) => {
    setFundForm((prev) => ({
      ...prev,
      type,
    }));

    setFundError("");
    setFundSuccess("");
    setShowAddFundsModal(true);
  };

  const handleFundChange = (e) => {
    const { name, value } = e.target;

    setFundForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFundError("");
    setFundSuccess("");
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();

    try {
      setCreatingFund(true);
      setFundError("");
      setFundSuccess("");

      if (!fundForm.amount || Number(fundForm.amount) <= 0) {
        setFundError("Please enter a valid amount.");
        return;
      }

      const body = {
        amount: Number(fundForm.amount),
        paymentDetails: {
          method: fundForm.method,
          bankName: fundForm.bankName,
          last4: fundForm.last4,
          externalReference: fundForm.externalReference,
        },
        description:
          fundForm.description ||
          (fundForm.type === "DEPOSIT"
            ? "Wallet deposit"
            : "Wallet withdrawal"),
      };

      const route =
        fundForm.type === "DEPOSIT"
          ? "/transactions/deposit"
          : "/transactions/withdraw";

      await API.post(route, body);

      setFundSuccess(
        fundForm.type === "DEPOSIT"
          ? "Funds added successfully."
          : "Withdrawal completed successfully."
      );

      setFundForm({
        type: "DEPOSIT",
        amount: "",
        currency: "USD",
        method: "BANK_TRANSFER",
        bankName: "",
        last4: "",
        externalReference: "",
        description: "",
      });

      await fetchWallet();
      await fetchTransactions();

      setTimeout(() => {
        setShowAddFundsModal(false);
        setFundSuccess("");
      }, 900);
    } catch (error) {
      console.log("TRANSACTION ERROR:", error.response?.data || error.message);
      setFundError(
        error.response?.data?.message || "Failed to process transaction."
      );
    } finally {
      setCreatingFund(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) return transactions;

    return transactions.filter((item) => {
      const transactionNumber = item.transactionNumber || "";
      const type = item.type || "";
      const status = item.status || "";
      const description = item.description || "";
      const dealTitle = item.dealId?.title || "";
      const distributionNumber = item.distributionId?.distributionNumber || "";

      return (
        transactionNumber.toLowerCase().includes(query) ||
        type.toLowerCase().includes(query) ||
        status.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        dealTitle.toLowerCase().includes(query) ||
        distributionNumber.toLowerCase().includes(query)
      );
    });
  }, [searchTerm, transactions]);

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <aside className="hidden lg:flex h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex-col p-4 gap-2 shrink-0 sticky top-0">
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
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 w-full z-40 h-16 px-4 md:px-8 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-8 min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-headline whitespace-nowrap">
              Investor Workspace
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button className="hidden sm:inline-flex p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
          <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="text-on-surface-variant text-sm font-medium tracking-wide uppercase">
                Wallet Workspace
              </span>

              <h2 className="text-3xl md:text-4xl font-extrabold text-primary font-headline">
                Digital Vault
              </h2>

              <p className="text-on-surface-variant mt-1">
                Manage your capital and monitor cash flow across your fractional
                assets.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="px-6 py-2.5 rounded-xl border border-outline-variant/30 font-semibold text-sm hover:bg-surface-container transition-colors">
                Export CSV
              </button>

              
            </div>
          </section>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-700 font-semibold">
              {errorMessage}
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_8px_32px_0_rgba(24,28,30,0.04)] flex flex-col justify-between border border-outline-variant/10">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-sm font-bold tracking-widest text-on-surface-variant uppercase">
                    Available Balance
                  </span>

                  <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full">
                    {wallet?.currency || "USD"} Wallet
                  </span>
                </div>

                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-4xl md:text-5xl font-extrabold tracking-tighter text-primary">
                    {loadingWallet
                      ? "Loading..."
                      : formatMoney(wallet?.balance, wallet?.currency)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-12">
                <button
                  onClick={() => openFundModal("DEPOSIT")}
                  className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-2xl font-bold tracking-tight hover:opacity-95 transition-opacity"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Deposit Funds
                </button>

                <button
                  onClick={() => openFundModal("WITHDRAWAL")}
                  className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-2xl font-bold tracking-tight hover:opacity-95 transition-opacity"
                >
                  <span className="material-symbols-outlined">
                    arrow_outward
                  </span>
                  Withdraw
                </button>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-container-low rounded-[2rem] p-6 flex flex-col border border-outline-variant/10">
                <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-4">
                  Locked Capital
                </span>

                <div className="text-3xl font-extrabold tracking-tight text-primary mb-1">
                  {loadingWallet
                    ? "Loading..."
                    : formatMoney(
                        wallet?.lockedCapital ||
                          wallet?.lockedBalance ||
                          wallet?.pendingAmount ||
                          0,
                        wallet?.currency
                      )}
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Funds currently committed to pending fractional acquisitions.
                </p>
              </div>

              <div className="bg-primary-container text-white rounded-[2rem] p-6 relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-xs font-bold tracking-widest opacity-60 uppercase mb-4 block">
                    Wallet Summary
                  </span>

                  <div className="text-lg font-bold mb-2">Total Invested</div>

                  <p className="text-2xl font-extrabold leading-relaxed">
                    {loadingWallet
                      ? "Loading..."
                      : formatMoney(wallet?.totalInvested || 0, wallet?.currency)}
                  </p>
                </div>

                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <span className="material-symbols-outlined text-8xl">
                    verified_user
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-[0_8px_32px_0_rgba(24,28,30,0.04)] border border-outline-variant/10">
            <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10">
              <h2 className="text-xl font-extrabold tracking-tight text-primary">
                Transaction History
              </h2>

              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>

                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all outline-none"
                  placeholder="Search transactions..."
                  type="text"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Date
                    </th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Type
                    </th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Reference
                    </th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Status
                    </th>
                    <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-outline-variant/5">
                  {loadingTransactions ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-8 py-12 text-center text-on-surface-variant"
                      >
                        Loading transactions...
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-8 py-12 text-center text-on-surface-variant"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((item) => {
                      const currency = item.currency || wallet?.currency || "USD";
                      const prefix = getAmountPrefix(item.type);

                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-surface-container-low/30 transition-colors"
                        >
                          <td className="px-8 py-5 text-sm text-on-surface">
                            {formatDate(item.completedAt || item.createdAt)}
                          </td>

                          <td className="px-8 py-5">
                            <span
                              className={`flex items-center gap-2 text-xs font-semibold ${getAmountColor(
                                item.type
                              )}`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {getTransactionIcon(item.type)}
                              </span>
                              {item.type}
                            </span>
                          </td>

                          <td className="px-8 py-5 text-sm">
                            <p className="font-semibold text-primary">
                              {item.transactionNumber || "N/A"}
                            </p>

                            <p className="text-xs text-on-surface-variant">
                              {item.dealId?.title ||
                                item.distributionId?.distributionNumber ||
                                item.description ||
                                "Wallet transaction"}
                            </p>
                          </td>

                          <td className="px-8 py-5">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${getStatusClasses(
                                item.status
                              )}`}
                            >
                              {item.status || "N/A"}
                            </span>
                          </td>

                          <td
                            className={`px-8 py-5 text-right font-bold text-sm ${getAmountColor(
                              item.type
                            )}`}
                          >
                            {prefix}
                            {formatMoney(item.amount, currency)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {showAddFundsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl border border-outline-variant/10 overflow-hidden my-8 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex items-start justify-between bg-surface-container-lowest">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">
                    account_balance_wallet
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-extrabold text-primary font-headline">
                    {fundForm.type === "DEPOSIT"
                      ? "Add Funds"
                      : "Withdraw Funds"}
                  </h3>

                  <p className="text-sm text-on-surface-variant">
                    Create a wallet transaction request.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddFundsModal(false)}
                className="p-2 rounded-full text-slate-500 hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddFunds} className="p-8 space-y-6">
              {fundError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-semibold">
                  {fundError}
                </div>
              )}

              {fundSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700 text-sm font-semibold">
                  {fundSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                  Transaction Type
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      value: "DEPOSIT",
                      title: "Deposit",
                      subtitle: "Add money to your wallet",
                      icon: "account_balance",
                    },
                    {
                      value: "WITHDRAWAL",
                      title: "Withdrawal",
                      subtitle: "Move money out of wallet",
                      icon: "outbound",
                    },
                  ].map((type) => {
                    const active = fundForm.type === type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setFundForm((prev) => ({
                            ...prev,
                            type: type.value,
                          }))
                        }
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          active
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-outline-variant/30 bg-white text-on-surface-variant hover:border-primary"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined">
                            {type.icon}
                          </span>

                          <div>
                            <p className="font-bold text-sm">{type.title}</p>
                            <p className="text-xs text-on-surface-variant">
                              {type.subtitle}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                    Amount
                  </label>

                  <div className="relative">
                    <input
                      name="amount"
                      value={fundForm.amount}
                      onChange={handleFundChange}
                      type="number"
                      min="1"
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-4 pr-20 font-headline font-bold text-xl focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">
                      USD
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                    Currency
                  </label>

                  <select
                    value="USD"
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-4 px-4 font-bold text-slate-500 cursor-not-allowed"
                  >
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                  Payment Method
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["BANK_TRANSFER", "CARD", "ACH", "WIRE"].map((method) => {
                    const active = fundForm.method === method;

                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() =>
                          setFundForm((prev) => ({
                            ...prev,
                            method,
                          }))
                        }
                        className={`p-4 rounded-xl border text-left transition-all ${
                          active
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 bg-white text-on-surface-variant hover:border-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg mb-2">
                          {method === "CARD"
                            ? "credit_card"
                            : "account_balance"}
                        </span>

                        <p className="text-xs font-bold">
                          {method.replace("_", " ")}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                    Bank Name
                  </label>

                  <input
                    name="bankName"
                    value={fundForm.bankName}
                    onChange={handleFundChange}
                    type="text"
                    placeholder="Example: Chase Bank"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 font-semibold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                    Last 4 Digits
                  </label>

                  <input
                    name="last4"
                    value={fundForm.last4}
                    onChange={handleFundChange}
                    type="text"
                    maxLength="4"
                    placeholder="4492"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 font-semibold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                  External Reference
                </label>

                <input
                  name="externalReference"
                  value={fundForm.externalReference}
                  onChange={handleFundChange}
                  type="text"
                  placeholder="Bank reference, card reference, or transfer ID"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 font-semibold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                  Description
                </label>

                <textarea
                  name="description"
                  value={fundForm.description}
                  onChange={handleFundChange}
                  placeholder={
                    fundForm.type === "DEPOSIT"
                      ? "Example: Initial wallet funding"
                      : "Example: Transfer to bank account"
                  }
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 font-semibold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none resize-none"
                />
              </div>

              <div className="rounded-2xl bg-primary text-white p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/70 font-bold">
                    Transaction Preview
                  </p>

                  <p className="text-2xl font-extrabold font-headline mt-1">
                    {fundForm.type === "DEPOSIT" ? "+" : "-"}
                    {formatMoney(fundForm.amount || 0, "USD")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-white/70 font-semibold">Type</p>
                  <p className="text-sm font-bold">{fundForm.type}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFundsModal(false)}
                  className="px-6 py-3 rounded-xl border border-outline-variant/30 font-semibold text-sm hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingFund}
                  className="px-8 py-3 rounded-xl bg-primary-container text-white font-bold shadow-lg shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creatingFund
                    ? "Processing..."
                    : fundForm.type === "DEPOSIT"
                    ? "Create Deposit"
                    : "Create Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}