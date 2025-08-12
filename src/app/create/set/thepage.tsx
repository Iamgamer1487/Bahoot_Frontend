"use client";
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Switch from "react-switch";
import { AlarmClock, Trash2, PencilLine, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/libs/firebase";
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

export default function Make() {
  const [isTrueFalse, setIsTrueFalse] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [timer, setime] = useState(20);
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<FullQuestion[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(288); // Default width in pixels (w-72 = 288px)
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
    const [user, setUser] = useState<User | null>(null);

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

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);

      });

      return () => unsubscribe();
    }, []);
  const handleSave = async () => {

    const trimmedQuestion = question.trim();
    const trimmedAnswers = answers.map((a) => a.trim());

    const errorToastOptions = {
      style: { background: "#1f2937", color: "#fff" }
    };

    if (trimmedQuestion === "") {
      toast.error("Question cannot be empty.", errorToastOptions);
      return;
    }

    if (!isTrueFalse && trimmedAnswers.some((a) => a === "")) {
      toast.error("All answers must be filled.", errorToastOptions);
      return;
    }

    if (timer > 120) {
      toast.error("Timer must be 2 minutes or less.", errorToastOptions);
      return;
    }

    if (timer === 0) {
      toast.error("Timer cannot be 0 seconds!", errorToastOptions);
      return;
    }

    if (correctIndex == null) {
      toast.error("Please select the correct answer using the circles on the side.", errorToastOptions);
      return;
    }
 const newQ: FullQuestion = {
  question,
  answers: isTrueFalse ? ["True", "False"] : answers,
  correctIndex,
  timer,
  type: isTrueFalse ? "boolean" : "multiple",
  isTrueFalse,
};

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = newQ;
      setQuestions(updated);
    } else {
      setQuestions([...questions, newQ]);
    }

    const payload = {
  question,
  timer,
  type: "multiple",
  choice_1: answers[0],
  choice_2: answers[1],
  choice_3: answers[2],
  choice_4: answers[3],
  answer: answers[correctIndex]
};
    setQuestion("");
    setIsTrueFalse(false);
    setAnswers(["", "", "", ""]);
    setCorrectIndex(null);
    setime(20);
    setEditingIndex(null);
    setIsOpen(false);
  };

  const handleEdit = (index: number) => {
    const q = questions[index];
    setQuestion(q.question);
    setAnswers(q.answers);
    setCorrectIndex(q.correctIndex);
    setime(q.timer);
    setIsTrueFalse(q.isTrueFalse || false);
    setEditingIndex(index);
    setIsOpen(true);
  };

const handleDelete = async (index: number) => {
  const errorToastOptions = {
    style: { background: "#1f2937", color: "#fff" }
  };


  const res = await fetch(`http://127.0.0.1:5000/delete_question/YOUR_SET_ID_HERE`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id: index + 1 })
  });

  if (res.ok) {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    toast.success("Question deleted.", errorToastOptions);
  } else {
    const err = await res.json();
    toast.error(err?.error || "Failed to delete.", errorToastOptions);
  }
};


  return (
    <>
      <Head>
        <meta name="description" content="Make questions" />
      </Head>

      <div className="flex h-screen bg-black text-white">
        <div
          ref={sidebarRef}
          className={`relative bg-gray-900 p-4 overflow-y-auto flex flex-col space-y-4 border-r border-gray-700`}
          style={{ width: `${sidebarWidth}px`, minWidth: collapsed ? '56px' : '150px' }}
        >

          <div
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-500 active:bg-emerald-600 transition-colors"
            onMouseDown={() => setIsResizing(true)}
          />
             <button   onClick={() => {
    const output = {
      Questions: questions.map((q) => ({
        type: q.isTrueFalse ? "boolean" : "multiple",
        question: q.question,
        choices: q.answers,
        answer: q.answers[q.correctIndex ?? 0],
        timer: q.timer,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
  }}className="bg-slate-800 p-3 rounded-lg cursor-pointer justify-center text-center items-center hover:bg-slate-700 transition-all"><p className="text-center items-center justify-center"></p>Save set</button>
          {!collapsed && (
            <>
              <h2 className="text-xl font-bold text-emerald-400">Your Questions</h2>
              {questions.length === 0 && (
                <p className="text-gray-500 text-sm">No questions yet</p>
              )}
              {questions.map((q, i) => (
                <QuestionCard
                  key={i}
                  index={i}
                  question={q}
                  onEdit={() => handleEdit(i)}
                  onDelete={() => handleDelete(i)}
                />
              ))}
            </>
          )}
        </div>

        {/* Main Area */}
        <div className="flex-1 relative flex justify-center items-start pt-12 bg-slate-950">
          <button
            onClick={() => {setIsOpen(true);}}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-4/5 px-6 py-3 cursor-pointer rounded-xl shadow-xl font-bold text-2xl transition-all absolute top-10"
          >
            +
          </button>


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
                        onChange={(e) => setime(Number(e.target.value))}
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
                        onChange={(checked) => setIsTrueFalse(checked)}
                        onColor="#10b981"
                        offColor="#6b7280"
                        checkedIcon={false}
                        uncheckedIcon={false}
                        height={20}
                        width={40}
                        handleDiameter={18}
                        className="react-switch"
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

      <style global jsx>{`
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
        .Toastify__close-button {
          color: white !important;
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
        input[type="radio"]:checked + div {
          border-color: #10b981 !important;
          background-color: #10b981 !important;
        }
        .react-switch {
          vertical-align: middle;
          margin: 0 5px;
        }
      `}</style>

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
        toastClassName="text-white items-center text-center select-none color-white"
      />
    </>
  );
}
