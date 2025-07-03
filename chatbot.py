import os
import pickle
import numpy as np
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity
from openai import OpenAI

# Load environment variables
load_dotenv()

# Set OpenAI API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

VECTOR_STORE_PATH = 'vector_store.pkl'

# Load vector store once
with open(VECTOR_STORE_PATH, 'rb') as f:
    vector_data = pickle.load(f)  # List of (embedding, text, meta)

def embed_text(text):
    response = client.embeddings.create(
        input=[text],
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

def generate_answer(user_message):
    user_embedding = embed_text(user_message)

    # Compute cosine similarity with each stored vector
    similarities = [
        (cosine_similarity([user_embedding], [vec])[0][0], text, meta)
        for vec, text, meta in vector_data
    ]

    top = sorted(similarities, key=lambda x: x[0], reverse=True)[:3]
    context = "\n".join([t for _, t, _ in top])

    prompt = f"You're a logistics assistant chatbot. Based on the following data:\n{context}\nAnswer the user's question: {user_message}"

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You're a helpful consignment assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    return response.choices[0].message.content
