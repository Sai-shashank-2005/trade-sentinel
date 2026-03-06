import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [topRisk, setTopRisk] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
    fetchTopRisk();
  }, []);

  async function fetchSummary() {
    const res = await axios.get(`${API}/dashboard-summary`);
    setSummary(res.data);
  }

  async function fetchTopRisk() {
    const res = await axios.get(
      `${API}/transactions?limit=10&risk_level=High`
    );

    // Ensure topRisk is always an array
    const data = Array.isArray(res.data)
      ? res.data
      : res.data.data || res.data.transactions || [];

    setTopRisk(data);
  }

  if (!summary)
    return <div className="text-gray-400 text-sm">Loading dashboard...</div>;

  const data = [
    { name: "High", value: summary.high },
    { name: "Medium", value: summary.medium },
    { name: "Low", value: summary.low },
  ];

  const COLORS = ["#ef4444", "#facc15", "#22c55e"];

  const highPercent = ((summary.high / summary.total) * 100).toFixed(2);

  return (
    <div className="space-y-10">

      {/* HERO */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold tracking-wide">
          Trade Sentinel AI
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Context-Aware Hybrid Risk Intelligence Engine
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-6">
        <KPI label="Total Transactions" value={summary.total} />
        <KPI
          label="High Risk"
          value={summary.high}
          highlight="red"
          sub={`${highPercent}% of total`}
        />
        <KPI label="Medium Risk" value={summary.medium} highlight="yellow" />
        <KPI label="Low Risk" value={summary.low} highlight="green" />
      </div>

      {/* DONUT + INSIGHTS */}
      <div className="grid grid-cols-2 gap-6 items-start">

        {/* DONUT */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">
            Risk Distribution Overview
          </h2>

          <div className="h-80 relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={85}
                  outerRadius={120}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <Tooltip content={<CustomTooltip total={summary.total} />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-gray-400 uppercase">Total</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg space-y-5">
          <h2 className="text-lg font-semibold">Intelligence Insights</h2>

          <p className="text-gray-400 text-sm">
            Hybrid anomaly detection combined with contextual trade
            behavior enhances precision risk calibration.
          </p>

          <div className="space-y-3 text-sm text-gray-300">
            <Insight text="Hybrid anomaly detection pipeline active" />
            <Insight text="Context-aware calibration reducing false positives" />
            <Insight text="High-risk anomaly cluster detected" />
            <Insight text="Statistical deviation monitoring operational" />
          </div>
        </div>
      </div>

      {/* TOP 10 TABLE */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          🔥 Top 10 High Risk Transactions
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
            {Array.isArray(topRisk) &&
              topRisk.map((txn) => (
                <tr
                  key={txn.transaction_id}
                  onClick={() =>
                    navigate(`/transactions/${txn.transaction_id}`)
                  }
                  className="border-t border-gray-800 hover:bg-gray-800 cursor-pointer transition"
                >
                  <td className="p-3">{txn.transaction_id}</td>
                  <td className="text-red-400 font-semibold">
                    {txn.final_risk?.toFixed(2)}
                  </td>
                  <td>{txn.ai_score?.toFixed(2)}</td>
                  <td>{txn.context_adjustment?.toFixed(2)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

/* KPI */
function KPI({ label, value, highlight, sub }) {
  const color =
    highlight === "red"
      ? "text-red-400"
      : highlight === "yellow"
      ? "text-yellow-400"
      : highlight === "green"
      ? "text-green-400"
      : "text-white";

  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:scale-[1.02] transition-transform">
      <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

/* INSIGHT */
function Insight({ text }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-green-400">✔</span>
      <span>{text}</span>
    </div>
  );
}

/* CUSTOM TOOLTIP */
function CustomTooltip({ active, payload, total }) {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const percent = ((value / total) * 100).toFixed(2);

    return (
      <div className="bg-gray-800 p-3 rounded-lg shadow-lg text-sm border border-gray-700">
        <p className="font-semibold">{payload[0].name}</p>
        <p>{value} transactions</p>
        <p>{percent}% of total</p>
      </div>
    );
  }
  return null;
}