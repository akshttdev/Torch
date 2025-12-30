from sentence_transformers import SentenceTransformer

_model = None

def get_encoder():
    global _model
    if _model is None:
        _model = SentenceTransformer("BAAI/bge-base-en-v1.5")
    return _model

def embed(texts: list[str]) -> list[list[float]]:
    model = get_encoder()
    return model.encode(texts, normalize_embeddings=True).tolist()