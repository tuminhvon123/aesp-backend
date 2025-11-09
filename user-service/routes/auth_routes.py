from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
import jwt
import datetime

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

# 🔑 Secret key
SECRET_KEY = "your_secret_key_here"

# Fake database tạm thời (sau này có thể thay bằng MySQL)
users = []

# 🟢 Đăng ký tài khoản
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    if not username or not password or not role:
        return jsonify({"message": "Thiếu thông tin đăng ký"}), 400

    if any(u["username"] == username for u in users):
        return jsonify({"message": "Tài khoản đã tồn tại"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    user = {"username": username, "password": hashed_pw, "role": role}
    users.append(user)

    return jsonify({"message": "Đăng ký thành công", "user": {"username": username, "role": role}}), 201


# 🟡 Đăng nhập
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    user = next((u for u in users if u["username"] == username and u["role"] == role), None)
    if not user:
        return jsonify({"message": "Sai tên đăng nhập hoặc vai trò"}), 401

    if not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Sai mật khẩu"}), 401

    # Tạo JWT token
    token = jwt.encode({
        "username": username,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({
        "message": "Đăng nhập thành công",
        "token": token,
        "user": {"username": username, "role": role}
    }), 200
