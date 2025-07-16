"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Leaderboard from "@/components/Goof";
import { auth } from "@/libs/firebase";

export default function StartGameHost() {
  const [user, setUser] = useState<User | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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
      const res = await fetch("https://backend-bahoot.vercel.app/game_players_display_names", {
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
      const res = await fetch(`https://backend-bahoot.vercel.app/start_game/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user?.uid }),
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
      const res = await fetch("https://bahoot.onrender.com/game_over", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId }),
      });
      if (res.ok) {
        window.location.href = "/";
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
    <div className="bg-green-700 min-h-screen w-full">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {!showLeaderboard && (
        <>
          <div className="bg-emerald-500 w-full p-10 text-center">
            <p className="text-black text-5xl font-bold">
              Game ID: {gameId ?? "Loading..."}
            </p>
            {gameId && (
              <button
                className="mt-6 px-8 py-3 rounded-xl cursor-pointer bg-sky-500 hover:bg-sky-600 transition-colors duration-200 font-bold text-black shadow-xl"
                onClick={startGame}
              >
                Start Game
              </button>
            )}
          </div>
          <button
            onClick={deleteGame}
            className="text-black bg-green-300 z-[1000] cursor-pointer absolute left-0 bottom-0 mb-2 ml-2 p-2 rounded-lg text-3xl font-bold hover:bg-green-400 transition-colors duration-200"
          >
            End game
          </button>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 m-10">
            {players.length > 0 ? (
              players.map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="bg-white py-7 px-4 rounded-2xl text-center shadow-2xl"
                >
                  <p className="text-black text-2xl font-bold">{name}</p>
                </div>
              ))
            ) : (
              <p className="text-white col-span-full text-center text-xl">
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
            className="text-black z-[999999] bg-green-300 cursor-pointer absolute left-0 bottom-0 mb-2 ml-2 p-2 rounded-lg text-3xl font-bold hover:bg-green-400 transition-colors duration-200"
          >
            End game
          </button>
          <Leaderboard />
        </>
      )}
    </div>
  );
}
