
import os
import sys
import subprocess
import platform
import venv

# --- Configuration ---
MIN_PYTHON_VERSION = (3, 11)
MIN_NODE_VERSION = (18, 0)
VENV_NAME = "venv"
FRONTEND_DIR = "frontend"
BACKEND_DIR = "backend"
REQUIREMENTS_FILE = os.path.join(BACKEND_DIR, "requirements.txt")

# --- Rich-like Console Output (simplified) ---
class Console:
    """A simple class to print colored text to the console."""
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    BOLD = "\033[1m"
    END = "\033[0m"

    def print(self, message, style=""):
        """Prints a message with a given style."""
        print(f"{style}{message}{self.END}")

    def rule(self, title, style=""):
        """Prints a horizontal rule with a title."""
        self.print(f"
--- {title} ---", style=f"{self.BOLD}{style}")

console = Console()

# --- Helper Functions ---
def get_python_executable():
    """Returns the name of the Python executable."""
    return sys.executable

def run_command(command, cwd=None, shell=True):
    """Runs a command and returns its output."""
    console.print(f"Running: {' '.join(command)}", style=Console.YELLOW)
    try:
        process = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True,
            cwd=cwd,
            shell=shell,
            encoding='utf-8'
        )
        if process.stdout:
            console.print(process.stdout.strip())
        return True, process.stdout
    except subprocess.CalledProcessError as e:
        console.print(f"Error running command: {' '.join(command)}", style=Console.RED)
        console.print(e.stderr, style=Console.RED)
        return False, e.stderr
    except FileNotFoundError:
        console.print(f"Command not found: {command[0]}", style=Console.RED)
        return False, f"Command not found: {command[0]}"


def check_version(command, min_version, version_arg="-V"):
    """Checks if a command's version is sufficient."""
    try:
        is_windows = platform.system() == "Windows"
        cmd = command if is_windows else [command]
        
        # Node.js uses -v, Python uses -V or --version
        if command == 'node':
            version_arg = '-v'
        elif command.startswith('python'):
            version_arg = '--version'

        process = subprocess.run(
            f"{cmd} {version_arg}",
            shell=True,
            capture_output=True,
            text=True,
            check=True,
        )
        
        version_str = process.stdout.strip().split()[-1]
        if version_str.startswith('v'):
            version_str = version_str[1:]

        version = tuple(map(int, version_str.split('.')[:2]))

        if version >= min_version:
            console.print(f"[green]✔ {command} version {version_str} is sufficient.[/green]")
            return True
        else:
            console.print(
                f"[red]✖ {command} version {version_str} is too old. "
                f"Please upgrade to {'.'.join(map(str, min_version))}+.[/red]"
            )
            return False
    except (subprocess.CalledProcessError, FileNotFoundError, IndexError):
        console.print(f"[red]✖ {command} not found. Please install it.[/red]")
        return False


# --- Setup Steps ---
def check_system_requirements():
    """Checks for all required system dependencies."""
    console.rule("Checking System Requirements")
    checks = {
        "Python": check_version(get_python_executable(), MIN_PYTHON_VERSION),
        "Node.js": check_version("node", MIN_NODE_VERSION),
        "npm": run_command(["npm", "--version"])[0],
        "Docker": run_command(["docker", "--version"])[0],
        "Docker Compose": run_command(["docker-compose", "--version"])[0]
    }
    
    if all(checks.values()):
        console.print("
[green]✔ All system requirements are met.[/green]")
        return True
    else:
        console.print("
[red]✖ Some system requirements are not met. Please review the errors above.[/red]")
        return False

def setup_backend_environment():
    """Sets up the Python virtual environment and installs dependencies."""
    console.rule("Setting up Backend Environment")
    
    # Create virtual environment
    if not os.path.exists(VENV_NAME):
        console.print(f"Creating virtual environment: {VENV_NAME}")
        try:
            venv.create(VENV_NAME, with_pip=True)
            console.print("[green]✔ Virtual environment created.[/green]")
        except Exception as e:
            console.print(f"[red]✖ Failed to create virtual environment: {e}[/red]")
            return False
    else:
        console.print("Virtual environment already exists.")

    # Determine paths for activation and pip
    if platform.system() == "Windows":
        python_exec = os.path.join(VENV_NAME, "Scripts", "python.exe")
        pip_exec = os.path.join(VENV_NAME, "Scripts", "pip.exe")
    else:
        python_exec = os.path.join(VENV_NAME, "bin", "python")
        pip_exec = os.path.join(VENV_NAME, "bin", "pip")
    
    # Upgrade pip
    console.print("Upgrading pip...")
    success, _ = run_command([pip_exec, "install", "--upgrade", "pip"])
    if not success:
        return False
        
    # Install backend dependencies
    console.print("Installing backend dependencies from requirements.txt...")
    if os.path.exists(REQUIREMENTS_FILE):
        success, _ = run_command([pip_exec, "install", "-r", REQUIREMENTS_FILE])
        if not success:
            return False
    else:
        console.print(f"[yellow]Warning: {REQUIREMENTS_FILE} not found. Skipping dependency installation.[/yellow]")
    
    console.print("[green]✔ Backend environment setup complete.[/green]")
    return True

def setup_frontend_environment():
    """Sets up the Node.js environment and installs dependencies."""
    console.rule("Setting up Frontend Environment")

    if not os.path.isdir(FRONTEND_DIR):
        console.print(f"[red]✖ Frontend directory '{FRONTEND_DIR}' not found.[/red]")
        return False

    console.print("Installing frontend dependencies with npm...")
    success, _ = run_command(["npm", "install"], cwd=FRONTEND_DIR)

    if success:
        console.print("[green]✔ Frontend environment setup complete.[/green]")
    else:
        console.print("[red]✖ Frontend setup failed.[/red]")

    return success

# --- Main Execution ---
def main():
    """The main function to run the setup script."""
    console.rule("Smart Queue Management System Environment Setup", style=Console.BLUE)

    if not check_system_requirements():
        sys.exit(1)

    if not setup_backend_environment():
        sys.exit(1)

    if not setup_frontend_environment():
        sys.exit(1)
        
    console.rule("Setup Complete!", style=Console.GREEN)
    console.print("You can now start the application using Docker:")
    console.print("docker-compose up --build", style=Console.BOLD)

if __name__ == "__main__":
    main()
