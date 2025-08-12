"use client";

import React, { JSX, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/libs/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
type QuestionState = {
  question: string;
  options: string[];
  time_left: number;
  answered_count: number;
  total_players: number;
  max_time: number;
  question_expired?: boolean;
  Game_Over?: boolean;
  correct_answer?: string;
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
  // Loader 4: Dots growing and shrinking
  () => (
    <div className="flex items-center justify-center w-full h-full gap-2">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  ),
  // Loader 5: Bars rising and falling (centered)
  () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="flex items-end gap-1">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-2 bg-green-400 rounded-t"
            style={{
              height: "24px",
              animation: "bar-bounce 1s infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes bar-bounce {
          0%,
          100% {
            height: 24px;
          }
          50% {
            height: 53px;
          }
        }
      `}</style>
    </div>
  ),
  // Loader 6: Smooth rotating squares
  () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative w-16 h-16 animate-rotate-smooth">
        {[...Array(4)].map((_, i) => {
          const angle = (i * 360) / 4;
          return (
            <div
              key={i}
              className="absolute w-6 h-6 bg-pink-500 opacity-80"
              style={{
                top: "50%",
                left: "50%",
                marginTop: "-12px",
                marginLeft: "-12px",
                transform: `rotate(${angle}deg) translate(32px)`,
              }}
            />
          );
        })}
        <style jsx>{`
          .animate-rotate-smooth {
            animation: rotate-smooth 1.5s ease-out alternate infinite;
          }
          @keyframes rotate-smooth {
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  ),
  // Loader 7: Ripple effect
  () => (
    <div className="flex items-center justify-center w-full h-full">
      <span className="relative flex h-16 w-16">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-16 w-16 bg-indigo-600"></span>
      </span>
    </div>
  ),
  // Loader 8: Spinning triangles
  () => (
    <div className="flex items-center justify-center w-full h-full">
      <svg
        className="animate-spin-slow"
        width="48"
        height="48"
        viewBox="0 0 48 48"
      >
        <polygon points="24,6 42,42 6,42" fill="#f472b6" />
      </svg>
      <style jsx>{`
        .animate-spin-slow {
          animation: spin-slow 1.8s ease infinite;
        }
        @keyframes spin-slow {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  ),
  // Loader 9: Orbiting dots
  () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative w-16 h-16">
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <div
              key={i}
              className="absolute w-3 h-3 bg-blue-400 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                marginTop: "-6px",
                marginLeft: "-6px",
                transform: `rotate(${angle}deg) translate(32px)`,
                animation: "orbit 1.6s linear infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          );
        })}
        <style jsx>{`
          @keyframes orbit {
            100% {
              transform: rotate(360deg) translate(32px);
            }
          }
        `}</style>
      </div>
    </div>
  ),
  // Loader 10: Colorful fading bars
  () => (
    <div className="flex items-center justify-center w-full h-full gap-1">
      {[
        "bg-red-400",
        "bg-yellow-400",
        "bg-green-400",
        "bg-blue-400",
        "bg-purple-400",
      ].map((color, i) => (
        <div
          key={i}
          className={`w-3 h-10 ${color} rounded animate-fade-bar`}
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style jsx>{`
        .animate-fade-bar {
          animation: fade-bar 1.2s infinite;
        }
        @keyframes fade-bar {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
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
    Game_Over: false,
    correct_answer: undefined,
  });
const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [showLoader, setShowLoader] = useState(false);
  const [randomLoader, setRandomLoader] = useState<JSX.Element | null>(null);
  const [showFeedbackOnTimerEnd, setShowFeedbackOnTimerEnd] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setPlayerId(user?.uid ?? null);
      if (!user?.uid) {
        setInitialLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `https://backend-bahoot.vercel.app/user_game_player/` + user.uid,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ host_id: user.uid }),
          }
        );
        const data = await res.json();
        if (res.ok && data.game_id) setGameId(data.game_id);
        else setFeedback("Game not found.");
      } catch {
        setFeedback("Error getting game.");
      } finally {
        setInitialLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);
  useEffect(() => {
    if (!gameId || !playerId) return;

    const gameRef = doc(db, "games", gameId);
    const unsubSnapshot = onSnapshot(gameRef, async (docSnap) => {
      if (!docSnap.exists()) {
        setFeedback("Game not found or ended.");
        setState({
          question: "",
          options: [],
          time_left: 0,
          answered_count: 0,
          total_players: 0,
          max_time: 0,
          question_expired: true,
          Game_Over: true,
        });
        setIsGameActive(false);
        return;
      }

      const data = docSnap.data() as any;

      const current_q_index = (data["Current Question"] || 1) - 1;
      const questions = data.Questions || [];
      const players = data.players || {};

      const total_players = Object.keys(players).length;
      const game_over = data.Game_Over || false;
      const game_state = data.game_state || false;
      setIsGameActive(game_state);

      const shuffleFlag = data.shuffle ?? false;

      let questionData: QuestionState = {
        question: "",
        options: [],
        time_left: 0,
        answered_count: 0,
        total_players: total_players,
        max_time: 0,
        question_expired: false,
        Game_Over: game_over,
        correct_answer: undefined,
      };

      if (current_q_index >= 0 && current_q_index < questions.length) {
        const currentQuestion = questions[current_q_index];
        const q_answers = data.answers?.[String(current_q_index)] || {};
        const answered_count = Object.keys(q_answers).length;
        const timer = currentQuestion.timer || 20;
        const start_time = data.question_start_time;

        let time_left = timer;
        let question_expired = false;

        if (start_time) {
          const elapsed = Math.max(0, Date.now() / 1000 - parseFloat(start_time));
          time_left = Math.max(0, Math.floor(timer - elapsed));
          question_expired = elapsed >= timer;
        }

        questionData = {
          question: currentQuestion.question || "",
          options: shuffleFlag
            ? [...(currentQuestion.choices || [])].sort(() => Math.random() - 0.5)
            : currentQuestion.choices || [],
          time_left: time_left,
          answered_count: answered_count,
          total_players: total_players,
          max_time: timer,
          question_expired: question_expired,
          Game_Over: game_over,
          correct_answer: currentQuestion.answer,
        };
      }

      const isNewQuestion = questionData.question !== state.question;
      if (isNewQuestion) {
        setAnswered(false);
        setSelectedAnswer(null);
        setShowLoader(false);
        setFeedback("");
        setShowFeedbackOnTimerEnd(false);
      }

      if (
        questionData.question === state.question &&
        questionData.time_left === 0 &&
        !state.question_expired &&
        !showFeedbackOnTimerEnd &&
        answered
      ) {
        setShowLoader(false);
        setShowFeedbackOnTimerEnd(true);
      }

      setState((prevState) => {
        if (
          prevState.question === questionData.question &&
          prevState.time_left === questionData.time_left &&
          prevState.answered_count === questionData.answered_count &&
          prevState.total_players === questionData.total_players &&
          prevState.max_time === questionData.max_time &&
          prevState.question_expired === questionData.question_expired &&
          prevState.Game_Over === questionData.Game_Over
        ) {
          return prevState;
        }
        return questionData;
      });

      if (
        questionData.time_left === 0 &&
        !answered &&
        questionData.max_time > 0 &&
        state.time_left !== questionData.max_time
      ) {
        setAnswered(true);
        setShowLoader(false);
        setFeedback("Time's up! You didn't answer.");

        try {
          await fetch(`https://backend-bahoot.vercel.app/answer/` + gameId, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: playerId,
              answer: null,
              response_time: questionData.max_time,
            }),
          });
        } catch (error) {
          console.error("Error submitting answer:", error);
        }
      }

      try {
        const scoreRes = await fetch(
          `https://backend-bahoot.vercel.app/leaderboard/` + gameId,
          {
            method: "POST",
          }
        );

        const scoreData = await scoreRes.json();
        if (scoreData.leaderboard) {
          const entry = scoreData.leaderboard.find(
            (p: any) => p.user_name === auth.currentUser?.displayName
          );
          if (entry) setScore(entry.score);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    });

    return () => unsubSnapshot();
  }, [gameId, playerId, answered, state.time_left, showFeedbackOnTimerEnd]);

  useEffect(() => {
    if (state.Game_Over) {
     router.push("/game/play/podium");
    }
  }, [state.Game_Over]);

  const handleAnswer = async (option: string) => {
    if (answered || !playerId || !gameId || state.time_left <= 0) return;

    setSelectedAnswer(option);
    setAnswered(true);
    setRandomLoader(loaders[Math.floor(Math.random() * loaders.length)]());
    setShowLoader(true);

    try {
      const res = await fetch(
        `https://backend-bahoot.vercel.app/answer/` + gameId,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: playerId,
            answer: option,
            response_time: state.max_time - state.time_left,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setFeedback(
          data.correct
            ? `✅ Correct! +${data.score_awarded} points`
            : `❌ Wrong! Correct answer: ${state.correct_answer}`
        );
        if (data.correct) setScore((prev) => prev + data.score_awarded);
      } else {
        setFeedback("❌ Failed to submit.");
      }
    } catch {
      setFeedback("❌ Server error.");
    }
  };

  const handleLeave = async () => {
    if (!gameId || !playerId) return;

    const sure = window.confirm(
      "Are you sure you want to leave the game? You will lose your score."
    );
    if (!sure) return;

    try {
      await fetch(`https://backend-bahoot.vercel.app/leave_game/` + gameId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: playerId }),
      });

     router.push("/");
    } catch {
      alert("Failed to leave game.");
    }
  };

  const showOverallLoader = initialLoading || !isGameActive || showLoader;

  return (
    <div className="bg-slate-950 min-h-screen w-full flex flex-col select-none relative">
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
      {showOverallLoader && (
        <div className="absolute top-0 left-0 w-full h-full bg-slate-950 bg-opacity-80 z-50 flex items-center justify-center">
          {initialLoading ? (
            <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent animate-spin rounded-full" />
          ) : !isGameActive ? (
            <div className="text-white text-xl flex items-center flex-col">
              <div className="mb-4 w-24 h-24 flex items-center justify-center">
                {loaders[Math.floor(Math.random() * loaders.length)]()}
              </div>
              <p>Waiting for host to start the game</p>
            </div>
          ) : (
            <>
            <div className="flex flex-center justify-center rounded-full items-center">
              <div className="absolute w-10 h-10 p-13 text-center items-center justify-center flex flex-center rounded-full animate-bounce bg-emerald-600 top-1/2 right-8 text-4xl font-bold">
                <p className="p-3 text-indigo-100">{state.time_left}</p>
              </div>
              {randomLoader}
              </div>
            </>
          )}
        </div>
      )}

      {!showOverallLoader && isGameActive && (
        <>
          <div className="flex justify-between items-center px-8 pt-6 z-10 relative">
            <div className="text-2xl right-0 top-0 absolute mr-3 mt-3 font-bold text-indigo-400">
              Time Left: {state.time_left} seconds
            </div>
            <div className="text-2xl left-0 top-0 absolute mt-3 ml-3 font-bold text-indigo-200">
              Answers: {state.answered_count}
            </div>
          </div>

          <div className="p-3 text-center text-2xl font-bold text-indigo-200 absolute bottom-0 mb-2 right-0">
            <button
              onClick={handleLeave}
              className="rounded-lg p-2 cursor-pointer shadow-lg bg-slate-800 border border-indigo-400 max-w-3xl hover:bg-slate-700 transition-colors duration-200 text-indigo-200 font-semibold"
            >
              Leave Game
            </button>
          </div>

          <div className="bg-slate-800 py-8 px-6 rounded-b-lg shadow-md text-center mt-5 border-b border-indigo-400">
            <p className="font-bold text-5xl text-indigo-100">{state.question}</p>
          </div>

          <div className="flex-grow p-6">
            <div className="grid grid-cols-2 grid-rows-2 gap-6 h-full">
              {state.options.map((option, i) => {
                const color =
                  i === 0
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : i === 1
                    ? "bg-slate-700 hover:bg-slate-800"
                    : i === 2
                    ? "bg-emerald-700 hover:bg-emerald-800"
                    : "bg-orange-500 hover:bg-orange-600";

                const isSelected = selectedAnswer === option;

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option)}
                    disabled={answered || state.time_left === 0}
                    className={`w-full cursor-pointer h-full flex items-center justify-center text-3xl md:text-5xl font-semibold rounded-xl shadow-lg transition-colors duration-200 ${color} ${
                      isSelected ? "ring-4 ring-indigo-300" : ""
                    } ${answered ? "!text-sky-100 opacity-60 !cursor-not-allowed" : "text-white"} min-h-[120px] md:min-h-[180px]`}
                    style={{ fontSize: "2.5rem", padding: "2rem" }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {(showFeedbackOnTimerEnd || (feedback && !answered && state.time_left > 0)) && (
            <div className="text-center pb-6 text-2xl font-bold text-indigo-200">
              {feedback}
            </div>
          )}
        </>
      )}
    </div>
  );
}
