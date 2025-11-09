from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.profile_routes import profile_bp

app = Flask(__name__)

# ✅ Bật CORS cho toàn bộ API (cho phép React frontend kết nối)
CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ Đăng ký Blueprint
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(profile_bp, url_prefix="/user")

# ✅ Route kiểm tra server
@app.route('/')
def home():
    return "✅ User Service is running..."

if __name__ == "__main__":
    # ✅ Chạy trên 0.0.0.0 để frontend có thể truy cập
    app.run(host="0.0.0.0", port=5001, debug=True)
