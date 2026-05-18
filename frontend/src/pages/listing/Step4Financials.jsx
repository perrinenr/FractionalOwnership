import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STORAGE_KEY = "listingWizardData";

const defaultListingData = {
  company: {
    name: "",
    slug: "",
    registrationNumber: "",
    incorporationDate: "",
    incorporationCountry: "",
    listingType: "EQUITY",
  },

  details: {
    description: "",
    shortDescription: "",
    foundedDate: "",
    businessModel: "",
    website: "",
    logoUrl: "",
    coverImageUrl: "",
    videoUrl: "",
  },

  classification: {
    detailedDescription: "",
    shortDescription: "",
    foundedDate: "",
    businessModel: "",
    websiteUrl: "",
    videoPitchUrl: "",
    primarySector: "",
    sectorId: "",
    subSector: "",
    subSectorId: "",
    businessType: "",
    tags: [],
  },

  funding: {
    targetAmount: "",
    minimumInvestment: "",
    minInvestment: "",
    maximumInvestment: "",
    maxInvestment: "",
    currency: "USD",
    equityOffered: "",
    equityOfferedPct: "",
    totalShares: "",
    pricePerPercent: "",
    sharePrice: "",
    fundingStartDate: "",
    fundingDeadline: "",
  },

  financials: {
    arr: "",
    mrr: "",
    grossRevenue: "",
    netIncome: "",
    grossMargin: "",
    netMargin: "",
    expenses: "",
    ebitda: "",
    asOfDate: "",
    audited: "",
  },

  valuation: {
    preMoneyValuation: "",
    postMoneyValuation: "",
    revenueMultiple: "",
    ebitdaMultiple: "",
    valuedAt: "",
    teamMembers: [
      {
        id: "member-1",
        name: "",
        role: "",
        bio: "",
        linkedin: "",
      },
    ],
  },

  team: [],

  documents: {},

  metrics: {
    employeeCount: "",
    customerCount: "",
    monthlyActiveUsers: "",
    churnRate: "",
    growthRate: "",
  },

  status: "PENDING_REVIEW",
  isListing: true,
};

function getSavedListingData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return defaultListingData;

    const parsed = JSON.parse(saved);

    const {
      currency: removedFinancialCurrency,
      ...savedFinancialsWithoutCurrency
    } = parsed.financials || {};

    return {
      ...defaultListingData,
      ...parsed,

      company: {
        ...defaultListingData.company,
        ...(parsed.company || {}),
      },

      details: {
        ...defaultListingData.details,
        ...(parsed.details || {}),
      },

      classification: {
        ...defaultListingData.classification,
        ...(parsed.classification || {}),
        tags: Array.isArray(parsed?.classification?.tags)
          ? parsed.classification.tags
          : [],
      },

      funding: {
        ...defaultListingData.funding,
        ...(parsed.funding || {}),
      },

      financials: {
        ...defaultListingData.financials,
        ...savedFinancialsWithoutCurrency,
      },

      valuation: {
        ...defaultListingData.valuation,
        ...(parsed.valuation || {}),
      },

      documents: {
        ...defaultListingData.documents,
        ...(parsed.documents || {}),
      },

      metrics: {
        ...defaultListingData.metrics,
        ...(parsed.metrics || {}),
      },

      team: Array.isArray(parsed.team) ? parsed.team : [],
    };
  } catch (error) {
    console.error("Failed to parse listing draft:", error);
    return defaultListingData;
  }
}

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) return null;

  const normalized = String(value).replace(/,/g, "").trim();

  if (!normalized) return null;

  const number = Number(normalized);

  return Number.isNaN(number) ? NaN : number;
}

function formatDisplayNumber(value) {
  if (value === "" || value === null || value === undefined) return "—";

  const number = typeof value === "number" ? value : parseNumber(value);

  if (number === null || Number.isNaN(number)) return "—";

  return number.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

export default function Step4FinancialsStyled() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => getSavedListingData());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleFinancialChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      financials: {
        ...prev.financials,
        [field]: value,
      },
    }));
  };

  const validateStep4 = () => {
    const newErrors = {};
    const financials = formData.financials;

    const arr = parseNumber(financials.arr);
    const grossRevenue = parseNumber(financials.grossRevenue);
    const netIncome = parseNumber(financials.netIncome);
    const expenses = parseNumber(financials.expenses);

    if (financials.arr === "") {
      newErrors.arr = "ARR is required.";
    } else if (arr === null || Number.isNaN(arr)) {
      newErrors.arr = "ARR must be a valid number.";
    } else if (arr < 0) {
      newErrors.arr = "ARR cannot be negative.";
    }

    if (financials.grossRevenue === "") {
      newErrors.grossRevenue = "Gross revenue is required.";
    } else if (grossRevenue === null || Number.isNaN(grossRevenue)) {
      newErrors.grossRevenue = "Gross revenue must be a valid number.";
    } else if (grossRevenue < 0) {
      newErrors.grossRevenue = "Gross revenue cannot be negative.";
    }

    if (financials.netIncome === "") {
      newErrors.netIncome = "Net income is required.";
    } else if (netIncome === null || Number.isNaN(netIncome)) {
      newErrors.netIncome = "Net income must be a valid number.";
    }

    if (financials.expenses === "") {
      newErrors.expenses = "Expenses is required.";
    } else if (expenses === null || Number.isNaN(expenses)) {
      newErrors.expenses = "Expenses must be a valid number.";
    } else if (expenses < 0) {
      newErrors.expenses = "Expenses cannot be negative.";
    }

    if (!financials.asOfDate) {
      newErrors.asOfDate = "As of date is required.";
    }

    if (financials.audited === "") {
      newErrors.audited = "Audited status is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  };

  const handlePrevious = () => {
    navigate("/Step3FundingInformation");
  };

  const handleContinue = () => {
    if (!validateStep4()) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

    navigate("/Step5ValuationTeam");
  };

  const progressWidth = "w-2/3";

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-8">
        <div className="flex items-center gap-8">
          <div className="text-lg font-black tracking-tighter text-slate-900">
            Financial Architect
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <button
            type="button"
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden ml-2 bg-surface-container border border-outline-variant/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-500 text-[18px]">
              person
            </span>
          </div>
        </div>
      </nav>

      <div className="flex pt-16 min-h-screen">
        <aside className="hidden lg:flex h-[calc(100vh-64px)] w-72 fixed left-0 flex-col gap-1 p-4 bg-slate-50 border-r border-slate-200/50">
          <div className="mb-6 px-2">
            <h2 className="font-headline font-bold text-slate-900 text-lg leading-tight">
              Listing Wizard
            </h2>

            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
              Institutional Grade Setup
            </p>

            <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full bg-secondary ${progressWidth} rounded-full`}
              ></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 4 of 6
            </p>
          </div>

          <nav className="space-y-1">
            <Link
              to="/Step1BasicInfoType"
              className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl transition-all duration-200 ease-in-out hover:bg-white/70"
            >
              <span className="material-symbols-outlined">business</span>
              <span className="font-inter text-sm">Company Info</span>
            </Link>

            <Link
              to="/Step2DetailsClassification"
              className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl transition-all duration-200 ease-in-out hover:bg-white/70"
            >
              <span className="material-symbols-outlined">category</span>
              <span className="font-inter text-sm">Classification</span>
            </Link>

            <Link
              to="/Step3FundingInformation"
              className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl transition-all duration-200 ease-in-out hover:bg-white/70"
            >
              <span className="material-symbols-outlined">payments</span>
              <span className="font-inter text-sm">Funding</span>
            </Link>

            <Link
              to="/Step4Financials"
              className="flex items-center gap-3 px-4 py-3 bg-white text-slate-900 font-bold shadow-sm rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined text-secondary">
                account_balance
              </span>
              <span className="font-inter text-sm">Financials</span>
            </Link>

            <Link
              to="/Step5ValuationTeam"
              className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl transition-all duration-200 ease-in-out hover:bg-white/70"
            >
              <span className="material-symbols-outlined">groups</span>
              <span className="font-inter text-sm">Valuation & Team</span>
            </Link>

            <Link
              to="/Step6DocumentsMetrics"
              className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl transition-all duration-200 ease-in-out hover:bg-white/70"
            >
              <span className="material-symbols-outlined">description</span>
              <span className="font-inter text-sm">Documents</span>
            </Link>
          </nav>
        </aside>

        <main className="ml-0 lg:ml-72 flex-1 p-6 lg:p-12 max-w-7xl">
          <div className="max-w-6xl mx-auto">
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-widest">
                  Step 04 of 06
                </span>

                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Financials
                </span>
              </div>

              <h1 className="font-manrope text-4xl font-extrabold tracking-tight text-on-surface mb-2">
                Financials
              </h1>

              <p className="text-on-surface-variant font-body max-w-2xl">
                This step contains only the required financial fields from your
                backend schema.
              </p>
            </header>

            <div className="grid grid-cols-12 gap-8">
              <section className="col-span-12 lg:col-span-8 space-y-8">
                <div className="bg-surface-container-low rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-primary-fixed">
                      <span className="material-symbols-outlined text-primary">
                        monitoring
                      </span>
                    </div>

                    <div>
                      <h3 className="font-manrope text-xl font-bold text-slate-900">
                        Financials
                      </h3>

                      <p className="text-sm text-on-surface-variant/70 mt-1">
                        Required fields only.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                        ARR <span className="text-error">*</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          $
                        </span>

                        <input
                          type="text"
                          placeholder="0"
                          value={formData.financials.arr}
                          onChange={(e) =>
                            handleFinancialChange("arr", e.target.value)
                          }
                          className="w-full h-14 pl-10 pr-4 bg-white border-none rounded-xl font-manrope font-bold text-on-surface focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {errors.arr && (
                        <p className="text-sm text-error mt-2">{errors.arr}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                        Gross Revenue <span className="text-error">*</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          $
                        </span>

                        <input
                          type="text"
                          placeholder="0"
                          value={formData.financials.grossRevenue}
                          onChange={(e) =>
                            handleFinancialChange(
                              "grossRevenue",
                              e.target.value
                            )
                          }
                          className="w-full h-14 pl-10 pr-4 bg-white border-none rounded-xl font-manrope font-bold text-on-surface focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {errors.grossRevenue && (
                        <p className="text-sm text-error mt-2">
                          {errors.grossRevenue}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                        Net Income <span className="text-error">*</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          $
                        </span>

                        <input
                          type="text"
                          placeholder="0"
                          value={formData.financials.netIncome}
                          onChange={(e) =>
                            handleFinancialChange("netIncome", e.target.value)
                          }
                          className="w-full h-14 pl-10 pr-4 bg-white border-none rounded-xl font-manrope font-bold text-on-surface focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {errors.netIncome && (
                        <p className="text-sm text-error mt-2">
                          {errors.netIncome}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                        Expenses <span className="text-error">*</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          $
                        </span>

                        <input
                          type="text"
                          placeholder="0"
                          value={formData.financials.expenses}
                          onChange={(e) =>
                            handleFinancialChange("expenses", e.target.value)
                          }
                          className="w-full h-14 pl-10 pr-4 bg-white border-none rounded-xl font-manrope font-bold text-on-surface focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {errors.expenses && (
                        <p className="text-sm text-error mt-2">
                          {errors.expenses}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                        As Of Date <span className="text-error">*</span>
                      </label>

                      <input
                        type="date"
                        value={formData.financials.asOfDate}
                        onChange={(e) =>
                          handleFinancialChange("asOfDate", e.target.value)
                        }
                        className="w-full h-14 px-4 bg-white border-none rounded-xl font-manrope font-semibold text-on-surface focus:ring-2 focus:ring-primary"
                      />

                      {errors.asOfDate && (
                        <p className="text-sm text-error mt-2">
                          {errors.asOfDate}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                        Audited <span className="text-error">*</span>
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Yes", value: "true" },
                          { label: "No", value: "false" },
                        ].map((choice) => (
                          <button
                            key={choice.value}
                            type="button"
                            onClick={() =>
                              handleFinancialChange("audited", choice.value)
                            }
                            className={`h-14 rounded-xl border font-bold transition-all ${
                              formData.financials.audited === choice.value
                                ? "bg-white border-secondary text-slate-900 shadow-sm"
                                : "bg-surface-container border-transparent text-slate-500 hover:border-secondary/30"
                            }`}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>

                      {errors.audited && (
                        <p className="text-sm text-error mt-2">
                          {errors.audited}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="col-span-12 lg:col-span-4 space-y-8">
                <div className="bg-gradient-to-br from-primary to-primary-container text-white p-8 rounded-2xl relative overflow-hidden shadow-xl shadow-primary/10">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-6">
                      Snapshot
                    </p>

                    <div className="space-y-6">
                      <div>
                        <span className="text-xs text-white/70 block mb-1">
                          ARR
                        </span>

                        <span className="text-3xl font-extrabold font-manrope">
                          $ {formatDisplayNumber(formData.financials.arr)}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-white/70 block mb-1">
                          Gross Revenue
                        </span>

                        <span className="text-3xl font-extrabold font-manrope">
                          ${" "}
                          {formatDisplayNumber(
                            formData.financials.grossRevenue
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-white/70 block mb-1">
                          Net Income
                        </span>

                        <span className="text-2xl font-extrabold font-manrope">
                          $ {formatDisplayNumber(formData.financials.netIncome)}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-white/70 block mb-1">
                          Expenses
                        </span>

                        <span className="text-2xl font-extrabold font-manrope">
                          $ {formatDisplayNumber(formData.financials.expenses)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-14 -bottom-14 w-44 h-44 bg-secondary/20 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                  <div className="flex items-center gap-2 mb-3 text-secondary font-bold">
                    <span className="material-symbols-outlined text-sm">
                      verified_user
                    </span>

                    <span className="text-xs uppercase tracking-tight">
                      Financial Fields Only
                    </span>
                  </div>

                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    Valuation has been removed from this step and will be
                    handled in another step.
                  </p>
                </div>
              </section>
            </div>

            <footer className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center gap-2 px-8 py-4 bg-surface-container-low text-on-surface-variant font-bold rounded-xl hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  arrow_back
                </span>
                Previous
              </button>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-8 py-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="px-10 py-4 rounded-xl font-bold text-sm bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  Next Step
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </button>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10"></div>

      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -z-10"></div>
    </div>
  );
}