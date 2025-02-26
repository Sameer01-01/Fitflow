import React, { useState, useEffect } from "react";
import axios from "axios";

const PoseComponent = () => {
  const [poseData, setPoseData] = useState({ pushups: 0, squats: 0, feedback: "Waiting for feedback..." });

  useEffect(() => {
    const fetchData = () => {
      axios.get("http://127.0.0.1:5000/pose")
        .then(response => setPoseData(response.data))
        .catch(error => console.error("Error fetching pose data:", error));
    };

    fetchData(); // Fetch once on mount
    const interval = setInterval(fetchData, 20000); // Fetch every 20s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold mb-4">AI-Powered Exercise Tracker</h2>
      
      <img
        src="http://127.0.0.1:5000/video_feed"
        alt="Live Camera Feed"
        className="w-96 h-72 rounded-lg shadow-lg border-2 border-green-500"
      />

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80 mt-4">
        <p className="text-lg">🔥 Push-ups: <span className="text-green-400">{poseData.pushups}</span></p>
        <p className="text-lg">🏋️ Squats: <span className="text-blue-400">{poseData.squats}</span></p>
        <p className="text-yellow-400 font-semibold mt-4">💬 Feedback: {poseData.feedback}</p>
      </div>
    </div>
  );
};

export default PoseComponent;
