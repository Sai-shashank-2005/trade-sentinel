import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function LiveTrade() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    transaction_id: "",
    date: "",
    importer: "",
    exporter: "",
    hs_code: "",
    quantity: "",
    unit_price: "",
    origin_country: "",
    destination_country: "",
    route: ""
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);

  function updateField(field,value){

    setForm({
      ...form,
      [field]:value
    });

  }

  function randomTrade(){

    const countries=["India","China","Germany","USA","UAE","Brazil"]

    const c1=countries[Math.floor(Math.random()*countries.length)]
    const c2=countries[Math.floor(Math.random()*countries.length)]

    setForm({
      transaction_id:Math.floor(Math.random()*90000)+10000,
      date:"2026-03-12",
      importer:"Importer "+Math.floor(Math.random()*50),
      exporter:"Exporter "+Math.floor(Math.random()*50),
      hs_code:1000+Math.floor(Math.random()*9000),
      quantity:Math.floor(Math.random()*500),
      unit_price:Math.floor(Math.random()*900),
      origin_country:c1,
      destination_country:c2,
      route:`${c1}-${c2}`
    })

  }

  async function submitTrade(){

    try{

      setLoading(true)

      const payload={
        ...form,
        transaction_id:Number(form.transaction_id),
        quantity:Number(form.quantity),
        unit_price:Number(form.unit_price)
      }

      const start=performance.now()

      const res=await axios.post(`${API}/live-trade`,payload)

      const end=performance.now()

      const evaluationTime=(end-start).toFixed(0)

      const timestamp=new Date().toLocaleTimeString()

      setResult({
        id:payload.transaction_id,
        time:evaluationTime,
        timestamp
      })

      setRecentTrades(prev=>[
        {
          id:payload.transaction_id,
          route:payload.route,
          timestamp
        },
        ...prev.slice(0,4)
      ])

    }

    catch(err){

      console.error(err)
      alert("Trade analysis failed")

    }

    setLoading(false)

  }

  return(

    <div className="space-y-10">

      {/* HEADER */}

      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl">

        <h1 className="text-4xl font-bold">
          Live Trade Intelligence Monitor
        </h1>

        <p className="text-gray-400 mt-2 text-sm">
          Inject a trade and evaluate risk in real-time
        </p>

      </div>


      {/* RANDOM TRADE */}

      <button
        onClick={randomTrade}
        className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
      >
        Generate Random Trade
      </button>


      {/* FORM */}

      <div className="grid grid-cols-2 gap-6 bg-gray-900 p-8 rounded-2xl">

        {Object.keys(form).map(key=>(

          <div key={key} className="space-y-2">

            <label className="text-sm text-gray-400">
              {key.replaceAll("_"," ").toUpperCase()}
            </label>

            <input
              value={form[key]}
              onChange={e=>updateField(key,e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />

          </div>

        ))}

      </div>


      {/* ANALYZE BUTTON */}

      <button
        onClick={submitTrade}
        disabled={loading}
        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300
        ${
          loading
          ? "bg-blue-600 animate-pulse"
          : "bg-blue-500 hover:bg-blue-600"
        }`}
      >

        {loading?"Analyzing Trade...":"Analyze Trade"}

      </button>


      {/* RESULT PANEL */}

      {result&&(

        <div className="bg-gray-900 p-6 rounded-2xl space-y-4 border border-blue-500/20 animate-fadeIn">

          <div className="flex items-center gap-2 text-blue-400">

            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>

            <span className="text-sm">
              AI Analysis Engine
            </span>

          </div>

          <h2 className="text-xl font-semibold">
            Analysis Complete
          </h2>

          <p className="text-gray-300">
            Transaction ID: <span className="font-bold">{result.id}</span>
          </p>

          <p className="text-gray-300">
            Evaluation Time: <span className="font-bold">{result.time} ms</span>
          </p>

          <p className="text-gray-300">
            Analyzed At: <span className="font-bold">{result.timestamp}</span>
          </p>

          <button
            onClick={()=>navigate(`/transactions/${result.id}`)}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
          >
            Open Investigation →
          </button>

        </div>

      )}


      {/* RECENT TRADES */}

      {recentTrades.length>0&&(

        <div className="bg-gray-900 p-6 rounded-2xl">

          <h2 className="text-xl font-semibold mb-4">
            Recent Injected Trades
          </h2>

          <div className="space-y-2">

            {recentTrades.map(t=>(

              <div
                key={t.id}
                onClick={()=>navigate(`/transactions/${t.id}`)}
                className="flex justify-between items-center px-4 py-3 rounded-lg border-b border-gray-800 cursor-pointer transition-all duration-150 hover:bg-blue-500/5"
              >

                <span className="text-blue-400 font-medium">
                  Txn {t.id}
                </span>

                <span className="text-gray-400">
                  {t.route}
                </span>

                <span className="text-gray-500 text-sm">
                  {t.timestamp}
                </span>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  )

}