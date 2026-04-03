import subprocess
import os
import shutil
from pathlib import Path

def test_extension_install_copilot(tmp_path: Path):
    """Test installing the extension in a temporary directory initialized with --ai copilot."""
    extension_root = Path(__file__).parent.parent.resolve()
    
    # Run specify init --here --ai copilot
    # Using 'specify' as the command which should be available via uv's PATH manipulation during pytest
    specify_cmd = shutil.which("specify")
    assert specify_cmd is not None, "specify command not found in PATH. Ensure specify-cli is installed."
    
    # Ensure python subprocess uses utf8 on windows
    subprocess_env = dict(os.environ, PYTHONIOENCODING="utf-8", PYTHONUTF8="1")
    
    init_result = subprocess.run(
        [specify_cmd, "init", "--here", "--ai", "copilot"],
        cwd=tmp_path,
        check=False,
        capture_output=True,
        input="\n",
        text=True,
        encoding="utf-8",
        env=subprocess_env
    )
    assert init_result.returncode == 0, f"specify init failed:\n{init_result.stdout}\n{init_result.stderr}"
    
    # Run specify extension add --dev <extension_root>
    add_result = subprocess.run(
        [specify_cmd, "extension", "add", "--dev", str(extension_root)],
        cwd=tmp_path,
        check=False,
        capture_output=True,
        input="n\n",
        text=True,
        encoding="utf-8",
        env=subprocess_env
    )
    if add_result.returncode != 0:
        Path("add_error.txt").write_text(f"stdout:\n{add_result.stdout}\n\nstderr:\n{add_result.stderr}", encoding="utf-8")
        assert False, "specify extension add failed. See add_error.txt for details."
    
    # Assert extension was added correctly
    conduct_ext_dir = tmp_path / ".specify" / "extensions" / "conduct"
    assert conduct_ext_dir.exists(), "Extension directory was not created."
    assert (conduct_ext_dir / "extension.yml").exists(), "Extension metadata file is missing."
    assert (conduct_ext_dir / "commands" / "conduct.md").exists(), "Extension commands file is missing."
    assert (conduct_ext_dir / "scripts" / "bash" / "load.sh").exists(), "Bash load script is missing."
    assert (conduct_ext_dir / "scripts" / "powershell" / "load.ps1").exists(), "Powershell load script is missing."
    
    # Assert ai integration files were added for copilot
    # The extension system will automatically register commands provided by extensions
    found_command = False
    for p in tmp_path.rglob("*"):
        if p.is_file() and (".github" in p.parts or ".vscode" in p.parts) and "test_dir" not in p.parts:
            try:
                content = p.read_text(encoding="utf-8")
                if "speckit.conduct.run" in content:
                    found_command = True
                    break
            except UnicodeDecodeError:
                pass
    
    assert found_command, "Command 'speckit.conduct.run' was not registered in any .github or .vscode file."
