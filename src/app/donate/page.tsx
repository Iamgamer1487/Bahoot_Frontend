"use client";

import React from "react";
import Head from "next/head";

export default function DonatePage() {
  return (
    <div className="bg-green-700 min-h-screen w-full text-black">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="bg-emerald-500 w-full p-10 text-center">
        <h1 className="text-5xl font-bold">Support the Game</h1>
        <p className="text-xl mt-4">We pay to keep our site ad free and running. Any donation is greatly appreciated.</p>
      </div>

      <div className="flex flex-col items-center mt-12 space-y-6">
        <button className="bg-lime-400 cursor-pointer hover:bg-lime-500 transition-colors duration-200 text-black px-6 py-4 rounded-xl text-2xl font-bold shadow-lg">
          Donate $5
        </button>
        <button className="bg-sky-500 cursor-pointer hover:bg-sky-600 transition-colors duration-200 text-black px-6 py-4 rounded-xl text-2xl font-bold shadow-lg">
          Donate $10
        </button>
        <button className="bg-slate-300 cursor-pointer hover:bg-slate-400 transition-colors duration-200 text-black px-6 py-4 rounded-xl text-2xl font-bold shadow-lg">
          Custom Amount
        </button>
      </div>
    </div>
  );
}
