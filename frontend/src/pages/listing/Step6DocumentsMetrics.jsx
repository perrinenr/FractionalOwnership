import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";


const STORAGE_KEY = "listingWizardData";
const OLD_STORAGE_KEY = "listingWizardDraft";

const documentDefinitions = [
  {
    key: "PITCH_DECK",
    label: "PITCH_DECK",
    description: "Presentation for prospective investors",
    icon: "slideshow",
    defaultVisibility: "INVESTORS_ONLY",
  },
  {
    key: "FINANCIALS",
    label: "FINANCIALS",
    description: "P&L, Balance Sheets, Cash Flow",
    icon: "analytics",
    defaultVisibility: "INVESTORS_ONLY",
  },
  {
    key: "LEGAL",
    label: "LEGAL",
    description: "Shareholder agreements, patents",
    icon: "gavel",
    defaultVisibility: "ADMIN_ONLY",
  },
  {
    key: "INCORPORATION",
    label: "INCORPORATION",
    description: "Certificate of formation, Bylaws",
    icon: "assured_workload",
    defaultVisibility: "PUBLIC",
  },
  {
    key: "TAX_RETURNS",
    label: "TAX_RETURNS",
    description: "Last 3 years of official filings",
    icon: "receipt_long",
    defaultVisibility: "ADMIN_ONLY",
  },
];

const defaultDocumentsState = documentDefinitions.reduce((acc, doc) => {
  acc[doc.key] = {
    visibility: doc.defaultVisibility,
    fileName: "",
    fileUrl: "",
  };
  return acc;
}, {});

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
    currency: "USD",
    audited: false,
  },

  valuation: {
    preMoneyValuation: "",
    postMoneyValuation: "",
    valuationMethod: "",
    revenueMultiple: "",
    ebitdaMultiple: "",
    valuedAt: "",
    valuedBy: "",
    teamMembers: [],
  },

  team: [],

  documents: defaultDocumentsState,

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
      },

      financials: {
        ...defaultListingData.financials,
        ...(parsed.financials || {}),
      },

      valuation: {
        ...defaultListingData.valuation,
        ...(parsed.valuation || {}),
        teamMembers: Array.isArray(parsed?.valuation?.teamMembers)
          ? parsed.valuation.teamMembers
          : [],
      },

      team: Array.isArray(parsed?.team) ? parsed.team : [],

      documents: {
        ...defaultDocumentsState,
        ...(parsed.documents || {}),
      },

      metrics: {
        ...defaultListingData.metrics,
        ...(parsed.metrics || {}),
      },
    };
  } catch (error) {
    console.error("Failed to parse listing wizard draft:", error);
    return defaultListingData;
  }
}

function parseNumber(value) {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(String(value).replace(/,/g, "").trim());

  return Number.isNaN(number) ? NaN : number;
}

function cleanValue(value) {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
}

function cleanNumber(value) {
  if (value === "" || value === null || value === undefined) return undefined;

  const number = Number(String(value).replace(/,/g, "").trim());

  if (Number.isNaN(number)) return undefined;

  return number;
}

function cleanDecimal(value) {
  if (value === "" || value === null || value === undefined) return undefined;

  const number = String(value).replace(/,/g, "").trim();

  return number;
}

function createSlug(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toBoolean(value) {
  return value === true || value === "true" || value === "yes" || value === "1";
}

export default function Step6DocumentsMetricsStyled() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => getSavedDraft());
  const [errors, setErrors] = useState({});
  const [saveFeedback, setSaveFeedback] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRefs = useRef({});
  const skipAutoSaveRef = useRef(false);

  useEffect(() => {
    if (skipAutoSaveRef.current) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (!saveFeedback) return;

    const timeout = setTimeout(() => setSaveFeedback(""), 2000);

    return () => clearTimeout(timeout);
  }, [saveFeedback]);

  const uploadedCount = documentDefinitions.filter(
    (doc) => formData.documents?.[doc.key]?.fileName
  ).length;

  const handleDocumentVisibilityChange = (documentKey, value) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentKey]: {
          ...prev.documents[documentKey],
          visibility: value,
        },
      },
    }));
  };

  const handleDocumentFileChange = (documentKey, file) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentKey]: {
          ...prev.documents[documentKey],
          fileName: file ? file.name : "",
          fileUrl: file ? file.name : "",
        },
      },
    }));
  };

  const triggerFilePicker = (documentKey) => {
    const input = fileInputRefs.current[documentKey];

    if (input) input.click();
  };

  const handleMetricChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [field]: value,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const metrics = formData.metrics || {};

    if (!formData.documents.PITCH_DECK?.fileName) {
      newErrors.PITCH_DECK = "Pitch deck is required.";
    }

    if (!formData.documents.FINANCIALS?.fileName) {
      newErrors.FINANCIALS = "Financials document is required.";
    }

    if (!formData.documents.INCORPORATION?.fileName) {
      newErrors.INCORPORATION = "Incorporation document is required.";
    }

    const employeeCount = parseNumber(metrics.employeeCount);
    const customerCount = parseNumber(metrics.customerCount);
    const monthlyActiveUsers = parseNumber(metrics.monthlyActiveUsers);
    const churnRate = parseNumber(metrics.churnRate);
    const growthRate = parseNumber(metrics.growthRate);

    if (metrics.employeeCount === "") {
      newErrors.employeeCount = "Employee count is required.";
    } else if (
      employeeCount === null ||
      Number.isNaN(employeeCount) ||
      employeeCount < 0
    ) {
      newErrors.employeeCount =
        "Employee count must be a valid positive number.";
    }

    if (metrics.customerCount === "") {
      newErrors.customerCount = "Customer count is required.";
    } else if (
      customerCount === null ||
      Number.isNaN(customerCount) ||
      customerCount < 0
    ) {
      newErrors.customerCount =
        "Customer count must be a valid positive number.";
    }

    if (metrics.monthlyActiveUsers === "") {
      newErrors.monthlyActiveUsers = "Monthly active users is required.";
    } else if (
      monthlyActiveUsers === null ||
      Number.isNaN(monthlyActiveUsers) ||
      monthlyActiveUsers < 0
    ) {
      newErrors.monthlyActiveUsers = "MAU must be a valid positive number.";
    }

    if (metrics.churnRate === "") {
      newErrors.churnRate = "Churn rate is required.";
    } else if (
      churnRate === null ||
      Number.isNaN(churnRate) ||
      churnRate < 0 ||
      churnRate > 100
    ) {
      newErrors.churnRate = "Churn rate must be between 0 and 100.";
    }

    if (metrics.growthRate === "") {
      newErrors.growthRate = "Growth rate is required.";
    } else if (growthRate === null || Number.isNaN(growthRate)) {
      newErrors.growthRate = "Growth rate must be a valid number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const buildDocumentsArray = (documentsObject) => {
    return documentDefinitions
      .map((doc) => {
        const item = documentsObject?.[doc.key];

        if (!item?.fileName) return null;

        return {
          type: doc.key,
          name: item.fileName,
          fileUrl: item.fileUrl || item.fileName,
          visibility: item.visibility || doc.defaultVisibility,
        };
      })
      .filter(Boolean);
  };

  const buildTeamArray = (nextData) => {
    const teamFromStep5 =
      Array.isArray(nextData.valuation?.teamMembers) &&
      nextData.valuation.teamMembers.length > 0
        ? nextData.valuation.teamMembers
        : nextData.team || [];

    return teamFromStep5
      .map((member) => ({
        name: member.name || member.fullName || "",
        role: member.role || "",
        bio: member.bio || "",
        linkedinUrl: member.linkedinUrl || member.linkedin || "",
        imageUrl: member.imageUrl || "",
      }))
      .filter((member) => member.name && member.role);
  };

  const handlePrevious = () => {
    navigate("/Step5ValuationTeam");
  };

  const handleManualSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    setSaveFeedback("Draft saved");
    setSubmitMessage("");
  };

  const handleSubmitListing = async () => {
    if (!validateForm()) {
      setSubmitMessage("");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage("");

      const nextData = {
        ...formData,
        status: "PENDING_REVIEW",
        isListing: true,
        submittedAt: new Date().toISOString(),
      };

      const companyName = nextData.company?.name || nextData.name;

      const sectorId =
        nextData.classification?.sectorId ||
        nextData.classification?.primarySector;

      const subSectorId =
        nextData.classification?.subSectorId ||
        nextData.classification?.subSector;

      const payload = {
        name: companyName,

        slug: nextData.company?.slug || createSlug(companyName),

        registrationNumber: cleanValue(nextData.company?.registrationNumber),

        incorporationDate: cleanValue(nextData.company?.incorporationDate),

        incorporationCountry: cleanValue(
          nextData.company?.incorporationCountry
        ),

        status: "PENDING_REVIEW",

        listingType: nextData.company?.listingType || "EQUITY",

        details: {
          description:
            nextData.details?.description ||
            nextData.classification?.detailedDescription,

          shortDescription:
            nextData.details?.shortDescription ||
            nextData.classification?.shortDescription,

          foundedDate:
            nextData.details?.foundedDate ||
            nextData.classification?.foundedDate,

          businessModel:
            nextData.details?.businessModel ||
            nextData.classification?.businessModel,

          website:
            nextData.details?.website ||
            nextData.classification?.websiteUrl,

          logoUrl: cleanValue(nextData.details?.logoUrl),

          coverImageUrl: cleanValue(nextData.details?.coverImageUrl),

          videoUrl:
            cleanValue(nextData.details?.videoUrl) ||
            cleanValue(nextData.classification?.videoPitchUrl),
        },

        classification: {
          sectorId,

          subSectorId: cleanValue(subSectorId),

          businessType: nextData.classification?.businessType,

          tags: Array.isArray(nextData.classification?.tags)
            ? nextData.classification.tags
            : [],
        },

        funding: {
          targetAmount: cleanDecimal(nextData.funding?.targetAmount),

          minimumInvestment: cleanDecimal(
            nextData.funding?.minimumInvestment ||
              nextData.funding?.minInvestment
          ),

          maximumInvestment: cleanDecimal(
            nextData.funding?.maximumInvestment ||
              nextData.funding?.maxInvestment
          ),

          currency: nextData.funding?.currency || "USD",

          equityOffered: cleanNumber(
            nextData.funding?.equityOffered ||
              nextData.funding?.equityOfferedPct
          ),

          pricePerPercent: cleanDecimal(nextData.funding?.pricePerPercent),

          totalShares: cleanNumber(nextData.funding?.totalShares),

          sharePrice: cleanDecimal(nextData.funding?.sharePrice),

          amountRaised: "0",

          investorCount: 0,

          fundingStartDate: cleanValue(nextData.funding?.fundingStartDate),

          fundingDeadline: cleanValue(nextData.funding?.fundingDeadline),
        },

        financials: {
          arr: cleanDecimal(nextData.financials?.arr),

          mrr: cleanDecimal(nextData.financials?.mrr),

          grossRevenue: cleanDecimal(nextData.financials?.grossRevenue),

          netIncome: cleanDecimal(nextData.financials?.netIncome),

          grossMargin: cleanNumber(nextData.financials?.grossMargin),

          netMargin: cleanNumber(nextData.financials?.netMargin),

          expenses: cleanDecimal(nextData.financials?.expenses),

          ebitda: cleanDecimal(nextData.financials?.ebitda),

          asOfDate: cleanValue(nextData.financials?.asOfDate),

          currency: nextData.financials?.currency || "USD",

          audited: toBoolean(nextData.financials?.audited),
        },

        valuation: {
          preMoneyValuation: cleanDecimal(
            nextData.valuation?.preMoneyValuation
          ),

          postMoneyValuation: cleanDecimal(
            nextData.valuation?.postMoneyValuation
          ),

          valuationMethod: cleanValue(nextData.valuation?.valuationMethod),

          revenueMultiple: cleanNumber(nextData.valuation?.revenueMultiple),

          ebitdaMultiple: cleanNumber(nextData.valuation?.ebitdaMultiple),

          valuedAt: cleanValue(nextData.valuation?.valuedAt),

          valuedBy: cleanValue(nextData.valuation?.valuedBy),
        },

        team: buildTeamArray(nextData),

        documents: buildDocumentsArray(nextData.documents),

        metrics: {
          employeeCount: cleanNumber(nextData.metrics?.employeeCount),

          customerCount: cleanNumber(nextData.metrics?.customerCount),

          monthlyActiveUsers: cleanNumber(
            nextData.metrics?.monthlyActiveUsers
          ),

          churnRate: cleanNumber(nextData.metrics?.churnRate),

          growthRate: cleanNumber(nextData.metrics?.growthRate),
        },

        isListing: true,
      };

      await API.post("/company/listing", payload, {
        withCredentials: true,
      });

      skipAutoSaveRef.current = true;

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(OLD_STORAGE_KEY);
      setFormData(defaultListingData);
      setErrors({});

      setSubmitMessage("Listing submitted successfully.");
      setTimeout(() => {
        navigate("/");
      }, 1800);

    } catch (error) {
      console.error("Submit listing error:", error);
      console.error("Axios message:", error.message);
      console.error("Backend status:", error.response?.status);
      console.error("Backend data:", error.response?.data);

      const backendErrors = error.response?.data?.errors;

      if (Array.isArray(backendErrors)) {
        setSubmitMessage(backendErrors.join(", "));
      } else if (error.response?.data?.message || error.response?.data?.error) {
        setSubmitMessage(
          `${error.response?.data?.message || ""} ${
            error.response?.data?.error || ""
          }`
        );
      } else if (error.message === "Network Error") {
        setSubmitMessage(
          "Network Error: backend not reachable, CORS problem, or wrong API URL."
        );
      } else {
        setSubmitMessage(error.message || "Failed to submit listing.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="h-full bg-secondary w-full rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 6 of 6
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
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">payments</span>
              <span className="font-inter text-sm">Funding</span>
            </Link>

            <Link
              to="/Step4Financials"
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">
                account_balance
              </span>
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
              className="flex items-center gap-3 px-4 py-3 bg-white text-slate-900 font-bold shadow-sm rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined text-secondary">
                description
              </span>
              <span className="font-inter text-sm">Documents</span>
            </Link>
          </nav>
        </aside>

        <main className="ml-0 lg:ml-72 flex-1 p-6 lg:p-12 max-w-7xl">
          <div className="max-w-6xl mx-auto">
            <header className="mb-12">
              <h1 className="font-manrope text-4xl font-extrabold tracking-tight text-on-surface mb-2">
                Finalize Documentation & Metrics
              </h1>

              <p className="text-on-surface-variant font-body max-w-3xl">
                Upload the required documents and confirm the final business
                metrics in the same polished style as the previous pages.
              </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-8 items-start">
              <div className="space-y-8">
                <section className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                      <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                        Required Documents
                        <span className="text-error text-lg">*</span>
                      </label>

                      <p className="text-sm text-on-surface-variant/60 mt-1">
                        Upload the core files needed before submission.
                      </p>
                    </div>

                    <span className="text-xs text-slate-500 font-semibold">
                      {uploadedCount} of {documentDefinitions.length} uploaded
                    </span>
                  </div>

                  <div className="space-y-4">
                    {documentDefinitions.map((doc) => {
                      const item = formData.documents[doc.key];
                      const error = errors[doc.key];

                      return (
                        <div
                          key={doc.key}
                          className="p-4 rounded-xl bg-surface-container-lowest border border-transparent hover:border-outline-variant/20 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-surface-container text-primary shrink-0">
                              <span className="material-symbols-outlined">
                                {doc.icon}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-on-surface truncate">
                                {doc.label}
                              </p>

                              <p className="text-xs text-on-surface-variant">
                                {doc.description}
                              </p>

                              {item.fileName && (
                                <p className="text-[11px] text-secondary mt-1 font-bold truncate">
                                  {item.fileName}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <select
                                value={item.visibility}
                                onChange={(e) =>
                                  handleDocumentVisibilityChange(
                                    doc.key,
                                    e.target.value
                                  )
                                }
                                className="text-[11px] font-bold py-2 px-3 border-none ring-1 ring-outline-variant/20 rounded-lg bg-white focus:ring-primary"
                              >
                                <option value="PUBLIC">PUBLIC</option>
                                <option value="INVESTORS_ONLY">
                                  INVESTORS_ONLY
                                </option>
                                <option value="ADMIN_ONLY">ADMIN_ONLY</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => triggerFilePicker(doc.key)}
                                className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-white shadow-sm hover:opacity-90"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  upload
                                </span>
                              </button>

                              <input
                                ref={(element) => {
                                  fileInputRefs.current[doc.key] = element;
                                }}
                                type="file"
                                className="hidden"
                                onChange={(e) =>
                                  handleDocumentFileChange(
                                    doc.key,
                                    e.target.files?.[0] || null
                                  )
                                }
                              />
                            </div>
                          </div>

                          {error && (
                            <p className="text-sm text-error mt-3">{error}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
                  <div className="mb-8">
                    <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      Business Metrics
                      <span className="text-error text-lg">*</span>
                    </label>

                    <p className="text-sm text-on-surface-variant/60 mt-1">
                      Confirm the latest operational numbers before submission.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant px-1">
                          Employee Count
                        </label>

                        <input
                          type="number"
                          placeholder="42"
                          value={formData.metrics.employeeCount}
                          onChange={(e) =>
                            handleMetricChange("employeeCount", e.target.value)
                          }
                          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 font-headline font-bold focus:ring-2 focus:ring-primary transition-all"
                        />

                        {errors.employeeCount && (
                          <p className="text-sm text-error">
                            {errors.employeeCount}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant px-1">
                          Customer Count
                        </label>

                        <input
                          type="number"
                          placeholder="1200"
                          value={formData.metrics.customerCount}
                          onChange={(e) =>
                            handleMetricChange("customerCount", e.target.value)
                          }
                          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 font-headline font-bold focus:ring-2 focus:ring-primary transition-all"
                        />

                        {errors.customerCount && (
                          <p className="text-sm text-error">
                            {errors.customerCount}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant px-1">
                        Monthly Active Users (MAU)
                      </label>

                      <input
                        type="number"
                        placeholder="85000"
                        value={formData.metrics.monthlyActiveUsers}
                        onChange={(e) =>
                          handleMetricChange(
                            "monthlyActiveUsers",
                            e.target.value
                          )
                        }
                        className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 font-headline font-bold focus:ring-2 focus:ring-primary transition-all"
                      />

                      {errors.monthlyActiveUsers && (
                        <p className="text-sm text-error">
                          {errors.monthlyActiveUsers}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant px-1">
                          Churn Rate (%)
                        </label>

                        <input
                          type="text"
                          placeholder="2.4"
                          value={formData.metrics.churnRate}
                          onChange={(e) =>
                            handleMetricChange("churnRate", e.target.value)
                          }
                          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 font-headline font-bold focus:ring-2 focus:ring-primary transition-all"
                        />

                        {errors.churnRate && (
                          <p className="text-sm text-error">
                            {errors.churnRate}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant px-1">
                          Growth Rate (%)
                        </label>

                        <input
                          type="text"
                          placeholder="18.5"
                          value={formData.metrics.growthRate}
                          onChange={(e) =>
                            handleMetricChange("growthRate", e.target.value)
                          }
                          className="w-full bg-surface-container-lowest border-none rounded-xl px-4 py-3 font-headline font-bold focus:ring-2 focus:ring-primary transition-all"
                        />

                        {errors.growthRate && (
                          <p className="text-sm text-error">
                            {errors.growthRate}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl p-8 relative overflow-hidden shadow-sm">
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
                      <span className="font-bold text-white">
                        Final Confirmation
                      </span>
                    </h3>

                    <p className="text-sm text-white leading-relaxed mb-4">
                      By submitting, the listing status will be set to{" "}
                      <span className="font-bold text-white">
                        PENDING_REVIEW
                      </span>{" "}
                      and{" "}
                      <span className="font-bold text-white">isListing</span>{" "}
                      to true.
                    </p>

                    {submitMessage && (
                      <p className="text-xs font-bold text-white mb-4">
                        {submitMessage}
                      </p>
                    )}

                    {saveFeedback && (
                      <p className="text-xs font-bold text-white mb-4">
                        {saveFeedback}
                      </p>
                    )}

                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSubmitListing}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-br from-secondary to-secondary-fixed text-white font-extrabold rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Listing"}

                        <span className="material-symbols-outlined text-sm">
                          send
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleManualSave}
                        className="w-full py-3 bg-white/10 border border-white/10 text-white font-bold rounded-xl hover:bg-white/15 transition-colors"
                      >
                        Save Draft
                      </button>

                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="w-full py-3 bg-white/10 border border-white/10 text-white font-bold rounded-xl hover:bg-white/15 transition-colors"
                      >
                        Previous
                      </button>
                    </div>
                  </div>

                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
                </section>
              </div>
            </div>

            <div className="mt-16 p-4 rounded-xl bg-surface-container border border-outline-variant/10 flex gap-4">
              <span className="material-symbols-outlined text-primary">
                info
              </span>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Once submitted, your listing enters the review queue. The draft
                remains saved locally so your uploaded file names and metrics
                stay available if you return later.
              </p>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -z-10"></div>
    </div>
  );
}