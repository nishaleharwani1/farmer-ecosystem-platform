from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (safe for integration)

@app.route("/analyze", methods=["POST"])
def analyze():

    # Check image exists
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files["image"]

    # Check empty image
    if image.filename == "":
        return jsonify({"error": "Empty image file"}), 400

    # ===== IMAGE SIZE BASED LOGIC =====
    image.seek(0, os.SEEK_END)
    size_kb = image.tell() / 1024
    image.seek(0)

    # ===== AI DECISION LOGIC (Rule-Based Prototype) =====
    if size_kb < 30:
        grade = "D"
        damage = "High"
        pest = "Yes"
    elif size_kb < 70:
        grade = "C"
        damage = "Medium"
        pest = random.choice(["Yes", "No"])
    elif size_kb < 150:
        grade = "B"
        damage = "Low"
        pest = "No"
    else:
        grade = "A"
        damage = "Very Low"
        pest = "No"

    # ===== AI REPORT =====
    report = {
        "color": random.choice(["Green", "Red", "Yellow"]),
        "spots": random.choice(["None", "Few", "Visible"]),
        "shape": "Normal",
        "size": "Medium",
        "visible_damage": damage,
        "pest_detected": pest,
        "quality_grade": grade,
        "analyzed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    return jsonify(report), 200


if __name__ == "__main__":
    print("AI Service running on http://127.0.0.1:5000/analyze")
    app.run(host="0.0.0.0", port=5000)
