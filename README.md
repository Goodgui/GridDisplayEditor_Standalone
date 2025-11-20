# Grid Display Editor

A standalone web-based character grid editor for creating ASCII art and text-based displays in the game StarBase.

## Features

### Selection & Editing Tools
- **Rectangular Selection**: Click and drag to select grid regions
- **Copy/Paste**: Copy selections with `Ctrl+C` and paste with `Ctrl+V`
- **Cut**: Cut selections with `Ctrl+X`
- **Move**: Hold `Ctrl` and use arrow keys to move selections
- **Keyboard Navigation**: Use arrow keys to navigate the grid
- **Bulk Editing**: Type to fill all selected squares simultaneously

### Export Formats
- **Raw Export**: Export layers in a readable format with layer metadata
- **Compressed Export**: Advanced compression algorithm optimized for YOLOL code generation
- **SPINE Export**: Export format directly for SPINE integration (in development)
- **SPINE 8x8 Icon Export**: Export 8x8 icons for SPINE integration

### Additional Features
- **Undo/Redo**: Full undo/redo support (`Ctrl+Z` / `Ctrl+Y`)
- **Auto-Save**: Automatically saves your work to browser localStorage
- **Clear Functions**: Clear individual layers or all layers at once
- **Size Indicator**: Shows selection dimensions when multiple squares are selected

## Usage

1. Visit the the [Online Browser Version](https://goodgui.github.io/GridDisplayEditor_Standalone/) or open `index.html` clone the repository and open it in a web browser
2. Select a layer to edit using the "Edit layer1/layer2/layer3" buttons
3. Click and drag on the grid to create selections
4. Type characters to fill selected squares

### Keyboard Shortcuts
- **Arrow Keys**: Navigate the grid or move selections
- **Ctrl+C**: Copy selection to clipboard
- **Ctrl+X**: Cut selection to clipboard
- **Ctrl+V**: Paste from clipboard
- **Ctrl+Z**: Undo last action
- **Ctrl+Y** or **Ctrl+Shift+Z**: Redo last action
- **Delete/Backspace**: Clear selected squares
- **Escape**: Cancel selection

3. Exported data is automatically copied to your clipboard


### Compression Algorithm
The compression system uses an extremely inefficient pattern matching algorithm to reduce string length for YOLOL code generation. If you have a complicated image without many repeating patterns it may take a few seconds to compress.

## Version

**Version 3.1_S** - Standalone Edition

## Credits
Made by Goodgu
Font is Telegrama Render by Yamaoka Yasuhiro [https://font.download/font/telegrama](https://font.download/font/telegrama) Starbase uses a modified version of this font ingame.
