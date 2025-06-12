import sys
import os
import json
import argparse
from pathlib import Path

script_dir = Path(__file__).parent.absolute()
project_root = script_dir.parent
sys.path.insert(0, str(project_root))

from event_validator import (
    validate_event_file,
    validate_events_directory
)

def print_validation_results(path, is_valid, errors, warnings):
    filename = os.path.basename(path)
    
    if is_valid and not warnings:
        print(f" {filename}: Validation passed!")
    elif is_valid:
        print(f"  {filename}: Passed with warnings:")
        for i, warning in enumerate(warnings, 1):
            print(f"  {i}. {warning}")
    else:
        print(f" {filename}: Validation failed:")
        for i, error in enumerate(errors, 1):
            print(f"  {i}. {error}")
        
        if warnings:
            print("  Warnings:")
            for i, warning in enumerate(warnings, 1):
                print(f"  {i}. {warning}")
    
    print("")


def validate_all_events(dir_path, summary=False):
    results = validate_events_directory(dir_path)
    
    if "error" in results:
        print(f"Error: {results['error']}")
        return False
    
    success = True
    issues = 0
    
    for file_path, result in results.items():
        if summary:
            if not result["is_valid"] or result["warnings"]:
                issues += 1
                filename = os.path.basename(file_path)
                status = "" if result["is_valid"] else ""
                print(f"{status} {filename}: {len(result['errors'])} errors, {len(result['warnings'])} warnings")
        else:
            print_validation_results(
                file_path,
                result["is_valid"],
                result["errors"],
                result["warnings"]
            )
        
        if not result["is_valid"]:
            success = False
    
    if summary:
        total = len(results)
        valid = sum(1 for r in results.values() if r["is_valid"])
        print(f"\nValidation summary: {valid}/{total} files valid, {issues} files with issues")
    
    return success


def main():
    parser = argparse.ArgumentParser(description="Validate Context Suite semantic events")
    
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("file", nargs="?", help="JSON file to validate")
    group.add_argument("-d", "--dir", help="Directory containing JSON files to validate")
    
    parser.add_argument("-s", "--summary", action="store_true", help="Print only summary for directory validation")
    parser.add_argument("-j", "--json", action="store_true", help="Output validation results as JSON")
    
    args = parser.parse_args()
    
    if args.file:
        is_valid, errors, warnings = validate_event_file(args.file)
        
        if args.json:
            result = {
                "file": args.file,
                "is_valid": is_valid,
                "errors": errors,
                "warnings": warnings
            }
            print(json.dumps(result, indent=2))
        else:
            print_validation_results(args.file, is_valid, errors, warnings)
        
        return 0 if is_valid else 1
    
    elif args.dir:
        success = validate_all_events(args.dir, args.summary)
        return 0 if success else 1
    
    return 1


if __name__ == "__main__":
    sys.exit(main())
