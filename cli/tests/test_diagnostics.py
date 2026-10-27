import os
import unittest
from pathlib import Path
from unittest.mock import patch
from securegen.core.diagnostics import (
    check_env_api_keys,
    check_dataset_inventory,
    run_system_diagnostics,
)


class TestDiagnostics(unittest.TestCase):
    def test_check_env_api_keys_empty(self):
        with patch.dict(os.environ, {}, clear=True):
            keys = check_env_api_keys()
            self.assertFalse(keys["OPENAI_API_KEY"])
            self.assertFalse(keys["ANTHROPIC_API_KEY"])
            self.assertFalse(keys["GOOGLE_API_KEY"])

    def test_check_env_api_keys_present(self):
        with patch.dict(os.environ, {"OPENAI_API_KEY": "sk-test-12345"}, clear=True):
            keys = check_env_api_keys()
            self.assertTrue(keys["OPENAI_API_KEY"])
            self.assertFalse(keys["ANTHROPIC_API_KEY"])

    def test_check_dataset_inventory(self):
        datasets_path = Path(__file__).resolve().parent.parent.parent / "datasets"
        res = check_dataset_inventory(datasets_path)
        self.assertTrue(res["exists"])
        self.assertGreater(res["total_files"], 0)
        self.assertIn("prompt_injections", res["categories"])

    def test_run_system_diagnostics_structure(self):
        datasets_path = Path(__file__).resolve().parent.parent.parent / "datasets"
        diag = run_system_diagnostics(datasets_path)
        self.assertIn("overall_ready", diag)
        self.assertIn("api_keys", diag)
        self.assertIn("ollama_connected", diag)
        self.assertIn("datasets", diag)


if __name__ == "__main__":
    unittest.main()
