"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/libs/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogIn} from "lucide-react";
import PieChartComponent from "@/components/compPieChart"
import Link from "next/link";
export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("#avatar-btn")
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlesignin = () => router.push("/login");
  const dash = () => router.push("/dashboard");
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <div
      className="bg-slate-950 min-h-screen relative"
      style={{
        overflow: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
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

      {/* Nav Bar */}
      <div className="w-full bg-slate-800 px-2 py-1 flex items-center justify-between border-b border-gray-800 fixed top-0 left-0 z-40 h-16 md:h-20">
        <h1 className="text-3xl md:text-5xl p-2 ml-0 text-white font-black">Bahoot</h1>
{/*
                      <button
              onClick={handlesignin}
              className="bg-emerald-600 p-1 md:p-2 mr-1 flex relative left-0 items-center text-indigo-50 cursor-pointer font-semibold px-2 py-1 md:px-4 md:py-2 rounded-lg hover:bg-emerald-700 transition text-xs md:text-base"
            >
              <div className="mr-1"><Gamepad /></div>
              Join a game
            </button> */}
        <div className="space-x-2 md:space-x-4 flex items-center">
          {loading ? (
            <span className="text-white font-medium flex flex-row">
              <svg
                className="mr-20 -ml-1 size-9 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
          ) : user ? (
            <div className="relative">
              {/* Avatar button */}
              <img
                id="avatar-btn"
                src={user.photoURL || "/file.svg"}
                alt="Profile"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-gray-200 cursor-pointer"
                referrerPolicy="no-referrer"
                onClick={() => setDropdownOpen((prev) => !prev)}
              />
              {/* Dropdown */}
              <div
                ref={dropdownRef}
                className={`absolute right-0 mt-2 w-56 bg-slate-800 border border-gray-700 rounded-lg shadow-lg transform origin-top-right transition-all duration-150 ${
                  dropdownOpen
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                <div className="p-4 border-b border-gray-700">
                  <p className="text-white font-semibold">{user.displayName}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <button
                  onClick={dash}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition cursor-pointer"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
<button
  onClick={handlesignin}
  className="bg-emerald-600 flex items-center text-white font-semibold px-3 py-2 md:px-4 md:py-2 cursor-pointer rounded-lg shadow-[0_4px_0_#065f46] active:shadow-[0_2px_0_#065f46] active:translate-y-[2px] hover:bg-emerald-700 transition-all duration-150 ease-out"
>
  <LogIn className="mr-2" size={18} />
  Log in
</button>

          )}
        </div>
      </div>

      {/* Main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-24 pb-24 max-w-6xl mx-auto">
  <div className="md:col-span-2 flex flex-col gap-6">
    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 w-full">
      <h1 className="font-extrabold text-center text-5xl text-white">Bahoot</h1>
      <p className="py-6 text-2xl text-white font-normal">
        Bahoot is a free educational tool that can help students learn and grasp concepts in a fun and educational way. <br /> <br />
        Start by <Link className="text-indigo-400" href={"/login"}> creating an account </Link> and making a set, and invite others to join your game!
      </p>
    </div><div className="bg-gradient-to-br from-gray-800 via-slate-700 to-slate-800 p-8 rounded-2xl shadow-lg w-full hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
  <h1 className="font-extrabold text-4xl md:text-5xl text-center text-white mb-10">
    What Our Users Say
  </h1>

  <div className="space-y-8 max-w-4xl mx-auto">
    {[
      {
        quote:
          "Bahoot helped me learn the material better as Bahoot gamifies it which makes topics much easier to learn! Hats off to Bahoot!",
        author: "A student",
            },
    ].map((t, idx) => (
      <div
        key={idx}
        className="bg-slate-900/40 p-6 rounded-xl shadow-md border border-slate-700"
      >
        <p className="text-xl md:text-2xl text-white italic leading-relaxed">
          “{t.quote}”
        </p>
        <p className="mt-4 text-right text-emerald-400 font-semibold">
          — {t.author}
        </p>
      </div>
    ))}
  </div>
</div>

  </div>
  <div className="w-full flex items-center justify-center">
    <div className="bg-gradient-to-r from-gray-700/40 via-gray-400/30 to-gray-500/40 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 rounded-xl p-8 w-full h-[600px] md:h-[80vh] text-white">
      <h1 className="font-extrabold text-2xl text-white">Statistics about Bahoot</h1>
      <hr className="text-white m-2"/>
      <PieChartComponent />
      <p className="text-white mt-4">
        With this pie chart we can see that kids prefer Bahoot. Even though Gimkit might be more fun or Blooket might have the skins, it is clear that Bahoot maintains a balance of playability while being educational.
      </p>
    </div>
  </div>
</div>

      </div>
  );
}
