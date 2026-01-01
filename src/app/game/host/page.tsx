"use client";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Settings2 } from "lucide-react";
import Leaderboard from "@/components/lead";
import { auth } from "@/libs/firebase";
import { useRouter } from "next/navigation";

export default function StartGameHost() {
  const [user, setUser] = useState<User | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<{ id: string; nickname: string }[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gamemode, setGamemode] = useState("Default");
  const [showGamemodeUi, setShowGamemodeUi] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const router = useRouter();

  async function fetchPlayerNames(gameId: string) {
    try {
      const res = await fetch(
        `https://backend-bahoot.vercel.app/game_players_display_names`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game_id: gameId }),
        }
      );
      const data = await res.json();

      if (res.ok && data.players) {
        const playerArray = Object.entries(data.players).map(
          ([id, nickname]) => ({
            id,
            nickname: nickname as string,
          })
        );
        setPlayers(playerArray);
      } else {
        setPlayers([]);
      }
    } catch {
      setPlayers([]);
    }
  }

  async function debugFetchPlayers() {
    if (!gameId) return;
    try {
      const res = await fetch(
        `https://backend-bahoot.vercel.app/game_players_display_names`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game_id: gameId }),
        }
      );
      const data = await res.json();
      console.log("Raw players data:", data);
    } catch {}
  }

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) return;

      try {
        const res = await fetch(
          `https://backend-bahoot.vercel.app/user_game_host/${u.uid}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ host_id: u.uid }),
          }
        );
        const data = await res.json();
        if (res.ok && data.game_id) {
          setGameId(data.game_id);
        } else {
          setGameId(null);
        }
      } catch {
        setGameId(null);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!gameId) return;

    fetchPlayerNames(gameId);
    debugFetchPlayers();

    const interval = setInterval(() => {
      fetchPlayerNames(gameId);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://backend-bahoot.vercel.app/game_state_check/${gameId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await res.json();
        if (res.ok && data.Game_state === "true") {
          setShowLeaderboard(true);
        }
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, [gameId]);

  async function startGame() {
    if (!user?.uid || !gameId) return;

    try {
      setGameStarted(true);
      const res = await fetch(
        `https://backend-bahoot.vercel.app/start_game/${gameId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.uid,
            shuffle: shuffleQuestions,
            shuffle_answers: shuffleAnswers,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.question) {
        setShowLeaderboard(true);
      }
    } catch {
      setShowLeaderboard(true);
    }
  }

  async function deleteGame() {
    if (!gameId || !user?.uid) return;
    if (!window.confirm("Are you sure you want to end this game?")) return;

    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/game_over`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId }),
      });
      if (res.ok) router.push("/");
    } catch {
      alert("failed to delete game");
    }
  }

  async function changeGamemode(gameId: String) {
    console.log("Change Gamemode");
  }

  return (
    <div className="bg-slate-950 min-h-screen w-full relative">
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0%);
          }
        }
      `}</style>

      {!showLeaderboard && (
        <>
          <div className="bg-slate-800 w-full p-8 md:p-10 text-center border-b border-gray-800 relative">

            {/* current gamemode left */}
            <h1 className="text-white text-m font-bold absolute top-4 left-4 z-20">
              Current Gamemode: {gamemode}
            </h1>

           {/* settings btn */}
<button
  onClick={() => setShowSettings(true)}
  className="p-3 bg-slate-900 cursor-pointer border border-indigo-400 rounded-xl shadow-[0_4px_0_#312e81] hover:bg-slate-800 active:shadow-[0_2px_0_#312e81] active:translate-y-[2px] transition-all absolute top-4 right-4 z-40"
>
  <Settings2 className="text-white w-6 h-6" />
</button>

{/* sidebar overlay (fixed so no layout glitch) */}
{showSettings && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
    <div className="w-72 h-full bg-slate-900 border-l border-indigo-400 shadow-xl p-6 animate-[slideIn_.25s_ease] relative">

      <h2 className="text-white text-xl font-bold mb-4">Settings</h2>

      <button
        onClick={() => setShowGamemodeUi(true)}
        className="mt-4 px-4 py-2 bg-indigo-500 rounded-lg shadow-[0_4px_0_#312e81] text-white font-bold active:translate-y-[2px]"
      >
        Change Gamemode
      </button>


      <p className="text-gray-300 mt-3 text-sm mb-6">KOOMER</p>

      <button
        onClick={() => setShowSettings(false)}
        className="mt-4 px-4 py-2 bg-indigo-500 rounded-lg shadow-[0_4px_0_#312e81] text-white font-bold active:translate-y-[2px]"
      >
        close
      </button>

    </div>
  </div>
)}
  {showGamemodeUi && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-center items-center">
    <div className="w-96 bg-slate-900 border border-indigo-400 shadow-xl p-6 rounded-xl animate-[slideIn_.25s_ease] relative">
      <h2 className="text-white text-xl font-bold mb-4">Change Gamemode</h2>

      {/* Example gamemode buttons */}
      <button
        onClick={() => { setGamemode("Default"); setShowGamemodeUi(false); }}
        className="mt-2 mr-2 px-4 py-2 bg-indigo-500 rounded-lg shadow-[0_4px_0_#312e81] text-white font-bold active:translate-y-[2px]"
      >
        Default
      </button>

      <button
        onClick={() => { setGamemode("Restaurant Owner"); setShowGamemodeUi(false); }}
        className="mt-2 px-4 py-2 bg-indigo-500 rounded-lg shadow-[0_4px_0_#312e81] text-white font-bold active:translate-y-[2px]"
      >
        Restaurant Owner
      </button>

      <button
        onClick={() => setShowGamemodeUi(false)}
        className="mt-4 px-4 py-2 bg-red-500 rounded-lg shadow-[0_4px_0_#7f1d1d] text-white font-bold active:translate-y-[2px]"
      >
        Close
      </button>
    </div>
  </div>
)}



            <div className="flex flex-col items-center justify-center">
              <button
                onClick={() => gameId && navigator.clipboard.writeText(gameId)}
                className="text-indigo-200 text-3xl md:text-5xl font-black cursor-pointer opacity-90 hover:opacity-100 transition-all active:scale-95 px-4 py-2 rounded-lg border-2 border-indigo-400 bg-slate-900 shadow-[0_4px_0_#312e81] active:shadow-[0_2px_0_#312e81]"
              >
                Game PIN: {gameId ?? "Loading..."}
              </button>
              <span className="text-xs text-gray-400 mb-2">Click to copy</span>
              <span className="text-xs text-gray-400">Players joined: {players.length}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center mt-4">
              <button
                onClick={() => setShuffleQuestions((p) => !p)}
                className={`px-6 py-3 rounded-xl cursor-pointer font-bold text-xs md:text-base transition-all duration-150 ${
                  shuffleQuestions
                    ? "bg-indigo-400 text-black shadow-[0_4px_0_#4338ca]"
                    : "bg-gray-300 text-black shadow-[0_4px_0_#4b5563]"
                }`}
                disabled={gameStarted}
              >
                Shuffle questions: {shuffleQuestions ? "On" : "Off"}
              </button>

              <button
                onClick={() => setShuffleAnswers((p) => !p)}
                className={`px-6 py-3 rounded-xl cursor-pointer font-bold text-xs md:text-base transition-all duration-150 ${
                  shuffleAnswers
                    ? "bg-indigo-400 text-black shadow-[0_4px_0_#4338ca]"
                    : "bg-gray-300 text-black shadow-[0_4px_0_#4b5563]"
                }`}
                disabled={gameStarted}
              >
                Shuffle answers: {shuffleAnswers ? "On" : "Off"}
              </button>
            </div>

            {gameId && (
              <button
                className="mt-6 ml-4 px-8 py-3 rounded-xl cursor-pointer font-bold text-white text-xs md:text-base bg-indigo-500 shadow-[0_4px_0_#3730a3]"
                onClick={startGame}
                disabled={gameStarted || players.length === 0}
              >
                {gameStarted ? "Starting Game..." : `Start Game (${players.length} players)`}
              </button>
            )}
          </div>

          <button
            onClick={deleteGame}
            className="text-white bg-emerald-700 cursor-pointer shadow-[0_4px_0_#065f46] absolute left-0 bottom-0 mb-2 ml-2 p-2 rounded-lg text-xl md:text-3xl font-bold"
          >
            End game
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 m-10">
            {players.length > 0 ? (
              players.map((player) => (
                <div
                  key={player.id}
                  className="bg-slate-900 py-7 px-4 flex items-center justify-center rounded-2xl text-center shadow-2xl border border-indigo-400"
                >
                  <p className="text-indigo-200 text-lg md:text-2xl font-bold">
                    {player.nickname}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-indigo-200 col-span-full text-center text-xl">
                No players yet
              </p>
            )}
          </div>
        </>
      )}

      {showLeaderboard && (
        <>
          <button
            onClick={deleteGame}
            className="absolute left-0 bottom-0 mb-2 ml-2 p-2 text-white bg-emerald-600 border border-teal-400 rounded-lg font-bold"
          >
            End game
          </button>
          <Leaderboard />
        </>
      )}
    </div>
  );
}
