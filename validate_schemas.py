import json
import os
import subprocess
import sys

# This function will try to import jsonschema and install if not found.
# It returns the module object if successful, or None otherwise.
def get_jsonschema_module():
    try:
        import jsonschema
        return jsonschema
    except ImportError:
        print("jsonschema library not found. Installing...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "jsonschema"])
            # After installation, try to import again
            import jsonschema
            print("jsonschema installed successfully.")
            return jsonschema
        except (subprocess.CalledProcessError, ImportError) as e:
            print(f"Error during jsonschema installation or import: {e}")
            return None

def validate_json_schemas(schema_dir, jsonschema_module):
    if not jsonschema_module:
        print("jsonschema module not available. Cannot validate.")
        return 1

    print(f"Validating schemas in directory: {schema_dir}")
    error_count = 0
    files_checked = 0

    if not os.path.isdir(schema_dir):
        print(f"Error: Directory '{schema_dir}' not found.")
        return 1

    try:
        if not os.path.exists(schema_dir):
             print(f"Error: Schema directory '{schema_dir}' does not exist.")
             return 1

        filenames = [f for f in os.listdir(schema_dir) if os.path.isfile(os.path.join(schema_dir, f))]
    except Exception as e:
        print(f"Error listing files in directory {schema_dir}: {e}")
        return 1

    for filename in filenames:
        if filename.endswith(".json"):
            filepath = os.path.join(schema_dir, filename)
            files_checked += 1
            print(f"--- Validating {filepath} ---")
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    schema_content = json.load(f)

                # Use the passed jsonschema_module
                if schema_content.get("$schema") == "https://json-schema.org/draft/2020-12/schema":
                    jsonschema_module.Draft202012Validator.check_schema(schema_content)
                    print(f"SUCCESS: {filename} is a valid Draft 2020-12 JSON Schema.\n")
                else:
                    validator_class = jsonschema_module.validators.validator_for(schema_content)
                    validator_class.check_schema(schema_content)
                    print(f"WARNING: {filename} does not explicitly state Draft 2020-12 via $schema or uses a different draft. Validated with {validator_class.__name__}. Manual check advised for 2020-12 specifics if required.\n")

            except json.JSONDecodeError as e:
                print(f"ERROR: {filename} - Invalid JSON: {e}\n")
                error_count += 1
            except jsonschema_module.exceptions.SchemaError as e: # Use qualified exception
                print(f"ERROR: {filename} - Schema validation error: {e}\n")
                error_count += 1
            except Exception as e:
                print(f"ERROR: {filename} - An unexpected error occurred: {e}\n")
                error_count += 1
        elif filename == "README.md":
            pass

    print(f"--- Validation Summary ---")
    print(f"Total JSON files found and checked: {files_checked}")
    print(f"Total schema errors found: {error_count}")

    if error_count > 0:
        return 1
    return 0

if __name__ == "__main__":
    # Attempt to get the jsonschema module (installing if necessary)
    jsonschema_lib = get_jsonschema_module()

    if not jsonschema_lib:
        print("FATAL: jsonschema module could not be loaded or installed. Exiting.")
        sys.exit(1)

    # Proceed with validation using the loaded module
    schema_directory = "schema/json-schema/"
    exit_code = validate_json_schemas(schema_directory, jsonschema_lib)

    if exit_code == 0:
        print("\nAll checked JSON schemas are valid.")
    else:
        print("\nSome JSON schemas have errors.")
    sys.exit(exit_code)
