from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
import jwt
import datetime
from db import mysql  # ✅ Import MySQL

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

# 🔑 Secret key
SECRET_KEY = "your_secret_key_here"

# 🟢 Đăng ký tài khoản - LƯU VÀO MYSQL
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    if not username or not password or not role:
        return jsonify({"message": "Thiếu thông tin đăng ký"}), 400

    try:
        # ✅ Kiểm tra user đã tồn tại trong MySQL
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            cursor.close()
            return jsonify({"message": "Tài khoản đã tồn tại"}), 400
        
        # ✅ Hash password
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # ✅ Lưu vào MySQL
        cursor.execute(
            "INSERT INTO users (username, password, role) VALUES (%s, %s, %s)",
            (username, hashed_pw, role)
        )
        mysql.connection.commit()
        
        # ✅ Lấy thông tin user vừa tạo
        cursor.execute("SELECT id, username, role FROM users WHERE username = %s", (username,))
        new_user = cursor.fetchone()
        cursor.close()

        return jsonify({
            "message": "Đăng ký thành công", 
            "user": {
                "id": new_user['id'],
                "username": new_user['username'], 
                "role": new_user['role']
            }
        }), 201
        
    except Exception as e:
        print(f"❌ Lỗi đăng ký: {e}")
        return jsonify({"message": "Lỗi server"}), 500


# 🟡 Đăng nhập - KIỂM TRA TRONG MYSQL
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    if not username or not password:
        return jsonify({"message": "Thiếu thông tin đăng nhập"}), 400

    try:
        # ✅ Tìm user trong MySQL
        cursor = mysql.connection.cursor()
        if role:
            cursor.execute("SELECT * FROM users WHERE username = %s AND role = %s", (username, role))
        else:
            cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        
        user = cursor.fetchone()
        cursor.close()

        if not user:
            return jsonify({"message": "Sai tên đăng nhập hoặc vai trò"}), 401

        # ✅ Kiểm tra password
        if not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"message": "Sai mật khẩu"}), 401

        # ✅ Tạo JWT token
        token = jwt.encode({
            "user_id": user['id'],
            "username": user['username'],
            "role": user['role'],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "message": "Đăng nhập thành công",
            "token": token,
            "user": {
                "id": user['id'],
                "username": user['username'],
                "role": user['role']
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Lỗi đăng nhập: {e}")
        return jsonify({"message": "Lỗi server"}), 500


# 🔵 API kiểm tra kết nối database
@auth_bp.route('/test-db', methods=['GET'])
def test_db():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        cursor.close()
        return jsonify({"message": "✅ Kết nối database thành công"}), 200
    except Exception as e:
        return jsonify({"error": f"❌ Lỗi database: {str(e)}"}), 500