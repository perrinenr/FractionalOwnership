import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";

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

function normalizeList(data, keyName) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.[keyName])) return data[keyName];

  return [];
}

export default function Step2DetailsClassificationStyled() {
  const navigate = useNavigate();

  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [formData, setFormData] = useState(() => getSavedDraft());
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");

  const [sectors, setSectors] = useState([]);
  const [subSectors, setSubSectors] = useState([]);

  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingSubSectors, setLoadingSubSectors] = useState(false);

  const [sectorFetchError, setSectorFetchError] = useState("");
  const [subSectorFetchError, setSubSectorFetchError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoadingSectors(true);
        setSectorFetchError("");

        const response = await API.get("/sectors", { withCredentials: true });
        const normalizedSectors = normalizeList(response.data, "sectors");

        setSectors(normalizedSectors);
      } catch (error) {
        console.error("Error fetching sectors:", error);
        setSectorFetchError("Unable to load sectors.");
      } finally {
        setLoadingSectors(false);
      }
    };

    fetchSectors();
  }, []);

  useEffect(() => {
    const sectorId = formData.classification.sectorId;

    if (!sectorId) {
      setSubSectors([]);
      return;
    }

    const fetchSubSectors = async () => {
      try {
        setLoadingSubSectors(true);
        setSubSectorFetchError("");

        const response = await API.get(`/subsectors?sectorId=${sectorId}`, {
          withCredentials: true,
        });
        const normalizedSubSectors = normalizeList(response.data, "subsectors");

        setSubSectors(normalizedSubSectors);
      } catch (error) {
        console.error("Error fetching subsectors:", error);
        setSubSectorFetchError("Unable to load subsectors.");
        setSubSectors([]);
      } finally {
        setLoadingSubSectors(false);
      }
    };

    fetchSubSectors();
  }, [formData.classification.sectorId]);

  const handleDetailsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value,
      },
    }));
  };

  const handleClassificationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      classification: {
        ...prev.classification,
        [field]: value,
      },
    }));
  };

  const handleSectorChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      classification: {
        ...prev.classification,
        sectorId: value,
        subSectorId: "",
      },
    }));
  };

  const handleAddTag = () => {
    const normalizedTag = tagInput.trim();

    if (!normalizedTag) return;

    const exists = formData.classification.tags.some(
      (tag) => tag.toLowerCase() === normalizedTag.toLowerCase()
    );

    if (exists) {
      setTagInput("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      classification: {
        ...prev.classification,
        tags: [...prev.classification.tags, normalizedTag],
      },
    }));

    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      classification: {
        ...prev.classification,
        tags: prev.classification.tags.filter((tag) => tag !== tagToRemove),
      },
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFileNameChange = (field, event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    handleDetailsChange(field, file.name);
  };

  const validateForm = () => {
    const newErrors = {};
    const details = formData.details;
    const classification = formData.classification;

    if (!details.description.trim()) {
      newErrors.description = "Detailed description is required.";
    }

    if (!details.shortDescription.trim()) {
      newErrors.shortDescription = "Short description is required.";
    } else if (details.shortDescription.trim().length > 150) {
      newErrors.shortDescription =
        "Short description must be 150 characters or less.";
    }

    if (!details.foundedDate) {
      newErrors.foundedDate = "Founded date is required.";
    }

    if (!details.businessModel.trim()) {
      newErrors.businessModel = "Business model is required.";
    }

    if (!details.website.trim()) {
      newErrors.website = "Website URL is required.";
    } else {
      try {
        new URL(details.website);
      } catch {
        newErrors.website = "Website URL must be valid.";
      }
    }

    if (details.videoUrl.trim()) {
      try {
        new URL(details.videoUrl);
      } catch {
        newErrors.videoUrl = "Video pitch URL must be valid.";
      }
    }

    if (!classification.sectorId) {
      newErrors.sectorId = "Primary sector is required.";
    }

    if (!classification.businessType) {
      newErrors.businessType = "Business type is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePrevious = () => {
    navigate("/Step1BasicInfoType");
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

    navigate("/Step3FundingInformation");
  };

  const businessTypes = [
    "SAAS",
    "MARKETPLACE",
    "E_COMMERCE",
    "AGENCY",
    "CONTENT",
    "EDUCATION",
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
              <div className="h-full bg-secondary w-[33.3333%] rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 2 of 6
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
              className="flex items-center gap-3 px-4 py-3 bg-white text-slate-900 font-bold shadow-sm rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined text-secondary">
                category
              </span>
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
                Company Details & Classification
              </h1>

              <p className="text-on-surface-variant font-body max-w-3xl">
                Define the company story, market position, and classification in
                the same polished style as the first page.
              </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-8 items-start">
              <div className="space-y-8">
                <section className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
                  <div className="mb-8">
                    <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      Core Narrative
                      <span className="text-error text-lg">*</span>
                    </label>

                    <p className="text-sm text-on-surface-variant/60 mt-1">
                      Present the story and operating identity of the company.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Detailed Description</span>
                        <span className="text-error normal-case">Required</span>
                      </label>

                      <textarea
                        rows="6"
                        placeholder="Provide an institutional-grade overview of your company operations, mission, and unique value proposition..."
                        value={formData.details.description}
                        onChange={(e) =>
                          handleDetailsChange("description", e.target.value)
                        }
                        className="w-full p-4 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary resize-none"
                      />

                      {errors.description && (
                        <p className="text-sm text-error mt-2">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Short Description</span>
                        <span className="text-slate-500 normal-case">
                          {formData.details.shortDescription.length}/150
                        </span>
                      </label>

                      <textarea
                        rows="2"
                        maxLength={150}
                        placeholder="Maximum 150 characters for search results..."
                        value={formData.details.shortDescription}
                        onChange={(e) =>
                          handleDetailsChange(
                            "shortDescription",
                            e.target.value
                          )
                        }
                        className="w-full p-4 bg-surface-container-lowest border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary resize-none"
                      />

                      {errors.shortDescription && (
                        <p className="text-sm text-error mt-2">
                          {errors.shortDescription}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                          <span>Founded Date</span>
                          <span className="text-error normal-case">
                            Required
                          </span>
                        </label>

                        <input
                          type="date"
                          value={formData.details.foundedDate}
                          onChange={(e) =>
                            handleDetailsChange("foundedDate", e.target.value)
                          }
                          className="w-full h-14 px-5 bg-surface-container-lowest border-none rounded-xl font-manrope font-semibold text-on-surface focus:ring-2 focus:ring-primary"
                        />

                        {errors.foundedDate && (
                          <p className="text-sm text-error mt-2">
                            {errors.foundedDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest mb-2 block">
                          Website URL <span className="text-error">*</span>
                        </label>

                        <input
                          type="url"
                          placeholder="https://company.com"
                          value={formData.details.website}
                          onChange={(e) =>
                            handleDetailsChange("website", e.target.value)
                          }
                          className="w-full h-14 px-5 bg-surface-container-lowest border-none rounded-xl font-manrope font-semibold text-on-surface focus:ring-2 focus:ring-primary"
                        />

                        {errors.website && (
                          <p className="text-sm text-error mt-2">
                            {errors.website}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Primary Business Model</span>
                        <span className="text-error normal-case">Required</span>
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. B2B Subscription-based Infrastructure"
                        value={formData.details.businessModel}
                        onChange={(e) =>
                          handleDetailsChange("businessModel", e.target.value)
                        }
                        className="w-full h-14 px-5 bg-surface-container-lowest border-none rounded-xl font-manrope font-semibold text-on-surface focus:ring-2 focus:ring-primary"
                      />

                      {errors.businessModel && (
                        <p className="text-sm text-error mt-2">
                          {errors.businessModel}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
                  <div className="mb-8">
                    <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      Visual Identity
                    </label>

                    <p className="text-sm text-on-surface-variant/60 mt-1">
                      Upload brand assets while keeping the same clean visual
                      system.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest block mb-3">
                        Company Logo
                      </label>

                      <input
                        ref={logoInputRef}
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg,.webp"
                        onChange={(e) => handleFileNameChange("logoUrl", e)}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full min-h-32 border-2 border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-lowest hover:bg-white transition-colors flex flex-col items-center justify-center gap-2 px-4 text-center"
                      >
                        <span className="material-symbols-outlined text-slate-400">
                          add_photo_alternate
                        </span>

                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                          {formData.details.logoUrl || "Upload SVG / PNG"}
                        </span>
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest block mb-3">
                        Cover Image
                      </label>

                      <input
                        ref={coverInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        onChange={(e) =>
                          handleFileNameChange("coverImageUrl", e)
                        }
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="w-full min-h-32 border-2 border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-lowest hover:bg-white transition-colors flex flex-col items-center justify-center gap-2 px-4 text-center"
                      >
                        <span className="material-symbols-outlined text-slate-400">
                          landscape
                        </span>

                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                          {formData.details.coverImageUrl ||
                            "16:9 ratio image"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest mb-2 block">
                      Video Pitch URL
                    </label>

                    <input
                      type="url"
                      placeholder="Vimeo or YouTube link"
                      value={formData.details.videoUrl}
                      onChange={(e) =>
                        handleDetailsChange("videoUrl", e.target.value)
                      }
                      className="w-full h-14 px-5 bg-surface-container-lowest border-none rounded-xl font-manrope font-semibold text-on-surface focus:ring-2 focus:ring-primary"
                    />

                    {errors.videoUrl && (
                      <p className="text-sm text-error mt-2">
                        {errors.videoUrl}
                      </p>
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
                  <div className="mb-8">
                    <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      Market Indexing
                      <span className="text-error text-lg">*</span>
                    </label>

                    <p className="text-sm text-on-surface-variant/60 mt-1">
                      Position the company in the right sector and business
                      class.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Primary Sector</span>
                        <span className="text-error normal-case">Required</span>
                      </label>

                      <div className="relative">
                        <select
                          value={formData.classification.sectorId}
                          onChange={(e) => handleSectorChange(e.target.value)}
                          className="w-full h-14 pl-5 pr-12 bg-surface-container-lowest border-none rounded-xl font-body text-on-surface appearance-none focus:ring-2 focus:ring-primary transition-all"
                        >
                          <option value="">
                            {loadingSectors
                              ? "Loading sectors..."
                              : "Select sector..."}
                          </option>

                          {sectors.map((sector) => {
                            const id = sector._id || sector.id;

                            return (
                              <option key={id} value={id}>
                                {sector.name || sector.title}
                              </option>
                            );
                          })}
                        </select>

                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <span className="material-symbols-outlined text-on-surface-variant">
                            expand_more
                          </span>
                        </div>
                      </div>

                      {errors.sectorId && (
                        <p className="text-sm text-error mt-2">
                          {errors.sectorId}
                        </p>
                      )}

                      {sectorFetchError && (
                        <p className="text-sm text-error mt-2">
                          {sectorFetchError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-2">
                        <span>Sub Sector</span>
                        <span className="text-slate-400 normal-case">
                          Optional
                        </span>
                      </label>

                      <div className="relative">
                        <select
                          value={formData.classification.subSectorId}
                          onChange={(e) =>
                            handleClassificationChange(
                              "subSectorId",
                              e.target.value
                            )
                          }
                          disabled={
                            !formData.classification.sectorId ||
                            loadingSubSectors
                          }
                          className="w-full h-14 pl-5 pr-12 bg-surface-container-lowest border-none rounded-xl font-body text-on-surface appearance-none focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
                        >
                          <option value="">
                            {loadingSubSectors
                              ? "Loading subsectors..."
                              : "Select sub sector..."}
                          </option>

                          {subSectors.map((subSector) => {
                            const id = subSector._id || subSector.id;

                            return (
                              <option key={id} value={id}>
                                {subSector.name || subSector.title}
                              </option>
                            );
                          })}
                        </select>

                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <span className="material-symbols-outlined text-on-surface-variant">
                            expand_more
                          </span>
                        </div>
                      </div>

                      {subSectorFetchError && (
                        <p className="text-sm text-error mt-2">
                          {subSectorFetchError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest flex items-center justify-between mb-4">
                        <span>Business Type</span>
                        <span className="text-error normal-case">Required</span>
                      </label>

                      <div className="grid grid-cols-2 gap-3">
                        {businessTypes.map((type) => {
                          const isActive =
                            formData.classification.businessType === type;

                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                handleClassificationChange(
                                  "businessType",
                                  type
                                )
                              }
                              className={`rounded-xl border px-3 py-3 text-[11px] font-bold tracking-tight transition-all ${
                                isActive
                                  ? "bg-secondary text-white border-secondary shadow-sm"
                                  : "bg-surface-container-lowest border-outline-variant/20 text-slate-700 hover:border-secondary/30"
                              }`}
                            >
                              {type.replaceAll("_", " ")}
                            </button>
                          );
                        })}
                      </div>

                      {errors.businessType && (
                        <p className="text-sm text-error mt-2">
                          {errors.businessType}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="bg-surface-container-low rounded-2xl p-8 shadow-sm">
                  <div className="mb-8">
                    <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      Search Tags
                    </label>

                    <p className="text-sm text-on-surface-variant/60 mt-1">
                      Add keywords that improve search and investor discovery.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        className="w-full h-14 pl-5 pr-12 bg-surface-container-lowest border-none rounded-xl font-manrope font-semibold text-on-surface focus:ring-2 focus:ring-primary"
                      />

                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform"
                      >
                        <span className="material-symbols-outlined">
                          add_circle
                        </span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.classification.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-surface-container text-on-surface-variant text-[11px] font-bold rounded-full flex items-center gap-2"
                        >
                          {tag}

                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="flex items-center"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              close
                            </span>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
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