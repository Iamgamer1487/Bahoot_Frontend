"use client";
import { useEffect, useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import router from "next/router";
import { motion } from "framer-motion";

type LeaderboardEntry = {
  rank: number;
  user_name: string;
  score: number;
  uid?: string;
};

type LeaderboardProps = {
  title?: string;
};

export default function Leaderboard({ title = "Leaderboard" }: LeaderboardProps) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [questionExpired, setQuestionExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});

  const prevLbRef = useRef<LeaderboardEntry[]>([]);

  async function fetchGameId() {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/user_game_host/${uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.game_id) setGameId(data.game_id);
    } catch (err) {
      console.error("failed to fetch game id", err);
    }
  }

  async function fetchNicknames(id: string) {
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/game_players_display_names`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: id }), // Send game_id in the body
      });
      const data = await res.json();
      if (data.players) {
        setNicknames(data.players || {});
      }
    } catch (err) {
      console.error("failed to fetch nicknames", err);
    }
  }

  async function fetchLeaderboard(id: string) {
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/leaderboard/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      let lb: LeaderboardEntry[] = data.leaderboard || [];

      // Map nicknames to leaderboard entries
      lb = lb.map((entry) => ({
        ...entry,
        user_name: nicknames[entry.uid ?? ""] || entry.user_name || "Unnamed",
      }));

      prevLbRef.current = leaderboard;
      setLeaderboard(lb);
    } catch (err) {
      console.error("failed to fetch leaderboard", err);
    }
  }

  async function checkQuestionState(id: string) {
    try {
      const res = await fetch("https://backend-bahoot.vercel.app/get_question_state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: id }),
      });
      const data = await res.json();

      if (data?.question_expired) {
        if (!questionExpired) {
          setQuestionExpired(true);
          fetchLeaderboard(id); // update leaderboard at question end
        }
        setTimeLeft(0);
      } else {
        if (questionExpired) setQuestionExpired(false);
        if (data?.time_left != null) setTimeLeft(data.time_left);
      }
    } catch (err) {
      console.error("failed to check question state", err);
    }
  }

  async function nextQuestion() {
    const user = getAuth().currentUser?.uid;
    if (!user || !gameId) return;
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/next_question/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user }),
      });
      const data = await res.json();
      if (data.Game_Over === true) {
        router.push("/game/play/podium");
        return;
      }
      await checkQuestionState(gameId);
    } catch (err) {
      console.error("failed to call next question", err);
    }
  }

  useEffect(() => {
    fetchGameId();
  }, []);

  // Update leaderboard when nicknames change
  useEffect(() => {
    if (gameId && Object.keys(nicknames).length > 0) {
      fetchLeaderboard(gameId);
    }
  }, [nicknames, gameId]);

  // polling nicknames & question state every 2s
  useEffect(() => {
    if (!gameId) return;

    fetchNicknames(gameId);
    checkQuestionState(gameId);

    const interval = setInterval(() => {
      fetchNicknames(gameId);
      checkQuestionState(gameId);
    }, 2000);

    return () => clearInterval(interval);
  }, [gameId]);

  // timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen h-auto select-none bg-slate-950 from-sky-800 to-green-600 p-8 flex flex-col justify-between relative">
      <div className="absolute top-5 left-5 space-y-2 z-50">
        {questionExpired && (
          <motion.button
            key="next-btn"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="px-5 py-2 rounded-lg font-semibold text-white cursor-pointer transition-all duration-150
              shadow-[0_4px_0_#065f46] active:shadow-[0_2px_0_#065f46] active:translate-y-[2px]
              bg-emerald-600 hover:bg-emerald-700"
            onClick={nextQuestion}
          >
            Next
          </motion.button>
        )}

        {!questionExpired && (
          <p className="text-indigo-100 absolute top-0 left-0 text-nowrap font-bold text-sm opacity-90">
            Time left: {timeLeft}s
          </p>
        )}
      </div>

      <div>
        <h1 className="text-white text-4xl text-center mb-10 drop-shadow-[0_0_1px_#42f5d7]">{title}</h1>

        <div className="max-w-xl mx-auto px-2">
          <div className="flex justify-between font-bold text-white mb-2 mx-5">
            <span>Rank</span>
            <span>Player</span>
            <span>Score</span>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-white text-center">No players yet.</p>
          ) : (
            <div>
              {leaderboard.map((player) => (
                <motion.div
                  key={player.uid ?? player.rank}
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  className={`flex items-center rounded-2xl mb-4 px-5 py-4 drop-shadow-[0_0_56px_12px_rgba(255,255,255,1)] hover:scale-105 transition-transform duration-300 ${
                    player.rank === 1
                      ? "bg-yellow-300"
                      : player.rank === 2
                      ? "bg-gray-300"
                      : player.rank === 3
                      ? "bg-yellow-600"
                      : "bg-emerald-600"
                  }`}
                >
                  <span className="font-bold text-black flex-1">{player.rank}</span>
                  <span className="font-bold text-black text-center flex-1">{player.user_name ?? "Unnamed"}</span>
                  <span className="font-bold text-black text-right flex-1">{player.score ?? "?"}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-0 right-0 mt-3 mr-3 group select-none z-50">
        <button
          onClick={() => {
            if (gameId) navigator.clipboard.writeText(gameId);
          }}
          className="text-white text-md cursor-pointer opacity-80 hover:opacity-100 transition-all active:scale-95"
        >
          Game ID: {gameId ?? "Loading..."}
        </button>
        <div className="absolute top-full right-0 mt-1 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Click to copy
        </div>
      </div>
    </div>
  );
}
