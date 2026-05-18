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
    currency: "USD",
    equityOffered: "",
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
    currency: "USD",
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

function getSavedDraft() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return defaultListingData;

    const parsed = JSON.parse(saved);

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
        currency: "USD",
      },

      financials: {
        ...defaultListingData.financials,
        ...(parsed.financials || {}),
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
    console.error("Failed to parse listing wizard draft:", error);
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

function formatNumber(value) {
  const number = parseNumber(value);

  if (number === null || Number.isNaN(number)) return "";

  return number.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

export default function Step3FundingInformationStyled() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => getSavedDraft());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleFundingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      funding: {
        ...prev.funding,
        [field]: value,
      },
    }));
  };

  const calculateFundingValues = (funding) => {
    const targetAmount = parseNumber(funding.targetAmount);
    const equityOffered = parseNumber(funding.equityOffered);
    const totalShares = parseNumber(funding.totalShares);

    const pricePerPercent =
      targetAmount && equityOffered ? targetAmount / equityOffered : "";

    const sharePrice =
      targetAmount && totalShares ? targetAmount / totalShares : "";

    return {
      pricePerPercent: pricePerPercent ? String(pricePerPercent) : "",
      sharePrice: sharePrice ? String(sharePrice) : "",
    };
  };

  const validateForm = () => {
    const newErrors = {};
    const funding = formData.funding;

    const targetAmount = parseNumber(funding.targetAmount);
    const minimumInvestment = parseNumber(funding.minimumInvestment);
    const equityOffered = parseNumber(funding.equityOffered);
    const totalShares = parseNumber(funding.totalShares);

    if (!String(funding.targetAmount || "").trim()) {
      newErrors.targetAmount = "Target amount is required.";
    } else if (
      targetAmount === null ||
      Number.isNaN(targetAmount) ||
      targetAmount <= 0
    ) {
      newErrors.targetAmount =
        "Target amount must be a valid positive number.";
    }

    if (!String(funding.minimumInvestment || "").trim()) {
      newErrors.minimumInvestment = "Minimum investment is required.";
    } else if (
      minimumInvestment === null ||
      Number.isNaN(minimumInvestment) ||
      minimumInvestment <= 0
    ) {
      newErrors.minimumInvestment =
        "Minimum investment must be a valid positive number.";
    }

    if (!String(funding.equityOffered || "").trim()) {
      newErrors.equityOffered = "Equity offered is required.";
    } else if (
      equityOffered === null ||
      Number.isNaN(equityOffered) ||
      equityOffered <= 0 ||
      equityOffered > 100
    ) {
      newErrors.equityOffered =
        "Equity offered must be a valid number between 0 and 100.";
    }

    if (!String(funding.totalShares || "").trim()) {
      newErrors.totalShares = "Total shares is required.";
    } else if (
      totalShares === null ||
      Number.isNaN(totalShares) ||
      totalShares <= 0
    ) {
      newErrors.totalShares = "Total shares must be a valid positive number.";
    }

    if (!funding.fundingStartDate) {
      newErrors.fundingStartDate = "Funding start date is required.";
    }

    if (!funding.fundingDeadline) {
      newErrors.fundingDeadline = "Funding deadline is required.";
    } else if (
      funding.fundingStartDate &&
      funding.fundingDeadline < funding.fundingStartDate
    ) {
      newErrors.fundingDeadline =
        "Funding deadline must be after the funding start date.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePrevious = () => {
    navigate("/Step2DetailsClassification");
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const calculatedValues = calculateFundingValues(formData.funding);

    const nextData = {
      ...formData,
      funding: {
        ...formData.funding,
        currency: "USD",
        ...calculatedValues,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    setFormData(nextData);

    navigate("/Step4Financials");
  };

  const handleManualSave = () => {
    const calculatedValues = calculateFundingValues(formData.funding);

    const nextData = {
      ...formData,
      funding: {
        ...formData.funding,
        currency: "USD",
        ...calculatedValues,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    setFormData(nextData);
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm h-16 flex justify-between items-center px-8">
        <div className="text-lg font-black tracking-tighter text-slate-900">
          Financial Architect
        </div>

        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-slate-900 transition-colors">
            help_outline
          </span>

          <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-slate-900 transition-colors">
            notifications
          </span>

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
              <div className="h-full bg-secondary w-[50%] rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 3 of 6
            </p>
          </div>

          <nav className="space-y-1">
            <Link
              to="/Step1BasicInfoType"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">business</span>
              <span className="font-inter text-sm">Company Info</span>
            </Link>

            <Link
              to="/Step2DetailsClassification"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">category</span>
              <span className="font-inter text-sm">Classification</span>
            </Link>

            <Link
              to="/Step3FundingInformation"
              className="flex items-center gap-3 px-4 py-3 bg-white text-slate-900 font-bold shadow-sm rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined text-secondary">
                payments
              </span>
              <span className="font-inter text-sm">Funding</span>
            </Link>

            <Link
              to="/Step4Financials"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">account_balance</span>
              <span className="font-inter text-sm">Financials</span>
            </Link>

            <Link
              to="/Step5ValuationTeam"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">groups</span>
              <span className="font-inter text-sm">Valuation & Team</span>
            </Link>

            <Link
              to="/Step6DocumentsMetrics"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">description</span>
              <span className="font-inter text-sm">Documents</span>
            </Link>
          </nav>
        </aside>

        <main className="ml-0 lg:ml-72 flex-1 p-6 lg:p-12 max-w-7xl">
          <form onSubmit={handleContinue}>
            <header className="mb-12">
              <h1 className="font-manrope text-4xl font-extrabold tracking-tight text-on-surface mb-2">
                Funding
              </h1>

              <p className="text-on-surface-variant font-body max-w-3xl">
                Define the economic structure and target goals for your
                fractional offering in the same polished style as the previous
                page.
              </p>
            </header>

            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 xl:col-span-8 space-y-8">
                <section className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
                  <div className="mb-8">
                    <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      Targets & Capital
                      <span className="text-error text-lg">*</span>
                    </label>

                    <p className="text-sm text-on-surface-variant/60 mt-1">
                      Set the funding target and minimum ticket size.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Target Amount</span>
                        <span className="text-error normal-case">Required</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          $
                        </span>

                        <input
                          type="text"
                          placeholder="500000"
                          value={formData.funding.targetAmount}
                          onChange={(e) =>
                            handleFundingChange("targetAmount", e.target.value)
                          }
                          className="w-full h-14 pl-10 pr-4 bg-surface-container-lowest border-none rounded-xl font-manrope font-bold text-on-surface focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {errors.targetAmount && (
                        <p className="text-sm text-error mt-2">
                          {errors.targetAmount}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Minimum Investment</span>
                        <span className="text-error normal-case">Required</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          $
                        </span>

                        <input
                          type="text"
                          placeholder="500"
                          value={formData.funding.minimumInvestment}
                          onChange={(e) =>
                            handleFundingChange(
                              "minimumInvestment",
                              e.target.value
                            )
                          }
                          className="w-full h-14 pl-10 pr-4 bg-surface-container-lowest border-none rounded-xl font-manrope font-bold text-on-surface focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {errors.minimumInvestment && (
                        <p className="text-sm text-error mt-2">
                          {errors.minimumInvestment}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
                  <div className="mb-8">
                    <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      Equity & Share Structuring
                      <span className="text-error text-lg">*</span>
                    </label>

                    <p className="text-sm text-on-surface-variant/60 mt-1">
                      Define the ownership slice and investment unit structure.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Equity Offered</span>
                        <span className="text-error normal-case">Required</span>
                      </label>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="15"
                          value={formData.funding.equityOffered}
                          onChange={(e) =>
                            handleFundingChange(
                              "equityOffered",
                              e.target.value
                            )
                          }
                          className="w-full h-14 pr-10 pl-4 bg-surface-container-lowest border-none rounded-xl font-manrope font-bold text-on-surface focus:ring-2 focus:ring-primary"
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          %
                        </span>
                      </div>

                      {errors.equityOffered && (
                        <p className="text-sm text-error mt-2">
                          {errors.equityOffered}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Total Shares</span>
                        <span className="text-error normal-case">Required</span>
                      </label>

                      <input
                        type="text"
                        placeholder="1000000"
                        value={formData.funding.totalShares}
                        onChange={(e) =>
                          handleFundingChange("totalShares", e.target.value)
                        }
                        className="w-full h-14 px-4 bg-surface-container-lowest border-none rounded-xl font-manrope font-bold text-on-surface focus:ring-2 focus:ring-primary"
                      />

                      {errors.totalShares && (
                        <p className="text-sm text-error mt-2">
                          {errors.totalShares}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
                  <div className="mb-8">
                    <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      Offering Timeline
                      <span className="text-error text-lg">*</span>
                    </label>

                    <p className="text-sm text-on-surface-variant/60 mt-1">
                      Set the opening and closing dates of the offering.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Funding Start Date</span>
                        <span className="text-error normal-case">Required</span>
                      </label>

                      <input
                        type="date"
                        value={formData.funding.fundingStartDate}
                        onChange={(e) =>
                          handleFundingChange(
                            "fundingStartDate",
                            e.target.value
                          )
                        }
                        className="w-full h-14 px-4 bg-surface-container-lowest border-none rounded-xl font-manrope font-semibold text-on-surface focus:ring-2 focus:ring-primary"
                      />

                      {errors.fundingStartDate && (
                        <p className="text-sm text-error mt-2">
                          {errors.fundingStartDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Funding Deadline</span>
                        <span className="text-error normal-case">Required</span>
                      </label>

                      <input
                        type="date"
                        value={formData.funding.fundingDeadline}
                        onChange={(e) =>
                          handleFundingChange(
                            "fundingDeadline",
                            e.target.value
                          )
                        }
                        className="w-full h-14 px-4 bg-surface-container-lowest border-none rounded-xl font-manrope font-semibold text-on-surface focus:ring-2 focus:ring-primary"
                      />

                      {errors.fundingDeadline && (
                        <p className="text-sm text-error mt-2">
                          {errors.fundingDeadline}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <div className="col-span-12 xl:col-span-4 space-y-8">
                <section className="bg-primary-container text-on-primary-container p-8 rounded-2xl relative overflow-hidden shadow-sm">
                  <div className="relative z-10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-6">
                      Offering Snapshot
                    </h4>

                    <div className="space-y-6">
                      <div>
                        <span className="text-xs text-slate-300 block mb-1">
                          Target Raise
                        </span>

                        <span className="text-3xl font-extrabold font-headline text-white">
                          {formData.funding.targetAmount
                            ? `$ ${formatNumber(formData.funding.targetAmount)}`
                            : "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-300 block mb-1">
                          Equity Offered
                        </span>

                        <span className="text-3xl font-extrabold font-headline text-white">
                          {formData.funding.equityOffered
                            ? `${formData.funding.equityOffered}%`
                            : "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-300 block mb-1">
                          Total Shares
                        </span>

                        <span className="text-2xl font-extrabold font-headline text-white">
                          {formData.funding.totalShares
                            ? formatNumber(formData.funding.totalShares)
                            : "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-slate-300 block mb-1">
                          Share Price
                        </span>

                        <span className="text-2xl font-extrabold font-headline text-white">
                          {calculateFundingValues(formData.funding).sharePrice
                            ? `$ ${formatNumber(
                                calculateFundingValues(formData.funding)
                                  .sharePrice
                              )}`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
                </section>

                <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
                  <div className="flex items-center gap-2 mb-2 text-secondary font-bold">
                    <span className="material-symbols-outlined text-sm">
                      verified_user
                    </span>

                    <span className="text-xs uppercase tracking-tight">
                      Institutional Shield
                    </span>
                  </div>

                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    These funding parameters shape how investors understand the
                    opportunity. Review the equity split and timeline carefully
                    before continuing.
                  </p>
                </section>
              </div>
            </div>

            <footer className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between gap-4 md:items-center">
              <button
                type="button"
                onClick={handlePrevious}
                className="px-8 py-3 rounded-xl font-inter font-semibold text-on-surface hover:bg-surface-container transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  arrow_back
                </span>
                Previous
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="px-8 py-3 rounded-xl font-inter font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Save Draft
                </button>

                <button
                  type="submit"
                  className="px-10 py-4 rounded-xl font-bold text-sm bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Next Step
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            </footer>
          </form>
        </main>
      </div>

      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10"></div>

      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -z-10"></div>
    </div>
  );
}