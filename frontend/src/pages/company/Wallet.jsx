import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API from "../../api/axios";



const navItems = [
  { label: "Dashboard", icon: "dashboard", to: "/company-dashboard" },
  { label: "My Deals", icon: "handshake", to: "/company-deals" },
  { label: "Distributions", icon: "payments", to: "/company-distributions" },
  {
    label: "Wallet",
    icon: "account_balance_wallet",
    to: "/company-wallet",
    active: true,
  },
  { label: "Profile", icon: "person", to: "/profile" },
];

const accountsData = [
  {
    name: "Company Wallet",
    subtitle: "Internal wallet balance",
    icon: "account_balance_wallet",
    iconWrap: "bg-blue-50 text-blue-700",
  },
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

export default function WalletPage() {
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
      const res = await API.get("/company/mywallet"); ////////// GET WALLET ROUTE
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
      const res = await API.get("/transactions/mytransactions"); ////////// GET TRANSACTIONS ROUTE
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
          ? "/transactions/deposit" ////////// DEPOSIT ROUTE
          : "/transactions/withdraw"; ////////// WITHDRAWAL ROUTE

      await API.post(route, body); ////////// BACKEND CALL

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
          <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <span className="text-on-surface-variant text-sm font-medium tracking-wide uppercase">
                Wallet Workspace
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary font-headline">
                Company Wallet
              </h2>
              <p className="text-on-surface-variant mt-1">
                Manage institutional liquidity and fractional asset
                distributions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="px-6 py-2.5 rounded-xl border border-outline-variant/30 font-semibold text-sm hover:bg-surface-container transition-colors">
                Export CSV
              </button>

              <button
                onClick={() => setShowAddFundsModal(true)}
                className="px-6 py-2.5 rounded-xl bg-primary-container text-white font-semibold text-sm shadow-lg shadow-primary/10"
              >
                Add / Withdraw Funds
              </button>
            </div>
          </section>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-700 font-semibold">
              {errorMessage}
            </div>
          )}

          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
              <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mb-4">
                Available Balance
              </p>
              <h3 className="font-headline text-4xl font-extrabold text-primary">
                {loadingWallet
                  ? "Loading..."
                  : formatMoney(wallet?.balance, wallet?.currency)}
              </h3>
              <div className="mt-6 flex items-center gap-2 text-secondary font-semibold text-sm">
                <span className="material-symbols-outlined text-sm">
                  account_balance_wallet
                </span>
                <span>{wallet?.currency || "USD"} Wallet</span>
              </div>
            </div>

          </section>

          <section className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-8">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
                <div className="px-8 py-6 border-b border-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h4 className="font-headline font-bold text-lg text-primary">
                    Transaction History
                  </h4>

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
                  <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-8 py-4">Date</th>
                        <th className="px-4 py-4">Type</th>
                        <th className="px-4 py-4">Reference</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Amount</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-surface-container">
                      {loadingTransactions ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-8 py-12 text-center text-on-surface-variant"
                          >
                            Loading transactions...
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((item) => {
                          const amount = item.amount;
                          const currency = item.currency || "USD";
                          const prefix = getAmountPrefix(item.type);

                          return (
                            <tr
                              key={item._id}
                              className="hover:bg-surface-container-low transition-colors group"
                            >
                              <td className="px-8 py-5 text-sm font-medium text-on-surface">
                                {formatDate(item.completedAt || item.createdAt)}
                              </td>

                              <td className="px-4 py-5">
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

                              <td className="px-4 py-5 text-sm">
                                <p className="font-semibold text-primary">
                                  {item.transactionNumber}
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                  {item.dealId?.title ||
                                    item.distributionId?.distributionNumber ||
                                    item.description ||
                                    "Wallet transaction"}
                                </p>
                              </td>

                              <td className="px-4 py-5">
                                <span
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${getStatusClasses(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              </td>

                              <td
                                className={`px-8 py-5 text-right font-headline font-bold ${getAmountColor(
                                  item.type
                                )}`}
                              >
                                {prefix}
                                {formatMoney(amount, currency)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {!loadingTransactions && !filteredTransactions.length && (
                  <div className="px-8 py-12 text-center text-on-surface-variant">
                    No transactions found.
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-12 xl:col-span-4 space-y-6">
              <div className="bg-primary text-white p-6 rounded-xl relative overflow-hidden shadow-xl shadow-primary/20">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-secondary-fixed">
                      account_balance_wallet
                    </span>
                    <h5 className="font-headline font-bold uppercase tracking-widest text-[10px]">
                      Wallet Summary
                    </h5>
                  </div>

                  <p className="font-headline font-bold text-lg mb-2">
                    Total Invested
                  </p>

                  <p className="text-blue-200 text-sm mb-6">
                    Your total invested amount is{" "}
                    <span className="text-white font-bold">
                      {formatMoney(wallet?.totalInvested, wallet?.currency)}
                    </span>
                  </p>

                  <button className="w-full bg-white text-primary py-3 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors">
                    View Details
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-low p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h5 className="font-headline font-bold text-primary">
                    Wallet Accounts
                  </h5>
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">
                    account_balance
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  {accountsData.map((account) => (
                    <div
                      key={account.name}
                      className="bg-white p-4 rounded-xl flex items-center justify-between group cursor-pointer border border-transparent hover:border-outline-variant/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${account.iconWrap}`}
                        >
                          <span className="material-symbols-outlined">
                            {account.icon}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-bold text-primary">
                            {account.name}
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            {wallet?.currency || account.subtitle}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold rounded-full flex items-center gap-1">
                        Active
                      </span>
                    </div>
                  ))}
                </div>

              
              </div>
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
                      : "Example: Transfer to company bank account"
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