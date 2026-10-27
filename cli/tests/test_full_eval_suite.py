import unittest
from pathlib import Path
from securegen.core.datasets import (
    discover_datasets,
    merge_datasets,
    filter_by_severity,
    filter_by_category,
    filter_by_tags,
    sample_dataset,
)


class TestFullEvalSuite(unittest.TestCase):
    def setUp(self):
        self.workspace_root = Path(__file__).resolve().parent.parent.parent
        self.datasets_root = self.workspace_root / "datasets"
        self.sample_items = [
            {"id": "t1", "category": "prompt_injection", "severity": "critical", "tags": ["direct", "sql"]},
            {"id": "t2", "category": "jailbreak", "severity": "high", "tags": ["roleplay"]},
            {"id": "t3", "category": "prompt_injection", "severity": "low", "tags": ["indirect"]},
            {"id": "t4", "category": "prompt_injection", "severity": "medium", "tags": ["sql"]},
        ]

    def test_discover_datasets(self):
        discovered = discover_datasets(self.datasets_root)
        self.assertIn("attacks", discovered)
        self.assertIn("benchmarks", discovered)
        self.assertGreater(len(discovered["attacks"]), 0)
        self.assertGreater(len(discovered["benchmarks"]), 0)

    def test_merge_datasets(self):
        discovered = discover_datasets(self.datasets_root)
        merged = merge_datasets(discovered["attacks"][:2])
        self.assertIsInstance(merged, list)
        self.assertGreater(len(merged), 0)

    def test_filter_by_severity(self):
        critical_only = filter_by_severity(self.sample_items, "critical")
        self.assertEqual(len(critical_only), 1)
        self.assertEqual(critical_only[0]["id"], "t1")

        high_plus = filter_by_severity(self.sample_items, "high")
        self.assertEqual(len(high_plus), 2)

    def test_filter_by_category(self):
        jb = filter_by_category(self.sample_items, "jailbreak")
        self.assertEqual(len(jb), 1)
        self.assertEqual(jb[0]["id"], "t2")

    def test_filter_by_tags(self):
        sql_tagged = filter_by_tags(self.sample_items, ["sql"])
        self.assertEqual(len(sql_tagged), 2)

    def test_sample_dataset(self):
        sampled = sample_dataset(self.sample_items, 2, seed=42)
        self.assertEqual(len(sampled), 2)


if __name__ == "__main__":
    unittest.main()
