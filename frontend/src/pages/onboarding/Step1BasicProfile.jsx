import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STORAGE_KEY = "onboardingData";

const defaultOnboardingData = {
  investorType: "INDIVIDUAL",
  riskTolerance: "",

  investmentSweetSpot: {
    min: "",
    max: "",
  },

  kyc: {
    documentType: "",
    documentNumber: "",
    issueDate: "",
    expiryDate: "",
    countryOfIssue: "",
  },

  sourceOfFunds: {
    primarySource: "",
    annualIncomeRange: "",
    employmentStatus: "",
    notes: "",
  },

  company: {
    registeredCompanyName: "",
    registrationNumber: "",
    incorporationDate: "",
    countryOfIncorporation: "",
  },

  bankAccount: {
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    iban: "",
    swift: "",
    isPrimary: false,
  },

  preferences: {
    preferredSectors: [],
    excludedSectors: [],
    businessModels: [],
  },
};

function getSavedOnboardingData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return defaultOnboardingData;

    const parsed = JSON.parse(saved);

    return {
      ...defaultOnboardingData,
      ...parsed,

      investmentSweetSpot: {
        ...defaultOnboardingData.investmentSweetSpot,
        ...(parsed.investmentSweetSpot || {}),
      },

      kyc: {
        ...defaultOnboardingData.kyc,
        ...(parsed.kyc || {}),
      },

      sourceOfFunds: {
        ...defaultOnboardingData.sourceOfFunds,
        ...(parsed.sourceOfFunds || {}),
      },

      company: {
        ...defaultOnboardingData.company,
        ...(parsed.company || {}),
      },

      bankAccount: {
        ...defaultOnboardingData.bankAccount,
        ...(parsed.bankAccount || {}),
      },

      preferences: {
        ...defaultOnboardingData.preferences,
        ...(parsed.preferences || {}),
      },
    };
  } catch (error) {
    console.error("Failed to parse onboarding draft:", error);
    return defaultOnboardingData;
  }
}

export default function Step1BasicProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => getSavedOnboardingData());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleInvestorTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      investorType: value,
    }));
  };

  const handleInvestmentPreferenceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      investmentSweetSpot: {
        ...prev.investmentSweetSpot,
        [field]: value,
      },
    }));
  };

  const validateStep1 = () => {
    const newErrors = {};

    const minValue = formData.investmentSweetSpot.min;
    const maxValue = formData.investmentSweetSpot.max;

    const min = Number(minValue);
    const max = Number(maxValue);

    if (!formData.investorType) {
      newErrors.investorType = "Investor type is required.";
    }

    if (!formData.riskTolerance) {
      newErrors.riskTolerance = "Risk tolerance is required.";
    }

    if (minValue === "" || minValue === null) {
      newErrors.min = "Minimum amount is required.";
    }

    if (maxValue === "" || maxValue === null) {
      newErrors.max = "Maximum amount is required.";
    }

    if (minValue !== "" && Number.isNaN(min)) {
      newErrors.min = "Minimum amount must be a valid number.";
    }

    if (maxValue !== "" && Number.isNaN(max)) {
      newErrors.max = "Maximum amount must be a valid number.";
    }

    if (!newErrors.min && min < 0) {
      newErrors.min = "Minimum amount cannot be negative.";
    }

    if (!newErrors.max && max < 0) {
      newErrors.max = "Maximum amount cannot be negative.";
    }

    if (!newErrors.min && !newErrors.max && min > max) {
      newErrors.max =
        "Maximum amount must be greater than or equal to minimum amount.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (!validateStep1()) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    navigate("/Step2KycVerification");
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(defaultOnboardingData);
    setErrors({});
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
        </div>
      </nav>

      <div className="flex pt-16 min-h-screen">
        <aside className="hidden lg:flex h-[calc(100vh-64px)] w-72 fixed left-0 flex-col gap-1 p-4 bg-slate-50 border-r border-slate-200/50">
          <div className="mb-6 px-2">
            <h2 className="font-headline font-bold text-slate-900 text-lg leading-tight">
              Onboarding
            </h2>

            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
              Application Progress
            </p>

            <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-1/5 rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 1 of 5
            </p>
          </div>

          <nav className="space-y-1">
            <Link
              className="flex items-center gap-3 px-4 py-3 bg-white text-slate-900 font-bold shadow-sm rounded-xl transition-all duration-200 ease-in-out"
              to="/Step1BasicProfile"
            >
              <span className="material-symbols-outlined text-secondary">
                person_outline
              </span>
              <span className="font-inter text-sm">Basic Profile</span>
            </Link>

            <div className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl cursor-not-allowed">
              <span className="material-symbols-outlined">verified_user</span>
              <span className="font-inter text-sm">KYC Verification</span>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl cursor-not-allowed">
              <span className="material-symbols-outlined">
                account_balance_wallet
              </span>
              <span className="font-inter text-sm">Source of Funds</span>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl cursor-not-allowed">
              <span className="material-symbols-outlined">business</span>
              <span className="font-inter text-sm">Company Info</span>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl cursor-not-allowed">
              <span className="material-symbols-outlined">account_balance</span>
              <span className="font-inter text-sm">Bank Account</span>
            </div>
          </nav>
        </aside>

        <main className="ml-0 lg:ml-72 flex-1 p-6 lg:p-12 max-w-5xl">
          <form onSubmit={handleContinue}>
            <header className="mb-12">
              <h1 className="font-manrope text-4xl font-extrabold tracking-tight text-on-surface mb-2">
                Basic Profile
              </h1>

              <p className="text-on-surface-variant font-body">
                Define your investor identity to tailor your fractional ownership
                experience.
              </p>
            </header>

            <div className="space-y-12">
              <section>
                <div className="mb-6">
                  <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    Investor Type
                    <span className="text-error text-lg">*</span>
                  </label>

                  <p className="text-sm text-on-surface-variant/60 mt-1">
                    Select the legal entity for your investments.
                  </p>

                  {errors.investorType && (
                    <p className="text-sm text-error mt-2">
                      {errors.investorType}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => handleInvestorTypeChange("INDIVIDUAL")}
                    className={`group relative flex cursor-pointer rounded-xl p-6 shadow-sm border transition-all ${
                      formData.investorType === "INDIVIDUAL"
                        ? "bg-white border-secondary shadow-md"
                        : "bg-surface-container-lowest border-transparent hover:border-secondary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="investorType"
                      value="INDIVIDUAL"
                      checked={formData.investorType === "INDIVIDUAL"}
                      onChange={() => handleInvestorTypeChange("INDIVIDUAL")}
                      className="sr-only"
                    />

                    <div className="flex items-center justify-between w-full">
                      <div className="flex gap-4 items-center">
                        <div
                          className={`p-3 rounded-full transition-colors ${
                            formData.investorType === "INDIVIDUAL"
                              ? "bg-secondary-fixed"
                              : "bg-surface-container"
                          }`}
                        >
                          <span className="material-symbols-outlined text-primary">
                            person
                          </span>
                        </div>

                        <div>
                          <span className="block font-manrope font-bold text-on-surface">
                            INDIVIDUAL
                          </span>
                          <span className="block text-xs text-on-surface-variant/70">
                            Personal private investing
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.investorType === "INDIVIDUAL"
                            ? "border-secondary bg-secondary"
                            : "border-outline-variant bg-transparent"
                        }`}
                      >
                        {formData.investorType === "INDIVIDUAL" && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleInvestorTypeChange("COMPANY")}
                    className={`group relative flex cursor-pointer rounded-xl p-6 shadow-sm border transition-all ${
                      formData.investorType === "COMPANY"
                        ? "bg-white border-secondary shadow-md"
                        : "bg-surface-container-lowest border-transparent hover:border-secondary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="investorType"
                      value="COMPANY"
                      checked={formData.investorType === "COMPANY"}
                      onChange={() => handleInvestorTypeChange("COMPANY")}
                      className="sr-only"
                    />

                    <div className="flex items-center justify-between w-full">
                      <div className="flex gap-4 items-center">
                        <div
                          className={`p-3 rounded-full transition-colors ${
                            formData.investorType === "COMPANY"
                              ? "bg-secondary-fixed"
                              : "bg-surface-container"
                          }`}
                        >
                          <span className="material-symbols-outlined text-primary">
                            corporate_fare
                          </span>
                        </div>

                        <div>
                          <span className="block font-manrope font-bold text-on-surface">
                            COMPANY
                          </span>
                          <span className="block text-xs text-on-surface-variant/70">
                            Institutional or business account
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          formData.investorType === "COMPANY"
                            ? "border-secondary bg-secondary"
                            : "border-outline-variant bg-transparent"
                        }`}
                      >
                        {formData.investorType === "COMPANY" && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-6">
                  <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    Risk Tolerance
                    <span className="text-error text-lg">*</span>
                  </label>

                  {errors.riskTolerance && (
                    <p className="text-sm text-error mt-2">
                      {errors.riskTolerance}
                    </p>
                  )}
                </div>

                <div className="relative group max-w-xl">
                  <select
                    value={formData.riskTolerance}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        riskTolerance: e.target.value,
                      }))
                    }
                    className="w-full h-14 pl-5 pr-12 bg-surface-container border-none rounded-xl font-body text-on-surface appearance-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                  >
                    <option value="">Select your risk appetite</option>
                    <option value="LOW">LOW — Capital Preservation Focus</option>
                    <option value="MEDIUM">
                      MEDIUM — Balanced Growth & Stability
                    </option>
                    <option value="HIGH">
                      HIGH — Aggressive Growth Search
                    </option>
                    <option value="AGGRESSIVE">
                      AGGRESSIVE — High Risk, High Reward
                    </option>
                  </select>

                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant">
                      expand_more
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-6">
                  <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    Investment Sweet Spot
                    <span className="text-error text-lg">*</span>
                  </label>

                  <p className="text-sm text-on-surface-variant/60 mt-1">
                    Define your preferred ticket size range for individual
                    assets.
                  </p>
                </div>

                <div className="bg-surface-container-low rounded-2xl p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant px-1">
                        Min. Amount
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0.00"
                          value={formData.investmentSweetSpot.min}
                          onChange={(e) =>
                            handleInvestmentPreferenceChange(
                              "min",
                              e.target.value
                            )
                          }
                          className="w-full h-14 pl-12 bg-surface-container-lowest border-none rounded-xl font-manrope font-bold text-on-surface focus:ring-2 focus:ring-primary"
                        />

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          $
                        </span>
                      </div>

                      {errors.min && (
                        <p className="text-sm text-error">
                          {errors.min}
                        </p>
                      )}
                    </div>

                    <div className="hidden md:flex items-center pb-4">
                      <span className="material-symbols-outlined text-outline-variant">
                        trending_flat
                      </span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant px-1">
                        Max. Amount
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0.00"
                          value={formData.investmentSweetSpot.max}
                          onChange={(e) =>
                            handleInvestmentPreferenceChange(
                              "max",
                              e.target.value
                            )
                          }
                          className="w-full h-14 pl-12 bg-surface-container-lowest border-none rounded-xl font-manrope font-bold text-on-surface focus:ring-2 focus:ring-primary"
                        />

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">
                          $
                        </span>
                      </div>

                      {errors.max && (
                        <p className="text-sm text-error">
                          {errors.max}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <footer className="mt-16 pt-8 border-t border-outline-variant/10 flex justify-between items-center">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-8 py-3 rounded-xl font-inter font-semibold text-on-surface-variant hover:bg-surface-container transition-all"
              >
                Discard Draft
              </button>

              <button
                type="submit"
                className="px-10 py-4 rounded-xl font-bold text-sm bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                Continue to Verification
              </button>
            </footer>
          </form>
        </main>
      </div>

      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -z-10"></div>
    </div>
  );
}