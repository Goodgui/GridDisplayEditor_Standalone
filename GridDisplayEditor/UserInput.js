// keep track of the keys that are currently pressed
const keysPressed = {};

// array to keep track of moved/copied grid squares
let copyMoveArray = [];
let copyMoveStartIndex;
let copyMoveEndIndex;


// add listeners to the whole document that will handle right click events
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

function handleKeyUp(event) {
    delete keysPressed[event.key];

    // if the control key is released, clear the copyMoveArray
    if (event.key === 'Control' && selectedSquares.length > 1) {
        endCopyMove();
        copyMoveArray = [];

        // set selectionbox color to yellow
        selectionBox.style.borderColor = 'yellow';
    }
}

function startCopyMove() {

    const startSquareIndex = parseInt(selectStartGridSquare.dataset.index);
    const endSquareIndex = parseInt(selectEndGridSquare.dataset.index);

    // save start and end square indices
    copyMoveStartIndex = startSquareIndex;
    copyMoveEndIndex = endSquareIndex;

    // if the control key is pressed copy the contents of the selected squares into copyMoveArray
    let columns = endSquareIndex % 25 - startSquareIndex % 25 + 1;
    let rows = Math.floor((endSquareIndex - startSquareIndex) / 25) + 1;

    // for each grid withing the selection, add the contents to copyMoveArray
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let index = startSquareIndex + i * 25 + j;
            let gridSquare = document.querySelector(`[data-index="${index}"][data-layer="${currentLayer}"]`);
            copyMoveArray.push(gridSquare.innerText);
        }
    }

    // set selectionbox color to blue
    selectionBox.style.borderColor = 'blue';
}

function endCopyMove() {
    // if the selection box has been moved, copy the contents of copyMoveArray into the selected squares
    const startSquareIndex = parseInt(selectStartGridSquare.dataset.index);
    const endSquareIndex = parseInt(selectEndGridSquare.dataset.index);

    let columns = copyMoveEndIndex % 25 - copyMoveStartIndex % 25 + 1;
    let rows = Math.floor((copyMoveEndIndex - copyMoveStartIndex) / 25) + 1;

    let hasMoved = copyMoveStartIndex !== startSquareIndex || copyMoveEndIndex !== endSquareIndex;

    if (hasMoved) {
        // clear the contents between the start and end squares
        clearOldSelection();

        // paste the contents of copyMoveArray into the selected squares
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                let index = startSquareIndex + i * 25 + j;
                let gridSquare = document.querySelector(`[data-index="${index}"][data-layer="${currentLayer}"]`);
                gridSquare.innerText = copyMoveArray[i * columns + j];
            }
        }

        clearRedoStack();
        pushUndo();
    }
}

function clearOldSelection() {
    let columns = copyMoveEndIndex % 25 - copyMoveStartIndex % 25 + 1;
    let rows = Math.floor((copyMoveEndIndex - copyMoveStartIndex) / 25) + 1;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let index = copyMoveStartIndex + r * 25 + c;
            let gridSquare = document.querySelector(`[data-index="${index}"][data-layer="${currentLayer}"]`);
            gridSquare.innerText = ' ';
        }
    }
}

function handleKeyDown(event) {
    event.preventDefault();

    keysPressed[event.key] = true;


    const startSquareIndex = parseInt(selectStartGridSquare.dataset.index);
    const endSquareIndex = parseInt(selectEndGridSquare.dataset.index);

    // layer scale
    const currentScale = parseInt(layers[currentLayer].scale);

    // if the escape key is pressed, hide the selection box and return
    if (event.key === 'Escape') {
        selectionBox.style.display = 'none';
        return;
    }


    // if the v key is pressed, load the selected squares from the clipboard
    if (keysPressed['Control']) {
        if (keysPressed['v']) {
            loadSelectionFromClipboard();
            clearRedoStack();
            pushUndo();

            toast('Pasted!');
            return;
        } else if (keysPressed['z']) {
            // undo the last action
            undo();
        } else if (keysPressed['y'] || keysPressed['Z']) {
            // redo the last action
            redo();
        }
    }


    // if multiple squares are selected
    if (selectedSquares.length > 1) {

        if (keysPressed['Control']) {

            // if the control key is pressed for the first time, start copying the selected squares
            if (copyMoveArray.length === 0) {
                startCopyMove();

                // if the c key is pressed, copy the selected squares
            } else if (keysPressed['c']) {
                saveSelectionToClipboard();

                toast('Copied!')
                return;

                // if the x key is pressed, copy the selected squares and clear the old selection
            } else if (keysPressed['x']) {
                saveSelectionToClipboard();
                clearOldSelection();
                clearRedoStack();
                pushUndo();

                toast('Cut!')
                return;
            }
        }

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
                    if (startSquareIndex - 25 >= 0) {
                        selectStartGridSquare = document.querySelector(`[data-index="${startSquareIndex - 25}"][data-layer="${currentLayer}"]`);
                        selectEndGridSquare = document.querySelector(`[data-index="${endSquareIndex - 25}"][data-layer="${currentLayer}"]`);
                    }
                    break;
                case 'ArrowDown':
                    // check if squares below both start and end are inside the grid
                    if (endSquareIndex < 25 * (currentScale - 1)) {
                        selectStartGridSquare = document.querySelector(`[data-index="${startSquareIndex + 25}"][data-layer="${currentLayer}"]`);
                        selectEndGridSquare = document.querySelector(`[data-index="${endSquareIndex + 25}"][data-layer="${currentLayer}"]`);
                    }
                    break;
            }

        } else if (!keysPressed['Control'] && (event.key === 'Backspace' || event.key === 'Delete')) {
            // delete the contents of all selected grid squares
            selectedSquares.forEach(gridSquare => {
                gridSquare.innerText = ' ';
            });

            clearRedoStack();
            pushUndo();

        } else if (!keysPressed['Control'] && event.key.length < 2) {
            // if the key pressed is not a special key, set the contents of all selected grid squares to the key
            selectedSquares.forEach(gridSquare => {
                gridSquare.innerText = event.key;
            });

            clearRedoStack();
            pushUndo();
        }
    } else if (!keysPressed['Control']) {

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
                    const rightIndex = rightIndexInitial >= (currentScale - 1) * 25 + currentScale ? 0 : rightIndexInitial;
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

            clearRedoStack();
            pushUndo();
        } else if (event.key === 'Delete') {
            // clear the current grid square
            selectedSquares[0].innerText = ' ';

            clearRedoStack();
            pushUndo();
        } else if (event.key.length < 2) {
            const rightIndexInitial = currentIndex + 1 + ((currentIndex + 1) % 25 == currentScale) * (25 - currentScale)
            const rightIndex = rightIndexInitial >= (currentScale - 1) * 25 + currentScale ? 0 : rightIndexInitial;
            selectStartGridSquare = document.querySelector(`[data-index="${rightIndex}"][data-layer="${currentLayer}"]`);

            selectedSquares[0].innerText = event.key;
            clearRedoStack();
            pushUndo();
        }

        selectEndGridSquare = selectStartGridSquare;
    }

    updateGridLayout();
    updateSelectionBox();
    saveLayersToLocalStorage();
}

function saveSelectionToClipboard() {
    let formattedString = '';
    const startSquareIndex = parseInt(selectStartGridSquare.dataset.index);
    const endSquareIndex = parseInt(selectEndGridSquare.dataset.index);

    let columns = endSquareIndex % 25 - startSquareIndex % 25 + 1;
    let rows = Math.floor((endSquareIndex - startSquareIndex) / 25) + 1;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let index = startSquareIndex + i * 25 + j;
            let gridSquare = document.querySelector(`[data-index="${index}"][data-layer="${currentLayer}"]`);
            formattedString += gridSquare.innerText;
        }
        // add a newline character after each row
        formattedString += '\n';
    }

    navigator.clipboard.writeText(formattedString)
        .catch(err => console.error('Failed to copy data to clipboard', err));
}

function loadSelectionFromClipboard() {
    navigator.clipboard.readText()
        .then(text => {
            const layerData = text.split('\r\n' || '\r' || '\n');

            const startSquareIndex = parseInt(selectStartGridSquare.dataset.index);

            // calculate the number of rows and columns in the layerData
            let columns = layerData[0].length;
            let rows = layerData.length;


            let index = 0;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < columns; c++) {
                    let gridSquare = document.querySelector(`[data-index="${startSquareIndex + r * 25 + c}"][data-layer="${currentLayer}"]`);
                    if (layerData[r][c] && layerData[r][c] !== ('\n' || '\r' || '\r\n')) {
                        gridSquare.innerText = layerData[r][c];
                    }
                    index++;
                }
            }

            saveLayersToLocalStorage();
        })
        .catch(err => console.error('Failed to paste data from clipboard', err));

}