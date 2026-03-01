# Pairwise Ranking in Obsidian
Simple plugin for using pairwise ranking to insert items (individual lines) onto a note that works on both mobile and desktop (via command palate).

The pairwise ranking logic uses a generic O(log n) binary insertion algorithm.

This focuses on insertion not on ranking an already existing list of items, but an existing list can be used as a ranking source for new items.

## Usage

1. Open a note, new or existing (each line will be treated as an existing ranking)
2. Open the command palate (`Ctrl`/`Cmd`+`P` on Desktop, via menu on mobile)
3. Search for command: `Pairwise Ranking: Add to Ranking` and select it
4. Enter your new item in the input box and select `Add`
5. If there are other items will present you with buttons to choose between your new item and an existing one until a ranking is determined, if no other items will just put it in the note
