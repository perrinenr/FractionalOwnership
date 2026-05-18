import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api/axios";

const navItems = [
  {
    icon: "dashboard",
    label: "Dashboard",
    path: "/admin-dashboard",
    active: false,
  },
  {
    icon: "handshake",
    label: "Pending Deals",
    path: "/pending-deals",
    active: false,
  },
  {
    icon: "business",
    label: "Pending Companies",
    path: "/pending-companies",
    active: false,
  },
  {
    icon: "verified_user",
    label: "KYC Review",
    path: "/kyc-review",
    active: false,
  },
  {
    icon: "history_edu",
    label: "Audit Logs",
    path: "/audit-logs",
    active: false,
  },
  {
    icon: "person",
    label: "Profile",
    path: "/admin-profile",
    active: true,
    filled: true,
  },
];

function Icon({ name, className = "", filled = false, weight = 400 }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${
          filled ? 1 : 0
        }, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
    >
      {name}
    </span>
  );
}

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [roleProfile, setRoleProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await API.get("/users/me", {
          withCredentials: true,
        });

        setUser(res.data.user);
        setRoleProfile(res.data.roleProfile);
      } catch (err) {
        console.error("ADMIN PROFILE ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const fullName = user
    ? `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim()
    : "";

  const displayName = fullName || "Admin User";

  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString();
  };

  const countryValue =
    user?.address?.country?.name || user?.address?.country || "N/A";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="bg-white px-8 py-6 rounded-2xl shadow-sm text-center">
          <Icon name="hourglass_empty" className="text-emerald-700 text-4xl" />
          <p className="mt-3 font-bold text-slate-700">
            Loading admin profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-on-surface flex">
      {/* Sidebar */}
      <aside className="h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex flex-col p-4 gap-2 shrink-0 sticky top-0">
        <div className="mb-8 px-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              Fractional Admin
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
              Institutional Access
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={
                item.active
                  ? "flex items-center gap-3 px-3 py-2.5 bg-white text-emerald-700 shadow-sm rounded-lg transition-transform duration-200"
                  : "flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1 transition-transform duration-200 rounded-lg"
              }
            >
              <Icon
                name={item.icon}
                filled={item.filled}
                className={item.active ? "text-emerald-700" : ""}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-50 h-16 px-8 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Admin Profile
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Icon name="notifications" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-secondary border border-white"></span>
            </button>

            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Icon name="help_outline" />
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Page Title */}
          <section>
            <span className="text-on-surface-variant text-sm font-medium tracking-wide uppercase">
              Account Workspace
            </span>

            <h2 className="text-4xl font-extrabold text-primary mt-1">
              My Profile
            </h2>

            <p className="text-on-surface-variant mt-2">
              View your admin account information, access details, preferences,
              and security activity.
            </p>
          </section>

          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Profile Card */}
            <section className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-2xl shadow border overflow-hidden">
              <div className="bg-primary px-8 py-8 text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-white/15 border-4 border-white/20 flex items-center justify-center text-white text-3xl font-black">
                  {initials}
                </div>

                <h2 className="mt-4 text-2xl font-bold text-white">
                  {displayName}
                </h2>

                <p className="text-white/70 text-sm break-all">
                  {user?.email || "No email"}
                </p>

                <span className="mt-4 inline-flex px-4 py-1.5 bg-white/10 text-white rounded-full text-xs font-semibold">
                  {user?.status || "ADMIN"}
                </span>
              </div>

              <div className="p-8 space-y-4">
                <InfoRow label="User Type" value={user?.userType || "ADMIN"} />
                <InfoRow label="Role" value={roleProfile?.type || "Admin"} />
                <InfoRow label="Language" value={user?.profile?.language} />
                <InfoRow label="Timezone" value={user?.profile?.timezone} />
                <InfoRow label="Created At" value={formatDate(user?.createdAt)} />
              </div>
            </section>

            {/* Right Content */}
            <section className="col-span-12 lg:col-span-8 space-y-8">
              <Card title="Personal Information" icon="badge">
                <Input label="First Name" value={user?.profile?.firstName} />
                <Input label="Last Name" value={user?.profile?.lastName} />
                <Input label="Email" value={user?.email} />
                <Input label="Phone" value={user?.profile?.phone} />
                <Input
                  label="Date of Birth"
                  value={formatDate(user?.profile?.dateOfBirth)}
                />
              </Card>

              <Card title="Admin Access" icon="admin_panel_settings">
                <Input label="Access Type" value={user?.userType || "ADMIN"} />
                <Input label="Profile Type" value={roleProfile?.type || "Admin"} />
                <Input label="Account ID" value={user?._id} />
                <Input
                  label="Created At"
                  value={formatDate(user?.createdAt)}
                />
              </Card>

              <Card title="Address" icon="location_on">
                <Input label="Street" value={user?.address?.street} />
                <Input label="City" value={user?.address?.city} />
                <Input label="State" value={user?.address?.state} />
                <Input label="Postal Code" value={user?.address?.postalCode} />
                <Input label="Country" value={countryValue} />
              </Card>

              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Icon
                      name="tune"
                      className="text-emerald-700"
                      filled={true}
                    />
                  </div>

                  <h2 className="text-2xl font-bold text-primary">
                    Preferences
                  </h2>
                </div>

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

              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Icon
                      name="security"
                      className="text-emerald-700"
                      filled={true}
                    />
                  </div>

                  <h2 className="text-2xl font-bold text-primary">Security</h2>
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
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-2xl shadow border">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Icon name={icon} className="text-emerald-700" filled={true} />
        </div>

        <h2 className="text-2xl font-bold text-primary">{title}</h2>
      </div>

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
        className="w-full px-4 py-3 bg-surface-container border-none rounded-xl text-sm focus:ring-2 focus:ring-secondary outline-none"
      />
    </div>
  );
}

function Preference({ label, active }) {
  return (
    <div className="bg-surface-container p-5 rounded-xl flex items-center justify-between">
      <span className="font-bold text-primary">{label}</span>

      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          active
            ? "bg-secondary-fixed text-on-secondary-container"
            : "bg-white text-on-surface-variant"
        }`}
      >
        {active ? "ON" : "OFF"}
      </span>
    </div>
  );
}

function SecurityRow({ icon, title, value }) {
  return (
    <div className="bg-surface-container p-5 rounded-xl flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
        <Icon name={icon} />
      </div>

      <div>
        <h4 className="font-bold text-primary">{title}</h4>
        <p className="text-xs text-on-surface-variant">{value}</p>
      </div>
    </div>
  );
}