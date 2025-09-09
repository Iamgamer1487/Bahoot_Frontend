"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Book, Gamepad2, UserRoundMinus, Power } from "lucide-react";
import { SetSection } from "@/components/question";
import { auth } from "@/libs/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function Sidebar() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerGameId, setPlayerGameId] = useState<string | null>(null);
  const [hostGameId, setHostGameId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid || null;
      setPlayerId(uid);

      if (uid) {
        try {
          // Check if user is a player
          const playerRes = await fetch(`https://backend-bahoot.vercel.app/user_game_player/${uid}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (playerRes.ok) {
            const data = await playerRes.json();
            setPlayerGameId(data.game_id);
          }

          // Check if user is a host
          const hostRes = await fetch(`https://backend-bahoot.vercel.app/user_game_host/${uid}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (hostRes.ok) {
            const data = await hostRes.json();
            setHostGameId(data.game_id);
          }
        } catch (err) {
          console.error("Failed to check game status", err);
        }
      }
    });
    return () => unsub();
  }, []);

  const leaveAllGames = async () => {
    if (!playerId || !playerGameId) return;
    if (!window.confirm("Leave the current game? You will lose your score.")) return;

    try {
      await fetch(`https://backend-bahoot.vercel.app/leave_game/${playerGameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: playerId }),
      });
      setPlayerGameId(null);
    } catch {
      alert("Failed to leave game.");
    }
  };

  const endAllGames = async () => {
    if (!hostGameId) return;
    if (!window.confirm("End your hosted game? This will disconnect all players.")) return;

    try {
      await fetch(`https://backend-bahoot.vercel.app/game_over`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: hostGameId }),
      });
      setHostGameId(null);
    } catch {
      alert("Failed to end game.");
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-6">
      {/* Sets Section */}
      <div>
        <h3 className="text-gray-400 text-sm text-center font-semibold mb-2 px-1">Sets</h3>
        <div className="flex flex-col gap-2">
          <SetSection />
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full cursor-pointer flex justify-center gap-2 items-center py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-[0_4px_0_#1e3a8a] active:shadow-[0_2px_0_#1e3a8a] active:translate-y-[2px] transition"
          >
            <Book />
            Your sets
          </button>
        </div>
      </div>

      {/* Games Section */}
      <div>
        <h3 className="text-gray-400 text-center text-sm font-semibold mb-2 px-1">Games</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push("/game/join")}
            className="w-full flex justify-center gap-2 cursor-pointer items-center py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-[0_4px_0_#1e3a8a] active:shadow-[0_2px_0_#1e3a8a] active:translate-y-[2px] transition"
          >
            <Gamepad2 />
            Join a game
          </button>

          <button
            onClick={leaveAllGames}
            disabled={!playerGameId}
            className={`w-full flex justify-center  gap-2 items-center py-2 rounded-lg ${
              playerGameId
                ? "bg-red-600 hover:bg-red-700 shadow-[0_4px_0_#991b1b] cursor-pointer  active:shadow-[0_2px_0_#991b1b] active:translate-y-[2px]"
                : "bg-red-600 opacity-50 cursor-not-allowed"
            } text-white font-semibold transition`}
          >
            <UserRoundMinus />
            Leave all games
          </button>

          <button
            onClick={endAllGames}
            disabled={!hostGameId}
            className={`w-full flex justify-center gap-2 items-center py-2 rounded-lg ${
              hostGameId
                ? "bg-red-700 hover:bg-red-800 shadow-[0_4px_0_#7f1d1d]  cursor-pointer active:shadow-[0_2px_0_#7f1d1d] active:translate-y-[2px]"
                : "bg-red-700 opacity-50 cursor-not-allowed"
            } text-white font-semibold transition`}
          >
            <Power />
            End all games
          </button>
        </div>
      </div>
    </aside>
  );
}
