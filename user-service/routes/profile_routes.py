from flask import Blueprint, jsonify, request
import jwt

profile_bp = Blueprint('profile', __name__)

SECRET_KEY = "your_secret_key_here"

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"message": "Thiếu token"}), 401

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({
            "username": decoded["username"],
            "role": decoded["role"]
        })
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token hết hạn"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token không hợp lệ"}), 401
