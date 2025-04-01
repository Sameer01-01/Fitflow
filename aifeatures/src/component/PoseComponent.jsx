import { useState, useEffect } from "react";
const App = () => {
  const [exercise, setExercise] = useState("pushups");
  const [count, setCount] = useState(0);
  useEffect(() => {
    const video = document.getElementById("videoFeed");
    if (video) {
      video.src = "http://localhost:5000/video_feed"; 
    }
  }, []);
  const changeExercise = async (type) => {
    setExercise(type);
    await fetch("http://localhost:5000/set_exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise: type }),
    });
  };
  const resetCount = async () => {
    await fetch("http://localhost:5000/reset_count", { method: "POST" });
    setCount(0);
  };
  return (
    <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">AI Exercise Tracker</h1>
      <div className="flex space-x-4 mb-4">
        <button onClick={() => changeExercise("pushups")} className="bg-blue-500 p-2 rounded">Push-Ups</button>
        <button onClick={() => changeExercise("squats")} className="bg-green-500 p-2 rounded">Squats</button>
      </div>
      <button onClick={resetCount} className="bg-red-500 p-2 rounded">Reset Count</button>
      <img id="videoFeed" 
     alt="Live Video" 
     className="mt-4 w-full h-auto max-w-4xl border-2 border-gray-300 rounded"
/>

      <p className="mt-4 text-lg">Current Exercise: {exercise}</p>
    </div>
  );
};

export default App;
