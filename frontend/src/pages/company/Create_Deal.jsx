import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../api/axios";


const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/company-dashboard" },
  { label: "My Deals", icon: "business_center", href: "/company-deals" },
  { label: "Distributions", icon: "payments", href: "/company-distributions" },
  { label: "Wallet", icon: "account_balance_wallet", href: "/company-wallet" },
  { label: "Profile", icon: "person", href: "/profile" },
];



export default function CreateDealPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetRaise: "",
    equityOfferedPct: "",
    pricePerShare: "",
    minInvestment: "",
    maxInvestment: "",
    verifiedOnly: true,
    openingDate: "",
    closingDate: "",
    fundingDeadline: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Deal title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Deal description is required";
    }

    if (!formData.targetRaise) {
      newErrors.targetRaise = "Target raise is required";
    }

    if (!formData.equityOfferedPct) {
      newErrors.equityOfferedPct = "Equity offered is required";
    }

    if (!formData.pricePerShare) {
      newErrors.pricePerShare = "Price per share is required";
    }

    if (!formData.minInvestment) {
      newErrors.minInvestment = "Minimum investment is required";
    }

    if (!formData.fundingDeadline) {
      newErrors.fundingDeadline = "Funding deadline is required";
    }

    if (
      formData.targetRaise &&
      Number(formData.targetRaise) <= 0
    ) {
      newErrors.targetRaise = "Target raise must be greater than 0";
    }

    if (
      formData.equityOfferedPct &&
      Number(formData.equityOfferedPct) <= 0
    ) {
      newErrors.equityOfferedPct = "Equity offered must be greater than 0";
    }

    if (
      formData.pricePerShare &&
      Number(formData.pricePerShare) <= 0
    ) {
      newErrors.pricePerShare = "Price per share must be greater than 0";
    }

    if (
      formData.minInvestment &&
      Number(formData.minInvestment) <= 0
    ) {
      newErrors.minInvestment = "Minimum investment must be greater than 0";
    }

    if (
      formData.maxInvestment &&
      Number(formData.maxInvestment) < Number(formData.minInvestment || 0)
    ) {
      newErrors.maxInvestment =
        "Maximum investment cannot be less than minimum investment";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const complianceScore = useMemo(() => {
    const requiredFields = [
      formData.title,
      formData.description,
      formData.targetRaise,
      formData.equityOfferedPct,
      formData.pricePerShare,
      formData.minInvestment,
      formData.fundingDeadline,
    ];

    const filled = requiredFields.filter(
      (field) => String(field).trim() !== ""
    ).length;

    return Math.min(100, Math.round((filled / requiredFields.length) * 100));
  }, [formData]);

  const complianceLabel =
    complianceScore >= 85
      ? "High Grade"
      : complianceScore >= 60
      ? "Moderate"
      : "Needs Review";

  const complianceStroke = 251.2;
  const complianceOffset =
    complianceStroke - (complianceScore / 100) * complianceStroke;

  const valuationPreview = useMemo(() => {
    const targetRaise = Number(formData.targetRaise);
    const equityOfferedPct = Number(formData.equityOfferedPct);

    if (!targetRaise || !equityOfferedPct) return "—";

    return (targetRaise / (equityOfferedPct / 100)).toFixed(2);
  }, [formData.targetRaise, formData.equityOfferedPct]);

  const pricePerPercentPreview = useMemo(() => {
    const targetRaise = Number(formData.targetRaise);
    const equityOfferedPct = Number(formData.equityOfferedPct);

    if (!targetRaise || !equityOfferedPct) return "—";

    return (targetRaise / equityOfferedPct).toFixed(2);
  }, [formData.targetRaise, formData.equityOfferedPct]);

  const buildPayload = () => {
    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      verifiedOnly: formData.verifiedOnly,
      openingDate: formData.openingDate || null,
      closingDate: formData.closingDate || null,

      investmentTerms: {
        currency: "USD",
        targetRaise: formData.targetRaise ? Number(formData.targetRaise) : null,
        equityOfferedPct: formData.equityOfferedPct
          ? Number(formData.equityOfferedPct)
          : null,
        pricePerShare: formData.pricePerShare
          ? Number(formData.pricePerShare)
          : null,
        minInvestment: formData.minInvestment
          ? Number(formData.minInvestment)
          : null,
        maxInvestment: formData.maxInvestment
          ? Number(formData.maxInvestment)
          : null,
        fundingDeadline: formData.fundingDeadline || null,
      },

      fundingProgress: {
        amountRaised: 0,
        investorCount: 0,
        progressPct: 0,
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    const isValid = validateForm();
    if (!isValid) return;

    const payload = buildPayload();
    console.log("SENDING PAYLOAD:", payload);

    try {
      setSubmitting(true);

      const res = await API.post("/deals/createDeal", payload); /////////// CREATE DEAL ROUTE

      setSuccessMessage(res.data.message || "Deal created successfully");

      setTimeout(() => {
        navigate("/company-deals"); /////////// REDIRECT AFTER SUCCESS
      }, 1000);
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("ERROR RESPONSE:", error.response);
      console.log("ERROR DATA:", error.response?.data);

      if (error.response?.data?.errors?.length) {
        setServerError(error.response.data.errors.join(", "));
      } else {
        setServerError(error.response?.data?.message || "Failed to create deal");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldName) =>
    `w-full bg-surface-container rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all ${
      errors[fieldName]
        ? "border border-red-500 focus:border-red-500"
        : "border border-transparent"
    }`;

  const smallInputClass = (fieldName) =>
    `w-full bg-surface-container rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary transition-all ${
      errors[fieldName]
        ? "border border-red-500 focus:border-red-500"
        : "border border-transparent"
    }`;

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <aside className="hidden lg:flex h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex-col p-4 gap-2 shrink-0 sticky top-0">
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">
                account_balance
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
              to={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-transform duration-200 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

       
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 h-16 px-4 md:px-8 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-xl font-bold text-slate-900 font-headline tracking-tight whitespace-nowrap">
              Company Worksplace
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-500 hover:bg-slate-100 transition-colors rounded-lg">
                <span className="material-symbols-outlined">notifications</span>
              </button>

              <button className="hidden sm:inline-flex p-2 text-slate-500 hover:text-slate-900 transition-colors">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="max-w-7xl mx-auto px-4 md:px-8 xl:px-10 py-8 md:py-12"
        >
          <div className="mb-10 flex flex-col xl:flex-row justify-between xl:items-end gap-6">
            <div>
              <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">
                Create New Deal
              </h2>
              <p className="text-on-surface-variant max-w-2xl">
                Fill in the minimum deal information and submit it directly to
                the backend.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl font-semibold bg-primary-container text-white flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">
                  rocket_launch
                </span>
                {submitting ? "Creating..." : "Create Deal"}
              </button>
            </div>
          </div>

          {serverError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 space-y-8">
              <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary text-sm">
                      fingerprint
                    </span>
                  </div>
                  <h3 className="font-headline text-xl font-bold">
                    Core Identity
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">
                      Deal Title
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={inputClass("title")}
                      placeholder="e.g. Skyline Residences Series A"
                      type="text"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">
                      Deal Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={inputClass("description")}
                      placeholder="Describe the deal..."
                      rows="4"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-sm">
                      account_balance_wallet
                    </span>
                  </div>
                  <h3 className="font-headline text-xl font-bold">
                    Investment Terms
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">
                      Target Raise
                    </label>
                    <input
                      name="targetRaise"
                      value={formData.targetRaise}
                      onChange={handleChange}
                      className={inputClass("targetRaise")}
                      placeholder="0.00"
                      type="number"
                    />
                    {errors.targetRaise && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.targetRaise}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">
                      Equity Offered (%)
                    </label>
                    <input
                      name="equityOfferedPct"
                      value={formData.equityOfferedPct}
                      onChange={handleChange}
                      className={inputClass("equityOfferedPct")}
                      placeholder="0.00"
                      type="number"
                    />
                    {errors.equityOfferedPct && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.equityOfferedPct}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">
                      Price Per Share
                    </label>
                    <input
                      name="pricePerShare"
                      value={formData.pricePerShare}
                      onChange={handleChange}
                      className={inputClass("pricePerShare")}
                      placeholder="0.00"
                      type="number"
                    />
                    {errors.pricePerShare && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.pricePerShare}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-primary text-xl">
                      group
                    </span>
                    <h3 className="font-headline text-lg font-bold">
                      Investors
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Min Investment
                      </label>
                      <input
                        name="minInvestment"
                        value={formData.minInvestment}
                        onChange={handleChange}
                        className={smallInputClass("minInvestment")}
                        placeholder="5000"
                        type="number"
                      />
                      {errors.minInvestment && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.minInvestment}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Max Investment
                      </label>
                      <input
                        name="maxInvestment"
                        value={formData.maxInvestment}
                        onChange={handleChange}
                        className={smallInputClass("maxInvestment")}
                        placeholder="100000"
                        type="number"
                      />
                      {errors.maxInvestment && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.maxInvestment}
                        </p>
                      )}
                    </div>

                    <label className="flex items-center justify-between pt-4 cursor-pointer">
                      <span className="text-sm font-medium text-slate-700">
                        Verified Investors Only
                      </span>
                      <span
                        className={`w-12 h-6 rounded-full relative shadow-inner transition-colors ${
                          formData.verifiedOnly
                            ? "bg-secondary"
                            : "bg-surface-container-highest"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="verifiedOnly"
                          checked={formData.verifiedOnly}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            formData.verifiedOnly ? "right-1" : "left-1"
                          }`}
                        ></span>
                      </span>
                    </label>
                  </div>
                </section>

                <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant/10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-primary text-xl">
                      calendar_month
                    </span>
                    <h3 className="font-headline text-lg font-bold">
                      Timeline
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Opening Date
                      </label>
                      <input
                        name="openingDate"
                        value={formData.openingDate}
                        onChange={handleChange}
                        className={smallInputClass("openingDate")}
                        type="date"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Closing Date
                      </label>
                      <input
                        name="closingDate"
                        value={formData.closingDate}
                        onChange={handleChange}
                        className={smallInputClass("closingDate")}
                        type="date"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Funding Deadline
                      </label>
                      <input
                        name="fundingDeadline"
                        value={formData.fundingDeadline}
                        onChange={handleChange}
                        className={smallInputClass("fundingDeadline")}
                        type="date"
                      />
                      {errors.fundingDeadline && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.fundingDeadline}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-6">
              <div className="bg-primary-container text-white p-8 rounded-xl shadow-xl overflow-hidden relative">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary opacity-10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h4 className="font-headline font-bold text-lg leading-tight mb-1">
                        Completion Check
                      </h4>
                      <p className="text-on-primary-container text-xs">
                        Based on required form fields
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-secondary-fixed text-2xl">
                      verified_user
                    </span>
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          className="text-slate-700"
                          cx="48"
                          cy="48"
                          fill="transparent"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                        />
                        <circle
                          className="text-secondary-fixed transition-all duration-500"
                          cx="48"
                          cy="48"
                          fill="transparent"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeDasharray={complianceStroke}
                          strokeDashoffset={complianceOffset}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-headline font-extrabold text-2xl">
                          {complianceScore}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-2xl font-bold font-headline">
                        {complianceLabel}
                      </p>
                      <p className="text-on-primary-container text-sm">
                        Form Readiness
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm group border border-outline-variant/10">
                <div className="h-48 overflow-hidden relative">
                  <img
                    alt="Deal preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-secondary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Preview
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    Deal Draft
                  </p>
                  <h5 className="font-headline font-bold text-xl mb-4 leading-tight">
                    {formData.title || "Untitled Deal"}
                  </h5>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase mb-1">
                        Target Raise
                      </p>
                      <p className="font-semibold">
                        {formData.targetRaise || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase mb-1">
                        Equity %
                      </p>
                      <p className="font-semibold">
                        {formData.equityOfferedPct || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase mb-1">
                        Valuation
                      </p>
                      <p className="font-semibold">{valuationPreview}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase mb-1">
                        Price Per %
                      </p>
                      <p className="font-semibold">{pricePerPercentPreview}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}