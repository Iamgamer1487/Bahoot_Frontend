"use client";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Switch from "react-switch";
import { AlarmClock, Trash2, PencilLine } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { useParams,useRouter } from "next/navigation";

import "react-toastify/dist/ReactToastify.css";

type FullQuestion = {
  type: "multiple" | "boolean";
  question: string;
  answers: string[];
  correctIndex: number | null;
  timer: number;
  isTrueFalse: boolean;
};

function QuestionCard({
  question,
  index,
  onEdit,
  onDelete,
}: {
  question: FullQuestion;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-3 transition flex justify-between items-center">
      <span className="text-emerald-400 font-semibold">Q{index + 1}:</span>
      <div className="flex items-center gap-2">
        <span className="text-sm truncate max-w-[120px] text-gray-300">
          {question.question || "(no question)"}
        </span>
        <span className="text-xs px-1 py-1 rounded bg-gray-700 text-gray-400">
          {question.isTrueFalse ? "T/F" : "MCQ"}
        </span>
      </div>
      <div className="flex gap-5">
        <PencilLine className="cursor-pointer" onClick={onEdit} />
        <Trash2 className="text-red-500 cursor-pointer" onClick={onDelete} />
      </div>
    </div>
  );
}
const toastOptions = {
  style: { background: "#1f2937", color: "#fff" },
};
export default function EditSetPage() {
  const router=useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<FullQuestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTrueFalse, setIsTrueFalse] = useState(false);
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(25);
  const [question, setQuestion] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(318);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const setId = params?.set_id as string;

  const API_BASE = `https://backend-bahoot.vercel.app`;
  const resetModalState = () => {
    setQuestion("");
    setAnswers(isTrueFalse ? ["True", "False"] : ["", "", "", ""]);
    setCorrectIndex(null);
    setTimer(25);
    setIsTrueFalse(false);
    setEditingIndex(null);
  };

  useEffect(() => {
    setAnswers(isTrueFalse ? ["True", "False"] : ["", "", "", ""]);
    setCorrectIndex(null);
  }, [isTrueFalse]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      const constrainedWidth = Math.max(150, Math.min(newWidth, 500));
      setSidebarWidth(constrainedWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser || !setId) return;

      try {
        const res = await fetch(
          `${API_BASE}/send_question_id/${firebaseUser.uid}/${setId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          toast.error("Failed to load set: " + (errData.error || res.status), toastOptions);
          return;
        }

        const data = await res.json();

        if (!data.questions) {
          toast.error("No questions found", toastOptions);
          return;
        }

        const loaded = data.questions.map((q: any) => ({
          question: q.question,
          answers: q.choices,
          correctIndex: q.choices.indexOf(q.answer),
          timer: q.timer,
          type: q.type,
          isTrueFalse: q.type === "boolean",
        }));

        setQuestions(loaded);
      } catch (err) {
        console.error("load fail", err);
        toast.error("Failed to load set", toastOptions);
      }
    });

    return () => unsubscribe();
  }, [setId]);

  const handleSave = async () => {
    if (question.trim() === "") return toast.error("Question cannot be empty.", toastOptions);
    if (!isTrueFalse && answers.some((a) => a.trim() === "")) return toast.error("All answers must be filled.", toastOptions);
    if (timer < 5 || timer > 120) return toast.error("Timer must be between 5 seconds and 2 minutes.", toastOptions);
    if (correctIndex == null) return toast.error("Please select the correct answer using the circles on the side.", toastOptions);
    if (!user || !setId) return toast.error("Not logged in or invalid set", toastOptions);

    const payload: any = {
      question: question.trim(),
      timer,
      type: isTrueFalse ? "boolean" : "multiple",
      answer: answers[correctIndex],
    };

    if (isTrueFalse) {
      payload.choice_1 = "True";
      payload.choice_2 = "False";
    } else {
      payload.choice_1 = answers[0].trim();
      payload.choice_2 = answers[1].trim();
      payload.choice_3 = answers[2].trim();
      payload.choice_4 = answers[3].trim();
    }

    try {
      let res;

      if (editingIndex !== null) {
        res = await fetch(
          `${API_BASE}/edit_question/${user.uid}/${setId}/${editingIndex + 1}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(`${API_BASE}/save_question/${user.uid}/${setId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error("Failed to save question: " + (errData.error || res.status), toastOptions);
        return;
      }

      const resData = await res.json();

      const newQuestion = {
        question: resData.question.question,
        answers: resData.question.choices,
        correctIndex: resData.question.choices.indexOf(resData.question.answer),
        timer: resData.question.timer,
        type: resData.question.type,
        isTrueFalse: resData.question.type === "boolean",
      };

      if (editingIndex !== null) {
        const updated = [...questions];
        updated[editingIndex] = newQuestion;
        setQuestions(updated);
      } else {
        setQuestions((prev) => [...prev, newQuestion]);
      }

      resetModalState();
      setIsOpen(false);
    } catch (err) {
      console.error("Save error", err);
      toast.error("Error saving question", toastOptions);
    }
  };

  const handleEdit = (index: number) => {
    const q = questions[index];
    setQuestion(q.question);
    setAnswers([...q.answers]);
    setCorrectIndex(q.correctIndex);
    setTimer(q.timer);
    setIsTrueFalse(q.isTrueFalse);
    setEditingIndex(index);
    setIsOpen(true);
  };

  const handleDelete = async (index: number) => {
    if (!user || !setId) return;

    try {
      const res = await fetch(`${API_BASE}/delete_question/${user.uid}/${setId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: index + 1 }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error("Failed to delete: " + (data.error || res.status), toastOptions);
        return;
      }

      setQuestions((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Delete error", err);
      toast.error("Error deleting question", toastOptions);
    }
  };

  return (
    <>
          <style jsx global>{`
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        /* Hide scrollbar for Firefox */
        html, body, div {
          scrollbar-width: none;
        }
        /* Hide scrollbar for IE, Edge */
        html, body, div {
          -ms-overflow-style: none;
        }
      `}</style>
      <div className="flex h-screen select-none bg-black text-white">
        <div
          ref={sidebarRef}
          className="relative bg-gray-900 p-4 overflow-y-auto flex flex-col space-y-4 border-r border-gray-700"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-500"
            onMouseDown={() => setIsResizing(true)}
          />

          <h2 className="text-xl font-bold text-emerald-400">Your Questions</h2>
          {questions.length === 0 && <p className="text-gray-500 text-sm">No questions yet</p>}
          {questions.map((q, i) => (
            <QuestionCard key={i} index={i} question={q} onEdit={() => handleEdit(i)} onDelete={() => handleDelete(i)} />
          ))}
        </div>
            {/* main area */}
        <div className="flex-1 relative flex flex-col justify-start items-center pt-12 bg-slate-950">
          <button
            onClick={() => {
              resetModalState();
              setIsOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-4/5 px-6 py-3 cursor-pointer rounded-xl shadow-xl font-bold text-2xl transition-all absolute top-10"
          >
            +
          </button>

          {!isOpen && (
            <><p className="text-gray-400 text-lg mt-20 select-none px-6 max-w-xl text-center">
              Select a question from the left to edit or press the + button to add a new question.</p>
            <button
  className="absolute bg-emerald-700 p-3 px-4 rounded-lg cursor-pointer m-2 hover:bg-emerald-800 transition-all right-0 bottom-0"
  onClick={() => {
    toast.success("Set saved successfully!", toastOptions);
    router.push("/dashboard");
  }}
>
  Save set
</button></>
          )}

          {isOpen && (
            <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
              <div className="bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in overflow-hidden">
                <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    {editingIndex !== null ? "Edit Question" : "Add a Question"}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                      <AlarmClock size={20} />
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={timer}
                        onChange={(e) => setTimer(Number(e.target.value))}
                        className="w-14 bg-gray-800 border border-gray-600 text-white px-2 py-1 rounded focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-white text-3xl cursor-pointer hover:text-gray-300"
                    >
                      &times;
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full text-lg px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 focus:outline-none"
                  />
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-800 rounded-lg">
                    <label className="text-gray-300 font-medium">Question Type:</label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">Multiple Choice</span>
                      <Switch
                        checked={isTrueFalse}
                        onChange={setIsTrueFalse}
                        onColor="#10b981"
                        offColor="#6b7280"
                        checkedIcon={false}
                        uncheckedIcon={false}
                        height={20}
                        width={40}
                        handleDiameter={18}
                      />
                      <span className="text-sm text-gray-400">True/False</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {answers.map((ans, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                          correctIndex === i
                            ? "border-emerald-500 bg-emerald-900/30"
                            : "border-gray-600 bg-gray-800"
                        } transition`}
                      >
                        <label className="flex items-center gap-3 w-full cursor-pointer">
                          <div className="relative">
                            <input
                              type="radio"
                              name="correct"
                              checked={correctIndex === i}
                              onChange={() => setCorrectIndex(i)}
                              className="absolute opacity-0 w-0 h-0"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                correctIndex === i
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-gray-400"
                              }`}
                            >
                              {correctIndex === i && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                          {isTrueFalse ? (
                            <span
                              className={`flex-1 font-medium ${
                                ans === "True" ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {ans}
                            </span>
                          ) : (
                            <input
                              type="text"
                              placeholder={`Option ${i + 1}`}
                              value={ans}
                              onChange={(e) => {
                                const updated = [...answers];
                                updated[i] = e.target.value;
                                setAnswers(updated);
                              }}
                              className="flex-1 bg-transparent border-none focus:outline-none text-white"
                            />
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 p-4 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3301}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="text-white items-center text-center select-none"
      />

      <style jsx global>{`
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out;
        }
        .Toastify__toast {
          background-color: #1f2937 !important;
          color: #fff !important;
        }
        .Toastify__close-button,
        .Toastify__close-button:hover,
        .Toastify__close-button:focus {
          color: white !important;
        }
        .Toastify__close-button svg {
          stroke: white !important;
          fill: white !important;
        }
      `}</style>
    </>
  );
}
