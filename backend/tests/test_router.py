from app.rag.router import route_query


def pretty(result):
    return {
        "collections": result["collections"],
        "weights": {k: round(v, 2) for k, v in result["weights"].items()},
        "top_k": result["top_k"],
    }


def run():
    test_queries = [
        "What does retain_graph do in backward?",
        "Why does backward retain_graph cause memory leak?",
        "How does autograd work in PyTorch?",
        "torch.nn.Module backward error",
        "CUDA crash during backward pass",
        "Explain torch.utils.checkpoint",
    ]

    for q in test_queries:
        print("=" * 80)
        print("QUERY:", q)
        result = route_query(q)
        print(pretty(result))


if __name__ == "__main__":
    run()