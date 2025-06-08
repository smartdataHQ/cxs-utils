import os
import sys
import subprocess
import importlib

def get_pydantic_library():
    """
    Tries to import the 'pydantic' library. If ImportError occurs,
    it attempts to install 'pydantic' and then tries importing again.
    Returns the 'pydantic' module object or None if it cannot be imported/installed.
    """
    try:
        from cxs.schema import pydantic
        return pydantic
    except ImportError:
        print("Pydantic library not found. Attempting to install pydantic...")
        try:
            # Added --user, similar to the avro script fix
            subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "pydantic"])
            print("Pydantic installation attempted.")

            # Try to make the new package visible
            try:
                user_site_packages = subprocess.check_output(
                    [sys.executable, "-m", "site", "--user-site"],
                    text=True,
                    stderr=subprocess.STDOUT
                ).strip()
                if user_site_packages not in sys.path:
                    print(f"Adding user site-packages to sys.path: {user_site_packages}")
                    sys.path.insert(0, user_site_packages)

                if hasattr(importlib, 'invalidate_caches'):
                    importlib.invalidate_caches()

                # Try importing again using importlib
                pydantic = importlib.import_module("pydantic")
                print("Pydantic library imported successfully after installation.")
                return pydantic
            except Exception as e_import: # Catch broader exceptions during import attempt
                print(f"Error during post-installation import: {e_import}")
                print("Failed to import pydantic library even after attempting installation and path modification.")
                print("This can sometimes happen if the Python interpreter needs to be restarted.")
                return None
        except subprocess.CalledProcessError as e_pip:
            print(f"Error installing pydantic: {e_pip}")
            return None
        # The initial ImportError is caught by the outer try-except

def validate_pydantic_models(models_dir, pydantic_module):
    """
    Validates Pydantic models in the specified directory by attempting to import them.

    Args:
        models_dir (str): The path to the directory containing Pydantic model files (.py).
        pydantic_module: The imported 'pydantic' module.

    Returns:
        int: 0 if all models are valid (i.e., importable), 1 otherwise.
    """
    if not pydantic_module:
        print("Pydantic library is not available. Cannot validate models.")
        return 1

    if not os.path.isdir(models_dir):
        print(f"Error: Models directory '{models_dir}' not found.")
        return 1

    error_count = 0
    files_checked = 0
    print(f"Scanning for Pydantic model files in '{models_dir}'...")

    # Add the script's directory to sys.path to allow importing from the 'pydantic' subdirectory
    script_parent_dir = os.path.dirname(os.path.abspath(__file__))
    if script_parent_dir not in sys.path:
        sys.path.insert(0, script_parent_dir)
    # Also add the parent of models_dir if it's different and needed for pydantic package structure
    # For models_dir = "pydantic/", script_parent_dir (cxs-schema) is correct for `import pydantic.module`

    # Ensure the 'pydantic' subdirectory itself is treated as a package if it's not already
    # This typically means having an __init__.py in the 'pydantic' folder.
    # The validation script itself doesn't create this, assumes it exists if needed.

    for filename in os.listdir(models_dir):
        if filename.endswith(".py"):
            if filename == "__init__.py" or filename.startswith("test_"):
                print(f"Skipping '{filename}'.")
                continue

            files_checked += 1
            module_name_part = filename[:-3]  # Remove .py extension
            # Assuming models_dir is "pydantic/" relative to script location (cxs-schema)
            # Then the package is 'pydantic' and module is 'module_name_part'
            module_to_import = f"pydantic.{module_name_part}"

            filepath = os.path.join(models_dir, filename)
            print(f"Validating '{filepath}' (attempting import as '{module_to_import}')...")

            try:
                importlib.import_module(module_to_import)
                print(f"SUCCESS: '{filepath}' imported successfully (Pydantic models likely valid).")
            except ImportError as e:
                print(f"ERROR: Could not import module '{module_to_import}' from '{filepath}'. "
                      f"Missing dependency or issue within the file. Details: {e}")
                error_count += 1
            except pydantic_module.errors.PydanticSchemaGenerationError as e: # Catch Pydantic specific errors
                print(f"ERROR: Pydantic schema generation error in '{filepath}' ({module_to_import}). Details: {e}")
                error_count += 1
            except (TypeError, SyntaxError, AttributeError) as e:
                print(f"ERROR: Malformed model or code error in '{filepath}' ({module_to_import}). Details: {e}")
                error_count += 1
            except Exception as e:
                print(f"ERROR: An unexpected error occurred while importing '{filepath}' ({module_to_import}). Details: {e}")
                error_count += 1

    # Clean up sys.path if it was modified
    if script_parent_dir in sys.path and sys.path[0] == script_parent_dir :
         sys.path.pop(0)

    print("\n--- Validation Summary ---")
    print(f"Total Python model files checked: {files_checked}")
    print(f"Total errors found (import failures): {error_count}")

    return 0 if error_count == 0 else 1

if __name__ == "__main__":
    pydantic_lib = get_pydantic_library()

    if pydantic_lib is None:
        print("Fatal: Pydantic library could not be loaded. Exiting.")
        sys.exit(1)

    script_location_dir = os.path.dirname(os.path.abspath(__file__))
    # models_directory is "pydantic/" relative to the script's location (cxs-schema)
    models_directory = os.path.join(script_location_dir, "pydantic")

    # Before calling validation, ensure the target 'pydantic' directory (models_directory)
    # and its parent (script_location_dir) are correctly set up for Python's import mechanism.
    # The script adds script_location_dir to sys.path to find the 'pydantic' package.

    exit_code = validate_pydantic_models(models_directory, pydantic_lib)

    if exit_code == 0:
        print("Overall validation successful: All Pydantic model files are importable.")
    else:
        print("Overall validation failed: Some Pydantic model files have errors or could not be imported.")

    sys.exit(exit_code)
