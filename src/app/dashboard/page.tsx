"use client";
import React, { useEffect, useState } from "react";
import { GraduationCap, Trash2, PencilLine } from "lucide-react";
import { auth } from "@/libs/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";

interface Set {
  set_id: string;
  set_name: string;
  question_count: number;
}

export default function AllSets() {
  const [sets, setSets] = useState<Set[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [setName, setSetName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const router = useRouter();

  async function fetchSet(uid: string): Promise<Set[]> {
    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/send_set_id/` + uid, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch sets");
        return [];
      }

      const data = await res.json();
      console.log(data.sets);
      console.log(data);
      return data.sets || [];
    } catch (error) {
      console.error("Error fetching sets:", error);
      return [];
    }
  }
const onDeleteSet = async (setId: string) => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this set? This action is irreversible.");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/delete_set/${user.uid}/${setId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Failed to delete set: " + err.error);
        return;
      }
      setSets((prev) => prev.filter((s) => s.set_id !== setId));
      alert("Set deleted.");
    } catch (err) {
      console.error("Error deleting set:", err);
    }
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
      alert("Set not found or access denied");
      return;
    }

    router.push(`/create/set/${setId}`);
  } catch (err) {
    console.error("Error validating set ID:", err);
    alert("Failed to validate set");
  }
};
async function sendPost(set_id: any) {
  if (!user) {
    alert("You must be logged in.");
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
      alert(err.message || res.statusText);
      router.push(`/game/host`);
      return;
    }

    const resData = await res.json();
    const game_id = resData.game_id;
    if (!game_id) {
      alert("No game ID returned from server");
      return;
    }

const questionsRes = await fetch(`https://backend-bahoot.vercel.app/send_questions_game/${user.uid}/${game_id}/${set_id}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});
    if (!questionsRes.ok) {
      const err = await questionsRes.json();
      alert(err.message || questionsRes.statusText);
      return;
    }
    router.push(`/game/host`);

  } catch (e) {
    console.error("Error creating game or sending questions", e);
    alert("Something went wrong");
  }
}

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const fetchedSets = await fetchSet(user.uid);
        setSets(fetchedSets);
        setLoading(false);
      } else {
        setLoading(false);
        alert("You are not logged in. Log in to view your sets.")
        router.push("/");
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

  if (!user) {
    return (
      <div className="bg-slate-950 min-h-screen w-full flex items-center justify-center">
        <p className="text-white">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen w-full p-6">
      <div className="text-center text-3xl text-white font-bold mb-6">
        Your sets
      </div>

      <div className="flex flex-col items-center space-y-4">
          {sets.map((set) => (
    <div key={set.set_id} className="relative bg-slate-800 text-white w-3/4 p-4 rounded-xl shadow-md">
      <h1 className="text-xl font-semibold">{set.set_name}</h1>
      <p className="text-gray-300">Questions: {set.question_count}</p>
      {/* <div className="absolute top-0 right-0 bg-emerald-600 text-white rounded-lg m-2 p-1 px-5">
        Set ID: {set.set_id}
      </div> */}
      <div className="mt-2 w-auto space-x-2 flex">
<button
  className="bg-blue-600 cursor-pointer px-4 py-1 flex gap-1 items-center rounded hover:bg-blue-700 duration-300"
  onClick={() => sendPost(set.set_id)}
>
  <GraduationCap size={18} />
  Host
</button>
<button
  className="flex items-center cursor-pointer gap-1 bg-yellow-600 px-3 py-1 rounded hover:bg-yellow-700 duration-300"
  onClick={() => onEditSet(set.set_id)}
>
  <PencilLine size={18} />
  <span>Edit</span>
</button>

        <button
          className="flex items-center cursor-pointer gap-1 bg-red-600 px-3 py-1 rounded hover:bg-red-700 duration-300"
          onClick={() => onDeleteSet(set.set_id)}
        >
          <Trash2 size={18} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  ))}
        {sets.length === 0 && (
          <div className="text-white text-lg mt-4">No sets found.</div>
        )}
      </div>
    </div>
  );
}
