from app.rag.pipeline import retrieve
import time

def run():
    query = "Why does backward retain_graph cause memory leak?"

    print("First call (no cache)")
    r1 = retrieve(query)

    print("\nSecond call (cached)")
    r2 = retrieve(query)

    assert r1 == r2
    print("✅ Cache hit confirmed")

if __name__ == "__main__":
    run()