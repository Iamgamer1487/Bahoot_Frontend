"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function DiscordLoginCallback() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;

    const fetchDiscordUser = async () => {
      try {
        const tokenRes = await axios.post(
          "https://discord.com/api/oauth2/token",
          new URLSearchParams({
            client_id: "1412122957400117309",
            client_secret: "3VgX6k-iwBFNdfbP0zYL5Q4Kvd8RtlyB",
            grant_type: "authorization_code",
            code,
            redirect_uri: "http://localhost:3001/login/discord",
            scope: "identify email",
          }).toString(),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        const accessToken = tokenRes.data.access_token;

        const userRes = await axios.get("https://discord.com/api/users/@me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const user = userRes.data;
        console.log("Discord user:", user);

        router.push("/dashboard");
      } catch (err) {
        console.error("OAuth error:", err);
        router.push("/login?error=discord");
      }
    };

    fetchDiscordUser();
  }, [router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.7,
      dy: (Math.random() - 0.5) * 0.7,
    }));

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

    animate();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />
      <div className="flex items-center justify-center min-h-screen relative z-10">
        <div className="text-center text-indigo-50">
          <h2 className="text-2xl md:text-3xl font-semibold text-emerald-400 mb-2 tracking-wide">
            Authenticating with Discord...
          </h2>
        </div>
      </div>
    </div>
  );
}
