from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import google.generativeai as genai
import time

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = "AIzaSyAwcGXbqapuH7A8ZdGAeVeo19vFZE_WIb4"
genai.configure(api_key=GEMINI_API_KEY)

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose()


exercise_type = "pushups"
pushup_count = 0
squat_count = 0
pushup_stage = None
squat_stage = None
last_feedback_time = time.time()
feedback = "Start exercising to receive AI feedback!"


def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return angle if angle <= 180 else 360 - angle

def get_gemini_feedback(pushup_count, squat_count, elbow_angle, knee_angle):
    global last_feedback_time, feedback
    if time.time() - last_feedback_time < 20:
        return feedback
    prompt = f"""
    I am doing {exercise_type}. My stats:
    - Push-Ups: {pushup_count}
    - Squats: {squat_count}
    - Elbow Angle: {elbow_angle}
    - Knee Angle: {knee_angle}
    Give me quick feedback in 10 words or less.
    """
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        feedback = " ".join(response.text.split()[:10])
        last_feedback_time = time.time()
        return feedback
    except Exception:
        feedback = "AI error. Keep going!"
        return feedback


@app.route("/set_exercise", methods=["POST"])
def set_exercise():
    global exercise_type
    data = request.json
    if "exercise" in data:
        exercise_type = data["exercise"]
        return jsonify({"message": "Exercise updated"}), 200
    return jsonify({"error": "Invalid request"}), 400


@app.route("/reset_count", methods=["POST"])
def reset_count():
    global pushup_count, squat_count
    pushup_count = 0
    squat_count = 0
    return jsonify({"message": "Counts reset"}), 200


def generate_frames():
    global pushup_count, squat_count, pushup_stage, squat_stage, feedback
    cap = cv2.VideoCapture(0)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
            landmarks = results.pose_landmarks.landmark

          
            shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].y]
            elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW].y]
            wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST].y]

            shoulder_r = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].x, landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].y]
            elbow_r = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW].x, landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW].y]
            wrist_r = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST].x, landmarks[mp_pose.PoseLandmark.RIGHT_WRIST].y]

         
            hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
            knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y]
            ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]

            hip_r = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP].x, landmarks[mp_pose.PoseLandmark.RIGHT_HIP].y]
            knee_r = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE].x, landmarks[mp_pose.PoseLandmark.RIGHT_KNEE].y]
            ankle_r = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE].x, landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE].y]

            elbow_angle = (calculate_angle(shoulder, elbow, wrist) + calculate_angle(shoulder_r, elbow_r, wrist_r)) / 2
            knee_angle = (calculate_angle(hip, knee, ankle) + calculate_angle(hip_r, knee_r, ankle_r)) / 2

           
            if exercise_type == "pushups":
                if elbow_angle < 85 and pushup_stage != "down":
                    pushup_stage = "down"
                if elbow_angle > 160 and pushup_stage == "down":
                    pushup_stage = "up"
                    pushup_count += 1

           
            if exercise_type == "squats":
                if knee_angle < 80 and squat_stage != "down":
                    squat_stage = "down"
                if knee_angle > 170 and squat_stage == "down":
                    squat_stage = "up"
                    squat_count += 1

            if (pushup_count + squat_count) % 10 == 0:
                feedback = get_gemini_feedback(pushup_count, squat_count, elbow_angle, knee_angle)

            
            cv2.putText(frame, f"{exercise_type.capitalize()} Count: {pushup_count if exercise_type == 'pushups' else squat_count}",
                        (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, feedback, (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        _, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    app.run(debug=True)
