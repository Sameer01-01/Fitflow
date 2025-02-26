from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import google.generativeai as genai
import time

app = Flask(__name__)
CORS(app)  

# Google Gemini API Key
GEMINI_API_KEY = "AIzaSyAwcGXbqapuH7A8ZdGAeVeo19vFZE_WIb4"
genai.configure(api_key=GEMINI_API_KEY)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
cap = cv2.VideoCapture(0)

pushup_count = 0
squat_count = 0
pushup_stage = None
squat_stage = None
last_feedback_time = time.time()
feedback = "Start exercising!"

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180 else angle

def analyze_pose(frame):
    global pushup_count, squat_count, pushup_stage, squat_stage, last_feedback_time, feedback

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(frame_rgb)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
        elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y]
        wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST].y]

        hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
        knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y]
        ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]

        elbow_angle = calculate_angle(shoulder, elbow, wrist)
        knee_angle = calculate_angle(hip, knee, ankle)

        if elbow_angle < 90:
            pushup_stage = "down"
        if elbow_angle > 150 and pushup_stage == "down":
            pushup_stage = "up"
            pushup_count += 1

        if knee_angle < 90:
            squat_stage = "down"
        if knee_angle > 160 and squat_stage == "down":
            squat_stage = "up"
            squat_count += 1

        if time.time() - last_feedback_time > 20:
            prompt = f"Push-Ups: {pushup_count}, Squats: {squat_count}, Elbow Angle: {elbow_angle}, Knee Angle: {knee_angle}. Short feedback (10 words max)."
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                feedback = " ".join(response.text.split()[:10])
                last_feedback_time = time.time()
            except Exception:
                feedback = "AI error. Keep going!"

    return frame

def generate_frames():
    while True:
        success, frame = cap.read()
        if not success:
            break
        
        frame = analyze_pose(frame)

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/pose", methods=["GET"])
def get_pose():
    return jsonify({"pushups": pushup_count, "squats": squat_count, "feedback": feedback})

if __name__ == "__main__":
    app.run(debug=True)
