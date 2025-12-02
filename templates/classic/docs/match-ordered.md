# Match Ordered

Sortable interactive matching question template where items must be arranged in the correct order.

> [!TIP]
> Use this template when you need to memorize the exact order of items, such as priority lists, rankings, or sequences.

## Fields

Notes for `items`

- Each line starts with a category, followed by two colons separating it from the items under that category
- Each item is separated by two commas
- **Items are NOT shuffled** - they maintain their order for memorization
- Users drag items to reorder them within each category
- The correct order is checked when reviewing the answer

An example for learning priority of chemical suffixes:

```
1::Ketone
2::Aldehyde
3::Alkine
4::Alkane
5::Alkohole
6::Carbonsäuren
7::Cycloalkane
8::Amine
9::Ester
10::Alkene
11::Ether
```

| Field name | Description                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| question   | This is the stem of the question. It supports various content formats in Anki, including bold, formulas, etc. |
| items      | The category and items in the correct order                                                                   |
| note       | You can fill in detailed explanations, notes, etc., here.                                                     |

## How it works

- Items are displayed in their original order (not shuffled)
- Users can drag and drop items to reorder them within each category
- When showing the answer, correctly placed items are marked green
- Incorrectly placed items (but belonging to the category) are marked red
- Missing items are marked yellow
