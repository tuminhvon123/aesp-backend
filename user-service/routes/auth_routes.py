from flask import Blueprint, request, jsonify
from models.user_model import users
from services.jwt_service import generate_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if email not in users or users[email]["password"] != password:
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(email)
    return jsonify({
        "token": token,
        "role": users[email]["role"]
    })
