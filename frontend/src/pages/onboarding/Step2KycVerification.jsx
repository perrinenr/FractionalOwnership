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

export default function Step2KycVerification() {
  const navigate = useNavigate();
  const documentInputRef = useRef(null);

  const [formData, setFormData] = useState(() => getSavedOnboardingData());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleKycChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      kyc: {
        ...prev.kyc,
        [field]: value,
      },
    }));
  };

  const handleDocumentTypeChange = (value) => {
    handleKycChange("documentType", value);
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    handleKycChange("documentFileName", file.name);
  };

  const removeSelectedFile = () => {
    handleKycChange("documentFileName", "");
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.kyc.documentType) {
      newErrors.documentType = "Document type is required.";
    }

    if (!formData.kyc.documentFileName) {
      newErrors.documentFileName = "Please upload a document.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    navigate("/Step3SourceOfFunds");
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
              <div className="h-full bg-secondary w-2/5 rounded-full"></div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Step 2 of 5
            </p>
          </div>

          <nav className="space-y-1">
            <Link
              className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-all duration-200 ease-in-out"
              to="/Step1BasicProfile"
            >
              <span className="material-symbols-outlined">person_outline</span>
              <span className="font-inter text-sm">Basic Profile</span>
            </Link>

            <Link
              className="flex items-center gap-3 px-4 py-3 bg-white text-slate-900 font-bold shadow-sm rounded-xl transition-all duration-200 ease-in-out"
              to="/Step2KycVerification"
            >
              <span className="material-symbols-outlined text-secondary">
                verified_user
              </span>
              <span className="font-inter text-sm">KYC Verification</span>
            </Link>

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

        <main className="flex-1 lg:ml-72 bg-surface p-6 md:p-12">
          <div className="max-w-5xl mx-auto">
            <header className="mb-10">
              <h1 className="font-headline text-[2.5rem] font-extrabold text-primary leading-tight tracking-tight">
                Identity Verification
              </h1>
              <p className="text-on-surface-variant text-lg mt-3 max-w-2xl leading-relaxed">
                Please select your identification type and upload your document
                for verification.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
                  <h3 className="font-headline font-bold text-primary text-base">
                    Guidelines
                  </h3>

                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <span className="material-symbols-outlined text-secondary text-[20px]">
                        check_circle
                      </span>
                      <span className="text-sm text-on-surface-variant leading-snug">
                        Ensure all four corners of the document are visible.
                      </span>
                    </li>

                    <li className="flex gap-3">
                      <span className="material-symbols-outlined text-secondary text-[20px]">
                        check_circle
                      </span>
                      <span className="text-sm text-on-surface-variant leading-snug">
                        Images must be clear and readable.
                      </span>
                    </li>

                    <li className="flex gap-3">
                      <span className="material-symbols-outlined text-secondary text-[20px]">
                        check_circle
                      </span>
                      <span className="text-sm text-on-surface-variant leading-snug">
                        Supported formats: PNG, JPG, PDF.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKbXA5mMsD3goR1LpZyVFWaRHwCy9yPNV6nPD_KQXJRo7p9c5Zzwi4OzBamk9gh-l15pAVZyPEYcbEzlmyqvQNT9-vHtaRKzkYU4eQLE0NVX_5Q00kN_suUomPFsR3g14A27Wh8O5lIQnIYpa3uKprqM2eo7BW0JeUTnej14WsIbL632av2iDxP-WH1iBfVbBNOjIe-rclHDdIt9CB-WmxMtRpKZ9qKBVPJZWB5MJX7nZMMVnA_jVtAlhgW5lpkz-nHXTY52Tht10G"
                    alt="KYC illustration"
                  />
                  <div className="absolute inset-0 bg-primary/20"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80 mb-1">
                      Vault Security
                    </p>
                    <p className="text-xs text-white/90 leading-tight">
                      Your data is encrypted with bank-grade security protocols.
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
                  <form onSubmit={handleContinue} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        Document Type
                      </label>

                      {errors.documentType && (
                        <p className="text-sm text-error">{errors.documentType}</p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            value: "PASSPORT",
                            label: "PASSPORT",
                            icon: "travel",
                          },
                          {
                            value: "NATIONAL_ID",
                            label: "NATIONAL_ID",
                            icon: "badge",
                          },
                          {
                            value: "DRIVERS_LICENSE",
                            label: "DRIVERS_LICENSE",
                            icon: "directions_car",
                          },
                          {
                            value: "PROOF_OF_ADDRESS",
                            label: "PROOF_OF_ADDRESS",
                            icon: "home_pin",
                          },
                        ].map((item) => (
                          <div
                            key={item.value}
                            onClick={() => handleDocumentTypeChange(item.value)}
                            className={`relative flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${
                              formData.kyc.documentType === item.value
                                ? "border-secondary bg-white shadow-sm"
                                : "border-outline-variant/30 bg-surface-container-low hover:bg-surface-container"
                            }`}
                          >
                            <input
                              type="radio"
                              name="doc_type"
                              value={item.value}
                              checked={formData.kyc.documentType === item.value}
                              onChange={() => handleDocumentTypeChange(item.value)}
                              className="hidden"
                            />

                            <div className="flex items-center gap-3 w-full">
                              <span
                                className={`material-symbols-outlined ${
                                  formData.kyc.documentType === item.value
                                    ? "text-primary"
                                    : "text-primary-fixed-dim"
                                }`}
                              >
                                {item.icon}
                              </span>

                              <span className="text-sm font-semibold text-slate-700">
                                {item.label}
                              </span>

                              <div
                                className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  formData.kyc.documentType === item.value
                                    ? "border-secondary bg-secondary"
                                    : "border-outline-variant"
                                }`}
                              >
                                {formData.kyc.documentType === item.value && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                        Upload Document
                      </label>

                      {errors.documentFileName && (
                        <p className="text-sm text-error">{errors.documentFileName}</p>
                      )}

                      <input
                        ref={documentInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      />

                      <div
                        onClick={() => documentInputRef.current?.click()}
                        className="border-2 border-dashed border-outline-variant/50 rounded-xl p-10 flex flex-col items-center justify-center bg-surface hover:bg-surface-container-low transition-all duration-300 group cursor-pointer"
                      >
                        <div className="w-16 h-16 bg-primary-fixed/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-primary text-3xl">
                            cloud_upload
                          </span>
                        </div>
                        <h4 className="font-headline font-bold text-primary mb-1 text-lg">
                          Click to upload your document
                        </h4>
                        <p className="text-on-surface-variant text-sm">
                          PNG, JPG or PDF (max. 10MB)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Current Uploads
                      </h4>

                      {formData.kyc.documentFileName ? (
                        <div className="flex items-center p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-primary">
                              description
                            </span>
                          </div>

                          <div className="ml-4 flex-1">
                            <p className="text-sm font-bold text-primary">
                              {formData.kyc.documentFileName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Selected locally
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="text-on-surface-variant hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              close
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-surface-container-low text-sm text-on-surface-variant">
                          No file selected yet.
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => navigate("/Step1BasicProfile")}
                        className="px-8 py-3 rounded-xl font-bold text-sm text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          arrow_back
                        </span>
                        Previous Step
                      </button>

                      <button
                        type="submit"
                        className="px-10 py-4 rounded-xl font-bold text-sm bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                      >
                        Continue to Source of Funds
                        
                      </button>
                    </div>
                  </form>
                </div>

                <div className="rounded-xl bg-white/70 border border-white p-4 text-sm text-on-surface-variant">
                  The selected file name is saved locally for the step flow.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}