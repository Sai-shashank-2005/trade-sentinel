import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function LiveTrade() {

  const [form, setForm] = useState({
    transaction_id: "",
    hs_code: "",
    quantity: "",
    unit_price: "",
    exporter: "",
    route: ""
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function updateField(field, value) {
    setForm({
      ...form,
      [field]: value
    });
  }

  async function submitTrade() {

    try {

      setLoading(true);

      const payload = {
        transaction_id: Number(form.transaction_id),
        hs_code: Number(form.hs_code),
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
        exporter: form.exporter,
        route: form.route,

        // auto fields
        date: new Date().toISOString(),
        importer: "LiveImporter",
        origin_country: "USA",
        destination_country: "Germany"
      };

      const res = await axios.post(`${API}/live-trade`, payload);

      setResult(res.data);

      alert("Trade analyzed successfully!");

    } catch (err) {

      console.error(err);
      alert("Trade analysis failed");

    }

    setLoading(false);
  }

  return (
    <div className="space-y-10">

      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold">
          Live Trade Intelligence Monitor
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Inject trade data and analyze risk instantly
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 bg-gray-900 p-8 rounded-2xl">

        {Object.keys(form).map((key) => (

          <div key={key} className="space-y-2">

            <label className="text-sm text-gray-400">
              {key.replace("_"," ").toUpperCase()}
            </label>

            <input
              value={form[key]}
              onChange={(e) => updateField(key, e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg"
            />

          </div>

        ))}

      </div>

      <button
        onClick={submitTrade}
        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-semibold"
      >
        {loading ? "Analyzing..." : "Analyze Trade"}
      </button>

      {result && (
        <div className="bg-gray-900 p-6 rounded-2xl">

          <h2 className="text-xl font-semibold mb-2">
            Analysis Result
          </h2>

          <p className="text-gray-300">
            Risk Level: <span className="font-bold">{result.risk}</span>
          </p>

          <p className="text-gray-400 text-sm mt-2">
            Risk Score: {result.score?.toFixed(2)}
          </p>

        </div>
      )}

    </div>
  );
}