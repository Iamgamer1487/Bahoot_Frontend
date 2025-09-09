"use client";
import Head from "next/head";
import React from "react";
import { useRouter } from "next/navigation";
export default function NotFound() {
    const router = useRouter();
    const go = () => {
        router.push("/");
    };
  return (
    <><Head>
          <title>Page Not Found</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta charSet="UTF-8" />
          <meta name="description" content="Page not found - 404 error" />
          <meta name="keywords" content="404, not found, error" />
      </Head><div className="bg-slate-950 min-h-screen w-full flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 animate-bounce">404</h1>
              <p className="text-white text-xl sm:text-2xl mb-8 animate-pulse">
                  Sorry, the page you're looking for doesn't exist.
              </p>
              <button
                  onClick={go}
                  className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-black font-bold py-3 px-6 rounded-xl shadow-[0_4px_0_#065f46] active:shadow-[0_2px_0_#065f46] active:translate-y-[2px] transition-all duration-150 ease-out"
              >
                  Go Back Home
              </button>
          </div></>
  );
}
