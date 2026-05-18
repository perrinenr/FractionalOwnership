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
    documentFileName: "",
  },

  sourceOfFunds: {
    primary: "",
    description: "",
    annualIncome: "",
    netWorth: "",
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

export default function Step3SourceOfFunds() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => getSavedOnboardingData());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleSourceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      sourceOfFunds: {
        ...prev.sourceOfFunds,
        [field]: value,
      },
    }));
  };

  const validateStep3 = () => {
    const newErrors = {};
    const annualIncome = Number(formData.sourceOfFunds.annualIncome);
    const netWorth = Number(formData.sourceOfFunds.netWorth);

    if (!formData.sourceOfFunds.primary) {
      newErrors.primary = "Primary source of funds is required.";
    }

    if (
      formData.sourceOfFunds.annualIncome !== "" &&
      Number.isNaN(annualIncome)
    ) {
      newErrors.annualIncome = "Annual income must be a valid number.";
    }

    if (
      formData.sourceOfFunds.netWorth !== "" &&
      Number.isNaN(netWorth)
    ) {
      newErrors.netWorth = "Net worth must be a valid number.";
    }

    if (
      formData.sourceOfFunds.annualIncome !== "" &&
      !Number.isNaN(annualIncome) &&
      annualIncome < 0
    ) {
      newErrors.annualIncome = "Annual income cannot be negative.";
    }

    if (
      formData.sourceOfFunds.netWorth !== "" &&
      !Number.isNaN(netWorth) &&
      netWorth < 0
    ) {
      newErrors.netWorth = "Net worth cannot be negative.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (!validateStep3()) return;

    navigate("/Step4CompanyInfo");
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen">
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm flex justify-between items-center px-8 h-16 w-full">
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

      <div className="flex min-h-screen pt-16">
        <aside className="hidden lg:flex h-[calc(100vh-64px)] w-72 fixed left-0 flex-col gap-1 p-4 bg-slate-50 border-r border-slate-200/50">
          <div className="mb-6 px-2">
            <h2 className="font-headline font-bold text-slate-900 text-lg leading-tight">
              Onboarding
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
              Application Progress
            </p>

            <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-1/2 rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 3 of 5
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out text-slate-500 hover:bg-slate-100"
              to="/Step1BasicProfile"
            >
              <span className="material-symbols-outlined">person_outline</span>
              <span className="text-sm font-medium">Basic Profile</span>
            </Link>

            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out text-slate-500 hover:bg-slate-100"
              to="/Step2KycVerification"
            >
              <span className="material-symbols-outlined">verified_user</span>
              <span className="text-sm font-medium">KYC Verification</span>
            </Link>

            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out bg-white text-slate-900 font-bold shadow-sm"
              to="/Step3SourceOfFunds"
            >
              <span className="material-symbols-outlined text-secondary">
                account_balance_wallet
              </span>
              <span className="text-sm">Source of Funds</span>
            </Link>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed">
              <span className="material-symbols-outlined">business</span>
              <span className="text-sm font-medium">Company Info</span>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed">
              <span className="material-symbols-outlined">account_balance</span>
              <span className="text-sm font-medium">Bank Account</span>
            </div>
          </nav>
        </aside>

        <main className="ml-0 lg:ml-72 pt-1 min-h-screen bg-surface flex-1">
          <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
            <header className="mb-12">
              <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tighter mb-4">
                Source of Funds
              </h1>
              <p className="text-on-surface-variant max-w-2xl leading-relaxed">
                To comply with financial regulations and maintain platform
                integrity, please provide the origin of your investment funds.
              </p>
            </header>

            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-8 space-y-8">
                <section className="bg-surface-container-lowest p-8 rounded-[1.5rem] shadow-sm border border-outline-variant/10">
                  <form onSubmit={handleContinue} className="grid grid-cols-1 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-3 tracking-tight">
                        Primary Source of Funds
                      </label>

                      {errors.primary && (
                        <p className="text-sm text-error mb-2">{errors.primary}</p>
                      )}

                      <div className="relative group">
                        <select
                          value={formData.sourceOfFunds.primary}
                          onChange={(e) =>
                            handleSourceChange("primary", e.target.value)
                          }
                          className="w-full h-14 pl-4 pr-10 bg-surface-container border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select an option</option>
                          <option value="EMPLOYMENT">EMPLOYMENT</option>
                          <option value="BUSINESS">BUSINESS</option>
                          <option value="INHERITANCE">INHERITANCE</option>
                          <option value="INVESTMENT">INVESTMENT</option>
                        </select>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                          <span className="material-symbols-outlined">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-on-surface mb-3 tracking-tight">
                          Annual Income (USD)
                        </label>

                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">
                            $
                          </div>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={formData.sourceOfFunds.annualIncome}
                            onChange={(e) =>
                              handleSourceChange("annualIncome", e.target.value)
                            }
                            className="w-full h-14 pl-10 pr-4 bg-surface-container border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                          />
                        </div>

                        {errors.annualIncome && (
                          <p className="mt-2 text-sm text-error">
                            {errors.annualIncome}
                          </p>
                        )}

                        <p className="mt-2 text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                          Optional
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-on-surface mb-3 tracking-tight">
                          Net Worth (USD)
                        </label>

                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">
                            $
                          </div>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={formData.sourceOfFunds.netWorth}
                            onChange={(e) =>
                              handleSourceChange("netWorth", e.target.value)
                            }
                            className="w-full h-14 pl-10 pr-4 bg-surface-container border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                          />
                        </div>

                        {errors.netWorth && (
                          <p className="mt-2 text-sm text-error">
                            {errors.netWorth}
                          </p>
                        )}

                        <p className="mt-2 text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                          Optional
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-3 tracking-tight">
                        Description
                      </label>

                      <textarea
                        rows="4"
                        placeholder="Briefly describe the source of these funds..."
                        value={formData.sourceOfFunds.description}
                        onChange={(e) =>
                          handleSourceChange("description", e.target.value)
                        }
                        className="w-full p-4 bg-surface-container border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all resize-none"
                      />

                      <p className="mt-2 text-xs text-on-surface-variant italic">
                        Optional, but useful for compliance review.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => navigate("/Step2KycVerification")}
                        className="px-8 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          arrow_back
                        </span>
                        Previous Step
                      </button>

                      <button
                        type="submit"
                        className="px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:opacity-95 active:scale-95 transition-all"
                      >
                        Continue to Company Info
                      </button>
                    </div>
                  </form>
                </section>
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
               
                <div className="bg-surface-container-low p-6 rounded-[1.5rem] border border-outline-variant/10">
                  <div className="space-y-4">
                   

                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-xl">
                          visibility_off
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">
                          Privacy Guaranteed
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          Information is used only for compliance verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] flex flex-col items-center justify-center text-center border border-outline-variant/5">
  <div className="relative w-24 h-24 mb-4">
    <svg className="w-full h-full transform -rotate-90">
      <circle
        className="text-surface-container"
        cx="48"
        cy="48"
        fill="transparent"
        r="40"
        stroke="currentColor"
        strokeWidth="8"
      ></circle>
      <circle
        className="text-secondary"
        cx="48"
        cy="48"
        fill="transparent"
        r="40"
        stroke="currentColor"
        strokeDasharray="251.2"
        strokeDashoffset="100.48"
        strokeWidth="8"
      ></circle>
    </svg>
    <div className="absolute inset-0 flex items-center justify-center font-headline font-bold text-xl">
      60%
    </div>
  </div>


                  <p className="font-bold text-on-surface">Step 3 of 5</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Almost there
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}