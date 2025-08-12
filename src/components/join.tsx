import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Join() {
  const [gameId, setGameId] = useState('');
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
        body: JSON.stringify({ player_id: user?.uid }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Joined game!');
        router.push("/game/play");
      } else {
        setMessage('Failed to join game. You seem to be already in a game or the game does not exist.');
      }
    } catch {
      setMessage('Error connecting to server.');
    }
  };

  return (
    <>
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        html, body, div {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
      <form onSubmit={handleSubmit}>
<div className={`
  fixed top-1/2 left-1/2
  transform -translate-x-1/2 -translate-y-1/2
  bg-emerald-600 p-8
  w-[30rem]
  text-center
  shadow-2xl rounded-2xl
  flex flex-col items-center justify-center
  h-auto
`}>

          <p className="font-bold mb-2 text-black text-4xl">Join a game</p>
          <input
            type="text"
            placeholder="Enter Game ID"
            className="w-full p-4 mb-2 text-center text-2xl font-bold border-4 bg-emerald-500 border-slate-700 rounded-lg focus:outline-none focus:border-slate-800 transition-colors duration-200"
            maxLength={7}
            value={gameId}
            onChange={e => setGameId(e.target.value)}
          />
          <button
            type="submit"
            className="bg-slate-800 cursor-pointer text-white font-extrabold text-3xl py-4 px-10 rounded-xl mt-4 shadow-lg hover:bg-slate-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300"
          >
            Go!
          </button>
          {message && <p className="mt-4 text-lg">{message}</p>}
        </div>
      </form>
    </>
  );
}
