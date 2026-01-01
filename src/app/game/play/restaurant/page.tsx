"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function GridFloor() {
  const rows = 5;
  const cols = 8;
  const tileSize = 128;

  const specialTiles: Record<number, string> = {
    0: "Fridge",
    2: "Fryer",
    3: "Counter",
    4: "Counter",
    16: "Grill",
  };

  const tileImages: Record<string, string> = {
    Floor: "/res_tiles/floor_tile.png",
    Grill: "/res_tiles/grill_tile.png",
    Counter: "/res_tiles/counter_tile.png",
    Fridge: "/res_tiles/fridge_tile.png",
    Fryer: "/res_tiles/deep_frying_tile.png",
  };

  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [facing, setFacing] = useState<"up" | "down" | "left" | "right">("down");
  const [heldItem, setHeldItem] = useState<string | null>(null);
  const [isCooking, setIsCooking] = useState(false);
  const [message, setMessage] = useState("");
  const [popupQuestion, setPopupQuestion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null);

  const blockedTypes = new Set(["Counter", "Fridge", "Grill", "Fryer"]);

  const tileAt = (x: number, y: number) => {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return null;
    const id = y * cols + x;
    return specialTiles[id] || "Floor";
  };

  const moveTo = (x: number, y: number) => {
    x = Math.max(0, Math.min(cols - 1, x));
    y = Math.max(0, Math.min(rows - 1, y));
    const t = tileAt(x, y);
    if (t && blockedTypes.has(t)) {
      setMessage(`You can't walk onto the ${t}.`);
      return playerPos;
    }
    return { x, y };
  };

  const interactTile = () => {
    let { x, y } = playerPos;
    if (facing === "up") y -= 1;
    if (facing === "down") y += 1;
    if (facing === "left") x -= 1;
    if (facing === "right") x += 1;

    const type = tileAt(x, y);
    if (!type || type === "Floor") {
      setMessage("Nothing to interact with here.");
      return;
    }

    if (type === "Fridge") {

      if (!heldItem) {
        setPopupQuestion(true)

        setHeldItem("raw_chicken");
        setMessage("You grabbed raw meat from the fridge.");
      } else setMessage("You're already holding something.");
      return;
    }

    if (type === "Grill") {
      if (heldItem === "raw_meat" && !isCooking) {
        setMessage("You put raw meat on the grill. Cooking...");
        setIsCooking(true);
        setTimeout(() => {
          setHeldItem("cooked_meat");
          setIsCooking(false);
          setMessage("Meat is cooked!");
        }, 2000);
      }
      else if (heldItem === "raw_chicken"){
        setMessage("You put raw chicken on the grill. Cooking...");
        setIsCooking(true);
        setTimeout(() => {
          setHeldItem("grilled_chicken");
          setIsCooking(false);
          setMessage("Chicken is cooked!");
        }, 2000);
      }
      else if (heldItem === "cooked_meat") {
        setMessage("You already have cooked meat.");
      } else setMessage("There's nothing to cook.");
      return;
    }

    if (type === "Fryer") {
      if (heldItem === "raw_chicken") {
        setMessage("You cook chicken in the deep fryer. Cooking...");
        setIsCooking(true);
        setTimeout(() => {
          setHeldItem("fried_chicken");
          setIsCooking(false);
          setMessage("Chicken is fried!");
        }, 2000);
      } else setMessage("There's nothing to cook.");
      return;
    }

    if (type === "Counter") {
      if (heldItem === "cooked_meat" || heldItem === "fried_chicken" || heldItem === "grilled_chicken") {
        const itemPlaced = heldItem;
        setHeldItem(null);
        setMessage(`You placed ${itemPlaced} on the counter (served).`);
      } else if (heldItem) {
        setMessage("You can't do anything useful with that here.");
      } else setMessage("The counter is clear.");
      return;
    }

    setMessage(`You interact with the ${type}.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", " ", "Enter", "e", "E"].includes(e.key)
    ) e.preventDefault();

    setMessage("");

    if (e.key === "ArrowUp" || e.key === "w") {
      setFacing("up");
      setPlayerPos(pos => moveTo(pos.x, pos.y - 1));
    } else if (e.key === "ArrowDown" || e.key === "s") {
      setFacing("down");
      setPlayerPos(pos => moveTo(pos.x, pos.y + 1));
    } else if (e.key === "ArrowLeft" || e.key === "a") {
      setFacing("left");
      setPlayerPos(pos => moveTo(pos.x - 1, pos.y));
    } else if (e.key === "ArrowRight" || e.key === "d") {
      setFacing("right");
      setPlayerPos(pos => moveTo(pos.x + 1, pos.y));
    } else if (["e", "E", " ", "Enter"].includes(e.key)) {
      interactTile();
    }
  };

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

useEffect(() => {
  if (!popupQuestion) {
    setTimeout(() => {
      containerRef.current?.focus();
    }, 10);
  }
}, [popupQuestion]);


  const tiles = Array.from({ length: rows * cols }, (_, i) => {
    const x = i % cols;
    const y = Math.floor(i / cols);
    return { id: i, x, y, state: specialTiles[i] || "Floor" };
  });

  const returnToRes = () => {
    setPopupQuestion(false)
  }
  const options = ["Obama", "Rok", "How tf should i know", "Koomer"]
  if (popupQuestion === true){
    return (
      <div className="bg-slate-950 select-none w-full h-screen flex flex-col justify-center items-center p-6">
        <div className="bg-slate-800 py-8 px-6 rounded-lg shadow-md text-center mb-8 border-b border-indigo-400 w-full">
          <p className="font-bold text-5xl text-indigo-100">What is obama's last name?</p>
        </div>

        <div className="w-full flex-grow">
          <div className="grid grid-cols-2 grid-rows-2 gap-6 h-full w-full">
            {options.map((option, i) => {
              const colors = [
                "bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900",
                "bg-gradient-to-br from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950",
                "bg-gradient-to-br from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950",
                "bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800"
              ];

              return (
                <button
                  key={i}
                  className={`w-full h-full flex items-center justify-center text-3xl md:text-4xl text-white font-semibold rounded-xl shadow-lg transition duration-200 ${colors[i]}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={returnToRes}
          className="mt-12 px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white text-xl font-semibold rounded-lg transition duration-200"
        >
          Return to Restaurant
        </button>
      </div>
    )
  }
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ outline: "none" }}
      className="bg-slate-950 w-full h-screen flex flex-col justify-center items-center p-6"
    >
      <div className="relative" style={{ width: cols * tileSize, height: rows * tileSize }}>
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
            gridAutoRows: `${tileSize}px`,
          }}
        >
          {tiles.map(({ id, state }) => (
            <div key={id} className="relative w-[128px] h-[128px]">
              <Image src={tileImages[state]} alt={`${state} Tile ${id}`} fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* Player */}
        <div
          aria-hidden
          className="pointer-events-none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: cols * tileSize,
            height: rows * tileSize,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: tileSize,
              height: tileSize,
              transform: `translate3d(${playerPos.x * tileSize}px, ${playerPos.y * tileSize}px, 0)`,
              transition: "transform 150ms linear",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="w-12 h-12 bg-yellow-400 rounded-full border-2 border-black flex items-center justify-center"
              style={{
                transform:
                  facing === "left" ? "rotate(-90deg)" :
                  facing === "right" ? "rotate(90deg)" :
                  facing === "up" ? "rotate(180deg)" :
                  "rotate(0deg)",
              }}
            >
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6">
        <div className="text-white">
          <div className="font-bold">Facing: <span className="font-normal">{facing}</span></div>
          <div className="font-bold">Holding: <span className="font-normal">{heldItem ?? "Nothing"}</span></div>
          {isCooking && <div className="font-bold text-yellow-400">Cooking...</div>}
        </div>
        <div className="text-white/90 text-sm">
          Use WASD or arrow keys to move. Press E (or Space/Enter) to interact.
        </div>

      </div>

      {message && (
  <div className="mt-4 bg-slate-950 rounded-md text-white text-lg font-bold">
    {message}
  </div>
)}
    </div>
  );
}
