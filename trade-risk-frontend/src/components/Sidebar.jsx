import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  LayoutDashboard,
  UploadCloud,
  ListOrdered,
  Activity
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-72 h-screen bg-gradient-to-b from-gray-950 to-gray-900 border-r border-gray-800 flex flex-col justify-between">

      {/* ================= BRAND ================= */}
      <div>
        <div className="px-6 py-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Trade Sentinel"
              className="w-10 h-10 rounded-md"
            />
            <div>
              <h1 className="text-lg font-semibold tracking-wide text-white">
                Trade Sentinel
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Hybrid Risk Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="px-4 py-6 space-y-2">

          <SidebarLink
            to="/"
            label="Dashboard"
            icon={<LayoutDashboard size={18} />}
          />

          <SidebarLink
            to="/upload"
            label="Upload Data"
            icon={<UploadCloud size={18} />}
          />

          <SidebarLink
            to="/transactions"
            label="Transactions"
            icon={<ListOrdered size={18} />}
          />

          <SidebarLink
            to="/live-trade"
            label="Live Monitor"
            icon={<Activity size={18} />}
          />
          

        </nav>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="px-6 py-5 border-t border-gray-800">

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Real-Time Monitoring Active
        </div>

        <p className="text-xs text-gray-600 mt-2">
          Trade Sentinel AI v2.5
        </p>

      </div>

    </div>
  );
}

/* ================= LINK COMPONENT ================= */

function SidebarLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-blue-500/10 text-blue-400"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`
      }
    >
      <span
        className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${
          window.location.pathname === to ? "bg-blue-500" : ""
        }`}
      ></span>

      <span className="opacity-80 group-hover:opacity-100">
        {icon}
      </span>

      {label}
    </NavLink>
  );
}