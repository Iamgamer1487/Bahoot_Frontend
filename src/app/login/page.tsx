"use client";

import { useState, useEffect, useRef } from "react";
import { auth, googleProvider } from "@/libs/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) router.push("/dashboard");
    });
    return () => unsub();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch {
      setError("Google login failed");
    }
  };

const handleDiscordSignIn = () => {
  const clientId = "1412122957400117309";
  const redirectUri = encodeURIComponent("http://localhost:3001/login/discord");
  const scope = "identify email";
  const discordUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  window.location.href = discordUrl;
};


  const handleEmailAuth = async () => {
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch {
      setError(isSignUp ? "Sign up failed" : "Invalid email or password");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; r: number; dx: number; dy: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.7,
        dy: (Math.random() - 0.5) * 0.7,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,255,180,0.8)";
      ctx.shadowColor = "rgba(0,255,180,0.9)";
      ctx.shadowBlur = 8;

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx = -p.dx;
        if (p.y < 0 || p.y > h) p.dy = -p.dy;
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen relative bg-slate-950 flex items-center justify-center px-4 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />
f
      <div className="w-full max-w-md bg-slate-900 p-10 rounded-3xl shadow-2xl flex flex-col gap-6 animate-fadeIn relative z-10">
        {loading ? (
          <div className="animate-spin border-4 border-white border-t-transparent rounded-full w-14 h-14 mx-auto"></div>
        ) : user ? (
          <div className="flex flex-col items-center gap-4">
            <img
              src={user.photoURL || "/file.svg"}
              alt="avatar"
              className="w-24 h-24 rounded-full border-2 border-emerald-500 shadow-lg"
            />
            <span className="text-xl font-medium text-white">Logged in as {user.displayName}</span>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center text-white animate-slideDown">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>
            {error && <span className="text-red-400 text-center">{error}</span>}

            {["email", "password"].map((field) => (
              <div key={field} className="relative">
                <input
                  type={field}
                  value={field === "email" ? email : password}
                  onChange={(e) =>
                    field === "email" ? setEmail(e.target.value) : setPassword(e.target.value)
                  }
                  placeholder={field}
                  className="peer w-full px-5 py-4 rounded-full bg-gray-800 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-300"
                />
                <label className="absolute left-5 top-4 text-gray-400 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-emerald-400 peer-focus:text-sm transition-all cursor-pointer">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
              </div>
            ))}<button
  onClick={handleEmailAuth}
  className="
    w-full py-3 rounded-full font-semibold text-white cursor-pointer
    bg-emerald-600 shadow-[0_4px_0_#065f46]
    active:shadow-[0_2px_0_#065f46] active:translate-y-[2px]
    hover:bg-emerald-700 transition-all duration-150
  "
>
  {isSignUp ? "Sign Up" : "Sign In"}
</button>
            <div className="text-center text-gray-400 text-sm">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    className="text-emerald-400 hover:underline cursor-pointer"
                    onClick={() => setIsSignUp(false)}
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    className="text-emerald-400 hover:underline cursor-pointer"
                    onClick={() => setIsSignUp(true)}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
<div className="relative my-4">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-700"></div>
  </div>
  <div className="relative flex justify-center text-sm text-gray-400">
    <span className="bg-gray-900 px-3">or continue with</span>
  </div>
</div>

            <div className="flex flex-col gap-2">
<button
  onClick={handleGoogleSignIn}
  className="
    flex items-center justify-center gap-3 py-3 rounded-full font-semibold cursor-pointer
    bg-white text-gray-800 shadow-[0_4px_0_#d1d5db]
    active:shadow-[0_2px_0_#d1d5db] active:translate-y-[2px]
    hover:bg-gray-200 transition-all duration-150
  "
>
  <img src="/google.svg" alt="G" className="w-6 h-6" />
  Google
</button><button
  onClick={handleDiscordSignIn}
  className="
    flex items-center justify-center gap-3 py-3 rounded-full font-semibold text-white cursor-pointer
    bg-[#5865F2] shadow-[0_4px_0_#3c45a5]
    active:shadow-[0_2px_0_#3c45a5] active:translate-y-[2px]
    hover:bg-[#4752c4] transition-all duration-150
  "
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="currentColor"
    viewBox="0 0 16 16"
    className="w-6 h-6"
  >
<path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
  </svg>
  Discord
</button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
