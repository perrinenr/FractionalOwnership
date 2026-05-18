import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: "dashboard", to: "/company-dashboard" },
  { label: "My Deals", icon: "handshake", to: "/company-deals" },
  { label: "Distributions", icon: "payments", to: "/company-distributions" },
  { label: "Wallet", icon: "account_balance_wallet", to: "/company-wallet" },
  { label: "Profile", icon: "person", to: "/profile", active: true },
];

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [roleProfile, setRoleProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users/me", {
          withCredentials: true,
        });

        setUser(res.data.user);
        setRoleProfile(res.data.roleProfile);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const fullName = user
    ? `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim()
    : "Loading...";

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <aside className="hidden lg:flex h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex-col p-4 gap-2 shrink-0 sticky top-0">
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">
                business_center
              </span>
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Fractional Company
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Business Access
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

        <div className="mt-auto border-t border-slate-200/50 pt-4">
          
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 w-full z-40 h-16 px-4 md:px-8 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-headline whitespace-nowrap">
            Company Workspace
          </h1>

          <div className="flex items-center gap-3 md:gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button className="hidden sm:inline-flex p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-8">
          <section>
            <span className="text-on-surface-variant text-sm font-medium tracking-wide uppercase">
              Account Workspace
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary font-headline">
              My Profile
            </h2>
            <p className="text-on-surface-variant mt-2">
              View and manage your personal account details.
            </p>
          </section>

          <div className="grid grid-cols-12 gap-8 items-start">
            <section className="col-span-12 lg:col-span-4 bg-white p-8 rounded-xl shadow-[0_8px_32px_0_rgba(24,28,30,0.06)]">
              <div className="flex flex-col items-center text-center">
                <img
                  src={
                    user?.profile?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${fullName}&background=0a2540&color=fff`
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-surface"
                />

                <h2 className="mt-4 text-2xl font-bold text-primary">
                  {fullName}
                </h2>

                <p className="text-on-surface-variant break-all">
                  {user?.email}
                </p>

                <span className="mt-4 px-4 py-1 rounded-full bg-secondary-fixed text-on-secondary-container text-xs font-bold">
                  {user?.status || "STATUS"}
                </span>
              </div>

              <div className="mt-8 space-y-4">
                <InfoRow label="User Type" value={user?.userType} />
                <InfoRow label="Language" value={user?.profile?.language} />
                <InfoRow label="Timezone" value={user?.profile?.timezone} />
                <InfoRow label="Created At" value={formatDate(user?.createdAt)} />
              </div>
            </section>

            <section className="col-span-12 lg:col-span-8 space-y-8">
              <Card title="Personal Information">
                <Input label="First Name" value={user?.profile?.firstName} />
                <Input label="Last Name" value={user?.profile?.lastName} />
                <Input label="Email" value={user?.email} />
                <Input label="Phone" value={user?.profile?.phone} />
                <Input
                  label="Date of Birth"
                  value={formatDate(user?.profile?.dateOfBirth)}
                />
                <Input label="Status" value={user?.status} />
              </Card>

              {roleProfile?.type === "company" && (
                <Card title="Company Information">
                  <Input label="Company Name" value={roleProfile.companyName} />
                  <Input
                    label="Registration Number"
                    value={roleProfile.registrationNumber}
                  />
                  <Input label="Listing Type" value={roleProfile.listingType} />
                  <Input label="Company Status" value={roleProfile.companyStatus} />
                  <Input
                    label="Incorporation Country"
                    value={roleProfile.incorporationCountry}
                  />
                  <Input
                    label="Wallet"
                    value={`${roleProfile.walletBalance || 0} ${
                      roleProfile.walletCurrency || "USD"
                    }`}
                  />
                </Card>
              )}

              {roleProfile?.type === "investor" && (
                <Card title="Investor Information">
                  <Input label="Investor Type" value={roleProfile.investorType} />
                  <Input
                    label="Accreditation Status"
                    value={roleProfile.accreditationStatus}
                  />
                  <Input label="KYC Status" value={roleProfile.kycStatus} />
                  <Input label="KYC Level" value={roleProfile.kycLevel} />
                  <Input label="Risk Tolerance" value={roleProfile.riskTolerance} />
                  <Input
                    label="Wallet"
                    value={`${roleProfile.walletBalance || 0} ${
                      roleProfile.walletCurrency || "USD"
                    }`}
                  />
                </Card>
              )}

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

              <div className="bg-surface-container-low p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Preferences
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Preference
                    label="Email Notifications"
                    active={user?.preferences?.emailNotifications}
                  />
                  <Preference
                    label="SMS Notifications"
                    active={user?.preferences?.smsNotifications}
                  />
                  <Preference
                    label="Investment Alerts"
                    active={user?.preferences?.investmentAlerts}
                  />
                  <Preference
                    label="Dividend Alerts"
                    active={user?.preferences?.dividendAlerts}
                  />
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-[0_8px_32px_0_rgba(24,28,30,0.06)]">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Security
                </h2>

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
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button className="px-8 py-3 text-on-surface-variant font-bold">
                  Cancel
                </button>

                <button className="bg-primary text-white px-10 py-3 rounded-xl font-bold hover:opacity-90">
                  Save Changes
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-[0_8px_32px_0_rgba(24,28,30,0.06)]">
      <h2 className="text-2xl font-bold text-primary mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
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

function Input({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-bold text-primary mb-2">
        {label}
      </label>
      <input
        value={value || ""}
        readOnly
        className="w-full px-4 py-3 bg-surface-container border-none rounded-xl text-sm focus:ring-2 focus:ring-secondary"
      />
    </div>
  );
}

function Preference({ label, active }) {
  return (
    <div className="bg-white p-5 rounded-xl flex items-center justify-between">
      <span className="font-bold text-primary">{label}</span>
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          active
            ? "bg-secondary-fixed text-on-secondary-container"
            : "bg-surface-container text-on-surface-variant"
        }`}
      >
        {active ? "ON" : "OFF"}
      </span>
    </div>
  );
}

function SecurityRow({ icon, title, value }) {
  return (
    <div className="bg-surface-container-low p-5 rounded-xl flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      <div>
        <h4 className="font-bold text-primary">{title}</h4>
        <p className="text-xs text-on-surface-variant">{value}</p>
      </div>
    </div>
  );
}