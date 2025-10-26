import React, { useState } from "react";
import axios from "axios";

// NOTE: Ensure DEFAULT_SUBJECTS matches the array in your backend code!
const DEFAULT_SUBJECTS = ["Magyar", "Matematika", "Történelem", "Angol"];

// 1. Define the Diak (Student) Interface
interface Diak {
  _id: string; 
  id: string;
  nev: string; 
  nyelv: string;
  anyja_neve: string; 
  szuletesi_hely: string;
  szuletesi_ido: string; 
  évfolyam: string; 
  osztály: string; 
  kolis: boolean; 
  tantárgyak: { 
    [subjectName: string]: string[]; 
  };
}

// Interface for form data
interface NewDiakData {
  nev: string;
  nyelv: string;
  anyja_neve: string; 
  szuletesi_ido: string; 
  évfolyam: string;
  osztály: string;
  kolis: boolean;
}

function App() {
  const [diakok, setDiakok] = useState<Diak[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDiak, setSelectedDiak] = useState<Diak | null>(null);

  // NEW STATE: For adding a new mark
  const [newMark, setNewMark] = useState({
    tantargy: DEFAULT_SUBJECTS[0] || '',
    jegy: '1', // Default mark value
  });

  const [newDiakData, setNewDiakData] = useState<NewDiakData>({
    nev: "",
    nyelv: "",
    anyja_neve: "",
    szuletesi_ido: "",
    évfolyam: "",
    osztály: "",
    kolis: false,
  });

  const handleSelectDiak = (diak: Diak) => {
    setSelectedDiak(diak);
    // Reset mark form when opening details
    setNewMark({ tantargy: Object.keys(diak.tantárgyak)[0] || DEFAULT_SUBJECTS[0] || '', jegy: '1' });
  };
  
  const handleCloseDetails = () => {
    setSelectedDiak(null);
  };

  const fetchDiakok = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Diak[]>("http://localhost:5000/api/diakok");
      setDiakok(res.data);
    } catch (err) {
      console.error("Error fetching diákok:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewDiakData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleMarkInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMark(prev => ({ ...prev, [name]: value }));
  };

  const addDiak = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const diakToSend = {
        ...newDiakData,
        id: new Date().getTime().toString(), 
        szuletesi_hely: "N/A",
        // tantárgyak will be initialized on the backend
      };

      const res = await axios.post<Diak>("http://localhost:5000/api/diakok", diakToSend);
      
      setDiakok(prev => [...prev, res.data]);
      setNewDiakData({ nev: "", nyelv: "", anyja_neve: "", szuletesi_ido: "", évfolyam: "", osztály: "", kolis: false });
    } catch (err) {
      console.error("Error adding diák:", err);
    }
  };

  // ⭐️ NEW HANDLER: Function to submit the new mark
  const addMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiak) return;
    
    try {
        const res = await axios.post<Diak>(
            `http://localhost:5000/api/diakok/${selectedDiak._id}/mark`,
            newMark
        );

        const updatedDiak = res.data;

        // 1. Update the main diakok list
        setDiakok(prevDiakok => 
            prevDiakok.map(d => (d._id === updatedDiak._id ? updatedDiak : d))
        );

        // 2. Update the currently displayed selectedDiak
        setSelectedDiak(updatedDiak);

        // Reset the mark input
        setNewMark(prev => ({ ...prev, jegy: '1' })); 

    } catch (err) {
        console.error("Error adding mark:", err);
        alert("Hiba történt a jegy hozzáadásakor.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <div className="max-w-3xl w-full bg-gray-800 rounded-2xl shadow-lg p-6 my-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          Diák Adatkezelő
        </h1>

        {/* --- ADD NEW DIÁK FORM (omitted for brevity, assume it's here) --- */}
        {/* ... */}
        <div className="bg-gray-700 p-4 rounded-xl mb-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-300">Új Diák hozzáadása</h3>
            <form onSubmit={addDiak} className="grid grid-cols-2 gap-4">
                <input type="text" name="nev" value={newDiakData.nev} onChange={handleInputChange} placeholder="Név" required className="p-2 bg-gray-800 rounded text-white" />
                <input type="text" name="anyja_neve" value={newDiakData.anyja_neve} onChange={handleInputChange} placeholder="Anyja neve" required className="p-2 bg-gray-800 rounded text-white" />
                <input type="date" name="szuletesi_ido" value={newDiakData.szuletesi_ido} onChange={handleInputChange} placeholder="Születési idő" required className="p-2 bg-gray-800 rounded text-white" />
                <input type="text" name="nyelv" value={newDiakData.nyelv} onChange={handleInputChange} placeholder="Nyelv" required className="p-2 bg-gray-800 rounded text-white" />
                <input type="text" name="évfolyam" value={newDiakData.évfolyam} onChange={handleInputChange} placeholder="Évfolyam" required className="p-2 bg-gray-800 rounded text-white" />
                <input type="text" name="osztály" value={newDiakData.osztály} onChange={handleInputChange} placeholder="Osztály" required className="p-2 bg-gray-800 rounded text-white" />

                <label className="flex items-center space-x-2 text-gray-300 col-span-2">
                    <input type="checkbox" name="kolis" checked={newDiakData.kolis} onChange={handleInputChange} className="form-checkbox h-5 w-5 text-blue-600 bg-gray-800 rounded" />
                    <span>Kolis (Kollégista)</span>
                </label>
                <button type="submit" className="col-span-2 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition">
                    Diák Mentése
                </button>
            </form>
        </div>
        {/* --- FETCH BUTTON --- */}
        <button
          onClick={fetchDiakok}
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50 mb-6"
        >
          {loading ? "Betöltés..." : "Diákok lekérése"}
        </button>

        {/* --- DIÁK LIST (omitted for brevity, assume it's here) --- */}
        <div className="space-y-4">
          {diakok.length === 0 && !loading && (
            <p className="text-center text-gray-400">Nincs elérhető adat.</p>
          )}
          {diakok.map((diak) => ( 
            <div
              key={diak._id || diak.id}
              className="p-4 bg-gray-700 rounded-xl hover:bg-gray-600 transition"
            >
              <h2 
                className="text-xl font-semibold text-blue-300 cursor-pointer hover:text-blue-200"
                onClick={() => handleSelectDiak(diak)}
              >
                {diak.nev}
              </h2>
              <p className="text-gray-300 text-sm mb-2">
                <span className="font-semibold">Évfolyam:</span> {diak.évfolyam}.{diak.osztály} | 
                <span className="font-semibold ml-2">Nyelv:</span> {diak.nyelv}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐️ DETAILED VIEW / MODAL FOR SELECTED DIAK WITH ADD MARK FORM */}
      {selectedDiak && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-blue-400">
                {selectedDiak.nev} Részletek
              </h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-white text-2xl font-light"
              >
                &times; 
              </button>
            </div>

            {/* General Details (omitted for brevity, assume it's here) */}
            <div className="space-y-3 text-gray-300">
                {/* ... existing general details ... */}
                <p><span className="font-semibold text-blue-300">Anyja neve:</span> {selectedDiak.anyja_neve}</p>
                <p><span className="font-semibold text-blue-300">Születési hely:</span> {selectedDiak.szuletesi_hely}</p>
                <p><span className="font-semibold text-blue-300">Születési idő:</span> {selectedDiak.szuletesi_ido}</p>
            </div>

            {/* Tantárgyak Details */}
            <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="font-semibold text-xl text-blue-400 mb-3">Tantárgyak és Jegyek:</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(selectedDiak.tantárgyak).map(([tantargy, jegyek]) => (
                    <div
                      key={tantargy}
                      className="bg-gray-700 p-3 rounded-lg shadow-inner"
                    >
                      <p className="font-medium text-blue-300">{tantargy}</p>
                      <p className="text-gray-400">Jegyek: {jegyek.join(", ")}</p>
                    </div>
                  ))}
                </div>
            </div>

            {/* ⭐️ NEW: ADD MARK FORM */}
            <div className="mt-6 pt-4 border-t border-gray-700">
                <h3 className="font-semibold text-xl text-green-400 mb-3">Jegy hozzáadása</h3>
                <form onSubmit={addMark} className="grid grid-cols-3 gap-3">
                    <select
                        name="tantargy"
                        value={newMark.tantargy}
                        onChange={handleMarkInputChange}
                        required
                        className="p-2 bg-gray-700 rounded text-white col-span-1"
                    >
                        {/* Use the keys from the selected Diak's tantárgyak object for options */}
                        {Object.keys(selectedDiak.tantárgyak).map(tantargy => (
                            <option key={tantargy} value={tantargy}>{tantargy}</option>
                        ))}
                    </select>

                    <select
                        name="jegy"
                        value={newMark.jegy}
                        onChange={handleMarkInputChange}
                        required
                        className="p-2 bg-gray-700 rounded text-white col-span-1"
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>

                    <button
                        type="submit"
                        className="py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition col-span-1"
                    >
                        Mentés
                    </button>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;