// Layer defaults
let layers;

let isSelecting = false;
let selectStartGridSquare;
let selectEndGridSquare;
let selectionBox;
let selectedSquares = [];

let undoStack = [];
let redoStack = [];

// default layer
let currentLayer;

document.addEventListener('DOMContentLoaded', function () {
    initializeToolbars();
    initializeGrid();
    updateGridLayout();
    writeToGrid();
});

loadLayersFromLocalStorage();
resizeGrid();

function initializeGrid() {
    Object.keys(layers).forEach(layerId => {
        const layer = layers[layerId];
        const gridContainer = document.getElementById(layerId);

        for (let i = 0; i < 625; i++) {
            let gridSquare = document.createElement('div');
            gridSquare.classList.add('grid-square');
            gridSquare.dataset.layer = layerId;
            gridSquare.dataset.index = i;
            gridSquare.id = `${layerId}-${i}`;

            gridContainer.appendChild(gridSquare);
        }
    });

    // add event listener to grid wrapper
    const gridWrapper = document.getElementById('grid-wrapper');
    gridWrapper.addEventListener('mousedown', selectStart);
    gridWrapper.addEventListener('mouseup', selectEnd);
    gridWrapper.addEventListener('mousemove', selectMove);

    // add the select box to the grid wrapper
    selectionBox = document.createElement('div');
    selectionBox.classList.add('selection-box');
    selectionBox.style.display = 'none';
    selectionBox.tabIndex = 0;
    gridWrapper.appendChild(selectionBox);

    document.addEventListener('mousedown', function (event) {
        // check if the mouse is outside the grid wrapper
        if (!event.target.closest('#grid-wrapper')) {
            // clear all selected grid squares
            selectedSquares.forEach(gridSquare => {
                gridSquare.classList.remove('selected');
            });
            selectedSquares = [];

            // hide the selection box
            document.getElementsByClassName('selection-box')[0].style.display = 'none';
        }
    });

    // add handler for keyboard input
    selectionBox.addEventListener('keydown', handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
}

function updateGridLayout() {
    for (let layerId in layers) {
        if (layers.hasOwnProperty(layerId)) {
            const layer = layers[layerId];
            const scale = layer.scale;
            const gridContainer = document.getElementById(layerId);
            if (gridContainer) {
                const gridSize = gridContainer.offsetWidth / scale;
                gridContainer.style.gridTemplateColumns = `repeat(25, ${gridSize}px)`;
                gridContainer.style.gridTemplateRows = `repeat(25, ${gridSize}px)`;
                gridContainer.style.fontSize = `${gridSize * 0.8}px`; // Set font size to 80% of grid size
            }

            // Set the hue of the grid text
            gridContainer.style.color = `hsl(${layer.hue}, 100%, 50%)`;

            const layerToolbar = document.getElementById(`toolbar-container-${layerId}`);
            if (layerToolbar) {
                updateSliderThumbBackground(layerId, layer.hue);
            }

            // Set the hue of the grid outline
            const gridSquares = document.querySelectorAll(`#${layerId} .grid-square`);
            gridSquares.forEach(gridSquare => {
                gridSquare.style.borderColor = `hsl(${layer.hue}, 100%, 5%)`;
            });

        }
    }
}

// Call resizeGrid on window resize
window.addEventListener('resize', resizeGrid);

function resizeGrid() {

    // Get the grid wrapper and viewport dimensions
    const gridWrapper = document.getElementById('grid-wrapper');
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine the smaller dimension and calculate 75% of it
    const size = Math.min(viewportWidth, viewportHeight) * 0.75;

    gridWrapper.style.width = size + 'px';
    gridWrapper.style.height = size + 'px';

    updateGridLayout(); // Update grid layout based on new size
    updateSelectionBox(); // Update selection box based on new size
}

function saveLayersToLocalStorage() {
    // for each layer, update the layer content
    Object.keys(layers).forEach(layerId => {
        const layer = layers[layerId];

        layer.content = "";
        for (let i = 0; i < 625; i++) {
            const gridSquare = document.getElementById(`${layerId}-${i}`);

            layer.content += gridSquare.innerText ? gridSquare.innerText : ' ';
        }
    });

    const layersData = JSON.stringify(layers);
    localStorage.setItem('layersData', layersData);

    localStorage.setItem('undoStack', JSON.stringify(undoStack.slice(-500)));
}

function loadLayersFromLocalStorage() {
    const layersData = localStorage.getItem('layersData');
    const undoStackData = localStorage.getItem('undoStack');

    if (undoStackData && undoStackData.length > undoStack.length) {
        undoStack = JSON.parse(undoStackData);
    }

    if (layersData) {
        layers = JSON.parse(layersData);
        toast('Saved data found. Yay!');

    } else {
        layers = {
            layer1: {
                scale: 25,
                hue: 0,
                content: ' '.repeat(625)
            },
            layer2: {
                scale: 25,
                hue: 0,
                content: ' '.repeat(625)
            },
            layer3: {
                scale: 25,
                hue: 0,
                content: ' '.repeat(625)
            }
        };
    }

    // Populate the grid with the content from each layer
    if (layers[0]) {
        writeToGrid();
    }
}

function writeToGrid() {
    // Populate the grid with the content from each layer
    Object.keys(layers).forEach(layerId => {
        const layer = layers[layerId];

        for (let i = 0; i < 625; i++) {
            const gridSquare = document.getElementById(`${layerId}-${i}`);
            gridSquare.innerText = layer.content[i];
        }

        //set the hue number input
        const hueNumber = document.getElementById(`hueNumber-${layerId}`);
        hueNumber.value = layer.hue;

        //set the scale number input
        const scaleNumber = document.getElementById(`scaleNumber-${layerId}`);
        scaleNumber.value = layer.scale;

        //set the scale slider
        const scaleSlider = document.getElementById(`scaleSlider-${layerId}`);
        scaleSlider.value = layer.scale;

        //set the hue slider
        const hueSlider = document.getElementById(`hueSlider-${layerId}`);
        hueSlider.value = layer.hue;
    });
}

function undo() {

    // if undo stack is not empty
    if (undoStack.length > 0) {
        const layersData = undoStack.pop();
        pushRedo();

        console.log(layers);

        layers = JSON.parse(layersData);
        writeToGrid();
    } else {
        toast('Nothing to undo');
    }
}

function redo() {

    // if redo stack is not empty
    if (redoStack.length > 0) {
        const layersData = redoStack.pop();
        pushUndo();
        layers = JSON.parse(layersData);
        writeToGrid();
    } else {
        toast('Nothing to redo');
    }
}

function clearRedoStack() {
    redoStack = [];
}

function clearUndoStack() {
    undoStack = [];
}

function pushUndo() {
    const layersData = JSON.stringify(layers);

    // check if the current state is different from the last state
    if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== layersData) {
        undoStack.push(layersData);
    }
}

function pushRedo() {
    const layersData = JSON.stringify(layers);

    // check if the current state is different from the last state
    if (redoStack.length === 0 || redoStack[redoStack.length - 1] !== layersData) {
        redoStack.push(layersData);
    }
}

function toast(message) {
    // Create a new toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;

    // Append the toast to the body
    document.body.appendChild(toast);

    // Get all active toasts to determine stacking
    const existingToasts = document.querySelectorAll('.toast');
    const offset = 10; // Base offset from the bottom
    const spacing = 50; // Spacing between each toast

    // Position the new toast dynamically
    const position = offset + (existingToasts.length - 1) * spacing;
    toast.style.bottom = `${position}px`;

    // Trigger the fade-in effect
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove the toast after 2 seconds
    setTimeout(() => {
        toast.classList.remove('show'); // Fade out
        setTimeout(() => {
            toast.remove(); // Remove from DOM after fade-out
        }, 500); // Match the CSS transition duration
    }, 2000);
}





