"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/libs/firebase";

export default function Podium() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [winner, setWinner] = useState<{ name: string; score: number } | null>(null);
  const [second, setSecond] = useState<{ name: string; score: number } | null>(null);
  const [third, setThird] = useState<{ name: string; score: number } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setGameId(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchGameId(uid: string) {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`https://bahoot.onrender.com/user_game_player/${uid}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ host_id: uid }), // This body is not actually needed for this route.
        });

        if (!res.ok) throw new Error(`status: ${res.status}`);
        const data = await res.json();

        if (data.game_id) setGameId(data.game_id);
        else setError("User is not in any game.");
      } catch {
        setError("Failed to fetch game data.");
        setGameId(null);
      } finally {
        setLoading(false);
      }
    }

    if (user?.uid) fetchGameId(user.uid);
  }, [user]);

  useEffect(() => {
    if (!gameId) return;

    async function fetchPlace() {
      try {
        const res = await fetch(`https://bahoot.onrender.com/leaderboard/${gameId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          console.error("Failed to fetch leaderboard:", res.status);
          return;
        }

        const data = await res.json();
        const lb = data.leaderboard || [];

        setWinner(lb[0] ? { name: lb[0].user_name, score: lb[0].score } : null);
        setSecond(lb[1] ? { name: lb[1].user_name, score: lb[1].score } : null);
        setThird(lb[2] ? { name: lb[2].user_name, score: lb[2].score } : null);

        console.log("Leaderboard:", lb);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchPlace();
  }, [gameId]);

  if (loading) return <div className="text-white text-center p-20">Loading...</div>;
  if (error) return <div className="text-red-400 text-center p-20">{error}</div>;
  if (!gameId) return <div className="text-white text-center p-20">User is not in any game. Cannot display podium.</div>;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-teal-700 to-emerald-600 flex flex-col items-center">
      <div className="w-full text-center bg-black/40 py-10 shadow-xl">
        <p className="text-5xl font-bold text-white drop-shadow-lg animate-pulse">
          🏆 Podium for Game {gameId}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-end gap-10 mt-24 px-4 w-full max-w-5xl">
        {/* Second Place */}
        <div className="flex-1 text-center bg-gray-300 rounded-2xl shadow-2xl py-10 px-6 h-[200px] animate-bounce">
          <p className="text-2xl font-bold text-gray-800 mb-4">🥈 Second Place</p>
          <p className="text-xl font-bold text-black">
            {second?.name ?? "Waiting..."}
          </p>
          <p className="text-xl font-bold text-black">
            Score: {second?.score ?? "—"}
          </p>
        </div>

        {/* First Place */}
        <div className="flex-1 text-center bg-yellow-300 rounded-2xl shadow-2xl px-6 h-[280px] animate-bounce z-10">
          <p className="pt-12 text-2xl font-bold text-gray-900 mb-4">🥇 First Place</p>
          <p className="text-xl font-bold text-black">
            {winner?.name ?? "Waiting..."}
          </p>
          <p className="text-xl font-bold text-black">
            Score: {winner?.score ?? "—"}
          </p>
        </div>

        {/* Third Place */}
        <div className="flex-1 text-center bg-amber-600 rounded-2xl shadow-2xl py-10 px-6 h-[160px] animate-bounce">
          <p className="text-2xl font-bold text-gray-800 mb-4">🥉 Third Place</p>
          <p className="text-xl font-bold text-black">
            {third?.name ?? "Waiting..."}
          </p>
          <p className="text-xl font-bold text-black">
            Score: {third?.score ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
