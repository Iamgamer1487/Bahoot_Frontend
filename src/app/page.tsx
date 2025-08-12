"use client";

import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/libs/firebase";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import Join from "../components/join";
import {SetSection} from "../components/question"
import { useRouter } from "next/navigation"
export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ✅ loading state
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false); // ✅ stop loading once we know
    });

    return () => unsubscribe();
  }, []);
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  const dash = () => {
    router.push("/dashboard");
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
 async function sendPost() {
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      const res = await fetch(`https://backend-bahoot.vercel.app/create_game/true`, {
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
        /* Hide scrollbar for Firefox */
        html, body, div {
          scrollbar-width: none;
        }
        /* Hide scrollbar for IE, Edge */
        html, body, div {
          -ms-overflow-style: none;
        }
      `}</style>
      {/* Nav Bar */}
      <div className="w-full bg-slate-800 px-2 py-1 flex items-center justify-between border-b border-gray-800 fixed top-0 left-0 z-40 h-16 md:h-20 lg:h-20" >
    {/* <img className="rounded-xl h-13 w-13 p-0 ml-1 shadow-[0_0_56px_12px_rgba(117, 37, 196,0.25)]" src="https://hda-breakfast.vercel.app/icon.png"></img> DID U DO LEAVE GAME */}
        <h1 className="text-3xl md:text-5xl p-2 ml-0 text-white font-black">Bahoot</h1>
          {/* dashboard button */}
          <SetSection/>
          <button
          onClick={dash}
        className="h-auto w-auto bg-emerald-600 p-2 px-3 rounded-lg right-0 relative cursor-pointer hover:bg-emerald-700 duration-300 font-bold">Go to dashboard</button>
                      <button
                className="bg-emerald-600 hover:bg-emerald-700 text-black cursor-pointer px-3 py-2 rounded-lg font-semibold transition-colors"
                onClick={sendPost}
              >
                Host premade set
              </button>
        <div className="space-x-2 md:space-x-4 flex items-center">
          {loading ? (
            <span className="text-white font-medium flex flex-row"><svg className="mr-20 -ml-1 size-9 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></span> // ✅ Loading indicator
          ) : user ? (
            <>
              <img
                src={user.photoURL || "../../public/file.svg"}
                alt="Profile"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-gray-200"
                style={{ border: '2px solid white', display: 'block !important' }}
                referrerPolicy="no-referrer"
              />
              <span className="text-white font-medium text-xs md:text-base">{user.displayName}</span>
              <button
                onClick={handleSignOut}
                className="bg-gray-700 flex mr-1 items-center gap-2 justify-center p-2 text-red-600 cursor-pointer font-semibold px-2 py-1 md:px-4 md:py-2 rounded-lg hover:bg-gray-600 transition text-xs md:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
  <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
  <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
</svg>
                Log out
              </button>
            </>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="bg-gray-700 p-1 md:p-2 mr-1 flex box-shadow-lg items-center text-indigo-200 cursor-pointer font-semibold px-2 py-1 md:px-4 md:py-2 rounded-lg hover:bg-gray-600 transition text-xs md:text-base"
            >
<svg
  className="inline-block box-shadow-lg z-2222 mr-2 w-5 h-5"
  viewBox="0 0 533.5 544.3"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M533.5 278.4c0-17.4-1.6-34-4.7-50.2H272v95h146.9c-6.3 34.4-25 63.5-53.4 83.1v68h86.2c50.4-46.5 81.8-115.1 81.8-195.9z"
    fill="#4285f4"
  />
  <path
    d="M272 544.3c72.6 0 133.6-24 178.2-65.4l-86.2-68c-24 16.1-54.7 25.7-92 25.7-70.7 0-130.7-47.8-152.1-112.1H32.2v70.5c44.5 87.9 136.5 149.3 239.8 149.3z"
    fill="#34a853"
  />
  <path
    d="M119.9 324.5c-10.9-32.5-10.9-67 0-99.5V154.5H32.2a272 272 0 000 235.3l87.7-65.3z"
    fill="#fbbc04"
  />
  <path
    d="M272 107.7c39.5 0 75 13.6 102.9 40.4l77.4-77.4C405.6 24 344.6 0 272 0c-103.3 0-195.3 61.4-239.8 149.3l87.7 70.5C141.3 155.5 201.3 107.7 272 107.7z"
    fill="#ea4335"
  />
</svg>
              Sign in with Google
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-center pt-24 mt-6 items-center gap-3 text-center pb-24 w-full">
        <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6 md:gap-3">
          <Join/>
        </div>
      </div>
      <a
        href="https://discord.gg/hDsDves4RE"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our Discord"
        className="fixed bottom-2 animate-bounce right-2 md:bottom-0 md:right-0 mx-2 my-1 z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={48}
          height={48}
          fill="#5865f2"
          className="bi scale-100 cursor-pointer hover:fill-[#7289da] transition drop-shadow-lg"
          viewBox="0 0 16 16"
        >
          <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
        </svg>
      </a>
      <div className="fixed left-2 bottom-2 md:left-6 md:bottom-6 z-50">
        <span className="bg-gray-800 text-gray-300 px-2 py-1 md:px-4 md:py-2 rounded-full shadow-lg font-mono text-xs md:text-sm tracking-wide border border-gray-700">Version 1.0.0 Beta</span>
      </div>
    </div>
  );
}
