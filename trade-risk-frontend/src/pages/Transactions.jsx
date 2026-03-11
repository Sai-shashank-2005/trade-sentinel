import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Transactions() {

  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const [page, setPage] = useState(1);
  const limit = 50;

  async function loadTransactions() {

    const offset = (page - 1) * limit;

    const res = await axios.get(`${API}/transactions`, {
      params: {
        search: search || undefined,
        risk_level: riskFilter,
        limit,
        offset
      }
    });

    setTransactions(res.data);
  }

  useEffect(() => {
    loadTransactions();
  }, [page]);

  function runSearch() {
    setPage(1);
    loadTransactions();
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold">
          Transaction Intelligence Console
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Investigate trades and analyze risk signals
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-gray-900 p-6 rounded-2xl flex items-center gap-4">

        <input
          placeholder="Search transaction ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 w-80"
        />

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700"
        >
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <button
          onClick={runSearch}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg"
        >
          Search
        </button>

        <div className="flex items-center gap-2 ml-6">

          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            className="bg-gray-800 px-3 py-1 rounded-lg"
          >
            ◀
          </button>

          <span className="text-gray-400">
            Page {page}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            className="bg-gray-800 px-3 py-1 rounded-lg"
          >
            ▶
          </button>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-800 text-gray-400 text-sm">

            <tr>
              <th className="text-left px-6 py-3">Txn ID</th>
              <th className="text-left px-6 py-3">Risk</th>
              <th className="text-left px-6 py-3">Final Risk</th>
              <th className="text-left px-6 py-3">AI Score</th>
              <th className="text-left px-6 py-3">Context Δ</th>
            </tr>

          </thead>

          <tbody>

            {transactions.map((tx) => (

              <tr
                key={tx.id}
                className="border-t border-gray-800 hover:bg-gray-800 cursor-pointer"
                onClick={() => navigate(`/transactions/${tx.transaction_id}`)}
              >

                <td className="px-6 py-3">
                  {tx.transaction_id}
                </td>

                <td className="px-6 py-3">

                  <span
                    className={`px-2 py-1 rounded text-xs
                      ${
                        tx.risk_level === "High"
                          ? "bg-red-500/20 text-red-400"
                          : tx.risk_level === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                  >
                    {tx.risk_level}
                  </span>

                </td>

                <td className="px-6 py-3">
                  {tx.final_risk?.toFixed(2)}
                </td>

                <td className="px-6 py-3">
                  {tx.ai_score?.toFixed(2)}
                </td>

                <td className="px-6 py-3">
                  {tx.context_adjustment?.toFixed(2)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}