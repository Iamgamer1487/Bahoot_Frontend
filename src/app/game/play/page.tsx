"use client";
import React, { JSX, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/libs/firebase";

type QuestionState = {
  question: string;
  options: string[];
  time_left: number;
  answered_count: number;
  total_players: number;
  max_time: number;
  question_expired?: boolean;
  Game_Over?: boolean; // ✅ added
};

const loaders = [
  () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent animate-spin rounded-full" />
    </div>
  ),
  () => (
    <div className="flex items-center justify-center gap-2 w-full h-full">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-4 h-4 bg-pink-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  ),
  () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative w-20 h-20">
        {[...Array(6)].map((_, i) => {
          const angle = (i * 360) / 6;
          return (
            <div
              key={i}
              className="absolute w-3 h-3 bg-sky-400 rounded-full animate-ping"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${angle}deg) translate(30px)`,
                transformOrigin: "center",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          );
        })}
      </div>
    </div>
  ),
];

export default function QuestionPage() {
  const [state, setState] = useState<QuestionState>({
    question: "",
    options: [],
    time_left: 0,
    answered_count: 0,
    total_players: 0,
    max_time: 20,
    Game_Over: false, // ✅ initialize
  });

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [showLoader, setShowLoader] = useState(false);
  const [randomLoader, setRandomLoader] = useState<JSX.Element | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setPlayerId(user?.uid ?? null);
      if (!user?.uid) return;

      try {
        const res = await fetch("https://backend-bahoot.vercel.app/user_game_player/" + user.uid, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ host_id: user.uid }),
        });
        const data = await res.json();
        if (res.ok && data.game_id) setGameId(data.game_id);
        else setFeedback("Game not found.");
      } catch {
        setFeedback("Error getting game.");
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!gameId || !playerId) return;

    const fetchState = async () => {
      try {
        const res = await fetch("https://backend-bahoot.vercel.app/get_question_state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ game_id: gameId }),
        });
        const data = await res.json();

        if (!res.ok || !Array.isArray(data.options)) {
          setFeedback("Bad data.");
          return;
        }

        const isNewQuestion = data.question !== state.question;

        if (isNewQuestion) {
          setAnswered(false);
          setSelectedAnswer(null);
          setShowLoader(false);
          setFeedback("");
        }

        setState({
          question: data.question || "",
          options: data.options,
          time_left: data.time_left ?? 0,
          answered_count: data.answered_count ?? 0,
          total_players: data.total_players ?? 0,
          max_time: data.max_time ?? 20,
          question_expired: data.question_expired,
          Game_Over: data.Game_Over,

        });

        if (
          data.max_time === 0 &&
          data.time_left === 0 &&
          !data.question_expired &&
          !answered
        ) {
          setFeedback("Waiting for host...");
          return;
        }

        if (data.time_left === 0 && showLoader) {
          setShowLoader(false);
        }

        if (
          data.time_left === 0 &&
          !answered &&
          data.max_time > 0 &&
          state.time_left !== data.max_time
        ) {
          setAnswered(true);
          setFeedback("Time's up!");

          await fetch("https://backend-bahoot.vercel.app/answer/" + gameId, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: playerId,
              answer: null,
              response_time: data.max_time,
            }),
          });
        }
      } catch {
        setFeedback("Server error.");
      }

      try {
        const scoreRes = await fetch("https://backend-bahoot.vercel.app/leaderboard/" + gameId, {
          method: "POST",
        });
        const scoreData = await scoreRes.json();
        if (scoreData.leaderboard) {
          const entry = scoreData.leaderboard.find(
            (p: any) => p.user_name === auth.currentUser?.displayName
          );
          if (entry) setScore(entry.score);
        }
      } catch {}
    };

    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, [gameId, playerId, answered, showLoader, state.time_left]);

  // ✅ Redirect if Game_Over becomes true
  useEffect(() => {
    if (state.Game_Over) {
      window.location.href = "/game/play/podium";

    }

  }, [state.Game_Over]);

  const handleAnswer = async (option: string) => {
    if (answered || !playerId || !gameId || state.time_left <= 0) return;

    try {
      const res = await fetch("https://backend-bahoot.vercel.app/answer/" + gameId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: playerId,
          answer: option,
          response_time: state.max_time - state.time_left,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setFeedback(
          data.correct
            ? `✅ Correct! +${data.score_awarded} points`
            : `❌ Wrong! Correct answer: ${data.correct_answer}`
        );
        if (data.correct) setScore(prev => prev + data.score_awarded);
      } else {
        setFeedback("❌ Failed to submit.");
      }
    } catch {
      setFeedback("❌ Server error.");
    }

    setSelectedAnswer(option);
    setAnswered(true);
    setRandomLoader(loaders[Math.floor(Math.random() * loaders.length)]());
    setShowLoader(true);
  };

  const handleLeave = async () => {
    if (!gameId || !playerId) return;
    const sure = window.confirm("Are you sure you want to leave the game? You will lose your score.");
    if (!sure) return;

    try {
      await fetch("https://backend-bahoot.vercel.app/leave_game/" + gameId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: playerId }),
      });
      window.location.href = "/";
    } catch {
      alert("Failed to leave game.");
    }
  };

  return (
    <div className="bg-emerald-400 h-screen w-full flex flex-col select-none relative">
      <div className="flex justify-between items-center px-8 pt-6 z-10 relative">
        <div className="text-2xl right-0 top-0 absolute mr-3 mt-3 font-bold text-purple-700">
          Time Left: {state.time_left} seconds
        </div>
        <div className="text-2xl left-0 top-0 absolute mt-3 ml-3 font-bold text-green-700">
          Answers: {state.answered_count}
        </div>
      </div>
      {showLoader && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 z-50">
          <div className="absolute top-6 left-6 text-2xl font-bold text-purple-400">
            Time Left: {state.time_left} seconds
          </div>
          {randomLoader}
        </div>
      )}
      <div className="p-3 text-center text-2xl font-bold text-purple-800 absolute bottom-0 right-0">
        <button
          onClick={handleLeave}
          className="rounded-lg p-2 z-[9222222222222222222222222222222222222229] cursor-pointer shadow-lg bg-lime-300 max-w-3xl hover:bg-lime-400 transition-colors duration-200"
        >
          Leave Game
        </button>
      </div>
      <div className="bg-teal-500 py-8 px-6 rounded-b-lg shadow-md text-center mt-5">
        <p className="font-bold text-5xl">{state.question}</p>
      </div>
      <div className="flex-grow p-6">
        <div className="grid grid-cols-2 grid-rows-2 gap-6 h-full">
          {state.options.map((option, i) => {
            const color =
              i === 0
                ? "bg-purple-600 hover:bg-purple-700"
                : i === 1
                ? "bg-green-600 hover:bg-green-700"
                : i === 2
                ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                : "bg-sky-500 hover:bg-sky-600";

            const isSelected = selectedAnswer === option;

            return (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                disabled={answered || state.time_left === 0}
                className={`w-full h-full flex items-center justify-center text-5xl font-semibold rounded-lg shadow-md transition-colors duration-200
                ${color}
                ${isSelected ? "ring-4 ring-white" : ""}
                ${answered ? "opacity-60 cursor-not-allowed" : "text-white"}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className="text-center pb-6 text-2xl font-bold text-gray-800">
          {feedback}
        </div>
      )}
    </div>
  );
}
