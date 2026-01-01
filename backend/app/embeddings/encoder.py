from sentence_transformers import SentenceTransformer
from typing import List

# -------- Text Embeddings (Docs + Issues) --------
_text_model = None

def _load_text_model():
    global _text_model
    if _text_model is None:
        _text_model = SentenceTransformer("BAAI/bge-base-en-v1.5")
    return _text_model

def embed_text(texts: List[str]) -> List[list]:
    model = _load_text_model()
    return model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=False,
    ).tolist()


# -------- Code Embeddings --------
_code_model = None

def _load_code_model():
    global _code_model
    if _code_model is None:
        _code_model = SentenceTransformer("microsoft/codebert-base")
    return _code_model

def embed_code(texts: List[str]) -> List[list]:
    model = _load_code_model()
    return model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=False,
    ).tolist()