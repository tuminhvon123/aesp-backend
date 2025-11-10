# routes/admin_routes.py
from flask import Blueprint, request, jsonify  # ✅ THÊM request
from db import mysql

# ✅ ĐỊNH NGHĨA admin_bp TRƯỚC
admin_bp = Blueprint('admin', __name__)

# 🔴 ADMIN API - Lấy danh sách tất cả users
@admin_bp.route('/admin/users', methods=['GET'])
def get_all_users():
    try:
        cursor = mysql.connection.cursor()
        
        # ✅ Chỉ lấy các cột cơ bản
        cursor.execute("SELECT id, username, role FROM users ORDER BY id DESC")
        users = cursor.fetchall()
        cursor.close()
        
        # ✅ Thống kê
        total_users = len(users)
        learners = len([u for u in users if u['role'] == 'learner'])
        mentors = len([u for u in users if u['role'] == 'mentor'])
        admins = len([u for u in users if u['role'] == 'admin'])

        return jsonify({
            "success": True,
            "users": users,
            "stats": {
                "total": total_users,
                "learners": learners,
                "mentors": mentors,
                "admins": admins
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Lỗi lấy danh sách users: {e}")
        return jsonify({
            "success": False,
            "error": f"Không thể lấy danh sách người dùng: {str(e)}"
        }), 500


# 🔴 ADMIN API - Xóa user
@admin_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        cursor = mysql.connection.cursor()
        
        # Kiểm tra user có tồn tại không
        cursor.execute("SELECT username, role FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            return jsonify({
                "success": False,
                "error": "User không tồn tại"
            }), 404

        # Không cho xóa admin
        if user['role'] == 'admin':
            cursor.close()
            return jsonify({
                "success": False,
                "error": "Không thể xóa tài khoản admin"
            }), 400

        # Xóa user
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            "success": True,
            "message": f"Đã xóa user {user['username']} thành công"
        }), 200
        
    except Exception as e:
        print(f"❌ Lỗi xóa user: {e}")
        return jsonify({
            "success": False,
            "error": f"Không thể xóa user: {str(e)}"
        }), 500


# 🔴 ADMIN API - Cập nhật role user
@admin_bp.route('/admin/users/<int:user_id>/role', methods=['PUT'])
def update_user_role(user_id):
    try:
        data = request.get_json()
        new_role = data.get('role')
        
        if not new_role or new_role not in ['learner', 'mentor', 'admin']:
            return jsonify({
                "success": False,
                "error": "Role không hợp lệ"
            }), 400

        cursor = mysql.connection.cursor()
        
        # Kiểm tra user có tồn tại không
        cursor.execute("SELECT username FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            return jsonify({
                "success": False,
                "error": "User không tồn tại"
            }), 404

        # Cập nhật role
        cursor.execute("UPDATE users SET role = %s WHERE id = %s", (new_role, user_id))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify({
            "success": True,
            "message": f"Đã cập nhật role của {user['username']} thành {new_role}"
        }), 200
        
    except Exception as e:
        print(f"❌ Lỗi cập nhật role: {e}")
        return jsonify({
            "success": False,
            "error": f"Không thể cập nhật role: {str(e)}"
        }), 500


# 🔴 ADMIN API - Lấy thông tin user cụ thể
@admin_bp.route('/admin/users/<int:user_id>', methods=['GET'])
def get_user_detail(user_id):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT 
                id, 
                username, 
                role
            FROM users 
            WHERE id = %s
        """, (user_id,))
        
        user = cursor.fetchone()
        cursor.close()

        if not user:
            return jsonify({
                "success": False,
                "error": "User không tồn tại"
            }), 404

        return jsonify({
            "success": True,
            "user": user
        }), 200
        
    except Exception as e:
        print(f"❌ Lỗi lấy thông tin user: {e}")
        return jsonify({
            "success": False,
            "error": f"Không thể lấy thông tin user: {str(e)}"
        }), 500


# 🔴 ADMIN API - Kiểm tra kết nối
@admin_bp.route('/admin/test', methods=['GET'])
def admin_test():
    return jsonify({
        "success": True,
        "message": "Admin routes đang hoạt động!"
    }), 200