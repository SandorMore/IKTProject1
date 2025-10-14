import { useState } from "react";

function App() {
  return (
    <div className="w-1/3 h-1/2 text-center border-[3px] rounded-sm p-5 justify-self-center self-center">
      <h1 className="">Adatkezelő napló</h1>
      <div className="flex flex-col items-center gap-5 mt-10">
        <button className="border-amber-400 border-[2px] px-3 py-1 w-1/2 rounded-sm hover:bg-amber-400 hover:text-white">
          Bejelentkezés diákként
        </button>
        <button className="border-amber-400 border-[2px] px-3 py-1 w-1/2 rounded-sm hover:bg-amber-400 hover:text-white">
          Bejelentkezés tanárként
        </button>
      </div>
    </div>
  );
}
export default App;
