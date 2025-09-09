"use client";
import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { CirclePlus } from "lucide-react";

export function SetSection() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [modalState, setModalState] = useState<"entering" | "visible" | "exiting" | null>(null);
  const [setName, setSetName] = useState("");
  const [isPrivate] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openModal = () => {
    setModalState("entering");
    setTimeout(() => setModalState("visible"), 10); // allow transition to trigger
  };

  const closeModal = () => {
    setModalState("exiting");
    setTimeout(() => setModalState(null), 200); // match transition duration
  };

  async function handleSetCreation() {
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    setIsCreatingSet(true);
    try {
      const res = await fetch(
        `https://backend-bahoot.vercel.app/make_set/${user.uid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_set_name: setName || "Untitled Set",
            private: isPrivate,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || "Failed to create set");
        } catch {
          throw new Error(errorText || "Server returned an error");
        }
      }

      const resData = await res.json();
      const newSetId = resData.set_id || resData.setId || resData.id;
      if (!newSetId) throw new Error("Missing new set id in response");

      router.push(`/create/set/${newSetId}`);
    } catch (err) {
      console.error("Set creation failed:", err);
      alert(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsCreatingSet(false);
      closeModal();
    }
  }

  if (loading) return null;

  return (
    <section className="flex flex-col items-center">
    {user && (
  <button
    type="button"
    onClick={openModal}
    disabled={isCreatingSet}
    className="w-full px-4 py-2 flex justify-center items-center text-center gap-2 cursor-pointer rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-[0_4px_0_#065f46] active:shadow-[0_2px_0_#065f46] active:translate-y-[2px] transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <CirclePlus className="w-5 h-5" />
    {isCreatingSet ? "Creating..." : "Create a set"}
  </button>
)}

      {modalState && (
        <div className="fixed inset-0 z-[98989] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div
            className={`relative bg-gray-900 p-6 rounded-lg border border-gray-700 w-full max-w-md shadow-xl transform transition-all duration-200 ease-in-out
              ${
                modalState === "entering"
                  ? "opacity-0 scale-95"
                  : modalState === "visible"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
          >
            <h3 className="text-white text-xl font-bold mb-4">Create a set</h3>
            <label className="block text-sm text-gray-300 mb-2">
              Set Name:
              <input
                type="text"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-4 focus:ring-teal-300 border-gray-600"
                placeholder="Enter a name for your set"
              />
            </label>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-slate-500 text-white cursor-pointer font-bold rounded-lg shadow-[0_4px_0_#334155] active:shadow-[0_2px_0_#334155] active:translate-y-[2px] transition-all duration-150 hover:bg-slate-700"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-emerald-500 text-white cursor-pointer font-bold rounded-lg shadow-[0_4px_0_#059669] active:shadow-[0_2px_0_#059669] active:translate-y-[2px] transition-all duration-150 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSetCreation}
                disabled={isCreatingSet || !setName.trim()}
              >
                {isCreatingSet ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
