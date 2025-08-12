"use client";
import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export function SetSection() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
      setModalOpen(false);
    }
  }

  async function sendPost() {
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/create_game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host_id: user.uid,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Failed to create game: " + (errorData.message || res.statusText));
      }
      router.push("/game/host");
    } catch (erer) {
      console.error("Failed to create game:", erer);
    }
  }

  if (loading) return null;

  return (
    <section className="flex flex-col items-center">
          {user && (
            <button
              type="button"
              className="bg-emerald-600 text-black cursor-pointer font-semibold text-md px-4 py-2 rounded-lg shadow-lg hover:bg-emerald-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300 ml-4"
              onClick={() => setModalOpen(true)}
              disabled={isCreatingSet}
            >
              {isCreatingSet ? "Creating..." : "Create a Set"}
            </button>
          )}

        <div className="flex flex-col gap-4 items-center">
      </div>
      {modalOpen && (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="relative bg-gray-900 p-6 rounded-lg border border-gray-700 w-full max-w-md shadow-xl">
      <h3 className="text-white text-xl font-bold mb-4">Create a New Set</h3>
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
          className="px-4 py-2 bg-slate-700 text-white cursor-pointer rounded-lg hover:bg-slate-600 duration-300"
          onClick={() => setModalOpen(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-emerald-600 cursor-pointer text-black font-semibold rounded-lg hover:bg-emerald-700 duration-300"
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
