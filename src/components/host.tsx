"use client";

import {  onAuthStateChanged, User } from "firebase/auth";
import {auth} from "@/libs/firebase"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Host() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter()
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  async function sendPost() {
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      const res = await fetch("https://backend-bahoot.vercel.app/create_game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "host_id": user.uid,
        }),
      });



      if (!res.ok) {
  const errorData = await res.json();
  alert("Failed to create game: " + (errorData.message || res.statusText));
  alert("Redirecting to hosted game...");

  }
      router.push("/game/host")
    } catch (err) {
      console.error("Failed to create game:", err);
    }
  }

  async function createSet(){
    const res = await fetch(`http://backend-bahoot.vercel.app/make_set/${user?.uid}`, {
      method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
    })

    if (res.ok){
      router.push("/create/set")
    }
  }

  return (
    <div className="bg-emerald-600 p-8 w-120 text-center h-70 shadow-2xl rounded-2xl">
      <p className="font-bold text-black text-4xl"> Create </p>

      <button
        type="button"
        className="bg-slate-800 cursor-pointer text-white font-extrabold text-4xl py-6 px-12 rounded-xl shadow-lg hover:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300 my-6"
        onClick={() => createSet}
      >
        Create a Set
      </button>
    </div>
  );
}
