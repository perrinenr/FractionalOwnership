import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api/axios";
import { Link , useNavigate } from "react-router-dom";

const navItems = [
  {
    icon: "dashboard",
    label: "Dashboard",
    path: "/admin-dashboard",
    active: true,
    filled: true,
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
    active: false,
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDeals: 0,
    pendingKyc: 0,
    pendingCompanies: 0,
  });

  const handleLogout = async () => {
  try {
    await API.post("/users/logout", {}, { withCredentials: true });
  } catch (err) {
    console.log("Logout backend error:", err);
  }

  localStorage.removeItem("token");
  localStorage.removeItem("role");

  navigate("/", { replace: true });
};

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/stats", {
          withCredentials: true,
        });

        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="bg-surface text-on-surface flex">
      <aside className="h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex flex-col p-4 gap-2 shrink-0">
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">
                Fractional Admin
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Institutional Access
              </p>
            </div>
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

       <div className="mt-auto border-t border-slate-200/50 pt-4">
          <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 hover:translate-x-1 transition-transform duration-200 rounded-lg"
          >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium text-sm">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 w-full z-50 h-16 px-8 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 manrope">
              Architect Admin
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Icon name="notifications" />
            </button>

            <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
              <Icon name="help_outline" />
            </button>

            <div className="h-6 w-[1px] bg-outline-variant mx-2"></div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-on-surface-variant text-sm font-medium tracking-wide">
                SYSTEM OVERVIEW
              </span>
              <h2 className="text-3xl font-extrabold text-primary manrope -mt-1">
                Performance Dashboard
              </h2>
            </div>

            <div className="flex gap-3">
              <div className="px-4 py-2 bg-surface-container-low rounded-xl flex items-center gap-2 text-on-surface-variant border border-outline-variant/10">
                <Icon name="calendar_today" className="text-sm" />
                <span className="text-sm font-medium">
                  {formatDate(start)} - {formatDate(end)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5 min-h-[320px] flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold text-primary manrope">
                    Platform Growth Trends
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    Monthly volume and user acquisition metrics
                  </p>
                </div>
              </div>

              <div className="flex-1 relative flex items-end gap-4 px-4 h-56">
                {["JAN", "FEB", "MAR", "APR", "MAY", "JUN"].map(
                  (month, index) => {
                    const heights = ["40%", "55%", "45%", "70%", "60%", "85%"];
                    const innerHeights = [
                      "80%",
                      "85%",
                      "75%",
                      "90%",
                      "82%",
                      "95%",
                    ];

                    return (
                      <div
                        key={month}
                        className="group relative flex-1 bg-primary/5 hover:bg-primary/10 transition-colors rounded-t-lg flex flex-col justify-end items-center"
                        style={{ height: heights[index] }}
                      >
                        <div
                          className="w-full bg-primary rounded-t-lg"
                          style={{
                            height: innerHeights[index],
                            opacity: index === 5 ? 1 : 0.4 + index * 0.1,
                          }}
                        ></div>

                        <span className="absolute -bottom-8 text-[10px] font-bold text-on-surface-variant">
                          {month}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_32px_rgba(24,28,30,0.04)] border border-outline-variant/5">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-primary manrope">
                    System Snapshot
                  </h3>
                  <p className="text-sm text-on-surface-variant">
                    Current platform status
                  </p>
                </div>

                <Icon name="monitoring" className="text-secondary" />
              </div>

              <div className="space-y-5">
                <StatRow label="Total Users" value={stats.totalUsers} />
                <StatRow label="Active Deals" value={stats.activeDeals} />
                <StatRow
                  label="Pending KYC"
                  value={stats.pendingKyc}
                  secondary
                />
                <StatRow
                  label="Pending Companies"
                  value={stats.pendingCompanies}
                  secondary
                  noBorder
                />
              </div>

              <div className="mt-8 rounded-2xl bg-surface-container-low p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
                    <Icon
                      name="admin_panel_settings"
                      className="text-white"
                      filled
                    />
                  </div>

                  <div>
                    <p className="font-bold text-primary manrope">
                      Admin Control
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      Review pending actions regularly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatRow({ label, value, secondary = false, noBorder = false }) {
  return (
    <div
      className={`flex items-center justify-between ${
        noBorder ? "" : "border-b border-outline-variant/10 pb-4"
      }`}
    >
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span
        className={`text-lg font-bold ${
          secondary ? "text-secondary" : "text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}