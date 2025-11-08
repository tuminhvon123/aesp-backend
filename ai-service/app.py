from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from speech_analysis import speech_analyzer

app = Flask(__name__)
CORS(app)

# Store analysis results (in production, use database)
analysis_results = {}

@app.route('/ai/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "AI Speech Analysis",
        "version": "1.0.0"
    })

@app.route('/ai/analyze/speech', methods=['POST'])
def analyze_speech():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        # Save temporarily
        temp_path = f"temp_{audio_file.filename}"
        audio_file.save(temp_path)
        
        # Analyze speech
        analysis = speech_analyzer.analyze_audio(temp_path)
        
        # Clean up
        os.remove(temp_path)
        
        # Store result
        result_id = len(analysis_results) + 1
        analysis_results[result_id] = analysis
        
        return jsonify({
            "success": True,
            "analysis_id": result_id,
            "results": analysis
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai/analyze/text', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Text analysis
        word_count = len(text.split())
        sentence_count = text.count('.') + text.count('!') + text.count('?')
        
        analysis = {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "avg_word_length": sum(len(word) for word in text.split()) / word_count if word_count > 0 else 0,
            "sentiment": speech_analyzer.analyze_sentiment(text),
            "language": "english"
        }
        
        return jsonify({
            "success": True,
            "analysis": analysis
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ai/results/<int:result_id>', methods=['GET'])
def get_analysis_result(result_id):
    result = analysis_results.get(result_id)
    if result:
        return jsonify({"success": True, "result": result})
    else:
        return jsonify({"error": "Result not found"}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)