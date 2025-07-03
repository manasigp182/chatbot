import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle

def build_vector_store(csv_path='data/March2025MOD.csv', output_path='vector_store.pkl'):
    df = pd.read_csv(csv_path)
    df['text'] = df.astype(str).agg(' | '.join, axis=1)
    vectorizer = TfidfVectorizer().fit(df['text'])
    vectors = vectorizer.transform(df['text'])
    with open(output_path, 'wb') as f:
        pickle.dump({'df': df, 'vectors': vectors, 'vectorizer': vectorizer}, f)

def search_similar(query, vector_store_path='vector_store.pkl', top_k=3):
    with open(vector_store_path, 'rb') as f:
        data = pickle.load(f)
    df, vectors, vectorizer = data['df'], data['vectors'], data['vectorizer']
    query_vec = vectorizer.transform([query])
    scores = cosine_similarity(query_vec, vectors)[0]
    top_indices = scores.argsort()[-top_k:][::-1]
    return df.iloc[top_indices]
