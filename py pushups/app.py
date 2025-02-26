from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import google.generativeai as genai
import time

app = Flask(__name__)
CORS(app)

genai.configure(api_key="AIzaSyAwcGXbqapuH7A8ZdGAeVeo19vFZE_WIb4")

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose()

selected_exercise = "pushups" 

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
    
    return angle

last_feedback_time = time.time()
feedback = "Start exercising to receive AI feedback!"
pushup_count = 0
squat_count = 0
pushup_stage = None
squat_stage = None

@app.route('/set_exercise', methods=['POST'])
def set_exercise():
    global selected_exercise
    data = request.json
    if 'exercise' in data:
        selected_exercise = data['exercise']
        return jsonify({"message": f"Exercise set to {selected_exercise}"})
    return jsonify({"error": "Invalid request"}), 400

@app.route('/video_feed')
def video_feed():
    def generate():
        global pushup_count, squat_count, pushup_stage, squat_stage, feedback, last_feedback_time
        cap = cv2.VideoCapture(0)
        
        while True:
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

                hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP].y]
                knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE].y]
                ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE].y]

                elbow_angle = calculate_angle(shoulder, elbow, wrist)
                knee_angle = calculate_angle(hip, knee, ankle)

                if selected_exercise == "pushups":
                    if elbow_angle < 90:
                        pushup_stage = "down"
                    if elbow_angle > 150 and pushup_stage == "down":
                        pushup_stage = "up"
                        pushup_count += 1
                
                if selected_exercise == "squats":
                    if knee_angle < 90:
                        squat_stage = "down"
                    if knee_angle > 160 and squat_stage == "down":
                        squat_stage = "up"
                        squat_count += 1

                if time.time() - last_feedback_time >= 20:
                    feedback = get_gemini_feedback(pushup_count, squat_count, elbow_angle, knee_angle)
                    last_feedback_time = time.time()

            if selected_exercise == "pushups":
                cv2.putText(frame, f'Push-Ups: {pushup_count}', (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            elif selected_exercise == "squats":
                cv2.putText(frame, f'Squats: {squat_count}', (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
            
            cv2.putText(frame, feedback, (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        cap.release()

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

def get_gemini_feedback(pushup_count, squat_count, elbow_angle, knee_angle):
    prompt = f"""
    I am doing {selected_exercise}. My stats:
    - Push-Ups: {pushup_count}
    - Squats: {squat_count}
    - Elbow Angle: {elbow_angle}
    - Knee Angle: {knee_angle}
    Give me feedback in 10 words or less.
    """
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return " ".join(response.text.split()[:10])
    except:
        return "AI error. Keep going!"

if __name__ == '__main__':
    app.run(debug=True)
