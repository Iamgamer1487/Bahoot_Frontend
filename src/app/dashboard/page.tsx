"use client";

import { GraduationCap, Trash2, PencilLine, Gamepad2,Book,} from "lucide-react";
import React, { useEffect, useState } from "react";
import { auth } from "@/libs/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { SetSection } from "@/components/question";
import { Sidebar } from "@/components/sidebar";
interface Set {
  set_id: string;
  set_name: string;
  question_count: number;
}

function CustomDialog({
  title,
  message,
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">{title}</h2>
        </div>
        <div className="px-6 py-6 text-gray-200">{message}</div>
        <div className="px-6 py-4 flex justify-end gap-3 border-t border-slate-700">
          {cancelText && (
            <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-[0_4px_0_#065f46] active:shadow-[0_2px_0_#065f46] active:translate-y-[2px] transition"
            >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AllSets() {
  const [sets, setSets] = useState<Set[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<null | {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>(null);

  const router = useRouter();

  async function fetchSet(uid: string): Promise<Set[]> {
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/send_set_id/${uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.sets || [];
    } catch {
      return [];
    }
  }

  const onDeleteSet = (setId: string) => {
    if (!user) return;
    setDialog({
      title: "Delete Set",
      message: "Are you sure you want to delete this set? This action is irreversible.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        setDialog(null);
        try {
          const res = await fetch(`https://backend-bahoot.vercel.app/delete_set/${user.uid}/${setId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) {
            const err = await res.json();
            setDialog({
              title: "Error",
              message: "Failed to delete set: " + err.error,
              confirmText: "OK",
              onConfirm: () => setDialog(null),
            });
            return;
          }
          setSets((prev) => prev.filter((s) => s.set_id !== setId));
          setDialog({
            title: "Deleted",
            message: "Set deleted successfully.",
            confirmText: "OK",
            onConfirm: () => setDialog(null),
          });
        } catch {
          setDialog({
            title: "Error",
            message: "Error deleting set.",
            confirmText: "OK",
            onConfirm: () => setDialog(null),
          });
        }
      },
    });
  };

  const onEditSet = async (setId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/validate_set_id/${user.uid}/${setId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setDialog({
          title: "Error",
          message: "Set not found or access denied.",
          confirmText: "OK",
          onConfirm: () => setDialog(null),
        });
        return;
      }
      router.push(`/create/set/${setId}`);
    } catch {
      setDialog({
        title: "Error",
        message: "Failed to validate set.",
        confirmText: "OK",
        onConfirm: () => setDialog(null),
      });
    }
  };

  const sendPost = async (set_id: string) => {
    if (!user) {
      setDialog({
        title: "Login Required",
        message: "You must be logged in.",
        confirmText: "OK",
        onConfirm: () => setDialog(null),
      });
      return;
    }
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/create_game/false`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host_id: user.uid }),
      });
      if (!res.ok) {
        const err = await res.json();
        setDialog({
          title: "Error",
          message: err.message || res.statusText,
          confirmText: "OK",
          onConfirm: () => setDialog(null),
        });
        router.push(`/game/host`);
        return;
      }
      const resData = await res.json();
      const game_id = resData.game_id;
      if (!game_id) {
        setDialog({
          title: "Error",
          message: "No game ID returned from server.",
          confirmText: "OK",
          onConfirm: () => setDialog(null),
        });
        return;
      }
      const questionsRes = await fetch(
        `https://backend-bahoot.vercel.app/send_questions_game/${user.uid}/${game_id}/${set_id}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!questionsRes.ok) {
        const err = await questionsRes.json();
        setDialog({
          title: "Error",
          message: err.message || questionsRes.statusText,
          confirmText: "OK",
          onConfirm: () => setDialog(null),
        });
        return;
      }
      router.push(`/game/host`);
    } catch {
      setDialog({
        title: "Error",
        message: "Something went wrong.",
        confirmText: "OK",
        onConfirm: () => setDialog(null),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const fetchedSets = await fetchSet(u.uid);
        setSets(fetchedSets);
        setLoading(false);
      } else {
        setLoading(false);
        setDialog({
          title: "Not Logged In",
          message: "You are not logged in. Log in to view your sets.",
          confirmText: "OK",
          onConfirm: () => router.push("/login"),
        });
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen w-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }
return (
  <div className="bg-slate-950 min-h-screen w-full flex">
    <Sidebar />
    {/* Main content */}
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="text-center text-3xl text-white font-bold mb-6">Your sets</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
  {sets.map((set) => (
    <div
      key={set.set_id}
      className="group bg-slate-800 rounded-xl shadow-lg border border-slate-700 hover:shadow-xl hover:border-emerald-500 transition-all duration-200 p-5 flex flex-col justify-between"
    >
      {/* Card header */}
      <div>
        <h2 className="text-xl font-bold text-white mb-2  transition-colors">
          {set.set_name}
        </h2>
        <p className="text-gray-400 text-sm">
          {set.question_count} {set.question_count === 1 ? "Question" : "Questions"}
        </p>
      </div>

      {/* Card actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => sendPost(set.set_id)}
          className="flex-1 flex items-center cursor-pointer justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-white bg-blue-600 shadow-[0_4px_0_#1e3a8a] active:shadow-[0_2px_0_#1e3a8a] active:translate-y-[2px] hover:bg-blue-700 transition-all duration-150"
        >
          <GraduationCap size={16} />
          Host
        </button>
        <button
          onClick={() => onEditSet(set.set_id)}
          className="flex-1 flex items-center cursor-pointer justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-white bg-amber-500 shadow-[0_4px_0_#b45309] active:shadow-[0_2px_0_#b45309] active:translate-y-[2px] hover:bg-yellow-600 transition-all duration-150"
        >
          <PencilLine size={16} />
          Edit
        </button>
        <button
          onClick={() => onDeleteSet(set.set_id)}
          className="flex-1 flex items-center cursor-pointer justify-center gap-1 px-3 py-2 rounded-lg font-semibold text-white bg-red-600 shadow-[0_4px_0_#991b1b] active:shadow-[0_2px_0_#991b1b] active:translate-y-[2px] hover:bg-red-700 transition-all duration-150"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  ))}

        {sets.length === 0 && (
          <div className="text-white text-lg mt-4">No sets found.</div>
        )}
      </div>
    </main>

    {dialog && (
      <CustomDialog
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.cancelText ? () => setDialog(null) : undefined}
      />
    )}
  </div>
);
}
