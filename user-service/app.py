from flask import Flask
from routes.auth_routes import auth_bp
from routes.profile_routes import profile_bp

app = Flask(__name__)

# Đăng ký Blueprint
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(profile_bp, url_prefix="/user")

@app.route('/')
def home():
    return "✅ User Service is running..."

if __name__ == "__main__":
    app.run(port=5001, debug=True)
