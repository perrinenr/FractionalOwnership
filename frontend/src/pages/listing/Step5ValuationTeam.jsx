import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STORAGE_KEY = "listingWizardData";

const defaultTeamMember = {
  id: "member-1",
  name: "",
  role: "",
  bio: "",
  linkedin: "",
};

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
    revenueMultiple: "",
    ebitdaMultiple: "",
    valuedAt: "",
    teamMembers: [defaultTeamMember],
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

    const parsedValuation = parsed.valuation || {};

    const savedTeamMembers = Array.isArray(parsedValuation.teamMembers)
      ? parsedValuation.teamMembers
      : [];

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
        ...parsedValuation,

        teamMembers:
          savedTeamMembers.length > 0
            ? savedTeamMembers.map((member, index) => ({
                id: member.id || `member-${index + 1}`,
                name: member.name || member.fullName || "",
                role: member.role || "",
                bio: member.bio || "",
                linkedin: member.linkedin || member.linkedinUrl || "",
              }))
            : [defaultTeamMember],
      },

      team: Array.isArray(parsed.team) ? parsed.team : [],

      documents: {
        ...defaultListingData.documents,
        ...(parsed.documents || {}),
      },

      metrics: {
        ...defaultListingData.metrics,
        ...(parsed.metrics || {}),
      },
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
  if (value === "" || value === null || value === undefined) return "";

  const number = typeof value === "number" ? value : parseNumber(value);

  if (number === null || Number.isNaN(number)) return "";

  return number.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

export default function Step5ValuationTeamStyled() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => getSavedListingData());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleValuationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      valuation: {
        ...prev.valuation,
        [field]: value,
      },
    }));
  };

  const handleTeamMemberChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      valuation: {
        ...prev.valuation,
        teamMembers: prev.valuation.teamMembers.map((member) =>
          member.id === id ? { ...member, [field]: value } : member
        ),
      },
    }));
  };

  const addTeamMember = () => {
    setFormData((prev) => ({
      ...prev,
      valuation: {
        ...prev.valuation,
        teamMembers: [
          ...prev.valuation.teamMembers,
          {
            id: `member-${Date.now()}`,
            name: "",
            role: "",
            bio: "",
            linkedin: "",
          },
        ],
      },
    }));
  };

  const removeTeamMember = (id) => {
    setFormData((prev) => {
      const remaining = prev.valuation.teamMembers.filter(
        (member) => member.id !== id
      );

      return {
        ...prev,
        valuation: {
          ...prev.valuation,
          teamMembers:
            remaining.length > 0
              ? remaining
              : [
                  {
                    id: `member-${Date.now()}`,
                    name: "",
                    role: "",
                    bio: "",
                    linkedin: "",
                  },
                ],
        },
      };
    });
  };

  const validateStep5 = () => {
    const newErrors = {};
    const valuation = formData.valuation;

    const preMoneyValuation = parseNumber(valuation.preMoneyValuation);
    const postMoneyValuation = parseNumber(valuation.postMoneyValuation);
    const revenueMultiple = parseNumber(valuation.revenueMultiple);
    const ebitdaMultiple = parseNumber(valuation.ebitdaMultiple);

    if (valuation.preMoneyValuation === "") {
      newErrors.preMoneyValuation = "Pre-money valuation is required.";
    } else if (
      preMoneyValuation === null ||
      Number.isNaN(preMoneyValuation)
    ) {
      newErrors.preMoneyValuation =
        "Pre-money valuation must be a valid number.";
    } else if (preMoneyValuation <= 0) {
      newErrors.preMoneyValuation =
        "Pre-money valuation must be greater than 0.";
    }

    if (valuation.postMoneyValuation === "") {
      newErrors.postMoneyValuation = "Post-money valuation is required.";
    } else if (
      postMoneyValuation === null ||
      Number.isNaN(postMoneyValuation)
    ) {
      newErrors.postMoneyValuation =
        "Post-money valuation must be a valid number.";
    } else if (postMoneyValuation <= 0) {
      newErrors.postMoneyValuation =
        "Post-money valuation must be greater than 0.";
    }

    if (
      preMoneyValuation !== null &&
      postMoneyValuation !== null &&
      !Number.isNaN(preMoneyValuation) &&
      !Number.isNaN(postMoneyValuation) &&
      postMoneyValuation < preMoneyValuation
    ) {
      newErrors.postMoneyValuation =
        "Post-money valuation should be greater than or equal to pre-money valuation.";
    }

    if (valuation.revenueMultiple !== "") {
      if (revenueMultiple === null || Number.isNaN(revenueMultiple)) {
        newErrors.revenueMultiple = "Revenue multiple must be a valid number.";
      } else if (revenueMultiple < 0) {
        newErrors.revenueMultiple = "Revenue multiple cannot be negative.";
      }
    }

    if (valuation.ebitdaMultiple !== "") {
      if (ebitdaMultiple === null || Number.isNaN(ebitdaMultiple)) {
        newErrors.ebitdaMultiple = "EBITDA multiple must be a valid number.";
      } else if (ebitdaMultiple < 0) {
        newErrors.ebitdaMultiple = "EBITDA multiple cannot be negative.";
      }
    }

    if (!valuation.valuedAt) {
      newErrors.valuedAt = "Valuation date is required.";
    }

    const teamMembers = valuation.teamMembers || [];

    const validMembers = teamMembers.filter(
      (member) =>
        member.name.trim() ||
        member.role.trim() ||
        member.bio.trim() ||
        member.linkedin.trim()
    );

    if (validMembers.length === 0) {
      newErrors.teamMembers = "Add at least one team member.";
    }

    validMembers.forEach((member, index) => {
      if (!member.name.trim()) {
        newErrors[`member-name-${member.id}`] = `Team member ${
          index + 1
        } needs a name.`;
      }

      if (!member.role.trim()) {
        newErrors[`member-role-${member.id}`] = `Team member ${
          index + 1
        } needs a role.`;
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const buildBackendTeam = (teamMembers) => {
    return teamMembers
      .filter((member) => member.name.trim() || member.role.trim())
      .map((member) => ({
        name: member.name.trim(),
        role: member.role.trim(),
        bio: member.bio.trim(),
        linkedinUrl: member.linkedin.trim(),
        imageUrl: "",
      }));
  };

  const handlePrevious = () => {
    navigate("/Step4Financials");
  };

  const handleContinue = () => {
    if (!validateStep5()) return;

    const nextData = {
      ...formData,
      team: buildBackendTeam(formData.valuation.teamMembers),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));

    setFormData(nextData);

    navigate("/Step6DocumentsMetrics");
  };

  const handleSaveDraft = () => {
    const nextData = {
      ...formData,
      team: buildBackendTeam(formData.valuation.teamMembers),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));

    setFormData(nextData);
  };

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
              <div className="h-full bg-secondary w-5/6 rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 5 of 6
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
              className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl transition-all duration-200 ease-in-out hover:bg-white/70"
            >
              <span className="material-symbols-outlined">
                account_balance
              </span>
              <span className="font-inter text-sm">Financials</span>
            </Link>

            <Link
              to="/Step5ValuationTeam"
              className="flex items-center gap-3 px-4 py-3 bg-white text-slate-900 font-bold shadow-sm rounded-xl transition-all duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined text-secondary">
                groups
              </span>
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
          <div className="max-w-6xl mx-auto">
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-widest">
                  Step 05 of 06
                </span>

                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Valuation & Team
                </span>
              </div>

              <h1 className="font-manrope text-4xl font-extrabold tracking-tight text-on-surface mb-2">
                Valuation & Executive Team
              </h1>

              <p className="text-on-surface-variant text-lg max-w-2xl">
                Define the valuation foundation of your listing and present the
                people behind the business with the same premium style as the
                previous pages.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <section className="lg:col-span-7 space-y-8">
                <div className="bg-surface-container-low rounded-[2rem] p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary-fixed rounded-xl">
                      <span className="material-symbols-outlined text-primary">
                        account_balance_wallet
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold font-manrope">
                        Valuation Metrics
                      </h2>

                      <p className="text-sm text-on-surface-variant/70 mt-1">
                        Set the pricing rationale investors will review.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Pre-Money Valuation{" "}
                        <span className="text-error">*</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                          $
                        </span>

                        <input
                          type="text"
                          placeholder="12500000"
                          value={formData.valuation.preMoneyValuation}
                          onChange={(e) =>
                            handleValuationChange(
                              "preMoneyValuation",
                              e.target.value
                            )
                          }
                          className="w-full pl-8 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-primary text-sm font-manrope font-semibold"
                        />
                      </div>

                      {errors.preMoneyValuation && (
                        <p className="text-sm text-error mt-2">
                          {errors.preMoneyValuation}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Post-Money Valuation{" "}
                        <span className="text-error">*</span>
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                          $
                        </span>

                        <input
                          type="text"
                          placeholder="15000000"
                          value={formData.valuation.postMoneyValuation}
                          onChange={(e) =>
                            handleValuationChange(
                              "postMoneyValuation",
                              e.target.value
                            )
                          }
                          className="w-full pl-8 pr-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-primary text-sm font-manrope font-semibold"
                        />
                      </div>

                      {errors.postMoneyValuation && (
                        <p className="text-sm text-error mt-2">
                          {errors.postMoneyValuation}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Revenue Multiple
                      </label>

                      <input
                        type="text"
                        placeholder="4.5"
                        value={formData.valuation.revenueMultiple}
                        onChange={(e) =>
                          handleValuationChange(
                            "revenueMultiple",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-primary text-sm"
                      />

                      {errors.revenueMultiple && (
                        <p className="text-sm text-error mt-2">
                          {errors.revenueMultiple}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        EBITDA Multiple
                      </label>

                      <input
                        type="text"
                        placeholder="12"
                        value={formData.valuation.ebitdaMultiple}
                        onChange={(e) =>
                          handleValuationChange(
                            "ebitdaMultiple",
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-primary text-sm"
                      />

                      {errors.ebitdaMultiple && (
                        <p className="text-sm text-error mt-2">
                          {errors.ebitdaMultiple}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Valued At <span className="text-error">*</span>
                      </label>

                      <input
                        type="date"
                        value={formData.valuation.valuedAt}
                        onChange={(e) =>
                          handleValuationChange("valuedAt", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-white border-none rounded-xl focus:ring-2 focus:ring-primary text-sm"
                      />

                      {errors.valuedAt && (
                        <p className="text-sm text-error mt-2">
                          {errors.valuedAt}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <footer className="pt-6 border-t border-outline-variant/15 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-6 py-3 text-on-surface-variant font-bold hover:text-primary transition-colors"
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
                      className="px-8 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={handleContinue}
                      className="px-10 py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary-container hover:scale-[1.02] transition-transform"
                    >
                      Next Step
                    </button>
                  </div>
                </footer>
              </section>

              <section className="lg:col-span-5 space-y-6">
                <div className="bg-surface-container-low rounded-[2rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-bold font-manrope">
                        Leadership
                      </h2>

                      <p className="text-sm text-on-surface-variant/70 mt-1">
                        Add founders, executives, or key advisors.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all"
                    >
                      <span className="material-symbols-outlined text-secondary">
                        add
                      </span>
                    </button>
                  </div>

                  {errors.teamMembers && (
                    <p className="text-sm text-error mb-4">
                      {errors.teamMembers}
                    </p>
                  )}

                  <div className="space-y-5">
                    {formData.valuation.teamMembers.map((member, index) => (
                      <div
                        key={member.id}
                        className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-slate-400">
                              person
                            </span>
                          </div>

                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              placeholder="Name"
                              value={member.name}
                              onChange={(e) =>
                                handleTeamMemberChange(
                                  member.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="block w-full border-none p-0 text-lg font-bold font-manrope focus:ring-0"
                            />

                            {errors[`member-name-${member.id}`] && (
                              <p className="text-sm text-error">
                                {errors[`member-name-${member.id}`]}
                              </p>
                            )}

                            <input
                              type="text"
                              placeholder="Role"
                              value={member.role}
                              onChange={(e) =>
                                handleTeamMemberChange(
                                  member.id,
                                  "role",
                                  e.target.value
                                )
                              }
                              className="block w-full border-none p-0 text-xs text-secondary font-bold uppercase tracking-widest focus:ring-0"
                            />

                            {errors[`member-role-${member.id}`] && (
                              <p className="text-sm text-error">
                                {errors[`member-role-${member.id}`]}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeTeamMember(member.id)}
                            className="text-error/40 hover:text-error transition-colors"
                            aria-label={`Remove team member ${index + 1}`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>

                        <textarea
                          rows="3"
                          placeholder="Executive Bio"
                          value={member.bio}
                          onChange={(e) =>
                            handleTeamMemberChange(
                              member.id,
                              "bio",
                              e.target.value
                            )
                          }
                          className="w-full border-none bg-surface-container/50 rounded-xl p-3 text-xs text-on-surface-variant leading-relaxed focus:ring-1 focus:ring-primary resize-none"
                        />

                        <div className="mt-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant/40">
                            link
                          </span>

                          <input
                            type="text"
                            placeholder="linkedin.com/in/username"
                            value={member.linkedin}
                            onChange={(e) =>
                              handleTeamMemberChange(
                                member.id,
                                "linkedin",
                                e.target.value
                              )
                            }
                            className="flex-1 border-none p-0 text-[11px] text-blue-600 focus:ring-0 bg-transparent"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="w-full bg-white/50 border-2 border-dashed border-outline-variant/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-secondary/50 transition-colors"
                    >
                      <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center mb-3 group-hover:bg-secondary-fixed transition-colors">
                        <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-secondary-container">
                          person_add
                        </span>
                      </div>

                      <p className="text-sm font-bold text-on-surface-variant">
                        Add Team Member
                      </p>

                      <p className="text-[10px] text-on-surface-variant/60 mt-1 max-w-[180px]">
                        Include key advisors or co-founders to increase
                        credibility.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary to-primary-container text-white p-8 rounded-[2rem] overflow-hidden relative shadow-xl shadow-primary/10">
                  <div className="relative z-10">
                    <h3 className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                      Valuation Summary
                    </h3>

                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-extrabold font-manrope">
                        {formData.valuation.postMoneyValuation
                          ? `$${formatDisplayNumber(
                              formData.valuation.postMoneyValuation
                            )}`
                          : "—"}
                      </span>
                    </div>

                    <p className="text-white/80 text-xs mb-8">
                      Post-Money Valuation
                    </p>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[11px] gap-4">
                        <span className="opacity-70">Revenue Multiple</span>

                        <span className="font-bold">
                          {formData.valuation.revenueMultiple
                            ? `${formData.valuation.revenueMultiple}x`
                            : "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[11px] gap-4">
                        <span className="opacity-70">Team Members</span>

                        <span className="font-bold">
                          {
                            formData.valuation.teamMembers.filter(
                              (member) =>
                                member.name.trim() || member.role.trim()
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10"></div>

      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -z-10"></div>
    </div>
  );
}