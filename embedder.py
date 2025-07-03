import pandas as pd
from openai import OpenAI
import os
import pickle
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity
from tqdm import tqdm

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
DATA_PATH = 'data/March2025MOD.csv'
VECTOR_STORE_PATH = 'vector_store.pkl'

def get_embedding(text, model="text-embedding-3-small"):
 response = client.embeddings.create(
input=[text],
model=model
)
 return response.data[0].embedding

def generate_embeddings():
    df = pd.read_csv(DATA_PATH)
    records = []

    for i, row in df.iterrows():
        text = f"LRNo: {row['LRNo']}, City: {row['CityName']}, Date: {row['LRDate']}, Boxes: {row['NoOfBox']}, Weight: {row['Weight']},InvoiceNumber: {row['InvoiceNumber']},InvoiceDate: {row['InvoiceDate']},PartyName: {row['PartyName']},CityName: {row['CityName']}, District: {row['District']}, State: {row['State']}, Amount: {row['Amount']}, Transport: {row['TransportName']},Remark: {row['Remark']}"
        records.append((text, row.to_dict()))

    vectors = []
    for text, meta in tqdm(records, desc="Embedding Records"):
        try:
            embedding = get_embedding(text, model="text-embedding-3-small")
            vectors.append((embedding, text, meta))
        except Exception as e:
            print(f"Error: {e}")

    with open(VECTOR_STORE_PATH, 'wb') as f:
        pickle.dump(vectors, f)

    print(f"Saved {len(vectors)} vectors to {VECTOR_STORE_PATH}")

if __name__ == "__main__":
    generate_embeddings()
