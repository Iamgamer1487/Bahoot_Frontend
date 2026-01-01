"use client";
import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { CirclePlus } from "lucide-react";

export function SetSection() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [modalState, setModalState] = useState<"entering" | "visible" | "exiting" | null>(null);
  const [setName, setSetName] = useState("");
  const [isPrivate] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const openModal = () => {
    setModalState("entering");
    setTimeout(() => setModalState("visible"), 10); // allow transition to trigger
  };

  const closeModal = () => {
    setModalState("exiting");
    setTimeout(() => setModalState(null), 200); // match transition duration
  };

  async function handleSetCreation() {
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    setIsCreatingSet(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/json_to_set/${user.uid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_set_name: setName || "Untitled Set",
            private: isPrivate,
            Questions: [
              {
                "type": "multiple",
                "question": "Which sorting algorithm has the best average-case efficiency?",
                "choices": ["Selection Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"],
                "answer": "Merge Sort",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "The data structure best suited for breadth-first search (BFS) in a graph is:",
                "choices": ["Stack", "Queue", "Hash Table", "Binary Tree"],
                "answer": "Queue",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Which Boolean expression matches the truth table of an XNOR gate?",
                "choices": [
                  "(A AND B) OR (¬A AND ¬B)",
                  "(A AND ¬B) OR (¬A AND B)",
                  "(A OR B) AND (¬A OR ¬B)",
                  "A OR ¬B"
                ],
                "answer": "(A AND B) OR (¬A AND ¬B)",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Convert binary 110110 to decimal:",
                "choices": ["52", "54", "56", "58"],
                "answer": "54",
                "timer": 15
              },
              {
                "type": "multiple",
                "question": "A CPU cache improves performance because:",
                "choices": [
                  "It is larger than main memory",
                  "It is non-volatile",
                  "It is closer and faster to access than RAM",
                  "It stores permanent data"
                ],
                "answer": "It is closer and faster to access than RAM",
                "timer": 15
              },
              {
                "type": "multiple",
                "question": "Which of the following is not a characteristic of OOP?",
                "choices": ["Encapsulation", "Inheritance", "Abstraction", "Recursion"],
                "answer": "Recursion",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "In operating systems, which scheduling policy ensures each process gets a time slice in turn?",
                "choices": ["FCFS", "SJN", "Round Robin", "Priority Scheduling"],
                "answer": "Round Robin",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "The maximum number of edges in an undirected simple graph with 7 vertices is:",
                "choices": ["21", "42", "28", "14"],
                "answer": "21",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Which Internet protocol is responsible for assigning IP addresses dynamically?",
                "choices": ["DNS", "DHCP", "HTTP", "FTP"],
                "answer": "DHCP",
                "timer": 15
              },
              {
                "type": "multiple",
                "question": "If a recursive function calls itself twice for each input of size n, the recurrence relation is:",
                "choices": [
                  "T(n) = T(n–1) + O(1)",
                  "T(n) = 2T(n–1) + O(1)",
                  "T(n) = T(n/2) + O(1)",
                  "T(n) = nT(n–1)"
                ],
                "answer": "T(n) = 2T(n–1) + O(1)",
                "timer": 25
              },
              {
                "type": "boolean",
                "question": "Breadth-first search (BFS) uses a stack.",
                "choices": ["True", "False"],
                "answer": "False",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "Binary search requires the array to be sorted.",
                "choices": ["True", "False"],
                "answer": "True",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "In Big-O notation, O(n log n) is asymptotically faster than O(n^2).",
                "choices": ["True", "False"],
                "answer": "True",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "ROM is volatile memory.",
                "choices": ["True", "False"],
                "answer": "False",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "In Boolean algebra, A AND (NOT A) = 0.",
                "choices": ["True", "False"],
                "answer": "True",
                "timer": 15
              },
              {
                "type": "multiple",
                "question": "Which scheduling algorithm can cause starvation?",
                "choices": ["FCFS", "Round Robin", "Shortest Job Next", "Lottery Scheduling"],
                "answer": "Shortest Job Next",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Which data structure is used in a recursive function call stack?",
                "choices": ["Queue", "Heap", "Stack", "Graph"],
                "answer": "Stack",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "In networking, which device operates at Layer 2 of the OSI model?",
                "choices": ["Router", "Switch", "Repeater", "Firewall"],
                "answer": "Switch",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Which algorithm is commonly used for shortest paths in weighted graphs (no negative edges)?",
                "choices": ["Kruskal's", "Prim's", "Dijkstra's", "Bellman-Ford"],
                "answer": "Dijkstra's",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Which is NOT a stable sorting algorithm?",
                "choices": ["Merge Sort", "Insertion Sort", "Quick Sort", "Bubble Sort"],
                "answer": "Quick Sort",
                "timer": 20
              },
              {
                "type": "boolean",
                "question": "A full binary tree with n internal nodes has n+1 leaves.",
                "choices": ["True", "False"],
                "answer": "True",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "TCP provides reliable, ordered delivery of packets.",
                "choices": ["True", "False"],
                "answer": "True",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "The maximum degree of a vertex in a simple graph with n vertices is n–1.",
                "choices": ["True", "False"],
                "answer": "True",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "In assembly, the instruction MOV copies data between registers or memory.",
                "choices": ["True", "False"],
                "answer": "True",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "Dynamic programming always provides faster algorithms than greedy methods.",
                "choices": ["True", "False"],
                "answer": "False",
                "timer": 15
              },
              {
                "type": "multiple",
                "question": "Which of the following is an NP-complete problem?",
                "choices": ["Dijkstra's", "Traveling Salesman", "Merge Sort", "Binary Search"],
                "answer": "Traveling Salesman",
                "timer": 25
              },
              {
                "type": "multiple",
                "question": "In Big-O notation, which of the following grows fastest?",
                "choices": ["O(n)", "O(n log n)", "O(2^n)", "O(n^2)"],
                "answer": "O(2^n)",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Which traversal of a binary search tree gives sorted order?",
                "choices": ["Preorder", "Postorder", "Inorder", "Level-order"],
                "answer": "Inorder",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Which memory is the fastest?",
                "choices": ["Cache", "RAM", "SSD", "Hard Disk"],
                "answer": "Cache",
                "timer": 15
              },
              {
                "type": "multiple",
                "question": "The truth table of an XOR gate is equivalent to:",
                "choices": ["A == B", "A != B", "A OR B", "NOT A"],
                "answer": "A != B",
                "timer": 20
              },
              {
                "type": "boolean",
                "question": "IPv6 addresses are 128 bits long.",
                "choices": ["True", "False"],
                "answer": "True",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "Recursion always uses more memory than iteration.",
                "choices": ["True", "False"],
                "answer": "False",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "Merge sort is a divide and conquer algorithm.",
                "choices": ["True", "False"],
                "answer": "True",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "Binary trees can never be unbalanced.",
                "choices": ["True", "False"],
                "answer": "False",
                "timer": 15
              },
              {
                "type": "boolean",
                "question": "In object-oriented programming, polymorphism allows methods to have the same name but different implementations.",
                "choices": ["True", "False"],
                "answer": "True",
                "timer": 15
              },
              {
                "type": "multiple",
                "question": "Which data structure is best for implementing undo in a text editor?",
                "choices": ["Queue", "Stack", "Heap", "Graph"],
                "answer": "Stack",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Which algorithm is typically used for constructing minimum spanning trees?",
                "choices": ["Dijkstra's", "Kruskal's", "Bellman-Ford", "DFS"],
                "answer": "Kruskal's",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Which component executes instructions in a CPU?",
                "choices": ["Control Unit", "ALU", "Cache", "Registers"],
                "answer": "ALU",
                "timer": 20
              },
              {
                "type": "multiple",
                "question": "Which data structure supports O(1) average time for insertion and lookup?",
                "choices": ["Stack", "Hash Table", "Linked List", "Binary Search Tree"],
                "answer": "Hash Table",
                "timer": 20
              }
            ]
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || "Failed to create set");
        } catch {
          throw new Error(errorText || "Server returned an error");
        }
      }

      const resData = await res.json();
      const newSetId = resData.set_id || resData.setId || resData.id;
      if (!newSetId) throw new Error("Missing new set id in response");

      router.push(`/create/set/${newSetId}`);
    } catch (err) {
      console.error("Set creation failed:", err);
      alert(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsCreatingSet(false);
      closeModal();
    }
  }

  if (loading) return null;

  return (
    <section className="flex flex-col items-center">
    {user && (
  <button
    type="button"
    onClick={openModal}
    disabled={isCreatingSet}
    className="w-full px-4 py-2 flex justify-center items-center text-center gap-2 cursor-pointer rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-[0_4px_0_#065f46] active:shadow-[0_2px_0_#065f46] active:translate-y-[2px] transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <CirclePlus className="w-5 h-5" />
    {isCreatingSet ? "Creating..." : "Create a set"}
  </button>
)}

      {modalState && (
        <div className="fixed inset-0 z-[98989] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div
            className={`relative bg-gray-900 p-6 rounded-lg border border-gray-700 w-full max-w-md shadow-xl transform transition-all duration-200 ease-in-out
              ${
                modalState === "entering"
                  ? "opacity-0 scale-95"
                  : modalState === "visible"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
          >
            <h3 className="text-white text-xl font-bold mb-4">Create a set</h3>
            <label className="block text-sm text-gray-300 mb-2">
              Set Name:
              <input
                type="text"
                value={setName}
                onChange={(e) => setSetName(e.target.value)}
                className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white border focus:outline-none focus:ring-4 focus:ring-teal-300 border-gray-600"
                placeholder="Enter a name for your set"
              />
            </label>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-slate-500 text-white cursor-pointer font-bold rounded-lg shadow-[0_4px_0_#334155] active:shadow-[0_2px_0_#334155] active:translate-y-[2px] transition-all duration-150 hover:bg-slate-700"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-emerald-500 text-white cursor-pointer font-bold rounded-lg shadow-[0_4px_0_#059669] active:shadow-[0_2px_0_#059669] active:translate-y-[2px] transition-all duration-150 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSetCreation}
                disabled={isCreatingSet || !setName.trim()}
              >
                {isCreatingSet ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
