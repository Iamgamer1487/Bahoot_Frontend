"use client";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const [gameId, setGameId] = useState("");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.7,
      dy: (Math.random() - 0.5) * 0.7,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,255,180,0.8)";
      ctx.shadowColor = "rgba(0,255,180,0.9)";
      ctx.shadowBlur = 8;
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx = -p.dx;
        if (p.y < 0 || p.y > h) p.dy = -p.dy;
      });
      requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
const handleJoin = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage("");
  setLoading(true);

  try {
    const res = await fetch(`https://backend-bahoot.vercel.app/join_game/${gameId.trim()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player_id: user?.uid,
        nickname: nickname.trim(),
      }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push("/game/play");
    } else {
      setMessage(data.message || data.error || "Failed to join game.");
    }
  } catch {
    setMessage("Game not found.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <form
        onSubmit={handleJoin}
        className="relative z-10 bg-emerald-700 p-10 w-full max-w-2xl text-center rounded-2xl flex flex-col items-center justify-center shadow-2xl border-4 border-emerald-500"
      >
        <h1 className="font-extrabold mb-8 text-white text-5xl">Join a Game</h1>

        <input
          type="text"
          placeholder="Enter Game ID"
          className="w-full p-6 mb-6 text-center text-3xl font-bold border-4 bg-emerald-500 border-slate-900 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-4 focus:ring-slate-900 transition-all duration-200 text-white placeholder-white/80"
          maxLength={7}
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Nickname"
          className="w-full p-6 mb-6 text-center text-3xl font-bold border-4 bg-emerald-500 border-slate-900 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-4 focus:ring-slate-900 transition-all duration-200 text-white placeholder-white/80"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading || !gameId.trim() || !nickname.trim()}
          className="bg-slate-900 w-full cursor-pointer text-white font-extrabold text-3xl py-4 rounded-xl shadow-[0_6px_0_#1e293b] active:shadow-[0_3px_0_#1e293b] active:translate-y-[3px] hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join Game"}
        </button>

        {message && <p className="mt-6 text-lg font-semibold text-white">{message}</p>}
      </form>
    </div>
  );
}
