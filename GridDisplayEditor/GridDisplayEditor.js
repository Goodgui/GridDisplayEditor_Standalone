// Layer defaults
let layers;

let isSelecting = false;
let selectStartGridSquare;
let selectEndGridSquare;
let selectionBox;
let selectedSquares = [];

// default layer
let currentLayer = 'layer1';

document.addEventListener('DOMContentLoaded', function () {
    initializeToolbars();
    initializeGrid();
    updateGridLayout();
    writeToGrid();
});

function initializeToolbars() {

    // Create the main toolbar
    toolbar = document.getElementById('toolbar');

    // Create the layer toolbars
    toolbar.appendChild(createToolbarLayer('layer1'));
    toolbar.appendChild(createToolbarLayer('layer2'));
    toolbar.appendChild(createToolbarLayer('layer3'));

    // Create the bottom toolbar
    body = document.getElementsByTagName('body')[0];
    body.appendChild(createBottomToolbar());
}

// add listeners to the whole document that will handle right click events
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

loadLayersFromLocalStorage();

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
    selectionBox.addEventListener('keydown', handleInput);
}

function selectStart(event) {
    event.preventDefault();

    // Confirm left mouse button is pressed
    if (event.button !== 0) return;

    // Get the grid square that was clicked, only if it's part of the current layer
    const gridSquare = event.target.closest(`#${currentLayer} .grid-square`);

    // Proceed only if a grid square of the current layer was clicked
    if (gridSquare) {
        selectStartGridSquare = gridSquare;
        selectEndGridSquare = gridSquare;

        // Show the selection box
        selectionBox.style.display = 'block';
        isSelecting = true;

        updateSelectionBox();
    }
}

function selectMove(event) {
    if (isSelecting) {
        // Get the current grid square under the mouse, only if it's part of the current layer
        const gridSquare = event.target.closest(`#${currentLayer} .grid-square`);

        // Proceed only if moving within a grid square of the current layer
        if (gridSquare) {
            selectEndGridSquare = gridSquare;
            updateSelectionBox();
        }
    }
}

function selectEnd(event) {
    isSelecting = false;

    // if selectStart bigger than selectEnd, swap them
    if (parseInt(selectStartGridSquare.dataset.index) > parseInt(selectEndGridSquare.dataset.index)) {
        [selectStartGridSquare, selectEndGridSquare] = [selectEndGridSquare, selectStartGridSquare];
    }
    selectionBox.focus();
}

function getSelectionBoxBounds() {
    const rect = selectionBox.getBoundingClientRect();
    return {
        top: rect.top + 3,
        left: rect.left + 3,
        right: rect.right - 3,
        bottom: rect.bottom - 3
    };
}

function isGridSquareInsideSelection(gridSquare, selectionBounds) {
    const rect = gridSquare.getBoundingClientRect();
    return rect.left < selectionBounds.right &&
        rect.right > selectionBounds.left &&
        rect.top < selectionBounds.bottom &&
        rect.bottom > selectionBounds.top;
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
                gridSquare.style.borderColor = `hsl(${layer.hue}, 100%, 20%)`;
            });

        }
    }
}

function updateSelectionBox() {

    // If the selection box is not visible, return
    if (!selectStartGridSquare || !selectEndGridSquare) return

    // Get the size and position of the grid squares
    const gridSize = selectStartGridSquare.offsetWidth;
    const startLeft = selectStartGridSquare.offsetLeft;
    const startTop = selectStartGridSquare.offsetTop;
    const endLeft = selectEndGridSquare.offsetLeft;
    const endTop = selectEndGridSquare.offsetTop;

    // Calculate the top-left corner of the selection box
    const boxLeft = Math.min(startLeft, endLeft);
    const boxTop = Math.min(startTop, endTop);

    // Calculate the size of the selection box
    const boxWidth = Math.abs(endLeft - startLeft) + gridSize;
    const boxHeight = Math.abs(endTop - startTop) + gridSize;

    // Set the position and size of the selection box
    selectionBox.style.left = boxLeft + 'px';
    selectionBox.style.top = boxTop + 'px';
    selectionBox.style.width = boxWidth - 3 + 'px'; // Adjusted for border
    selectionBox.style.height = boxHeight - 3 + 'px'; // Adjusted for border

    const selectionBounds = getSelectionBoxBounds();

    // Clear the selected squares array
    selectedSquares = [];

    // Iterate over each grid square in the current layer
    document.querySelectorAll(`#${currentLayer} .grid-square`).forEach(gridSquare => {
        if (isGridSquareInsideSelection(gridSquare, selectionBounds)) {
            selectedSquares.push(gridSquare);
            gridSquare.classList.add('selected');
        } else {
            gridSquare.classList.remove('selected');
        }
    });
}

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

// Call resizeGrid on window resize
window.addEventListener('resize', resizeGrid);

// Call resizeGrid on page load
resizeGrid();

function handleInput(event) {
    event.preventDefault();

    const startSquareIndex = parseInt(selectStartGridSquare.dataset.index);
    const endSquareIndex = parseInt(selectEndGridSquare.dataset.index);

    // layer scale
    const currentScale = parseInt(layers[currentLayer].scale);
    const totalSquares = currentScale * currentScale;

    if (event.key === 'Escape') {
        // hide the selection box
        selectionBox.style.display = 'none';
        return;
    }

    if (selectedSquares.length > 1) {

        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {

            switch (event.key) {
                case 'ArrowLeft':
                    // check if squares left of both start and end are inside the grid
                    if (startSquareIndex % 25 > 0) {
                        selectStartGridSquare = document.querySelector(`[data-index="${startSquareIndex - 1}"][data-layer="${currentLayer}"]`);
                        selectEndGridSquare = document.querySelector(`[data-index="${endSquareIndex - 1}"][data-layer="${currentLayer}"]`);
                    }
                    break;
                case 'ArrowRight':
                    // check if squares right of both start and end are inside the grid
                    if (endSquareIndex % 25 < currentScale - 1) {
                        selectStartGridSquare = document.querySelector(`[data-index="${startSquareIndex + 1}"][data-layer="${currentLayer}"]`);
                        selectEndGridSquare = document.querySelector(`[data-index="${endSquareIndex + 1}"][data-layer="${currentLayer}"]`);
                    }
                    break;
                case 'ArrowUp':
                    // check if squares above both start and end are inside the grid
                    if (startSquareIndex - currentScale >= 0 && endSquareIndex - currentScale >= 0) {
                        selectStartGridSquare = document.querySelector(`[data-index="${startSquareIndex - 25}"][data-layer="${currentLayer}"]`);
                        selectEndGridSquare = document.querySelector(`[data-index="${endSquareIndex - 25}"][data-layer="${currentLayer}"]`);
                    }
                    break;
                case 'ArrowDown':
                    // check if squares below both start and end are inside the grid
                    if (startSquareIndex + currentScale < totalSquares && endSquareIndex + currentScale < totalSquares) {
                        selectStartGridSquare = document.querySelector(`[data-index="${startSquareIndex + 25}"][data-layer="${currentLayer}"]`);
                        selectEndGridSquare = document.querySelector(`[data-index="${endSquareIndex + 25}"][data-layer="${currentLayer}"]`);
                    }
                    break;
            }

        } else if (event.key === 'Backspace' || event.key === 'Delete') {
            // delete the contents of all selected grid squares
            selectedSquares.forEach(gridSquare => {
                gridSquare.innerText = ' ';
            });

        } else if (event.key.length < 2) {
            // if the key pressed is not a special key, set the contents of all selected grid squares to the key
            selectedSquares.forEach(gridSquare => {
                gridSquare.innerText = event.key;
            });
        }
    } else {

        const currentIndex = parseInt(selectedSquares[0].dataset.index);

        //if arrow keys are pressed
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            switch (event.key) {
                case 'ArrowLeft':
                    // Wrap to the other end if at the start of the grid
                    const leftIndexInitial = currentIndex % 25 === 0 ? currentIndex - (26 - currentScale) : currentIndex - 1;
                    const leftIndex = leftIndexInitial < 0 ? leftIndexInitial + currentScale * 25 : leftIndexInitial;
                    selectStartGridSquare = document.querySelector(`[data-index="${leftIndex}"][data-layer="${currentLayer}"]`);
                    break;
                case 'ArrowRight':
                    // Wrap to the other end if at the end of the grid
                    const rightIndexInitial = currentIndex + 1 + ((currentIndex + 1) % 25 == currentScale) * (25 - currentScale)
                    const rightIndex = rightIndexInitial > (currentScale - 1) * 25 + currentScale ? 0 : rightIndexInitial;
                    selectStartGridSquare = document.querySelector(`[data-index="${rightIndex}"][data-layer="${currentLayer}"]`);
                    break;
                case 'ArrowUp':
                    // Wrap within the same column if at the top
                    const upIndexInitial = (currentIndex - 25) % 625 % (25 * currentScale);
                    const upIndex = upIndexInitial < 0 ? upIndexInitial + currentScale * 25 : upIndexInitial;
                    selectStartGridSquare = document.querySelector(`[data-index="${upIndex}"][data-layer="${currentLayer}"]`);
                    break;
                case 'ArrowDown':
                    // Wrap within the same column if at the bottom
                    const downIndex = (currentIndex + 25) % 625 % (25 * currentScale);
                    selectStartGridSquare = document.querySelector(`[data-index="${downIndex}"][data-layer="${currentLayer}"]`);
                    break;
            }
        } else if (event.key === 'Backspace') {
            // clear the previous grid square and move the cursor back
            const leftIndexInitial = currentIndex % 25 === 0 ? currentIndex - (26 - currentScale) : currentIndex - 1;
            const leftIndex = leftIndexInitial < 0 ? leftIndexInitial + currentScale * 25 : leftIndexInitial;
            selectStartGridSquare = document.querySelector(`[data-index="${leftIndex}"][data-layer="${currentLayer}"]`);

            selectedSquares[0].innerText = ' ';
        } else if (event.key === 'Delete') {
            // clear the current grid square
            selectedSquares[0].innerText = ' ';

        } else if (event.key.length < 2) {
            const rightIndexInitial = currentIndex + 1 + ((currentIndex + 1) % 25 == currentScale) * (25 - currentScale)
            const rightIndex = rightIndexInitial > (currentScale - 1) * 25 + currentScale ? 0 : rightIndexInitial;
            selectStartGridSquare = document.querySelector(`[data-index="${rightIndex}"][data-layer="${currentLayer}"]`);

            selectedSquares[0].innerText = event.key;
        }

        selectEndGridSquare = selectStartGridSquare;
    }

    updateGridLayout();
    updateSelectionBox();
    saveLayersToLocalStorage();
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
}

function loadLayersFromLocalStorage() {
    const layersData = localStorage.getItem('layersData');

    if (layersData) {
        layers = JSON.parse(layersData);

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

function clearLayer(layerId) {

    const layer = layers[layerId];
    layer.content = ' '.repeat(625);
    layer.scale = 25;
    layer.hue = 0;

    writeToGrid();
    updateGridLayout();
    saveLayersToLocalStorage();
}

function clearAllLayers() {
    // Show the custom confirmation modal
    document.getElementById('confirmation-modal').style.display = 'block';

    // Wait for user interaction with the modal
    document.getElementById('confirm-yes').onclick = function () {
        // User confirmed the action
        Object.keys(layers).forEach(layerId => {
            const layer = layers[layerId];
            layer.content = ' '.repeat(625);
            layer.scale = 25;
            layer.hue = 0;
        });

        //purge local storage to clear errors
        localStorage.removeItem('layersData');

        //populate grid
        writeToGrid();
        updateGridLayout();

        // Close the modal
        document.getElementById('confirmation-modal').style.display = 'none';
    };

    document.getElementById('confirm-no').onclick = function () {
        // User declined the action
        document.getElementById('confirmation-modal').style.display = 'none';
    };
}


function outlineToggle(layer) {
    // toggle the outline class on all grid squares in the layer
    const gridSquares = document.querySelectorAll(`#${layer} .grid-square`);
    const toolBarButton = document.getElementById(`toolbar-container-${layer}`).childNodes[1];
    gridSquares.forEach(gridSquare => {
        gridSquare.classList.toggle('grid-outline');
    });

    // toggle the outline button color
    toolBarButton.style.backgroundColor = toolBarButton.style.backgroundColor === 'rgb(66, 79, 107)' ? 'rgb(45, 52, 61)' : 'rgb(66, 79, 107)';
}

function syncSliderWithNumber(layerId, type) {
    const numberInput = document.getElementById(`${type}Number-${layerId}`);
    const slider = document.getElementById(`${type}Slider-${layerId}`);
    slider.value = numberInput.value;

    layers[layerId][type] = numberInput.value;

    updateGridLayout();
    saveLayersToLocalStorage();
}

function syncNumberWithSlider(layerId, type) {
    const numberInput = document.getElementById(`${type}Number-${layerId}`);
    const slider = document.getElementById(`${type}Slider-${layerId}`);
    numberInput.value = slider.value;

    layers[layerId][type] = slider.value;

    updateGridLayout();
    saveLayersToLocalStorage();
}

function changeLayer(layerId) {
    currentLayer = layerId;

    // Iterate over each layer
    Object.keys(layers).forEach(layer => {
        if (layer === layerId) {
            // If the layer is the current layer, set the toolbar to active
            document.getElementById(`${layer}`).style.pointerEvents = 'auto';
            // Update the layer button color
            document.getElementById(`toolbar-container-${layerId}`).childNodes[0].style.backgroundColor = 'rgb(66, 79, 107)';
        } else {
            // If the layer is not the current layer, set the toolbar to inactive
            document.getElementById(`${layer}`).style.pointerEvents = 'none';
            // Update the layer button color
            document.getElementById(`toolbar-container-${layer}`).childNodes[0].style.backgroundColor = 'rgb(45, 52, 61)';
        }
    });
}

function createToolbarLayer(layerId) {
    // Create the main div
    var toolbarLayer = document.createElement('div');
    toolbarLayer.className = 'toolbar-container';
    toolbarLayer.id = 'toolbar-container-' + layerId;

    // Create the toolbar layer button
    var changeLayerButton = document.createElement('button');
    changeLayerButton.className = 'toolbar-element';
    changeLayerButton.textContent = 'Edit ' + layerId;
    changeLayerButton.setAttribute('onclick', "changeLayer('" + layerId + "')");

    // Create the toggle outline button
    var toggleOutlineButton = document.createElement('button');
    toggleOutlineButton.className = 'toolbar-element';
    toggleOutlineButton.textContent = 'Outline';
    toggleOutlineButton.setAttribute('onclick', "outlineToggle('" + layerId + "')");

    // Create the scale slider
    var scaleContainer = document.createElement('div');
    scaleContainer.className = 'toolbar-element';

    // Create the scale text
    var scaleText = document.createElement('p1');
    scaleText.textContent = 'Scale:';

    // Create the scale number input
    var scaleNumber = document.createElement('input');
    scaleNumber.type = 'number';
    scaleNumber.id = 'scaleNumber-' + layerId;
    scaleNumber.value = 25;
    scaleNumber.min = 1;
    scaleNumber.max = 25;
    scaleNumber.oninput = function () { syncSliderWithNumber(layerId, 'scale'); };

    // Create the scale slider
    var scaleSlider = document.createElement('input');
    scaleSlider.type = 'range';
    scaleSlider.className = 'scale-slider';
    scaleSlider.id = 'scaleSlider-' + layerId;
    scaleSlider.min = 1;
    scaleSlider.max = 25;
    scaleSlider.value = 25;
    scaleSlider.oninput = function () { syncNumberWithSlider(layerId, 'scale'); };

    // Append everything to the scale container
    scaleContainer.appendChild(scaleText);
    scaleContainer.appendChild(scaleNumber);
    scaleContainer.appendChild(scaleSlider);

    // Create the hue slider
    var hueContainer = document.createElement('div');
    hueContainer.className = 'toolbar-element';

    // Create the hue text
    var hueP = document.createElement('p1');
    hueP.textContent = 'Hue:';

    // Create the hue number input
    var hueNumber = document.createElement('input');
    hueNumber.type = 'number';
    hueNumber.id = 'hueNumber-' + layerId;
    hueNumber.value = 0;
    hueNumber.min = 0;
    hueNumber.max = 360;
    hueNumber.oninput = function () { syncSliderWithNumber(layerId, 'hue'); };

    // Create the hue slider
    var hueSlider = document.createElement('input');
    hueSlider.type = 'range';
    hueSlider.className = 'hue-slider';
    hueSlider.id = 'hueSlider-' + layerId;
    hueSlider.min = 0;
    hueSlider.max = 360;
    hueSlider.value = 0;
    hueSlider.oninput = function () { syncNumberWithSlider(layerId, 'hue'); };

    // Append everything to the hue container
    hueContainer.appendChild(hueP);
    hueContainer.appendChild(hueNumber);
    hueContainer.appendChild(hueSlider);

    // Create the clear layer button
    var clearButton = document.createElement('button');
    clearButton.className = 'toolbar-element clear-layer';
    clearButton.textContent = 'Clear Layer';
    clearButton.setAttribute('onclick', "clearLayer('" + layerId + "')");

    // Append everything to the main div
    toolbarLayer.appendChild(changeLayerButton);
    toolbarLayer.appendChild(toggleOutlineButton);
    toolbarLayer.appendChild(scaleContainer);
    toolbarLayer.appendChild(hueContainer);
    toolbarLayer.appendChild(clearButton);

    // Return the complete toolbar layer
    return toolbarLayer;
}

function createBottomToolbar() {

    // Create the main div
    var bottomToolBar = document.createElement('div');
    bottomToolBar.className = 'toolbar-container';
    bottomToolBar.id = 'toolbar-container-bottom';
    bottomToolBar.style.marginTop = '20px';

    // Create the clear all button
    var clearAllButton = document.createElement('button');
    clearAllButton.className = 'toolbar-element clear-all toolbar-bottom';
    clearAllButton.textContent = 'Clear All';
    clearAllButton.setAttribute('onclick', "clearAllLayers()");

    // Create the file input
    var fileInput = document.createElement('input');
    fileInput.className = 'toolbar-element toolbar-bottom';
    fileInput.type = 'file';
    fileInput.id = 'file-input';

    // Create the load button
    var loadButton = document.createElement('button');
    loadButton.className = 'toolbar-element toolbar-bottom';
    loadButton.textContent = 'Import';
    loadButton.setAttribute('onclick', "importFromClipboard()");

    // Create the save button
    var saveButton = document.createElement('button');
    saveButton.className = 'toolbar-element toolbar-bottom';
    saveButton.textContent = 'Copy To Clipboard';
    saveButton.setAttribute('onclick', "exportToClipboard()");

    // Append everything to the main div
    bottomToolBar.appendChild(clearAllButton);
    // bottomToolBar.appendChild(fileInput);
    // bottomToolBar.appendChild(loadButton);
    bottomToolBar.appendChild(saveButton);

    return bottomToolBar;
}

function updateSliderThumbBackground(layerId, hue) {
    // Create a unique ID for the style tag
    const styleTagId = `slider-thumb-style-${layerId}`;
    let styleTag = document.getElementById(styleTagId);

    // If the style tag doesn't exist, create it and append it to <head>
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleTagId;
        document.head.appendChild(styleTag);
    }

    // Set the CSS rule for the specific slider thumb
    styleTag.textContent = `
        #hueSlider-${layerId}::-webkit-slider-thumb {
            background: radial-gradient(circle, hsl(${hue}, 100%, 50%), #ffffff);
        }
        #hueSlider-${layerId}::-moz-range-thumb {
            background: radial-gradient(circle, hsl(${hue}, 100%, 50%), #ffffff);
        }
    `;
}

function exportToClipboard() {
    let formattedString = '';
    Object.keys(layers).forEach(layerId => {
        const layer = layers[layerId];
        const contentLines = layer.content.match(/.{1,25}/g); // Split content into lines of 25 characters

        if (contentLines && contentLines.length > 0) {
            formattedString += `s= "${contentLines[0]}"+"${contentLines[1]}"`;
            for (let i = 2; i < contentLines.length; i += 2) {
                formattedString += `\ns+= "${contentLines[i]}"+"${(contentLines[i + 1] || '')}"`;
            }
            formattedString += `\n:L=${layerId.replace('layer', '')} :H=${layer.hue} :S=${layer.scale}\n`;
        }

        formattedString += '\n';
    });

    navigator.clipboard.writeText(formattedString)
        .catch(err => console.error('Failed to copy data to clipboard', err));
}
