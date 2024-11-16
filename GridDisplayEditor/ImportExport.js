// ⁑ ✦ ✴ ✾
let patternIds = ['✶', '❃', '❊', '✩', '✺', '✫', '✰', '❈', '✮', '✼'];
let finalIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];


function computeYOLOLString(input, debug) {
    let output = '';
    let formattedLines = ['', '', '', '', '', '', '', '', '', ''];

    // if (debug) { console.log(input); }

    patternIds.forEach((id) => {
        input = input.replaceAll(id, '✦' + id + '✦');
    });

    input = input.replaceAll('✦✦', '✾');

    let firstChar = input[0];
    let lastChar = input[input.length - 1];

    if (!patternIds.includes(firstChar) && firstChar !== '✦') {
        input = '⁑' + input;
    } else {
        input = input.slice(1);
    }

    if (!patternIds.includes(lastChar) && lastChar !== '✦') {
        input = input + '⁑';
    } else {
        input = input.slice(0, -1);
    }

    patternIds.forEach((id) => {
        input = input.replaceAll(id + '✦', id + '✦⁑');
        input = input.replaceAll('✦' + id, '⁑✦' + id);
    });

    input = input.replaceAll('✾', '✦');

    index = 0;
    let prevChar = '';

    Array.from(input).forEach((char) => {

        // if less than 68 characters, add to the current line
        if (formattedLines[index].length < 68 + (index === 0 ? 0 : 2)) {
            formattedLines[index] += char;

            // if current character is a quote, add it to the current line
        } else if (char === '⁑') {
            formattedLines[index] += char;

            // if current character is a plus, skip it
        } else if (char === '✦') {
            index++;
            formattedLines[index] += '\n✴✴✴';

            // if current character is a substring and the last character was a plus, remove the plus and put it on a new line
        } else if (prevChar === '✦' && patternIds.includes(char)) {
            formattedLines[index] = formattedLines[index].slice(0, -1);
            index++;
            formattedLines[index] += '\n✴✴✴' + char;

            // if current character is a substring put it on a new line
        } else if (patternIds.includes(char)) {
            index++;
            formattedLines[index] += '\n✴✴✴' + char;

            // if current character and previous characters are not substrings add quotation marks
        } else if (!patternIds.includes(char) && !patternIds.includes(prevChar)) {
            index++;
            formattedLines[index] += '⁑\n✴✴✴⁑' + char;

            // error if none of the above conditions are met
        } else { console.log('ERROR'); }

        prevChar = char;
    });

    // assemble the final string and remove any empty lines
    formattedLines.forEach(line => {
        if (line.length > 0 && line !== '\n✴✴✴') {
            output += line;
        }
    });

    // double check for invalid YOLOL
    if (debug && (output.includes('✴✴ ') || output.includes('✴✴✦') || output.includes('✦\n') || output.includes('✦ ') || output.includes(' ✦'))) {
        alert('ERROR: Incorrectly parsed YOLOL detected. Please send this to Goodgu along with a screenshot or RAW export of your current grid: \n'
            + '{' + cleanYololString(output) + '}' + '\nYou can still use this code, but it may require manual correction');
    }

    return output;
}

function cleanYololString(input) {
    input = input.replaceAll('✦', '+').replaceAll('⁑', '"')
    input = input.replaceAll('✴✴✴', 's+=').replaceAll('✴✴', 's=');
    patternIds.forEach((pattern, index) => {
        input = input.replaceAll(pattern, finalIds[index]);
    });
    return input;
}

function compressString(input) {
    let finalPatterns = [];

    // Function to find the optimal compression pattern
    function findOptimalPattern(input, patternsCost) {

        let minSavings = 5;
        let maxSavings = 0;
        let optimalPattern = null;
        let initialCost = computeYOLOLString(input).length + patternsCost;

        // Scan for patterns from length 65 down to 5
        for (let length = 65; length >= 5; length--) {

            let substrings = {};
            for (let i = 0; i <= input.length - length; i++) {

                // create a new pattern to test
                let testPattern = input.slice(i, i + length);

                // Skip if already checked and store the pattern to avoid duplicates
                if (substrings[testPattern]) continue;
                substrings[testPattern] = true;

                // computing the actual output string using a as a placeholder
                testOutput = input.replaceAll(testPattern, '✼');
                let testOutputCost = computeYOLOLString(testOutput).length;
                let testPatternCost = computeYOLOLString(testPattern).length;

                // calculate the cost of the test string
                let testCost = testOutputCost + testPatternCost + patternsCost;

                // calculate the savings
                let savings = initialCost - testCost;

                if ((savings > (maxSavings))) {
                    maxSavings = savings;
                    optimalPattern = testPattern;

                }

            }
        }

        // return the optimal pattern if it saves more than the minimum characters
        if (maxSavings > minSavings) {
            return optimalPattern;
        } else {
            return null;
        }
    }

    let optimizedStr = input;
    let patternsCost = 0;

    for (let i = 0; i < 10; i++) {

        // Find the optimal pattern
        let newpattern = findOptimalPattern(optimizedStr, patternsCost);

        // Break if no new pattern was found
        if (!newpattern) { break; }

        // compensate for having to store the pattern
        let computedPattern = computeYOLOLString(newpattern);
        patternsCost += computedPattern.length;

        computedPattern = finalIds[i] + "=" + cleanYololString(computedPattern);
        // Store the pattern and replace it in the string
        finalPatterns.push({ pattern: computedPattern, patternId: patternIds[i] });

        // Replace the pattern with the patternId
        optimizedStr = optimizedStr.replaceAll(newpattern, patternIds[i]);

    }

    let formattedString = '';
    formattedLines = ['', '', '', '', '', '', '', '', ''];

    let compressedString = computeYOLOLString(optimizedStr, true);
    compressedString = cleanYololString(compressedString);

    index = 0;
    finalPatterns.forEach(pattern => {

        if (formattedLines[index].length + pattern.pattern.length > 69) {
            index++;
        }
        formattedLines[index] += pattern.pattern + ' ';
    });

    formattedLines.forEach(line => {
        if (line.length > 0) {
            formattedString += line + '\n';
        }
    });

    formattedString += "s=" + compressedString;

    return formattedString;
}


function exportToClipboard() {

    // Show the custom clear modal
    document.getElementById('export-modal').style.display = 'block';


    document.getElementById('export-confirm-neg').onclick = function () {
        // User declined the action
        document.getElementById('export-modal').style.display = 'none';

    };

    // Compressed export
    document.getElementById('compressed-export-confirm-pos').onclick = function () {

        // change button text to "compressing..."
        document.getElementById('compressed-export-confirm-pos').innerText = 'Working...';
        let formattedString = '';

        //wait for the button to change text
        setTimeout(() => {

            // Loop through each layer and format the data
            Object.keys(layers).forEach(layerId => {

                // Get the layer data
                const layer = layers[layerId];
                const layerNumber = layerId.replace('layer', '');
                const layerHue = layer.hue;
                const layerScale = layer.scale;

                let compressedString = '';
                if (layer.content === ' '.repeat(625)) {
                    compressedString = 's="                         " s+=s+s+s+s s+=s+s+s+s';
                } else {
                    compressedString = compressString(layer.content);
                }

                formattedString += compressedString + '\n' + ':L=' + layerNumber + ' :H=' + layerHue + ' :S=' + layerScale + ' :input=s' + '\n';
            });

            // Copy the formatted string to the clipboard
            navigator.clipboard.writeText(formattedString).catch(err => console.error('Failed to copy data to clipboard', err));
            toast('Compressed export copied to clipboard!');

            // Close the modal
            document.getElementById('export-modal').style.display = 'none';
            document.getElementById('compressed-export-confirm-pos').innerText = 'Compressed';

        }, 0);
    };

    // Raw export
    document.getElementById('raw-export-confirm-pos').onclick = function () {

        let formattedString = '';

        // Loop through each layer and format the data
        Object.keys(layers).forEach(layerId => {

            // Get the layer data
            const layer = layers[layerId];
            const layerNumber = layerId.replace('layer', '');
            const layerHue = layer.hue.toString().padStart(3, '0');
            const layerScale = layer.scale.toString().padStart(2, '0');

            formattedString += ':L=' + layerNumber + ' :H=' + layerHue + ' :S=' + layerScale + ' layer: "' + layer.content + '"' + '\n';
        });

        navigator.clipboard.writeText(formattedString).catch(err => console.error('Failed to copy data to clipboard', err));
        toast('Raw export copied to clipboard!');

        // Close the modal
        document.getElementById('export-modal').style.display = 'none';
    };

    document.getElementById('SPINE-export-confirm-pos').onclick = function () {

        // Close the modal
        // document.getElementById('export-modal').style.display = 'none';

        // TEMPORARY make the button flash red
        let button = document.getElementById('SPINE-export-confirm-pos')
        button.style.backgroundColor = 'rgb(148, 44, 44)';
        button.style.transition = 'all 0.2s ease-in-out';
        setTimeout(() => {
            button.style.backgroundColor = 'rgb(61, 74, 102)';
        }, 200);

        toast('Exporting to SPINE is not yet implemented yet. :(');

    };
}


function importFromClipboard() {

    // Show the custom clear modal
    // document.getElementById('import-modal').style.display = 'block';

    // Wait for user interaction with the modal
    document.getElementById('standalone-import-confirm-pos').onclick = function () {

        // Close the modal
        document.getElementById('import-modal').style.display = 'none';
    };

    // Wait for user interaction with the modal
    document.getElementById('SPINE-import-confirm-pos').onclick = function () {

        // Close the modal
        document.getElementById('import-modal').style.display = 'none';
    };

    document.getElementById('import-confirm-neg').onclick = function () {
        // User declined the action
        document.getElementById('import-modal').style.display = 'none';
    };

    toast('Importing from clipboard is not yet implemented. :( Try paste!');

}