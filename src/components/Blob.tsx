"use client";

import { useEffect, useState } from "react";

export default function Blob() {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const int = setInterval(() => {
      setPulse((p) => !p);
    }, 800);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div
        className={`w-16 h-16 bg-purple-500 rounded-full blur-md opacity-70 transition-all duration-700 ${
          pulse ? "scale-100" : "scale-125"
        }`}
      >
        <div className="w-full h-full bg-purple-300 rounded-full blur-sm animate-ping" />
      </div>
    </div>
  );
}
