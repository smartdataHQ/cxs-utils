import os
import sys
import json
import subprocess

def get_avro_library():
    """
    Tries to import the 'avro' library. If ImportError occurs,
    it attempts to install the 'avro-python3' package and then tries importing 'avro' again.
    Returns the 'avro' module object or None if it cannot be imported/installed.
    """
    try:
        import avro
        import avro.schema
        return avro
    except ImportError:
        print("Avro library not found. Attempting to install avro-python3...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "avro-python3"])
            # It's crucial to try importing again in a way that Python will find it.
            # Sometimes, sys.path might need to be refreshed or the module reloaded.
            # For simplicity, we'll try a fresh import.
            import avro
            import avro.schema
            print("Avro library installed successfully.")
            return avro
        except subprocess.CalledProcessError as e:
            print(f"Error installing avro-python3: {e}")
            return None
        except ImportError:
            print("Failed to import avro library even after attempting installation.")
            print("This can sometimes happen if the Python interpreter needs to be restarted "
                  "or if the installation path is not immediately available in sys.path.")
            return None

def validate_avro_schemas(schema_dir, avro_module):
    """
    Validates Avro schemas in the specified directory.

    Args:
        schema_dir (str): The path to the directory containing Avro schema files (.avsc).
        avro_module: The imported 'avro' module.

    Returns:
        int: 0 if all schemas are valid, 1 otherwise.
    """
    if not avro_module:
        print("Avro library is not available. Cannot validate schemas.")
        return 1

    if not os.path.isdir(schema_dir):
        print(f"Error: Schema directory '{schema_dir}' not found.")
        return 1

    error_count = 0
    files_checked = 0
    print(f"Scanning for .avsc files in '{schema_dir}'...")

    # Create a Names object to hold known schema types across files
    known_schemas = avro_module.schema.Names()

    # It's often better to parse files that define base types before files that reference them.
    # A multi-pass approach can resolve dependencies regardless of os.listdir() order.

    all_files = [f for f in os.listdir(schema_dir) if f.endswith(".avsc")]
    files_to_process = all_files[:]
    files_checked = len(all_files)

    pass_num = 0
    max_passes = len(all_files) + 1 # Max passes to prevent infinite loops with unresolvable schemas

    while files_to_process and pass_num < max_passes:
        pass_num += 1
        print(f"\n--- Validation Pass {pass_num} ---")
        successfully_parsed_in_pass = 0
        remaining_files_after_pass = []
        pass_errors = {}

        for filename in files_to_process:
            filepath = os.path.join(schema_dir, filename)
            if filepath in pass_errors: # Already failed in this pass with non-SchemaParseException
                remaining_files_after_pass.append(filename)
                continue

            print(f"Attempting to validate '{filepath}'...")
            try:
                with open(filepath, 'r') as f:
                    schema_content_json = json.load(f)

                avro_module.schema.SchemaFromJSONData(schema_content_json, known_schemas)
                print(f"SUCCESS: '{filepath}' is a valid Avro schema.")
                successfully_parsed_in_pass += 1
            except json.JSONDecodeError as e:
                msg = f"Could not parse JSON in '{filepath}'. Details: {e}"
                print(f"ERROR: {msg}")
                pass_errors[filepath] = msg
                remaining_files_after_pass.append(filename)
            except avro_module.schema.SchemaParseException as e:
                if "already exists" in str(e).lower():
                    print(f"INFO: Schema in '{filepath}' already known/processed. Details: {e}")
                    successfully_parsed_in_pass += 1 # Consider it progress for this pass
                else:
                    # Other SchemaParseException (like "Unknown named schema")
                    msg = f"Invalid Avro schema in '{filepath}' (may resolve in next pass). Details: {e}"
                    print(f"WARNING: {msg}")
                    pass_errors[filepath] = msg # Record error to report if it persists
                    remaining_files_after_pass.append(filename)
            except IOError as e:
                msg = f"Could not read file '{filepath}'. Details: {e}"
                print(f"ERROR: {msg}")
                pass_errors[filepath] = msg
                remaining_files_after_pass.append(filename)
            except Exception as e:
                msg = f"An unexpected error occurred with '{filepath}'. Details: {e}"
                print(f"ERROR: {msg}")
                pass_errors[filepath] = msg
                remaining_files_after_pass.append(filename)

        files_to_process = remaining_files_after_pass

        if successfully_parsed_in_pass == 0 and files_to_process:
            print("\nNo schemas successfully parsed in this pass. Remaining files may have unresolvable errors or circular dependencies.")
            break # Avoid infinite loop if no progress is made

    error_count = len(files_to_process) # Files that could not be processed are errors
    if error_count > 0:
        print("\n--- Final Errors After All Passes ---")
        for filename in files_to_process:
            filepath = os.path.join(schema_dir, filename)
            print(f"ERROR: File '{filepath}' could not be validated. Last known error: {pass_errors.get(filepath, 'Unknown error or not attempted in final pass')}")

    print("\n--- Validation Summary ---")
    print(f"Total .avsc files found: {files_checked}")
    print(f"Total errors found: {error_count}")

    return 0 if error_count == 0 else 1

if __name__ == "__main__":
    avro_lib = get_avro_library()

    if avro_lib is None:
        print("Fatal: Avro library could not be loaded. Exiting.")
        sys.exit(1)

    # Assuming the script is in cxs-schema and avro files are in cxs-schema/avro/
    # Adjust if the script is meant to be run from the root or another location.
    script_location_dir = os.path.dirname(os.path.abspath(__file__))
    schema_directory = os.path.join(script_location_dir, "avro")
    # If your avro/ folder is guaranteed to be a direct subdirectory of where the script is,
    # then "avro/" would also work if the script is CWD. But being explicit is safer.

    exit_code = validate_avro_schemas(schema_directory, avro_lib)

    if exit_code == 0:
        print("Overall validation successful: All Avro schemas are valid.")
    else:
        print("Overall validation failed: Some Avro schemas have errors.")

    sys.exit(exit_code)
