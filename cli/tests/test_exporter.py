import json
import tempfile
import unittest
from pathlib import Path
from securegen.reporters.exporter import export_to_csv, export_to_jsonl


class TestExporter(unittest.TestCase):
    def setUp(self):
        self.sample_data = [
            {"id": "test_001", "category": "injection", "severity": "high", "tags": ["tag1", "tag2"]},
            {"id": "test_002", "category": "jailbreak", "severity": "medium", "tags": ["tag3"]},
        ]

    def test_export_to_jsonl(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "test.jsonl"
            count = export_to_jsonl(self.sample_data, out_path)
            self.assertEqual(count, 2)
            self.assertTrue(out_path.exists())

            lines = out_path.read_text(encoding="utf-8").strip().split("\n")
            self.assertEqual(len(lines), 2)
            parsed = json.loads(lines[0])
            self.assertEqual(parsed["id"], "test_001")

    def test_export_to_csv(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            out_path = Path(tmpdir) / "test.csv"
            count = export_to_csv(self.sample_data, out_path)
            self.assertEqual(count, 2)
            self.assertTrue(out_path.exists())

            content = out_path.read_text(encoding="utf-8")
            self.assertIn("id,category,severity,tags", content)
            self.assertIn("test_001", content)


if __name__ == "__main__":
    unittest.main()
