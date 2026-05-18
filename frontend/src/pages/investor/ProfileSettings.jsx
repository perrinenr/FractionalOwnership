import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

const navItems = [
  { label: "Dashboard", icon: "dashboard", to: "/InvestorDashboard" },
  { label: "Explore Deals", icon: "explore", to: "/exploredeals" },
  { label: "Portfolio", icon: "account_balance_wallet", to: "/portfolio" },
  { label: "Wallet", icon: "account_balance", to: "/wallet" },
  { label: "Profile", icon: "person", to: "/profilesetting", active: true },
];

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const decimalValue = (value) => {
  if (!value) return 0;
  if (value.$numberDecimal) return Number(value.$numberDecimal);
  return Number(value);
};

const formatMoney = (value, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(decimalValue(value));
};

const getStatusClass = (status) => {
  switch (status) {
    case "ACTIVE":
    case "VERIFIED":
    case "APPROVED":
      return "bg-secondary-fixed text-on-secondary-container";
    case "PENDING":
    case "PENDING_REVIEW":
      return "bg-amber-100 text-amber-700";
    case "REJECTED":
    case "SUSPENDED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-surface-container text-on-surface-variant";
  }
};

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [roleProfile, setRoleProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await API.get("/users/me");

      setUser(res.data.user || null);
      setRoleProfile(res.data.roleProfile || null);
    } catch (error) {
      console.log("PROFILE ERROR:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.message || "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fullName = useMemo(() => {
    if (!user) return "Loading...";

    const firstName = user.profile?.firstName || "";
    const lastName = user.profile?.lastName || "";
    const name = `${firstName} ${lastName}`.trim();

    return name || user.email || "Investor";
  }, [user]);

  const avatarUrl = user?.profile?.avatarUrl
    ? user.profile.avatarUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fullName
      )}&background=0a2540&color=fff`;

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <aside className="hidden lg:flex h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex-col p-4 gap-2 shrink-0 sticky top-0">
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">
                account_balance_wallet
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Investor Workplace
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Investor Access
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-transform duration-200 ${
                item.active
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/50 hover:translate-x-1"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 w-full z-40 h-16 px-4 md:px-8 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-headline">
              Investor Workspace
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          <header>
            <span className="text-on-surface-variant text-sm font-medium tracking-wide uppercase">
              Account Workspace
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold text-primary font-headline">
              Investor Settings
            </h1>

            <p className="text-on-surface-variant mt-2 max-w-2xl">
              Manage your fractional investment profile, identity verification,
              and security settings.
            </p>
          </header>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-700 font-semibold">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl p-10 text-center text-on-surface-variant font-semibold">
              Loading profile...
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-8 items-start">
              <div className="col-span-12 lg:col-span-4 space-y-8">
                <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_0_rgba(24,28,30,0.06)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16"></div>

                  <div className="relative flex flex-col items-center text-center">
                    <div className="relative">
                      <img
                        alt="Investor Profile"
                        className="w-24 h-24 rounded-full border-4 border-surface object-cover"
                        src={avatarUrl}
                      />

                      <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full text-xs">
                        <span className="material-symbols-outlined text-sm">
                          edit
                        </span>
                      </button>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-primary">
                      {fullName}
                    </h2>

                    <p className="text-on-surface-variant break-all">
                      {user?.email || "No email"}
                    </p>

                    <span
                      className={`mt-4 px-4 py-1 rounded-full text-xs font-bold ${getStatusClass(
                        user?.status
                      )}`}
                    >
                      {user?.status || "STATUS"}
                    </span>
                  </div>

                  <div className="mt-8 space-y-4">
                    <InfoRow
                      label="Account ID"
                      value={user?._id ? `ID-${user._id.slice(-6)}` : "N/A"}
                    />

                    <InfoRow label="User Type" value={user?.userType} />

                    <InfoRow
                      label="Member Since"
                      value={formatDate(user?.createdAt)}
                    />

                    <InfoRow
                      label="Language"
                      value={user?.profile?.language || "N/A"}
                    />

                    <InfoRow
                      label="Timezone"
                      value={user?.profile?.timezone || "N/A"}
                    />
                  </div>
                </section>

                <section className="bg-surface-container-low p-8 rounded-xl space-y-6">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">
                      verified_user
                    </span>
                    Verification Status
                  </h3>

                  <div className="space-y-4">
                    <StatusBox
                      label="KYC Compliance"
                      value={
                        roleProfile?.kycLevel ||
                        roleProfile?.kycStatus ||
                        "Not available"
                      }
                      status={roleProfile?.kycStatus || "N/A"}
                    />

                    <StatusBox
                      label="Accreditation"
                      value={roleProfile?.accreditationStatus || "N/A"}
                      status={roleProfile?.accreditationStatus || "N/A"}
                    />
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Your verification information is loaded from your investor
                    profile in the database.
                  </p>
                </section>
              </div>

              <div className="col-span-12 lg:col-span-8 space-y-8">
                <Card title="Personal Information">
                  <Input label="First Name" value={user?.profile?.firstName} />
                  <Input label="Last Name" value={user?.profile?.lastName} />
                  <Input label="Email" value={user?.email} />
                  <Input label="Phone" value={user?.profile?.phone} />
                  <Input
                    label="Date of Birth"
                    value={formatDate(user?.profile?.dateOfBirth)}
                  />
                  <Input label="Account Status" value={user?.status} />
                </Card>

                {roleProfile?.type === "investor" && (
                  <Card title="Investor Information">
                    <Input
                      label="Investor Type"
                      value={roleProfile?.investorType}
                    />
                    <Input
                      label="Accreditation Status"
                      value={roleProfile?.accreditationStatus}
                    />
                    <Input label="KYC Status" value={roleProfile?.kycStatus} />
                    <Input label="KYC Level" value={roleProfile?.kycLevel} />
                    <Input
                      label="Risk Tolerance"
                      value={roleProfile?.riskTolerance}
                    />
                    <Input
                      label="Wallet"
                      value={formatMoney(
                        roleProfile?.walletBalance || 0,
                        roleProfile?.walletCurrency || "USD"
                      )}
                    />
                  </Card>
                )}

                <section className="bg-surface-container-lowest p-10 rounded-xl shadow-[0_8px_32px_0_rgba(24,28,30,0.06)]">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-primary">
                        Investment Sweet Spot
                      </h2>
                      <p className="text-on-surface-variant text-sm">
                        Your investment preferences loaded from the database.
                      </p>
                    </div>

                    <button className="text-secondary font-bold text-sm hover:underline">
                      Reset Filters
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-primary uppercase tracking-wider">
                        Minimum Commitment
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">
                          $
                        </span>

                        <input
                          className="w-full pl-10 pr-4 py-4 bg-surface-container border-none rounded-xl font-bold text-xl focus:ring-2 focus:ring-secondary transition-all"
                          type="text"
                          value={roleProfile?.investmentSweetSpotmin || 0}
                         
                        />
                      </div>

                      <p className="text-xs text-on-surface-variant">
                        Deals below this threshold can be hidden from your feed.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-primary uppercase tracking-wider">
                        Maximum Commitment
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">
                          $
                        </span>

                        <input
                          className="w-full pl-10 pr-4 py-4 bg-surface-container border-none rounded-xl font-bold text-xl focus:ring-2 focus:ring-secondary transition-all"
                          type="text"
                          value={
                            roleProfile?.investmentSweetSpotmax || 0
                          }
                          readOnly
                        />
                      </div>

                      <p className="text-xs text-on-surface-variant">
                        Safety cap for single-asset fractional ownership stakes.
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 space-y-6">
                    <label className="block text-sm font-bold text-primary uppercase tracking-wider">
                      Risk Tolerance
                    </label>

                    <div className="flex flex-wrap gap-3">
                      {["LOW", "MEDIUM", "HIGH", "AGGRESSIVE"].map((risk) => {
                        const active = roleProfile?.riskTolerance === risk;

                        return (
                          <button
                            key={risk}
                            className={`px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold transition-transform hover:scale-105 ${
                              active
                                ? "bg-primary-container text-white"
                                : "bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {active ? "check_circle" : "radio_button_unchecked"}
                            </span>
                            {risk}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <Card title="Address">
                  <Input label="Street" value={user?.address?.street} />
                  <Input label="City" value={user?.address?.city} />
                  <Input label="State" value={user?.address?.state} />
                  <Input label="Postal Code" value={user?.address?.postalCode} />
                  <Input
                    label="Country"
                    value={user?.address?.country?.name || user?.address?.country}
                  />
                </Card>

                <section className="bg-surface-container-low p-10 rounded-xl">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-primary">
                      Security & Access
                    </h2>
                    <p className="text-on-surface-variant text-sm">
                      Ensure your account remains protected.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <SecurityRow
                      icon="login"
                      title="Last Login"
                      value={formatDate(user?.security?.lastLogin)}
                    />

                    <SecurityRow
                      icon="lock_reset"
                      title="Password Changed"
                      value={formatDate(user?.security?.passwordChangedAt)}
                    />

                    <SecurityRow
                      icon="warning"
                      title="Failed Login Attempts"
                      value={user?.security?.failedLoginAttempts ?? 0}
                    />

                    <SecurityRow
                      icon="phonelink_lock"
                      title="Two-Factor Authentication"
                      value={
                        user?.security?.twoFactorEnabled
                          ? "Enabled"
                          : "Not enabled"
                      }
                    />
                  </div>

                  <div className="mt-10 pt-8 border-t border-outline-variant/20 flex justify-end gap-4">
                    <button className="px-8 py-3 text-on-surface-variant font-bold">
                      Discard Changes
                    </button>

                    <button className="bg-primary text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity">
                      Save All Configuration
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}

          <footer className="mt-16 py-8 border-t border-outline-variant/10 text-center">
            <p className="text-xs text-on-surface-variant font-medium tracking-widest uppercase">
              Equitas Modern — Investor Profile
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_0_rgba(24,28,30,0.06)]">
      <h2 className="text-2xl font-bold text-primary mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </section>
  );
}

function Input({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-bold text-primary mb-2">
        {label}
      </label>

      <input
        value={value || ""}
        readOnly
        className="w-full px-4 py-3 bg-surface-container border-none rounded-xl text-sm focus:ring-2 focus:ring-secondary outline-none"
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-outline-variant/20 pb-3">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-bold text-primary text-right break-all">
        {value || "N/A"}
      </span>
    </div>
  );
}

function StatusBox({ label, value, status }) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
          {label}
        </p>

        <p className="text-sm font-bold text-primary">{value || "N/A"}</p>
      </div>

      <span
        className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(
          status
        )}`}
      >
        {status || "N/A"}
      </span>
    </div>
  );
}

function SecurityRow({ icon, title, value }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between border border-transparent hover:border-primary/10 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        <div>
          <h4 className="font-bold text-primary">{title}</h4>
          <p className="text-xs text-on-surface-variant">{value}</p>
        </div>
      </div>
    </div>
  );
}