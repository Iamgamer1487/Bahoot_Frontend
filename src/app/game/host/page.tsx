"use client";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Leaderboard from "@/components/lead";
import { auth } from "@/libs/firebase";
import {useRouter} from "next/navigation";
export default function StartGameHost() {
  const [user, setUser] = useState<User | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const router=useRouter();
  async function fetchGameId(uid: string) {
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/user_game_host/${uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host_id: uid }),
      });
      const data = await res.json();
      if (res.ok && data.game_id) setGameId(data.game_id);
    } catch {
      setGameId(null);
    }
  }

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
      }
    } catch {
      setPlayers([]);
    }
  }

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
    const confirmDelete = window.confirm("Are you sure you want to end this game? This action cannot be undone.");
    if (!confirmDelete) return;
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchGameId(u.uid);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!gameId) return;
    fetchPlayerNames(gameId);
    pollingRef.current = setInterval(() => fetchPlayerNames(gameId), 500);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [gameId]);

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

  return (
    <div className="bg-slate-950 min-h-screen w-full relative">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        html, body, div {
          scrollbar-width: none;
        }
        html, body, div {
          -ms-overflow-style: none;
        }
      `}</style>
      {!showLeaderboard && (
        <>
          <div className="bg-slate-800 w-full p-8 md:p-10 text-center border-b border-gray-800">
            <div className="flex flex-col items-center justify-center">
              <button
                onClick={() => {
                  if (gameId) navigator.clipboard.writeText(gameId);
                }}
                className="text-indigo-200 text-3xl md:text-5xl font-black cursor-pointer opacity-90 hover:opacity-100 transition-all active:scale-95 px-4 py-2 rounded-lg border-2 border-indigo-400 bg-slate-900 shadow-lg mb-2"
                aria-label="Copy Game ID"
              >
                Game PIN: {gameId ?? "Loading..."}
              </button>
              <span className="text-xs text-gray-400 mb-2">Click to copy</span>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center mt-4">
              <button
                onClick={() => setShuffleQuestions((prev) => !prev)}
                className={`px-6 py-3 rounded-xl cursor-pointer font-bold shadow-lg text-xs md:text-base ${
                  shuffleQuestions
                    ? "bg-indigo-400 text-black hover:bg-indigo-500 transition-colors duration-200"
                    : "bg-gray-300 text-black hover:bg-gray-400 transition-colors duration-200"
                }`}
                aria-pressed={shuffleQuestions}
                type="button"
                disabled={gameStarted}
              >
                Shuffle questions: {shuffleQuestions ? "On" : "Off"}
              </button>
              <button
                onClick={() => setShuffleAnswers((prev) => !prev)}
                className={`px-6 py-3 rounded-xl cursor-pointer font-bold shadow-lg text-xs md:text-base ${
                  shuffleAnswers
                    ? "bg-indigo-400 text-black hover:bg-indigo-500 transition-colors duration-200"
                    : "bg-gray-300 text-black hover:bg-gray-400 transition-colors duration-200"
                }`}
                aria-pressed={shuffleAnswers}
                type="button"
                disabled={gameStarted}
              >
                Shuffle answers: {shuffleAnswers ? "On" : "Off"}
              </button>
            </div>
            {gameId && (
              <button
                className="mt-6 ml-4 px-8 py-3 rounded-xl cursor-pointer bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200 font-bold text-white shadow-xl text-xs md:text-base"
                onClick={startGame}
              >
                Start Game
              </button>
            )}
          </div>
          <button
            onClick={deleteGame}
            className="text-white bg-emerald-700 shadow-lg z-[1000] cursor-pointer absolute left-0 bottom-0 mb-2 ml-2 p-2 rounded-lg text-xl md:text-3xl font-bold hover:bg-emerald-800 transition-colors duration-200 border border-teal-400"
          >
            End game
          </button>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 m-10">
            {players.length > 0 ? (
              players.map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="bg-slate-900 py-7 px-4 flex items-center justify-center h-full w-full rounded-2xl text-center shadow-2xl border border-indigo-400"
                >
                  <p className="text-indigo-200 text-lg md:text-2xl font-bold">{name}</p>
                </div>
              ))
            ) : (
              <p className="text-indigo-200 col-span-full text-center text-xl">No players connected yet.</p>
            )}
          </div>
        </>
      )}

      {showLeaderboard && (
        <>
          <button
            onClick={deleteGame}
            className="text-white bg-emerald-700 shadow-lg z-[999999] cursor-pointer absolute left-0 bottom-0 mb-2 ml-2 p-2 rounded-lg text-xl md:text-3xl font-bold hover:bg-emerald-800 transition-colors duration-200 border border-teal-400"
          >
            End game
          </button>
          <Leaderboard />
        </>
      )}
    </div>
  );
}
