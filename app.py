from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from chatbot import generate_answer

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    question = data.get('question', '')
    if not question:
        return jsonify({'answer': 'No question provided'}), 400

    try:
        response = generate_answer(question)
        return jsonify({'answer': response})
    except Exception as e:
        return jsonify({'answer': f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
