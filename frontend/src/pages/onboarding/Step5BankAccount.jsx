import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";

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
    name: "",
    incorporationDate: "",
    legalDocumentFileName: "",
  },

  bankAccount: {
    bankName: "",
    accountNumber: "",
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

function buildPayload(formData) {
  return {
    investorType: formData.investorType,
    riskTolerance: formData.riskTolerance || undefined,

    investmentSweetSpot: {
      min:
        formData.investmentSweetSpot.min === ""
          ? undefined
          : Number(formData.investmentSweetSpot.min),
      max:
        formData.investmentSweetSpot.max === ""
          ? undefined
          : Number(formData.investmentSweetSpot.max),
      currency: formData.investmentSweetSpot.currency || undefined,
    },

    kyc: formData.kyc?.documentType
      ? {
          documentType: formData.kyc.documentType,
        }
      : undefined,

    sourceOfFunds: {
      primary: formData.sourceOfFunds.primary,
      description: formData.sourceOfFunds.description || undefined,
      annualIncome:
        formData.sourceOfFunds.annualIncome === ""
          ? undefined
          : Number(formData.sourceOfFunds.annualIncome),
      netWorth:
        formData.sourceOfFunds.netWorth === ""
          ? undefined
          : Number(formData.sourceOfFunds.netWorth),
    },

    company:
      formData.investorType === "COMPANY"
        ? {
            name: formData.company.name || undefined,
            incorporationDate: formData.company.incorporationDate || undefined,
          }
        : undefined,

    bankAccount: {
      bankName: formData.bankAccount.bankName,
      accountNumber: formData.bankAccount.accountNumber,
      isPrimary: Boolean(formData.bankAccount.isPrimary),
    },

    preferences: formData.preferences,
  };
}

export default function Step5BankAccount() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => getSavedOnboardingData());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleBankChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [field]: value,
      },
    }));
  };

  const validateStep = () => {
    const newErrors = {};

    if (!formData.bankAccount.bankName.trim()) {
      newErrors.bankName = "Bank name is required.";
    }

    if (!formData.bankAccount.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    if (!validateStep()) return;

    try {
      setSubmitting(true);

      const payload = buildPayload(formData);

      await API.post(
        "/investors/onboarding",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      localStorage.removeItem(STORAGE_KEY);
      setSuccessMessage("Onboarding completed successfully.");

      setTimeout(() => {
        navigate("/");
      }, 1800);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen">
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
              <div className="h-full bg-secondary w-full rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 5 of 5
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
              to="/Step1BasicProfile"
            >
              <span className="material-symbols-outlined">person_outline</span>
              <span className="text-sm font-medium">Basic Profile</span>
            </Link>

            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
              to="/Step2KycVerification"
            >
              <span className="material-symbols-outlined">verified_user</span>
              <span className="text-sm font-medium">KYC Verification</span>
            </Link>

            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
              to="/Step3SourceOfFunds"
            >
              <span className="material-symbols-outlined">
                account_balance_wallet
              </span>
              <span className="text-sm font-medium">Source of Funds</span>
            </Link>

            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 transition-all"
              to="/Step4CompanyInfo"
            >
              <span className="material-symbols-outlined">business</span>
              <span className="text-sm font-medium">Company Info</span>
            </Link>

            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-slate-900 font-bold shadow-sm transition-all"
              to="/Step5BankAccount"
            >
              <span className="material-symbols-outlined">account_balance</span>
              <span className="text-sm">Bank Account</span>
            </Link>
          </nav>
        </aside>

        <main className="ml-0 lg:ml-72 flex-1 p-6 lg:p-12 bg-surface">
          <div className="max-w-6xl mx-auto">
            <header className="mb-12">
              <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-3">
                Bank Account
              </h1>
              <p className="text-on-surface-variant text-lg max-w-3xl">
                Final step. Add the required banking details to complete your
                onboarding.
              </p>
            </header>

            <div className="mb-10 p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-white flex items-start gap-4">
              <div className="bg-secondary-fixed p-2 rounded-lg">
                <span className="material-symbols-outlined text-on-secondary-fixed">
                  info
                </span>
              </div>

              <div>
                <h4 className="font-bold text-primary">
                  Required Banking Details
                </h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Only the required fields from your schema are shown here:
                  bank name, account number, and whether this is the primary
                  account.
                </p>
              </div>
            </div>

            {serverError ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {serverError}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                {successMessage}
              </div>
            ) : null}

            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 lg:col-span-7 space-y-8">
                <form onSubmit={handleCompleteOnboarding} className="space-y-8">
                  <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-outline-variant/10 pb-4">
                      Required Account Information
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2 tracking-wider">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={formData.bankAccount.bankName}
                          onChange={(e) =>
                            handleBankChange("bankName", e.target.value)
                          }
                          placeholder="e.g. JPMorgan Chase"
                          className="w-full bg-surface-container border-none rounded-xl p-4 text-primary focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-slate-400"
                        />
                        {errors.bankName && (
                          <p className="text-sm text-error mt-2">
                            {errors.bankName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2 tracking-wider">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={formData.bankAccount.accountNumber}
                          onChange={(e) =>
                            handleBankChange("accountNumber", e.target.value)
                          }
                          placeholder="0000 0000 0000"
                          className="w-full bg-surface-container border-none rounded-xl p-4 text-primary focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-slate-400"
                        />
                        {errors.accountNumber && (
                          <p className="text-sm text-error mt-2">
                            {errors.accountNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm">
                    <div className="flex items-center justify-between gap-6 flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary">
                            star
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-primary">
                            Set as Primary Account
                          </h4>
                          <p className="text-sm text-on-surface-variant">
                            This account will be marked as your main account.
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.bankAccount.isPrimary}
                          onChange={(e) =>
                            handleBankChange("isPrimary", e.target.checked)
                          }
                        />
                        <div className="w-14 h-8 bg-surface-container-highest rounded-full peer peer-checked:bg-secondary after:content-[''] after:absolute after:top-1 after:left-1 after:h-6 after:w-6 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-6"></div>
                      </label>
                    </div>
                  </section>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      type="button"
                      onClick={() => navigate("/Step4CompanyInfo")}
                      className="px-8 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        arrow_back
                      </span>
                      Previous Step
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100"
                    >
                      {submitting ? "Completing..." : "Complete Onboarding"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="col-span-12 lg:col-span-5 space-y-8">
                <section className="bg-surface-container-low p-8 rounded-3xl">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-outline-variant/20 pb-4">
                    Why We Need This
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">
                        check_circle
                      </span>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        <span className="font-bold text-primary">
                          Dividend Payouts:
                        </span>{" "}
                        receive earnings directly to your bank account.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-sm mt-0.5">
                        check_circle
                      </span>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        <span className="font-bold text-primary">
                          Verification:
                        </span>{" "}
                        confirm the beneficial owner of the funds.
                      </p>
                    </div>
                  </div>
                </section>

                <div className="relative overflow-hidden rounded-3xl bg-primary text-white p-8">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-secondary opacity-20 blur-3xl rounded-full"></div>

                  <div className="relative z-10">
                    <span className="material-symbols-outlined text-secondary-fixed mb-4">
                      encrypted
                    </span>
                    <h4 className="font-headline font-bold text-lg mb-2">
                      Final Security Check
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                      This is the final step before creating your investor
                      profile.
                    </p>
                  </div>
                </div>

                <section className="bg-surface-container-low p-8 rounded-3xl">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-outline-variant/20 pb-4">
                    Completion Status
                  </h3>

                  <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-secondary w-full rounded-full"></div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary font-bold">
                      100% Complete
                    </span>
                    <span className="text-on-surface-variant">Final step</span>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}