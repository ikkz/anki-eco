import genanki
import shutil
import json
import argparse
import sys
import re
from os import path
import os


def package_anki_deck(input_dir, output_dir):
    """
    Package an Anki deck from the given input directory.

    Args:
        input_dir: Directory containing build.json, front.html, back.html
        output_dir: Directory where the .apkg file will be saved
    """
    # Validate input directory
    if not path.exists(input_dir):
        print(f"Error: Input directory '{input_dir}' does not exist")
        return False

    build_json_path = path.join(input_dir, "build.json")
    front_html_path = path.join(input_dir, "front.html")
    back_html_path = path.join(input_dir, "back.html")

    # Check required files
    required_files = [build_json_path, front_html_path, back_html_path]
    for file_path in required_files:
        if not path.exists(file_path):
            print(f"Error: Required file '{file_path}' not found")
            return False

    # Create output directory if it doesn't exist
    if not path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        # Load build configuration
        with open(build_json_path, "r", encoding="utf-8") as f:
            build = json.load(f)

        notes = build["notes"]
        fields = build["fields"]

        # Get note type name and deck name from build config
        note_type_name = build["note_type_name"]
        deck_name = build["deck_name"]

        print(f"Packaging '{deck_name}' with note type '{note_type_name}'...")

        # Load HTML templates
        with open(front_html_path, "r", encoding="utf-8") as f:
            front = f.read()
        with open(back_html_path, "r", encoding="utf-8") as f:
            back = f.read()

        # Create Anki model
        model = genanki.Model(
            build["note_type_id"],
            note_type_name,
            fields=list(map(lambda field: {"name": field, "font": "Arial"}, fields)),
            templates=[{"name": "Card 1", "qfmt": front, "afmt": back}],
        )

        # Create deck
        deck = genanki.Deck(deck_id=build["deck_id"], name=deck_name)

        # Add notes to deck
        for note_config in notes:
            note = genanki.Note(
                model=model,
                fields=list(
                    map(
                        lambda field: note_config["fields"][field]
                        if field in note_config["fields"]
                        else "",
                        fields,
                    )
                ),
            )
            deck.add_note(note)

        # Generate output file path (using deck_name for filename)
        output_file = path.join(output_dir, f"{deck_name}.apkg")

        # Write package
        genanki.Package(deck).write_to_file(output_file)

        print(f"Successfully created '{output_file}'")
        return True

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in build.json: {e}")
        return False
    except KeyError as e:
        print(f"Error: Missing required key in build.json: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False


def process_multiple_decks(input_dir, output_dir):
    """
    Process multiple decks from subdirectories in the input directory.

    Args:
        input_dir: Directory containing subdirectories with deck data
        output_dir: Directory where .apkg files will be saved
    """
    if not path.exists(input_dir):
        print(f"Error: Input directory '{input_dir}' does not exist")
        return False

    # Create output directory if it doesn't exist
    if not path.exists(output_dir):
        os.makedirs(output_dir)

    success_count = 0
    total_count = 0

    # Process each subdirectory
    for name in os.listdir(input_dir):
        folder_path = path.join(input_dir, name)

        # Skip files, only process directories
        if not path.isdir(folder_path):
            continue

        total_count += 1
        print(f"\nProcessing directory: {name}")

        if package_anki_deck(folder_path, output_dir):
            success_count += 1

    print(f"\nProcessed {success_count}/{total_count} decks successfully")
    return success_count == total_count


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Package Anki decks from build artifacts",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Package a single deck
  python package.py -i /path/to/deck -o /path/to/output
  
  # Package multiple decks from subdirectories
  python package.py -i /path/to/dist -o /path/to/release --multiple
        """,
    )

    parser.add_argument(
        "-i",
        "--input",
        default=".",
        help="Input directory containing build.json, front.html, back.html (or subdirectories for --multiple)",
    )

    parser.add_argument(
        "-o", "--output", default=".", help="Output directory for .apkg files"
    )

    parser.add_argument(
        "--multiple",
        action="store_true",
        help="Process multiple decks from subdirectories in the input directory",
    )

    parser.add_argument(
        "--cwd",
        help="Change to this directory before processing",
        required=True,
    )

    args = parser.parse_args()

    def normalize_cwd(value: str) -> str:
        if os.name != "nt":
            return value
        if value.startswith("\\\\?\\"):
            return value
        if re.match(r"^[A-Za-z]:/", value):
            return value.replace("/", "\\")
        if re.match(r"^/[A-Za-z]/", value):
            drive = value[1].upper()
            rest = value[2:].replace("/", "\\").lstrip("\\")
            return f"{drive}:\\{rest}"
        return value

    # Change to specified cwd if provided
    if args.cwd:
        os.chdir(normalize_cwd(args.cwd))

    # Convert to absolute paths
    input_dir = path.abspath(args.input)
    output_dir = path.abspath(args.output)

    print(f"Input directory: {input_dir}")
    print(f"Output directory: {output_dir}")

    if args.multiple:
        success = process_multiple_decks(input_dir, output_dir)
    else:
        success = package_anki_deck(input_dir, output_dir)

    if not success:
        sys.exit(1)


if __name__ == "__main__":
    main()
