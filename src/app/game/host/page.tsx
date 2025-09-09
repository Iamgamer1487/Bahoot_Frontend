"use client";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Leaderboard from "@/components/lead";
import { auth } from "@/libs/firebase";
import { useRouter } from "next/navigation";

export default function StartGameHost() {
  const [user, setUser] = useState<User | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const router = useRouter();

  // Fetch players from backend
  async function fetchPlayerNames(gameId: string) {
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/game_players_display_names`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId }),
      });
      const data = await res.json();
      if (res.ok && data.players) {
        setPlayers(Object.values(data.players) as string[]);
      } else {
        setPlayers([]);
      }
    } catch {
      setPlayers([]);
    }
  }

  // Auth + get gameId
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) return;

      try {
        const res = await fetch(`https://backend-bahoot.vercel.app/user_game_host/${u.uid}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ host_id: u.uid }),
        });
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

  // Poll players
  useEffect(() => {
    if (!gameId) return;
    const interval = setInterval(() => {
      fetchPlayerNames(gameId);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameId]);

  // Poll game state
  useEffect(() => {
    if (!gameId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://backend-bahoot.vercel.app/game_state_check/${gameId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.Game_state === "true") {
          setShowLeaderboard(true);
        }
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, [gameId]);

  async function startGame() {
    try {
      setGameStarted(true);
      const res = await fetch(`https://backend-bahoot.vercel.app/start_game/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.uid,
          shuffle: !!shuffleQuestions,
          shuffle_answers: !!shuffleAnswers,
        }),
      });
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
    if (!window.confirm("Are you sure you want to end this game? This action cannot be undone.")) return;
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/game_over`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId }),
      });
      if (res.ok) {
        router.push("/");
      } else {
        alert("failed to delete game");
      }
    } catch {
      alert("failed to delete game");
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen w-full relative">
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        html, body, div {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      {!showLeaderboard && (
        <>
          <div className="bg-slate-800 w-full p-8 md:p-10 text-center border-b border-gray-800">
            <div className="flex flex-col items-center justify-center">
              <button
                onClick={() => gameId && navigator.clipboard.writeText(gameId)}
                className="text-indigo-200 text-3xl md:text-5xl font-black cursor-pointer opacity-90 hover:opacity-100 transition-all active:scale-95 px-4 py-2 rounded-lg border-2 border-indigo-400 bg-slate-900 shadow-[0_4px_0_#312e81] active:shadow-[0_2px_0_#312e81]"
              >
                Game PIN: {gameId ?? "Loading..."}
              </button>
              <span className="text-xs text-gray-400 mb-2">Click to copy</span>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center mt-4">
              <button
                onClick={() => setShuffleQuestions((prev) => !prev)}
                className={`px-6 py-3 rounded-xl cursor-pointer font-bold text-xs md:text-base transition-all duration-150 ${
                  shuffleQuestions
                    ? "bg-indigo-400 text-black shadow-[0_4px_0_#4338ca] active:shadow-[0_2px_0_#4338ca] active:translate-y-[2px] hover:bg-indigo-500"
                    : "bg-gray-300 text-black shadow-[0_4px_0_#4b5563] active:shadow-[0_2px_0_#4b5563] active:translate-y-[2px] hover:bg-gray-400"
                }`}
                disabled={gameStarted}
              >
                Shuffle questions: {shuffleQuestions ? "On" : "Off"}
              </button>

              <button
                onClick={() => setShuffleAnswers((prev) => !prev)}
                className={`px-6 py-3 rounded-xl cursor-pointer font-bold text-xs md:text-base transition-all duration-150 ${
                  shuffleAnswers
                    ? "bg-indigo-400 text-black shadow-[0_4px_0_#4338ca] active:shadow-[0_2px_0_#4338ca] active:translate-y-[2px] hover:bg-indigo-500"
                    : "bg-gray-300 text-black shadow-[0_4px_0_#4b5563] active:shadow-[0_2px_0_#4b5563] active:translate-y-[2px] hover:bg-gray-400"
                }`}
                disabled={gameStarted}
              >
                Shuffle answers: {shuffleAnswers ? "On" : "Off"}
              </button>
            </div>

            {gameId && (
              <button
                className="mt-6 ml-4 px-8 py-3 rounded-xl cursor-pointer font-bold text-white text-xs md:text-base bg-indigo-500 shadow-[0_4px_0_#3730a3] active:shadow-[0_2px_0_#3730a3] active:translate-y-[2px] hover:bg-indigo-600 transition-all duration-150"
                onClick={startGame}
              >
                Start Game
              </button>
            )}
          </div>

          <button
            onClick={deleteGame}
            className="text-white bg-emerald-700 cursor-pointer shadow-[0_4px_0_#065f46] absolute left-0 bottom-0 mb-2 ml-2 p-2 rounded-lg text-xl md:text-3xl font-bold hover:bg-emerald-800 active:translate-y-[2px] transition-all duration-150 border border-teal-400"
          >
            End game
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 m-10">
            {players.length > 0 ? (
              players.map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="bg-slate-900 py-7 px-4 flex items-center justify-center rounded-2xl text-center shadow-2xl border border-indigo-400"
                >
                  <p className="text-indigo-200 text-lg md:text-2xl font-bold">{name}</p>
                </div>
              ))
            ) : (
                  <p className="text-indigo-200 col-span-full text-center text-xl">
                    No players connected yet.
                  </p>
                )}
              </div>
            </>
          )}

          {showLeaderboard && (
            <>
              <button
                onClick={deleteGame}
                className="absolute left-0 bottom-0 mb-2 z-[402384728] cursor-pointer ml-2 px-4 py-2 md:px-6 md:py-3 text-white text-lg md:text-2xl font-bold bg-emerald-600 border border-teal-400 rounded-lg shadow-[0_4px_0_#065f46] hover:bg-emerald-700 active:shadow-[0_2px_0_#065f46] active:translate-y-[2px] transition-all duration-150"
              >
                End game
              </button>
              <Leaderboard />
            </>
          )}
        </div>
      );
}
