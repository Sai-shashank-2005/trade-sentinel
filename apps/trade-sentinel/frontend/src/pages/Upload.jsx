import { useState } from "react";
import { uploadCSV } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Upload() {

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleUpload = async () => {

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {

      setLoading(true);
      setStatus("Processing dataset...");

      await uploadCSV(formData);

      setStatus("Dataset successfully analyzed.");

      setTimeout(() => navigate("/"), 1500);

    } catch {

      setStatus("Upload failed. Please verify file format.");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="space-y-10">

      {/* HERO */}

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold">
          Data Ingestion & Risk Analysis
        </h1>

        <p className="text-gray-400 mt-2 text-sm">
          Upload trade transaction datasets for hybrid AI-driven risk evaluation.
        </p>

      </div>


      {/* UPLOAD PANEL */}

      <div className="bg-gray-900 p-8 rounded-2xl shadow-lg space-y-8">

        {/* DRAG ZONE */}

        <label className="border-2 border-dashed border-gray-700 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-gray-800 transition">

          <div className="text-4xl mb-3">
            📂
          </div>

          <p className="text-sm text-gray-400">
            Drag & drop CSV file here or click to select
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Supported format: .csv
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />

        </label>


        {/* FILE PREVIEW */}

        {file && (

          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">

            <div>

              <p className="text-sm font-medium">
                {file.name}
              </p>

              <p className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>

            </div>

            <button
              onClick={() => setFile(null)}
              className="text-xs text-red-400 hover:text-red-500"
            >
              Remove
            </button>

          </div>

        )}


        {/* RUN BUTTON */}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2
            ${
              loading
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.01]"
            }`}
        >

          {loading ? (
            <>
              <span className="animate-spin">⚙️</span>
              Analyzing Dataset...
            </>
          ) : (
            "Run Hybrid Risk Analysis"
          )}

        </button>


        {/* STATUS */}

        {status && (

          <div className="text-sm text-gray-400 border-t border-gray-800 pt-4">

            {status}

            {loading && (

              <div className="w-full bg-gray-800 rounded mt-3 h-2 overflow-hidden">

                <div className="bg-blue-500 h-2 animate-pulse w-full"></div>

              </div>

            )}

          </div>

        )}

      </div>


      {/* PROCESSING INFO */}

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">

        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
          Processing Overview
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">

          <div className="bg-gray-800 p-3 rounded-lg">
            🤖 AI anomaly detection via Isolation Forest
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            📊 Statistical deviation scoring (Z-Score)
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            ⚖ Rule-based compliance validation
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            🔁 Contextual frequency adjustment
          </div>

          <div className="bg-gray-800 p-3 rounded-lg col-span-2">
            🔍 Explainable risk interpretation engine
          </div>

        </div>

      </div>

    </div>

  );
}