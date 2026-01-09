import genanki
import shutil
import json
from os import path
import os

build_dir = path.dirname(__file__)

release_dir = path.abspath(path.join(build_dir, "../output/release"))
dist_dir = path.abspath(path.join(build_dir, "../output/dist"))

if path.exists(release_dir):
    shutil.rmtree(release_dir)
os.makedirs(release_dir)

if not path.exists(dist_dir):
    print("dist folder not found")
    exit(1)

for name in os.listdir(dist_dir):
    folder = path.join(dist_dir, name)
    with open(path.join(folder, "build.json"), encoding="utf-8") as f:
        build = json.load(f)
    config = build["config"]
    notes = build["notes"]
    fields = build["fields"]
    print(f"package {config['name']}")
    with open(path.join(folder, "front.html"), encoding="utf-8") as f:
        front = f.read()
    with open(path.join(folder, "back.html"), encoding="utf-8") as f:
        back = f.read()

    model = genanki.Model(
        config["type_id"],
        f"IKKZ__{config['name']}".upper(),
        fields=list(map(lambda field: {"name": field, "font": "Arial"}, fields)),
        templates=[{"name": "Card 1", "qfmt": front, "afmt": back}],
    )
    deck = genanki.Deck(
        deck_id=config["deck_id"], name=f"{config['name']} demo by ikkz"
    )

    for note_config in notes:
        if "question" in note_config["fields"]:
            note_config["fields"]["question"] += f"<br>[{config['deck_id']}]"

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

    genanki.Package(deck).write_to_file(
        path.join(release_dir, f"{config['name']}.apkg")
    )
