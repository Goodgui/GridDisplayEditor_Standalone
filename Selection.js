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

    // if selectStart righter than selectEnd, swap them
    if (parseInt(selectStartGridSquare.dataset.index) % 25 > parseInt(selectEndGridSquare.dataset.index) % 25) {
        const size = parseInt(selectStartGridSquare.dataset.index) % 25 - parseInt(selectEndGridSquare.dataset.index) % 25;
        const start = parseInt(selectStartGridSquare.dataset.index) - size;
        const end = parseInt(selectEndGridSquare.dataset.index) + size;
        selectStartGridSquare = document.querySelector(`[data-index="${start}"][data-layer="${currentLayer}"]`);
        selectEndGridSquare = document.querySelector(`[data-index="${end}"][data-layer="${currentLayer}"]`);
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

function isGridSquareInsideSelection(gridSquare, selectionBounds) {
    const rect = gridSquare.getBoundingClientRect();
    return rect.left < selectionBounds.right &&
        rect.right > selectionBounds.left &&
        rect.top < selectionBounds.bottom &&
        rect.bottom > selectionBounds.top;
}