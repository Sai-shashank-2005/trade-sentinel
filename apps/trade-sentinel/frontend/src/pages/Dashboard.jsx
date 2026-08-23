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
  Cell
} from "recharts";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {

  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [topRisk, setTopRisk] = useState([]);
  const [routeRisk, setRouteRisk] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [riskIndex, setRiskIndex] = useState(0);

  useEffect(() => {

    fetchSummary();
    fetchTransactions();

    const interval = setInterval(() => {
      fetchTransactions();
    }, 5000);

    return () => clearInterval(interval);

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

      const r = t.route || "Unknown";

      if (!routeMap[r]) {
        routeMap[r] = { route: r, total: 0, count: 0 };
      }

      routeMap[r].total += t.final_risk || 0;
      routeMap[r].count++;

    });

    const routeData = Object.values(routeMap)
      .map((r) => ({
        route: r.route,
        risk: r.total / r.count
      }))
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 8);

    setRouteRisk(routeData);

    /* LIVE FEED WITH FIXED TIME */

    const now = Date.now();

    const recent = txns.slice(0, 6).map((t, i) => ({
      ...t,
      displayTime: new Date(now - i * 5000).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    }));

    setRecentTransactions(recent);

    /* TOP HIGH RISK */

    const top = [...txns]
      .sort((a, b) => (b.final_risk || 0) - (a.final_risk || 0))
      .slice(0, 10);

    setTopRisk(top);

  }

  if (!summary)
    return <div className="text-gray-400">Loading dashboard...</div>;

  const highPercent = ((summary.high / summary.total) * 100).toFixed(2);

  const riskDistribution = [
    { name: "High", value: summary.high },
    { name: "Medium", value: summary.medium },
    { name: "Low", value: summary.low }
  ];

  const COLORS = ["#ef4444", "#facc15", "#22c55e"];

  function riskColor(level) {
    if (level === "High") return "text-red-400";
    if (level === "Medium") return "text-yellow-400";
    return "text-green-400";
  }

  function contextColor(v) {
    if (v < 0) return "text-green-400";
    if (v > 0) return "text-red-400";
    return "text-gray-300";
  }

  return (

    <div className="space-y-10">

      {/* HEADER */}

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

      {/* CHARTS */}

      <div className="grid grid-cols-3 gap-6">

        {/* PIE */}

        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

          <h2 className="text-lg font-semibold mb-4">
            Risk Distribution
          </h2>

          <div className="h-80 relative">

            <ResponsiveContainer>

              <PieChart>

                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  innerRadius={85}
                  outerRadius={120}
                  paddingAngle={3}
                >

                  {riskDistribution.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <p className="text-xs text-gray-400 uppercase">
                Total Trades
              </p>

              <p className="text-3xl font-bold">
                {summary.total}
              </p>

            </div>

          </div>

        </div>

        {/* ROUTE RISK */}

        <div className="col-span-2 bg-gray-900 p-6 rounded-2xl shadow-lg">

          <h2 className="text-lg font-semibold mb-4">
            Risk Concentration by Trade Route
          </h2>

          <div className="h-96">

            <ResponsiveContainer>

              <BarChart data={routeRisk} margin={{ bottom: 40 }}>

                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

                <XAxis
                  dataKey="route"
                  stroke="#94a3b8"
                  interval={0}
                  tick={{ fontSize: 12 }}
                />

                <YAxis stroke="#94a3b8" />

                <Tooltip
                  formatter={(v) => v.toFixed(2)}
                  labelFormatter={(l) => `Route: ${l}`}
                />

                <Bar
                  dataKey="risk"
                  fill="#3b82f6"
                  radius={[6,6,0,0]}
                  barSize={45}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* LIVE TRADE FEED */}

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

        <h2 className="text-lg font-semibold mb-4">
          ⚡ Live Trade Feed
        </h2>

        {recentTransactions.map((t) => (

          <div
            key={t.id}
            onClick={() => navigate(`/transactions/${t.transaction_id}`)}
            className="flex justify-between items-center border-b border-gray-800 py-2 hover:bg-gray-800/40 cursor-pointer"
          >

            <div className="flex gap-4">

              <span className="text-gray-500 font-mono w-[90px]">
                {t.displayTime}
              </span>

              <span>
                Txn {t.transaction_id} • {t.route}
              </span>

            </div>

            <span className={riskColor(t.risk_level)}>
              {t.risk_level}
            </span>

          </div>

        ))}

      </div>

      {/* TOP HIGH RISK TABLE */}

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

        <h2 className="text-lg font-semibold mb-4">
          🔥 Top High Risk Transactions
        </h2>

        <table className="w-full table-fixed">

          <thead className="bg-gray-800 text-gray-400 text-sm">

            <tr>
              <th className="text-left px-6 py-3">Txn ID</th>
              <th className="text-right px-6 py-3">Final Risk</th>
              <th className="text-right px-6 py-3">AI Score</th>
              <th className="text-right px-6 py-3">Context Impact</th>
            </tr>

          </thead>

          <tbody>

            {topRisk.map((txn) => (

              <tr
                key={txn.id}
                onClick={() => navigate(`/transactions/${txn.transaction_id}`)}
                className="border-t border-gray-800 hover:bg-gray-800 cursor-pointer"
              >

                <td className="px-6 py-3 text-blue-400">
                  {txn.transaction_id}
                </td>

                <td className="px-6 py-3 text-right text-red-400 font-semibold">
                  {(txn.final_risk || 0).toFixed(2)}
                </td>

                <td className="px-6 py-3 text-right">
                  {(txn.ai_score || 0).toFixed(2)}
                </td>

                <td className={`px-6 py-3 text-right ${contextColor(txn.context_adjustment)}`}>
                  {(txn.context_adjustment || 0).toFixed(2)}
                </td>

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

      <p className="text-xs text-gray-400 uppercase">
        {label}
      </p>

      <p className={`text-2xl font-bold mt-2 ${color || ""}`}>
        {value}
      </p>

      {sub && (
        <p className="text-xs text-gray-500 mt-1">
          {sub}
        </p>
      )}

    </div>

  );

}