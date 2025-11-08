from flask import Blueprint, jsonify
from services.jwt_service import token_required

profile_bp = Blueprint("profile", __name__)

@profile_bp.route('/profile', methods=['GET'])
@token_required
def profile(current_user):
    return jsonify({
        "email": current_user,
        "message": "Profile info retrieved successfully"
    })
