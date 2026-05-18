import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const STORAGE_KEY = "listingWizardData";
const OLD_STORAGE_KEY = "listingWizardDraft";

const defaultListingData = {
  company: {
    name: "",
    slug: "",
    registrationNumber: "",
    incorporationDate: "",
    incorporationCountry: "",
    listingType: "",
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
    sectorId: "",
    subSectorId: "",
    businessType: "",
    tags: [],
  },

  funding: {
    targetAmount: "",
    minimumInvestment: "",
    maximumInvestment: "",
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

function createSlug(name) {
  return (
    String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "company-slug"
  );
}

function getSavedDraft() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return defaultListingData;

    const parsed = JSON.parse(saved);

    const companyName =
      parsed.company?.name || parsed.companyName || parsed.name || "";

    const listingType =
      parsed.company?.listingType || parsed.listingType || "";

    const slug =
      parsed.company?.slug || parsed.slug || createSlug(companyName);

    return {
      ...defaultListingData,
      ...parsed,

      company: {
        ...defaultListingData.company,
        ...(parsed.company || {}),
        name: companyName,
        slug,
        listingType,
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
          : Array.isArray(parsed?.tags)
          ? parsed.tags
          : [],
      },

      funding: {
        ...defaultListingData.funding,
        ...(parsed.funding || {}),
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

export default function Step1BasicInfoType() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => getSavedDraft());
  const [errors, setErrors] = useState({});

  const assetSlug = useMemo(() => {
    return createSlug(formData.company.name);
  }, [formData.company.name]);

  useEffect(() => {
    const nextData = {
      ...formData,
      company: {
        ...formData.company,
        slug: assetSlug,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  }, [formData, assetSlug]);

  const handleCompanyChange = (field, value) => {
    setFormData((prev) => {
      const updatedCompany = {
        ...prev.company,
        [field]: value,
      };

      if (field === "name") {
        updatedCompany.slug = createSlug(value);
      }

      return {
        ...prev,
        company: updatedCompany,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company.name.trim()) {
      newErrors.companyName = "Company name is required.";
    }

    if (!formData.company.listingType) {
      newErrors.listingType = "Listing type is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const nextData = {
      ...formData,
      company: {
        ...formData.company,
        slug: assetSlug,
      },
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));

    navigate("/Step2DetailsClassification");
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OLD_STORAGE_KEY);
    setFormData(defaultListingData);
    setErrors({});
  };

  const listingOptions = [
    {
      value: "EQUITY",
      title: "EQUITY",
      description:
        "Direct ownership of shares with voting rights and dividend potential.",
      icon: "pie_chart",
      activeIconBg: "bg-secondary-fixed",
      inactiveIconBg: "bg-surface-container",
      iconColor: "text-primary",
    },
    {
      value: "REVENUE_SHARE",
      title: "REVENUE SHARE",
      description:
        "Percentage of top-line revenue without dilution of voting rights.",
      icon: "payments",
      activeIconBg: "bg-secondary-fixed",
      inactiveIconBg: "bg-surface-container",
      iconColor: "text-primary",
    },
    {
      value: "HYBRID",
      title: "HYBRID",
      description:
        "Custom combination of equity stakes and income sharing agreements.",
      icon: "layers",
      activeIconBg: "bg-secondary-fixed",
      inactiveIconBg: "bg-surface-container",
      iconColor: "text-primary",
    },
  ];

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
              <div className="h-full bg-secondary w-[16.6667%] rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 1 of 6
            </p>
          </div>

          <nav className="space-y-1">
            <Link
              to="/Step1BasicInfoType"
              className="flex items-center gap-3 px-4 py-3 bg-white text-slate-900 font-bold shadow-sm rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined text-secondary">
                business
              </span>
              <span className="font-inter text-sm">Company Info</span>
            </Link>

            <Link
              to="/Step2DetailsClassification"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl transition-all duration-200 ease-in-out hover:bg-white hover:text-slate-900"
            >
              <span className="material-symbols-outlined">category</span>
              <span className="font-inter text-sm">Classification</span>
            </Link>

            <Link
              to="/Step3FundingInformation"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl transition-all duration-200 ease-in-out hover:bg-white hover:text-slate-900"
            >
              <span className="material-symbols-outlined">payments</span>
              <span className="font-inter text-sm">Funding</span>
            </Link>

            <Link
              to="/Step4Financials"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl transition-all duration-200 ease-in-out hover:bg-white hover:text-slate-900"
            >
              <span className="material-symbols-outlined">account_balance</span>
              <span className="font-inter text-sm">Financials</span>
            </Link>

            <Link
              to="/Step5ValuationTeam"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl transition-all duration-200 ease-in-out hover:bg-white hover:text-slate-900"
            >
              <span className="material-symbols-outlined">groups</span>
              <span className="font-inter text-sm">Valuation & Team</span>
            </Link>

            <Link
              to="/Step6DocumentsMetrics"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl transition-all duration-200 ease-in-out hover:bg-white hover:text-slate-900"
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
                Basic Company Info & Listing Type
              </h1>

              <p className="text-on-surface-variant font-body max-w-3xl">
                Establish the institutional foundation of your asset. The
                registration number will be generated automatically by the
                backend.
              </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-8 items-start">
              <section className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
                <div className="mb-8">
                  <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    Basic Info
                    <span className="text-error text-lg">*</span>
                  </label>

                  <p className="text-sm text-on-surface-variant/60 mt-1">
                    Add the core information of the company you want to list.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                      <span>Company Name</span>
                      <span className="text-error normal-case">Required</span>
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. Blue Horizon Real Estate Holdings"
                      value={formData.company.name}
                      onChange={(e) =>
                        handleCompanyChange("name", e.target.value)
                      }
                      className="w-full h-14 px-5 bg-surface-container-lowest border-none rounded-xl font-manrope font-semibold text-on-surface focus:ring-2 focus:ring-primary"
                    />

                    {errors.companyName && (
                      <p className="text-sm text-error mt-2">
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                      <span>Asset Slug</span>
                      <span className="text-slate-400 normal-case">
                        Auto-generated
                      </span>
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                        /asset/
                      </span>

                      <input
                        type="text"
                        value={assetSlug}
                        disabled
                        className="w-full h-14 pl-20 pr-5 bg-surface-container-lowest border-none rounded-xl font-mono text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-6">
                  <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    Listing Type
                    <span className="text-error text-lg">*</span>
                  </label>

                  <p className="text-sm text-on-surface-variant/60 mt-1">
                    Choose the structure investors will participate in.
                  </p>

                  {errors.listingType && (
                    <p className="text-sm text-error mt-2">
                      {errors.listingType}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {listingOptions.map((option) => {
                    const isActive =
                      formData.company.listingType === option.value;

                    return (
                      <div
                        key={option.value}
                        onClick={() =>
                          handleCompanyChange("listingType", option.value)
                        }
                        className={`group relative flex cursor-pointer rounded-xl p-6 shadow-sm border transition-all ${
                          isActive
                            ? "bg-white border-secondary shadow-md"
                            : "bg-surface-container-low border-transparent hover:border-secondary/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="listingType"
                          value={option.value}
                          checked={isActive}
                          onChange={() =>
                            handleCompanyChange("listingType", option.value)
                          }
                          className="sr-only"
                        />

                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex gap-4 items-start">
                            <div
                              className={`p-3 rounded-full transition-colors ${
                                isActive
                                  ? option.activeIconBg
                                  : option.inactiveIconBg
                              }`}
                            >
                              <span
                                className={`material-symbols-outlined ${option.iconColor}`}
                              >
                                {option.icon}
                              </span>
                            </div>

                            <div>
                              <span className="block font-manrope font-bold text-on-surface">
                                {option.title}
                              </span>

                              <span className="block text-xs text-on-surface-variant/70 mt-1 leading-relaxed">
                                {option.description}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                              isActive
                                ? "border-secondary bg-secondary"
                                : "border-outline-variant bg-transparent"
                            }`}
                          >
                            {isActive && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <footer className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-8 py-3 rounded-xl font-inter font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
              >
                Discard Draft
              </button>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="px-10 py-4 rounded-xl font-bold text-sm bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
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