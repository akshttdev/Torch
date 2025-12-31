import ast
import pathlib
from typing import List, Dict


class CodeChunkExtractor(ast.NodeVisitor):
    """
    Extracts top-level classes and functions from a Python file
    using AST, preserving source code and metadata.
    """

    def __init__(self, source: str, file_path: str):
        self.source = source
        self.lines = source.splitlines()
        self.file_path = file_path
        self.chunks: List[Dict] = []

    def _get_source_segment(self, node: ast.AST) -> str:
        """Safely extract source code for an AST node."""
        start = node.lineno - 1
        end = getattr(node, "end_lineno", node.lineno)  # Python 3.9+
        return "\n".join(self.lines[start:end])

    def _add_chunk(self, node: ast.AST, chunk_type: str):
        name = getattr(node, "name", "<anonymous>")
        docstring = ast.get_docstring(node)

        code = self._get_source_segment(node)

        self.chunks.append({
            "content": code,
            "type": chunk_type,          # class | function
            "symbol": name,
            "docstring": docstring,
            "file_path": self.file_path,
            "start_line": node.lineno,
            "end_line": getattr(node, "end_lineno", node.lineno),
        })

    def visit_ClassDef(self, node: ast.ClassDef):
        self._add_chunk(node, "class")
        self.generic_visit(node)  # allow nested defs if needed

    def visit_FunctionDef(self, node: ast.FunctionDef):
        self._add_chunk(node, "function")

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self._add_chunk(node, "function")


def parse_python_file(path: str) -> List[Dict]:
    """
    Parse a Python file and return semantic code chunks.

    Returns:
        List of dicts with:
        - content
        - type
        - symbol
        - docstring
        - file_path
        - start_line
        - end_line
    """
    path = pathlib.Path(path)

    try:
        source = path.read_text(encoding="utf-8")
    except Exception:
        return []

    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []

    extractor = CodeChunkExtractor(source, str(path))
    extractor.visit(tree)

    return extractor.chunks