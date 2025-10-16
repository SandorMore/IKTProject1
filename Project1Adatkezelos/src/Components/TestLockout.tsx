import React, { useState } from "react";
import axios from "axios";

// 1. Define the Diak (Student) Interface
interface Diak {
  _id: string; // Mongoose ID
  id: string;
  nev: string; // name
  nyelv: string; // language
  anyja_neve: string; // mother's name
  szuletesi_hely: string; // place of birth
  szuletesi_ido: string; // date of birth
  évfolyam: string; // grade/year (Note the 'é' character)
  osztály: string; // class (Note the 'á' character)
  kolis: boolean; // dorm resident
  
  // The structure of the nested 'tantárgyak' object
  tantárgyak: { 
    [subjectName: string]: string[]; // Key (subject) is string, Value (scores) is array of strings
  };
}

function App() {
  // 2. Use the Diak interface for state typing
  const [diakok, setDiakok] = useState<Diak[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiakok = async () => {
    try {
      setLoading(true);
      
      // Axios response type is set to Diak[]
      const res = await axios.get<Diak[]>("http://localhost:5000/api/diakok");
      
      console.log("Fetched data:", res.data);
      setDiakok(res.data);
    } catch (err) {
      console.error("Error fetching diákok:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-gray-800 rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          Diák Adatkezelő
        </h1>

        <button
          onClick={fetchDiakok}
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? "Betöltés..." : "Diákok lekérése"}
        </button>

        <div className="mt-6 space-y-4">
          {diakok.length === 0 && !loading && (
            <p className="text-center text-gray-400">Nincs elérhető adat.</p>
          )}

          {diakok.map((diak) => ( // Removed 'i' since '_id' or 'id' can be a better key
            <div
              key={diak._id || diak.id} // Use a reliable key
              className="p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition"
            >
              <h2 className="text-xl font-semibold text-blue-300">
                {diak.nev}
              </h2>
              <p className="text-gray-300 text-sm mb-2">
                <span className="font-semibold">Nyelv:</span> {diak.nyelv} |{" "}
                <span className="font-semibold">Évfolyam:</span>{" "}
                {/* Access using correct property names defined in the Interface */}
                {diak.évfolyam}.{diak.osztály}
              </p>
              <p className="text-gray-400 text-sm mb-2">
                <span className="font-semibold">Születési hely:</span>{" "}
                {diak.szuletesi_hely} |{" "}
                <span className="font-semibold">Születési idő:</span>{" "}
                {diak.szuletesi_ido}
              </p>

              {/* Tantárgyak */}
              <div className="mt-3">
                <h3 className="font-semibold text-blue-400 mb-2">Tantárgyak:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {diak.tantárgyak &&
                    Object.entries(diak.tantárgyak).map(([tantargy, jegyek]) => (
                      <div
                        key={tantargy}
                        className="bg-gray-800 p-2 rounded-md text-sm"
                      >
                        <p className="font-medium text-blue-300">{tantargy}</p>
                        <p className="text-gray-300">
                          Jegyek: {jegyek.join(", ")}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;