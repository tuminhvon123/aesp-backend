from flask import Flask
from flask_cors import CORS
from db import init_db
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
app = Flask(__name__)
CORS(app)

# ✅ Khởi tạo database
init_db(app)

# ✅ Đăng ký blueprint
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(admin_bp, url_prefix='/auth')

@app.route('/')
def home():
    return "User Service is running! (MySQL)"

if __name__ == '__main__':
    app.run(debug=True, port=5001)