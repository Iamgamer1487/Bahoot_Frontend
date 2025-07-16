
"use client";

import { useEffect, useState } from "react";

export default function Orb() {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 4) % 360);
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  const radius = 40;
  const orbCount = 6;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-32 h-32">
        {[...Array(orbCount)].map((_, i) => {
          const a = ((360 / orbCount) * i + angle) * (Math.PI / 180);
          const x = Math.cos(a) * radius;
          const y = Math.sin(a) * radius;
          return (
            <div
              key={i}
              className="absolute w-4 h-4 bg-purple-500 rounded-full opacity-80"
              style={{
                transform: `translate(${x + 64}px, ${y + 64}px) scale(${
                  1 + Math.sin(a * 2) * 0.3
                })`,
                transition: "transform 0.05s linear",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
