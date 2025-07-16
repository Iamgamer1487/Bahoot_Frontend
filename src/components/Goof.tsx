"use client";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import router from "next/router";

type LeaderboardEntry = {
  rank: number;
  user_name: string;
  score: number;
};

type LeaderboardProps = {
  title?: string;
};

export default function Leaderboard({ title = "Leaderboard" }: LeaderboardProps) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [questionExpired, setQuestionExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  async function fetchGameId() {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/user_game_host/${uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setGameId(data.game_id);
    } catch (err) {
      console.error("failed to fetch game id", err);
    }
  }

  async function fetchLeaderboard(id: string) {
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/leaderboard/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error("failed to load leaderboard", err);
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
          fetchLeaderboard(id); // fetch when it ends
        }
        setTimeLeft(0);
      } else {
        if (questionExpired) {
          setQuestionExpired(false);
        }
        if (data?.time_left != null) {
          setTimeLeft(data.time_left);
        }
      }
    } catch (err) {
      console.error("failed to check question state", err);
    }
  }

  async function nextQuestion() {
    const user = getAuth().currentUser?.uid;
    if (!user) return;
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/next_question/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user }),
      });


    const data = await res.json();

    if (data.message === "Redirect") {
      router.push("/");
      return;
    }


      if (gameId) {
        await checkQuestionState(gameId);
      }
    } catch (err) {
      console.error("failed to call next question", err);
    }
  }


  useEffect(() => {
    fetchGameId();
  }, []);

  useEffect(() => {
    if (!gameId) return;

    checkQuestionState(gameId);
    fetchLeaderboard(gameId);

    const interval = setInterval(() => {
      checkQuestionState(gameId);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen h-auto select-none bg-gradient-to-tr from-sky-800 to-green-600 p-8 flex flex-col justify-between relative">
      {/* next btn + timer */}
      <div className="absolute top-5 left-5 space-y-2 z-50">
        <button
          className={`bg-blue-500 cursor-pointer text-white px-5 py-2 rounded-xl shadow-lg transition-all duration-300 active:scale-95 ${
            questionExpired
              ? "opacity-100 hover:bg-blue-600"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={nextQuestion}
        >
          Next
        </button>
        {!questionExpired && (
          <p className="text-white absolute top-0 left-0 text-nowrap font-bold text-sm opacity-90">
            Time left: {timeLeft}s
          </p>
        )}
      </div>

      {/* leaderboard */}
      <div>
        <h1 className="text-white text-4xl text-center mb-10 drop-shadow-[0_0_10px_#42f5d7]">
          {title}
        </h1>

        <div className="max-w-xl mx-auto px-2">
          <div className="flex justify-between font-bold text-white mb-2 mx-5">
            <span>Rank</span>
            <span>Player</span>
            <span>Score</span>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-white text-center">No players yet.</p>
          ) : (
            leaderboard.map((player) => (
              <div
                key={player.rank}
                className={`flex items-center rounded-2xl mb-4 px-5 py-4 drop-shadow-[0_0_56px_12px_rgba(255,255,255,1)] transition-transform duration-1000 hover:scale-105 ${
                  player.rank === 1
                    ? "bg-yellow-300"
                    : player.rank === 2
                    ? "bg-gray-300"
                    : player.rank === 3
                    ? "bg-yellow-600"
                    : "bg-red-600"
                }`}
              >
                <span className="font-bold text-black flex-1">{player.rank}</span>
                <span className="font-bold text-black text-center flex-1">
                  {player.user_name ?? "error fetching name"}
                </span>
                <span className="font-bold text-black text-right flex-1">
                  {player.score ?? "error fetching score"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

{/* game id */}
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
