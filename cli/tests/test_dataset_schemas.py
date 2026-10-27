import sys
import unittest
from pathlib import Path

# Add scripts directory to path to import validator
scripts_dir = Path(__file__).resolve().parent.parent.parent / "scripts"
if str(scripts_dir) not in sys.path:
    sys.path.insert(0, str(scripts_dir))

from validate_datasets import validate_all_datasets  # type: ignore


class TestDatasetSchemas(unittest.TestCase):
    def setUp(self):
        self.workspace_root = Path(__file__).resolve().parent.parent.parent
        self.datasets_root = self.workspace_root / "datasets"

    def test_all_datasets_valid(self):
        is_valid, errors, file_count, item_count = validate_all_datasets(self.datasets_root)
        self.assertTrue(is_valid, f"Validation failed with errors: {errors}")
        self.assertEqual(len(errors), 0)
        self.assertGreaterEqual(file_count, 10)
        self.assertGreaterEqual(item_count, 100)

    def test_prompt_injection_datasets_exist(self):
        pi_dir = self.datasets_root / "prompt_injections"
        self.assertTrue(pi_dir.exists())
        json_files = list(pi_dir.glob("*.json"))
        self.assertGreaterEqual(len(json_files), 3)

    def test_security_task_datasets_exist(self):
        st_dir = self.datasets_root / "security_tasks"
        self.assertTrue(st_dir.exists())
        json_files = list(st_dir.glob("*.json"))
        self.assertGreaterEqual(len(json_files), 4)


if __name__ == "__main__":
    unittest.main()
