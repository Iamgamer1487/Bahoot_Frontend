// components/Join.tsx
import {  onAuthStateChanged, User } from "firebase/auth";
import {auth} from "@/libs/firebase"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function Join() {
  const [gameId, setGameId] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
    const [user, setUser] = useState<User | null>(null);

    const router = useRouter();
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch(`https://backend-bahoot.vercel.app/join_game/${gameId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "player_id": user?.uid }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Joined game!');
        router.push("/game/play")
      } else {
        setMessage('Failed to join game.');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-sky-100 p-8 w-120 text-center h-70 shadow-2xl rounded-2xl flex flex-col items-center justify-center">
        <p className="font-bold text-black text-4xl"> Join </p>
        <input
          type="text"
          placeholder="Enter Game ID"
          className="w-full p-4 mb-2 text-center text-2xl font-bold border-4 border-gray-300 rounded-lg focus:outline-none focus:border-green-700 transition-colors duration-200"
          maxLength={7}
          value={gameId}
          onChange={e => setGameId(e.target.value)}
        />

        <button
          type="submit"
          className="bg-emerald-700 cursor-pointer text-white font-extrabold text-3xl py-4 px-10 rounded-xl shadow-lg hover:bg-emerald-800 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300"
        >
          Go!
        </button>
        { <p className="mt-4 text-lg"> {message}</p>}
      </div>
    </form>
  );
}
