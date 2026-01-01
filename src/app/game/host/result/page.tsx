import React from 'react';

const data = {
  "0": {
    "Question": "What is the capital of France?",
    "percentages": {
      "Paris": 80,
      "London": 10,
      "Berlin": 5,
      "Rome": 5
    },
    "Correct_ans": "Paris"
  },
  "1": {
    "Question": "Which planet is known as the Red Planet?",
    "percentages": {
      "Earth": 5,
      "Mars": 70,
      "Jupiter": 15,
      "Venus": 10
    },
    "Correct_ans": "Mars"
  },
  "classAccuracy": 75
}


export default function Results() {
  return (
    <div className='bg-slate-800 w-full min-h-screen p-5'>
      <h1 className='text-4xl text-white text-center font-bold'>Results for Game</h1>

      <h2 className="text-white text-center text-2xl my-5">
        Class Accuracy: {data.classAccuracy}%
      </h2>

      {/* Loop through each question */}
      {Object.entries(data)
        .filter(([key]) => key !== "classAccuracy") // skip classAccuracy
        .map(([qIdx, q]) => {
            const question = q as {
                Question: string;
                percentages: Record<string, number>;
                Correct_ans: string;
            };
          const options = Object.keys(question.percentages);
          const correctAns = question.Correct_ans;


          return (
            <div key={qIdx} className="bg-slate-900 p-5 m-5 w-2/4 text-center mx-auto text-white rounded-2xl">
              <p className='font-bold text-2xl mb-2'>Question {parseInt(qIdx)+1}: {question.Question}</p>
              <p className="text-slate-400 mb-4">
                ({question.percentages[correctAns]}% got it right, {100-question.percentages[correctAns]}% didn't)
              </p>

              {/* Options with percentages */}
              {options.map((opt, i) => {
                const pct = question.percentages[opt]; // declare here

                let barColor = "bg-red-500";      // 0–30%
  if            (pct > 30 && pct <= 70) barColor = "bg-yellow-500";  // 31–70%
  if            (pct > 70) barColor = "bg-green-500";               // 71–100%
                return (
                    <div key={i} className="flex items-center mb-2">
                        <span className='w-1/5'>{String.fromCharCode(65 + i)}. {opt}</span>

                        <div className="w-3/5 bg-gray-700 h-6 rounded overflow-hidden mx-2">
                            <div
                                className={`${barColor} h-6`}
                                style={{ width: `${pct}%` }} // use pct here
                            />
                        </div>

                        <span className='w-1/5 text-right'>({pct}%)</span>
                    </div>
  );
})}


              <p className='text-xl text-green-500 font-bold mt-2'>Correct Answer: {correctAns}</p>
            </div>
          );
        })}
    </div>
  );
}
