import React, { useEffect, useRef, useState } from "react";
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
    name: "",
    incorporationDate: "",
    legalDocumentFileName: "",
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

export default function Step4CompanyInfo() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => getSavedOnboardingData());
  const [errors, setErrors] = useState({});

  const isCompanyInvestor = formData.investorType === "COMPANY";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleCompanyChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value,
      },
    }));
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        legalDocumentFileName: file.name,
      },
    }));
  };

  const removeSelectedFile = () => {
    setFormData((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        legalDocumentFileName: "",
      },
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateStep4 = () => {
    const newErrors = {};

    if (!isCompanyInvestor) {
      setErrors({});
      return true;
    }

    if (!formData.company.name.trim()) {
      newErrors.name = "Company name is required.";
    }

    if (!formData.company.incorporationDate) {
      newErrors.incorporationDate = "Incorporation date is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (!validateStep4()) return;

    navigate("/Step5BankAccount");
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
              <div className="h-full bg-secondary w-4/5 rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 4 of 5
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out text-slate-500 hover:bg-slate-100"
              to="/Step3SourceOfFunds"
            >
              <span className="material-symbols-outlined">
                account_balance_wallet
              </span>
              <span className="text-sm font-medium">Source of Funds</span>
            </Link>

            <Link
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out bg-white text-slate-900 font-bold shadow-sm"
              to="/Step4CompanyInfo"
            >
              <span className="material-symbols-outlined text-secondary">
                business
              </span>
              <span className="text-sm">Company Info</span>
            </Link>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed">
              <span className="material-symbols-outlined">account_balance</span>
              <span className="text-sm font-medium">Bank Account</span>
            </div>
          </nav>
        </aside>

        <main className="ml-0 lg:ml-72 flex-1 p-6 lg:p-12 bg-surface">
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-3">
                Company Information
              </h1>
              <p className="text-on-surface-variant text-lg">
                This step is required only for investors onboarding as a company.
              </p>
            </header>

            {!isCompanyInvestor ? (
              <>
                <div className="mb-10 p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-white flex items-start gap-4">
                  <div className="bg-secondary-fixed p-2 rounded-lg">
                    <span className="material-symbols-outlined text-on-secondary-fixed">
                      info
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-primary">
                      Step not required
                    </h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Your investor type is currently set to{" "}
                      <span className="font-bold text-primary">
                        {formData.investorType || "INDIVIDUAL"}
                      </span>
                      . Company information is only needed when the investor type
                      is <span className="font-bold text-primary">COMPANY</span>.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-outline-variant/10 pb-4">
                    Individual Investor Notice
                  </h3>

                  <p className="text-on-surface-variant leading-relaxed">
                    Since this onboarding is for an individual investor, you can
                    skip this step and continue to the banking section.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-8">
                  <button
                        type="button"
                        onClick={() => navigate("/Step3SourceOfFunds")}
                        className="px-8 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          arrow_back
                        </span>
                        Previous Step
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/Step5BankAccount")}
                    className="px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Continue to Banking
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-10 p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-white flex items-start gap-4">
                  <div className="bg-secondary-fixed p-2 rounded-lg">
                    <span className="material-symbols-outlined text-on-secondary-fixed">
                      info
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-primary">
                      Institutional Entity Verification
                    </h4>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      By completing this section, you confirm that you are acting
                      on behalf of a registered legal entity.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleContinue}>
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-7 space-y-8">
                      <section className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-outline-variant/10 pb-4">
                          Legal Identity
                        </h3>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2 tracking-wider">
                              Registered Company Name
                            </label>
                            <input
                              type="text"
                              value={formData.company.name}
                              onChange={(e) =>
                                handleCompanyChange("name", e.target.value)
                              }
                              placeholder="e.g. Acme Global Assets Ltd"
                              className="w-full bg-surface-container border-none rounded-xl p-4 text-primary focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-slate-400"
                            />
                            {errors.name && (
                              <p className="text-sm text-error mt-2">
                                {errors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase mb-2 tracking-wider">
                              Date of Incorporation
                            </label>
                            <input
                              type="date"
                              value={formData.company.incorporationDate}
                              onChange={(e) =>
                                handleCompanyChange(
                                  "incorporationDate",
                                  e.target.value
                                )
                              }
                              className="w-full bg-surface-container border-none rounded-xl p-4 text-primary focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            />
                            {errors.incorporationDate && (
                              <p className="text-sm text-error mt-2">
                                {errors.incorporationDate}
                              </p>
                            )}
                          </div>
                        </div>
                      </section>

                      <div className="flex items-center justify-between pt-4">
                     <button
                        type="button"
                        onClick={() => navigate("/Step3SourceOfFunds")}
                        className="px-8 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          arrow_back
                        </span>
                        Previous Step
                      </button>

                        <button
                          type="submit"
                          className="px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Continue to Banking
                        </button>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5 space-y-8">
                      <section className="bg-surface-container-low p-8 rounded-3xl">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-outline-variant/20 pb-4">
                          Required Documents
                        </h3>

                        <div className="mb-6">
                          <p className="text-xs text-on-surface-variant mb-4">
                            Upload your Articles of Incorporation or Certificate
                            of Good Standing.
                          </p>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="hidden"
                            onChange={(e) =>
                              handleFileSelect(e.target.files?.[0])
                            }
                          />

                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white transition-colors cursor-pointer group"
                          >
                            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <span className="material-symbols-outlined text-primary">
                                cloud_upload
                              </span>
                            </div>

                            <p className="text-sm font-bold text-primary mb-1">
                              Click to upload file
                            </p>

                            <p className="text-[10px] text-slate-400 uppercase">
                              PDF, PNG or JPG (Max 10MB)
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {formData.company.legalDocumentFileName ? (
                            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                              <span className="material-symbols-outlined text-secondary text-sm">
                                check_circle
                              </span>

                              <span className="text-xs font-medium text-primary">
                                {formData.company.legalDocumentFileName}
                              </span>

                              <button
                                type="button"
                                onClick={removeSelectedFile}
                                className="material-symbols-outlined text-slate-400 text-sm ml-auto cursor-pointer"
                              >
                                close
                              </button>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-white/50 text-xs text-on-surface-variant">
                              No legal document selected yet.
                            </div>
                          )}
                        </div>
                      </section>

                      <div className="relative overflow-hidden rounded-3xl bg-primary text-white p-8">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-secondary opacity-20 blur-3xl rounded-full"></div>

                        <div className="relative z-10">
                          <span className="material-symbols-outlined text-secondary-fixed mb-4">
                            support_agent
                          </span>
                          <h4 className="font-headline font-bold text-lg mb-2">
                            Need white-glove assistance?
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed mb-6">
                            Our Institutional Onboarding team is available for
                            complex corporate structures and offshore entities.
                          </p>

                          <a
                            className="inline-flex items-center gap-2 text-secondary-fixed font-bold text-sm hover:underline"
                            href="#"
                          >
                            Schedule a Call
                            <span className="material-symbols-outlined text-xs">
                              arrow_forward
                            </span>
                          </a>
                        </div>
                      </div>

                      <div className="rounded-3xl overflow-hidden h-32 bg-slate-200">
                        <img
                          alt="Modern skyscraper office building"
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjIhXn8d0Si_hXN3LfMtilvYKe5E2iBcuu2HLbg88EtLiTu46a7HVgkuDxpTq6EajZhKGP3yVg1OwrhesZJ-UZYQM-DiOoD3OaXaeT6TiwgFWZToXIAHZorOWFEOtUCbxYxqo5lrelbaJ8UfsipjZMJNR6lEUCkVIQtQZH73UhDz_mKb28boQ_x90lTZDSbORnjBauJxC3rIWyzEK2p9npFMMz1kPvzCwZIEnFpjvO2g3z3drtr-IRRkJJbeRqYGA7I8Q-Euxn2zhs"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}