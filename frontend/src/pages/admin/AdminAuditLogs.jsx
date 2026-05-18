import React from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api/axios";
const navItems = [
  { icon: "dashboard", label: "Dashboard", path:"/admin-dashboard",active: false },
  { icon: "handshake", label: "Pending Deals", path:"/pending-deals",active: false },
  { icon: "business", label: "Pending Companies", path:"/pending-companies",active: false },
  { icon: "verified_user", label: "KYC Review", path:"/kyc-review",active: false },
  { icon: "history_edu", label: "Audit Logs",  path:"/audit-logs",active: true },
  {icon: "person", label: "Profile", path: "/admin-profile", active: false },
];
function Icon({ name, className = "", filled = false, weight = 400 }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
    >
      {name}
    </span>
  );
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
useEffect(() => {
  API.get("/audit_Logs", {
    withCredentials: true
  })
  .then(res => {
    console.log(res.data);
    setLogs(res.data);
  })
  .catch(err => console.error(err));
}, []);
  return (
   <div className="min-h-screen bg-[#f3f4f6] text-slate-900 flex">
      
            {/* SIDEBAR */}
            <aside className="h-screen w-64 border-r border-slate-200 bg-[#f3f4f6] flex flex-col p-4 gap-2 sticky top-0">
              <div className="mb-8 px-2">
                <h2 className="text-lg font-black">Fractional Admin</h2>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  Institutional Access
                </p>
              </div>
      
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={
                      item.active
                        ? "flex items-center gap-3 px-3 py-2.5 bg-white text-emerald-700 shadow-sm rounded-lg"
                        : "flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-200/50 rounded-lg"
                    }
                  >
                    <Icon name={item.icon} filled={item.filled} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </aside>

      <div className="flex-1 flex flex-col min-w-0">
       <header className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl md:static md:w-auto">
          <div className="flex justify-between items-center h-16 px-8 w-full">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 brand-font">
                Audit Logs
              </span>
            </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-slate-900 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </button>

              <button className="text-slate-500 hover:text-slate-900 transition-colors">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mt-16 p-8 max-w-7xl mx-auto w-full space-y-8">

          <section className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Action
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      Entity
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      User
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
<tbody className="divide-y divide-outline-variant/10">
               {logs.map((log, index) => {
                
  const date = new Date(log.timestamp);

  return (
    <React.Fragment key={index}>
    <tr key={index} className="hover:bg-surface-container-lowest/50 transition-colors">
      
      {/* Timestamp */}
      <td className="px-6 py-5">
        <div className="text-sm font-semibold text-primary">
          {date.toLocaleDateString()}
        </div>
        <div className="text-[11px] text-on-surface-variant">
          {date.toLocaleTimeString()}
        </div>
      </td>

      {/* Action */}
      <td className="px-6 py-5">
        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary-fixed text-on-secondary-fixed">
          {log.action}
        </span>
      </td>

      {/* Entity */}
      <td className="px-6 py-5">
        <div className="text-sm font-medium">{log.entityType}</div>
        <div className="text-[11px] font-mono">
          {log.entityId}
        </div>
      </td>

      {/* User */}
      <td className="px-6 py-5">
        <div className="text-sm font-medium">
          {log.userType}
        </div>
        <div className="text-[10px] text-emerald-600">
          {log.userId}
        </div>
      </td>

      <td className="px-6 py-5 text-right">
        <button
  onClick={() =>
    setExpandedIndex(expandedIndex === index ? null : index)
  }
  className="text-primary text-xs font-bold hover:underline"
>
  {expandedIndex === index ? "Hide Changes" : "View Changes"}
</button>
      </td>

    </tr>
    {expandedIndex === index && (
        <tr>
          <td colSpan="5" className="px-6 py-4 bg-slate-50">
            <div className="grid grid-cols-2 gap-6">

              <div>
                <h3 className="text-xs font-bold text-red-600 mb-2">BEFORE</h3>
                <pre className="text-xs bg-red-50 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(log.changes?.before || {}, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="text-xs font-bold text-green-600 mb-2">AFTER</h3>
                <pre className="text-xs bg-green-50 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(log.changes?.after || {}, null, 2)}
                </pre>
              </div>

            </div>
          </td>
        </tr>
      )}

    </React.Fragment>
  
  );
})}
</tbody>
 </table>
  </div>
   </section>
   </main>
      </div>
    </div>
    
  );
}