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

    // Set the current layer to the first layer
    changeLayer('layer1');
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
    saveButton.textContent = 'Export';
    saveButton.setAttribute('onclick', "exportToClipboard()");

    // Append everything to the main div
    bottomToolBar.appendChild(clearAllButton);
    // bottomToolBar.appendChild(fileInput);
    bottomToolBar.appendChild(loadButton);
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

function clearLayer(layerId) {

    const layer = layers[layerId];
    layer.content = ' '.repeat(625);
    layer.scale = 25;
    layer.hue = 0;

    writeToGrid();
    updateGridLayout();
    saveLayersToLocalStorage();

    toast(layerId + ' cleared');
}

function clearAllLayers() {
    // Show the custom clear modal
    document.getElementById('clear-modal').style.display = 'block';

    // Wait for user interaction with the modal
    document.getElementById('clear-confirm-neg').onclick = function () {
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

        clearUndoStack();

        // Close the modal
        document.getElementById('clear-modal').style.display = 'none';

        toast('All layers cleared');
    };

    document.getElementById('clear-confirm-pos').onclick = function () {
        // User declined the action
        document.getElementById('clear-modal').style.display = 'none';
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