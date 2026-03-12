import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [topRisk, setTopRisk] = useState([]);
  const [routeRisk, setRouteRisk] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [riskIndex, setRiskIndex] = useState(0);

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, []);

  async function fetchSummary() {
    const res = await axios.get(`${API}/dashboard-summary`);
    setSummary(res.data);
  }

  async function fetchTransactions() {
    const res = await axios.get(`${API}/transactions?limit=500`);
    const txns = res.data || [];

    if (txns.length === 0) return;

    /* GLOBAL RISK INDEX */

    const avg =
      txns.reduce((sum, t) => sum + (t.final_risk || 0), 0) / txns.length;

    setRiskIndex(avg.toFixed(1));

    /* ROUTE RISK */

    const routeMap = {};

    txns.forEach((t) => {
      const r = t.route || "UNKNOWN";

      if (!routeMap[r]) {
        routeMap[r] = { route: r, total: 0, count: 0 };
      }

      routeMap[r].total += t.final_risk || 0;
      routeMap[r].count++;
    });

    const routeData = Object.values(routeMap)
      .map((r) => ({
        route: r.route,
        risk: r.total / r.count,
      }))
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 8);

    setRouteRisk(routeData);

    /* ALERT FEED */

    const highAlerts = txns
      .filter((t) => t.risk_level === "High")
      .slice(0, 5);

    setAlerts(highAlerts);

    /* TOP RISK */

    const top = [...txns]
      .sort((a, b) => b.final_risk - a.final_risk)
      .slice(0, 10);

    setTopRisk(top);
  }

  if (!summary)
    return <div className="text-gray-400">Loading dashboard...</div>;

  const highPercent = ((summary.high / summary.total) * 100).toFixed(2);

  const riskDistribution = [
    { name: "High", value: summary.high },
    { name: "Medium", value: summary.medium },
    { name: "Low", value: summary.low },
  ];

  const COLORS = ["#ef4444", "#facc15", "#22c55e"];

  return (
    <div className="space-y-10">

      {/* INTELLIGENCE HEADER */}

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl flex justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            Global Trade Risk Intelligence
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            AI-driven anomaly detection across international trade flows
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase">
            Global Risk Index
          </p>

          <p className="text-4xl font-bold text-blue-400">
            {riskIndex}
          </p>

          <p className="text-xs text-gray-500">
            Hybrid AI + Rule + Context scoring
          </p>
        </div>

      </div>

      {/* KPI GRID */}

      <div className="grid grid-cols-4 gap-6">

        <KPI label="Total Transactions" value={summary.total} />

        <KPI
          label="High Risk Alerts"
          value={summary.high}
          color="text-red-400"
          sub={`${highPercent}% flagged`}
        />

        <KPI
          label="Medium Risk Monitoring"
          value={summary.medium}
          color="text-yellow-400"
        />

        <KPI
          label="Safe Trade Volume"
          value={summary.low}
          color="text-green-400"
        />

      </div>

      {/* RISK DISTRIBUTION + ROUTE RISK */}

      <div className="grid grid-cols-2 gap-6">

        {/* RISK DISTRIBUTION */}

        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

          <h2 className="text-lg font-semibold mb-4">
            Risk Distribution
          </h2>

          <div className="h-80 relative">

  <ResponsiveContainer>

    <PieChart>

      <defs>
        <linearGradient id="highRisk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444"/>
          <stop offset="100%" stopColor="#991b1b"/>
        </linearGradient>

        <linearGradient id="medRisk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#facc15"/>
          <stop offset="100%" stopColor="#ca8a04"/>
        </linearGradient>

        <linearGradient id="lowRisk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e"/>
          <stop offset="100%" stopColor="#15803d"/>
        </linearGradient>
      </defs>

      <Pie
        data={riskDistribution}
        dataKey="value"
        innerRadius={85}
        outerRadius={120}
        paddingAngle={3}
        stroke="#0f172a"
        strokeWidth={2}
      >

        <Cell fill="url(#highRisk)" />
        <Cell fill="url(#medRisk)" />
        <Cell fill="url(#lowRisk)" />

      </Pie>

      <Tooltip
        contentStyle={{
          background: "#020617",
          border: "1px solid #1e293b",
          borderRadius: "8px",
          color: "#fff"
        }}
      />

    </PieChart>

  </ResponsiveContainer>


  {/* CENTER METRIC */}

  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

    <p className="text-xs text-gray-400 uppercase">
      Total Trades
    </p>

    <p className="text-3xl font-bold text-white">
      {summary.total}
    </p>

    <p className="text-xs text-gray-500">
      monitored
    </p>

  </div>

</div>
        </div>


        {/* ROUTE RISK */}

        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

          <h2 className="text-lg font-semibold mb-4">
            Risk Concentration by Trade Route
          </h2>

          <div className="h-80">

  <ResponsiveContainer>

    <BarChart data={routeRisk}>

      <defs>
        <linearGradient id="routeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>
      </defs>

      <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" />

      <XAxis
        dataKey="route"
        stroke="#94a3b8"
        tick={{ fontSize: 12 }}
      />

      <YAxis
        stroke="#94a3b8"
        tick={{ fontSize: 12 }}
      />

      <Tooltip
        contentStyle={{
          background: "#0f172a",
          border: "1px solid #1f2937",
          borderRadius: "8px",
          color: "#fff"
        }}
      />

      <Bar
        dataKey="risk"
        fill="url(#routeGradient)"
        radius={[6,6,0,0]}
        barSize={45}
      />

    </BarChart>

  </ResponsiveContainer>

</div>

        </div>

      </div>

      {/* ALERT FEED */}

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

        <h2 className="text-lg font-semibold mb-4">
          🚨 Active Risk Alerts
        </h2>

        {alerts.length === 0 && (
          <p className="text-gray-400 text-sm">
            No high-risk anomalies detected recently
          </p>
        )}

        {alerts.map((a) => (

          <div
            key={a.id}
            onClick={() => navigate(`/transactions/${a.transaction_id}`)}
            className="flex justify-between border-b border-gray-800 py-2 cursor-pointer hover:text-white"
          >

            <span>
              Txn {a.transaction_id} • {a.route}
            </span>

            <span className="text-red-400">
              {a.final_risk.toFixed(2)}
            </span>

          </div>

        ))}

      </div>

      {/* TOP HIGH RISK */}

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

        <h2 className="text-lg font-semibold mb-4">
          🔥 Top High Risk Transactions
        </h2>

        <table className="w-full text-left">

          <thead className="bg-gray-800 text-sm">

            <tr>
              <th className="p-3">Txn ID</th>
              <th>Final Risk</th>
              <th>AI Score</th>
              <th>Context Impact</th>
            </tr>

          </thead>

          <tbody>

            {topRisk.map((txn) => (

              <tr
  key={txn.id}
  onClick={() => navigate(`/transactions/${txn.transaction_id}`)}
  className="border-t border-gray-800 hover:bg-gray-800 cursor-pointer"
>

  <td className="p-3">{txn.transaction_id}</td>

  <td className="text-red-400 font-semibold">
    {txn.final_risk.toFixed(2)}
  </td>

  <td>{txn.ai_score.toFixed(2)}</td>

  <td>{txn.context_adjustment.toFixed(2)}</td>

</tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

function KPI({ label, value, color, sub }) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
      <p className="text-xs text-gray-400 uppercase">{label}</p>
      <p className={`text-2xl font-bold mt-2 ${color || ""}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}