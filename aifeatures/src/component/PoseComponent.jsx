import { useEffect, useState } from "react";
import axios from "axios";

export default function ExerciseTracker() {
  const [exercise, setExercise] = useState("pushups");
  const [videoUrl, setVideoUrl] = useState("http://localhost:5000/video_feed");

  useEffect(() => {
    axios.post("http://localhost:5000/set_exercise", { exercise }).catch((err) => {
      console.error("Error setting exercise:", err);
    });
  }, [exercise]);

  return (
    <div className="flex flex-col items-center p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-4">AI-Powered Exercise Tracker</h1>
      <div className="mb-4">
        <label className="mr-4">Select Exercise:</label>
        <select
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          className="p-2 bg-gray-800 border border-gray-600 rounded"
        >
          <option value="pushups">Push-Ups</option>
          <option value="squats">Squats</option>
        </select>
      </div>
      <div className="w-full flex justify-center">
        <img src={videoUrl} alt="Exercise Stream" className="border-4 border-green-500 rounded-lg" />
      </div>
    </div>
  );
}
