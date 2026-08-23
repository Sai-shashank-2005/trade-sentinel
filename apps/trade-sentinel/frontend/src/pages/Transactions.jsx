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

    try {

      const offset = (page - 1) * limit;

      const res = await axios.get(`${API}/transactions`, {
        params: {
          search: search || undefined,
          risk_level: riskFilter === "All" ? undefined : riskFilter,
          limit,
          offset
        }
      });

      setTransactions(res.data || []);

    } catch (err) {

      console.error("Transaction load failed", err);

    }

  }

  useEffect(() => {
    loadTransactions();
  }, [page]);

  function runSearch() {
    setPage(1);
    loadTransactions();
  }

  async function handleClearHistory() {
    if (window.confirm("Are you sure you want to delete ALL transaction history? This cannot be undone.")) {
      try {
        await axios.delete(`${API}/transactions`);
        setPage(1);
        loadTransactions();
      } catch (err) {
        console.error("Failed to clear history", err);
        alert("Failed to clear history");
      }
    }
  }

  function riskBadge(level) {

    if (level === "High")
      return "bg-red-500/20 text-red-400";

    if (level === "Medium")
      return "bg-yellow-500/20 text-yellow-400";

    return "bg-green-500/20 text-green-400";

  }

  function contextColor(val) {

    if (val < 0) return "text-green-400";   // context reduced risk
    if (val > 0) return "text-red-400";     // context increased risk
    return "text-gray-300";

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


      {/* SEARCH PANEL */}

      <div className="bg-gray-900 p-6 rounded-2xl flex items-center gap-4 flex-wrap">

        <input
          placeholder="Search transaction ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
          className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 w-80 focus:outline-none focus:border-blue-500"
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
          className="bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded-lg"
        >
          Search
        </button>

        <button
          onClick={handleClearHistory}
          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 transition px-4 py-2 rounded-lg ml-auto"
        >
          Clear History
        </button>


        {/* PAGINATION */}

        <div className="flex items-center gap-3 ml-4">

          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg"
          >
            ◀
          </button>

          <span className="text-gray-400 text-sm">
            Page {page}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg"
          >
            ▶
          </button>

        </div>

      </div>


      {/* TABLE */}

      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg">

        <div className="h-[calc(100vh-320px)] overflow-y-auto">

          <table className="w-full">

            <thead className="bg-gray-800 text-gray-400 text-sm sticky top-0">

              <tr>
                <th className="text-left px-6 py-3">Txn ID</th>
                <th className="text-center px-6 py-3">Risk</th>
                <th className="text-right px-6 py-3">Final Risk</th>
                <th className="text-right px-6 py-3">AI Score</th>
                <th className="text-right px-8 py-3 min-w-[120px]">Context Δ</th>
              </tr>

            </thead>

            <tbody>

              {transactions.map((tx) => (

                <tr
                  key={tx.id}
                  className="border-t border-gray-800 hover:bg-gray-800/60 transition cursor-pointer odd:bg-gray-900 even:bg-gray-900/60"
                  onClick={() => navigate(`/transactions/${tx.transaction_id}`)}
                >

                  {/* TXN ID */}

                  <td className="px-6 py-3 font-mono text-blue-400">
                    {tx.transaction_id}
                  </td>


                  {/* RISK */}

                  <td className="px-6 py-3 text-center">

                    <span
                      className={`px-2 py-1 rounded text-xs ${riskBadge(tx.risk_level)}`}
                    >
                      {tx.risk_level}
                    </span>

                  </td>


                  {/* FINAL RISK */}

                  <td className="px-6 py-3 text-right font-semibold tabular-nums">
                    {tx.final_risk?.toFixed(2)}
                  </td>


                  {/* AI SCORE */}

                  <td className="px-6 py-3 text-right tabular-nums">
                    {tx.ai_score?.toFixed(2)}
                  </td>


                  {/* CONTEXT */}

                  <td
                    className={`px-8 py-3 text-right tabular-nums ${contextColor(
                      tx.context_adjustment
                    )}`}
                  >
                    {tx.context_adjustment > 0 ? "+" : ""}
                    {tx.context_adjustment?.toFixed(2)}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}