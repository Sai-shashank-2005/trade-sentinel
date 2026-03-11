import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function TransactionDetail() {

  const { id } = useParams();
  const [txn, setTxn] = useState(null);

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  async function fetchTransaction() {
    try {
      const res = await axios.get(`${API}/transactions/${id}`);
      setTxn(res.data);
    } catch (err) {
      console.error("Failed to load transaction");
    }
  }

  if (!txn)
    return (
      <div className="text-gray-400 text-sm">
        Loading transaction intelligence...
      </div>
    );

  const confidence = (
    (Math.abs(txn.ai_score) + Math.abs(txn.rule_score)) / 2
  ).toFixed(1);

  return (
    <div className="space-y-8">

      {/* ================= HERO ================= */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl grid grid-cols-3 items-center">

        {/* LEFT */}
        <div className="col-span-2">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Final Risk Score
          </p>

          <p
            className={`text-5xl font-bold mt-2 ${
              txn.risk_level === "High"
                ? "text-red-400"
                : txn.risk_level === "Medium"
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {txn.final_risk?.toFixed(2)}
          </p>

          <span
            className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-medium ${
              txn.risk_level === "High"
                ? "bg-red-500/20 text-red-400"
                : txn.risk_level === "Medium"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-green-500/20 text-green-400"
            }`}
          >
            {txn.risk_level} Risk Classification
          </span>

          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>Transaction ID: {txn.transaction_id}</p>
            <p>
              Processed: {new Date(txn.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="text-right space-y-6 border-l border-gray-800 pl-8">
          <Metric label="AI Score" value={txn.ai_score?.toFixed(2)} />
          <Metric label="Rule Score" value={txn.rule_score?.toFixed(2)} />
          <Metric
            label="Context Adjustment"
            value={txn.context_adjustment?.toFixed(2)}
          />
        </div>
      </div>


      {/* ================= TRADE DATA ================= */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

        <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">
          Trade Intelligence Snapshot
        </p>

        <div className="grid grid-cols-4 gap-6 text-sm">

          <Data label="Date" value={txn.date} />
          <Data label="Importer" value={txn.importer} />
          <Data label="Exporter" value={txn.exporter} />
          <Data label="HS Code" value={txn.hs_code} />

          <Data label="Quantity" value={txn.quantity?.toFixed(2)} />
          <Data label="Unit Price" value={txn.unit_price?.toFixed(2)} />
          <Data label="Total Value" value={txn.total_value?.toFixed(2)} />

          <Data label="Origin Country" value={txn.origin_country} />
          <Data label="Destination Country" value={txn.destination_country} />
          <Data label="Trade Route" value={txn.route} />

          <Data label="Dataset Source" value={txn.dataset_name || "Live Trade"} />
          <Data label="Ingestion Type" value={txn.source} />

        </div>
      </div>


      {/* ================= INTELLIGENCE GRID ================= */}
      <div className="grid grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-6">

          <Card title="Model Contribution">
            <Progress label="AI Influence" value={txn.ai_score} />
            <Progress label="Rule Influence" value={txn.rule_score} />
            <Progress
              label="Context Impact"
              value={Math.abs(txn.context_adjustment)}
            />
          </Card>

          <Card title="Anomaly Signals">
            <Progress label="Price Z-Score" value={txn.price_zscore * 10} />
            <Progress label="Volume Z-Score" value={txn.volume_zscore * 10} />
            <Progress
              label="Route Frequency"
              value={txn.route_frequency * 20}
            />
            <Progress
              label="Counterparty Frequency"
              value={txn.counterparty_frequency * 20}
            />
          </Card>

        </div>


        {/* RIGHT */}
        <div className="space-y-6">

          <Card title="Rule Triggers">
            <Rule label="Price Rule" value={txn.price_rule_triggered} />
            <Rule label="Volume Rule" value={txn.volume_rule_triggered} />
            <Rule label="Route Rule" value={txn.route_rule_triggered} />
            <Rule label="Exporter Rule" value={txn.exporter_rule_triggered} />
          </Card>

          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg text-center">

            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Model Confidence
            </p>

            <p className="text-4xl font-bold mt-3 text-blue-400">
              {confidence}%
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Calibrated hybrid intelligence confidence
            </p>

          </div>

        </div>

      </div>


      {/* ================= EXPLAINABLE AI ================= */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Explainable AI Output
        </p>

        <h2 className="text-lg font-semibold mb-3">
          Automated Risk Interpretation
        </h2>

        <p className="text-gray-400 text-sm leading-relaxed">
          {txn.explanation_text}
        </p>

      </div>

    </div>
  );
}


/* ================= COMPONENTS ================= */

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}


function Card({ title, children }) {
  return (
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}


function Progress({ label, value }) {

  const safe = Math.min(Math.max(value, 0), 100);

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{safe.toFixed(2)}</span>
      </div>

      <div className="w-full bg-gray-800 h-2 rounded-full">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}


function Rule({ label, value }) {
  return (
    <div className="flex justify-between text-sm mb-2">
      <span>{label}</span>
      <span className={value ? "text-red-400" : "text-green-400"}>
        {value ? "Triggered" : "Not Triggered"}
      </span>
    </div>
  );
}


function Data({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm mt-1 font-medium text-gray-200">
        {value || "-"}
      </p>
    </div>
  );
}