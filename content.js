// // Initialize current color for highlighting
// let currentColor = 'yellow';
// let activePopup = null; // Track the active popup


// // Add a listener for mouseup events to handle text selection
// document.addEventListener('mouseup', function() {
//     let selection = window.getSelection();
//     if (selection.toString()) {
//         let range = selection.getRangeAt(0);

//         let parent = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
//             ? range.commonAncestorContainer.parentNode
//             : range.commonAncestorContainer;

//         let { startOffset, endOffset } = getRelativeOffsets(range, parent);

//         // Log calculated offsets
//         console.log('Calculated offsets:', { startOffset, endOffset });

//         let span = document.createElement('span');
//         span.className = `highlight highlight-${currentColor}`;
//         span.setAttribute('data-color', currentColor); // Store the current color in the span
//         range.surroundContents(span);

//         // Show note input popup
//         showNoteInputPopup(span, selection.toString(), startOffset, endOffset, parent);

//         // Add click event listener to show note popup immediately
//         span.addEventListener('click', function() {
//             let note = span.getAttribute('data-note') || '';
//             showNoteInputPopup(span, span.textContent, startOffset, endOffset, parent, note); // Use span.textContent for the original text
//         });

//         // Clear the current selection
//         selection.removeAllRanges();
//     }
// });

// function showNoteInputPopup(span, text, startOffset, endOffset, parent, existingNote = '') {
//     let popup = document.createElement('div');
//     popup.className = 'note-popup';
//     popup.innerHTML = `
//         <textarea placeholder="Enter your note here">${existingNote}</textarea>
//         <button class="save-button">Save</button>
//         <button class="cancel-button">Cancel</button>
//         <button class="remove-highlight-button">Remove Highlight</button>
//     `;
//     document.body.appendChild(popup);
    
//     popup.style.top = `${span.getBoundingClientRect().bottom + window.scrollY+2}px`;
//     popup.style.left = `${span.getBoundingClientRect().left + window.scrollX}px`;

//     const saveNote = () => {
//         let note = popup.querySelector('textarea').value;
//         let color = span.getAttribute('data-color'); 
//         saveHighlight(text, startOffset, endOffset, parent, color, note);
//         span.setAttribute('data-note', note); 
//         document.body.removeChild(popup);
//     };

//     popup.querySelector('.save-button').addEventListener('click', saveNote);

//     popup.querySelector('.cancel-button').addEventListener('click', function() {
//         if (!existingNote) { 
//             saveHighlight(text, startOffset, endOffset, parent, span.getAttribute('data-color'), '');
//         }
//         document.body.removeChild(popup);
//     });

//     popup.querySelector('.remove-highlight-button').addEventListener('click', function() {
//         removeHighlight(span, startOffset, endOffset, parent);
//         document.body.removeChild(popup);
//     });
// }

// // Function to get relative offsets within the parent node's text content
// function getRelativeOffsets(range, parent) {
//     let textNodes = getTextNodes(parent);
//     let startOffset = 0, endOffset = 0, charCount = 0;

//     textNodes.forEach(node => {
//         if (node === range.startContainer) {
//             startOffset = charCount + range.startOffset;
//         }
//         if (node === range.endContainer) {
//             endOffset = charCount + range.endOffset;
//         }
//         charCount += node.textContent.length;
//     });

//     return { startOffset, endOffset };
// }

// // Function to save highlights in Chrome's local storage
// function saveHighlight(text, startOffset, endOffset, parent, color, note) {
//     const url = window.location.href;
//     const newHighlight = {
//         text,
//         startOffset,
//         endOffset,
//         parentXPath: getXPath(parent),
//         color,
//         note
//     };

//     // Log the highlight parameters
//     console.log('Highlight to save:', newHighlight);

//     // Get the current highlights data from local storage
//     chrome.storage.local.get('highlights', function(result) {
//         const highlightsData = result.highlights || {};
//         highlightsData[url] = highlightsData[url] || [];

//         // Check if this highlight already exists and update it if necessary
//         let highlightIndex = highlightsData[url].findIndex(h => h.startOffset === startOffset && h.endOffset === endOffset && h.parentXPath === newHighlight.parentXPath);
//         if (highlightIndex > -1) {
//             highlightsData[url][highlightIndex] = newHighlight;
//         } else {
//             highlightsData[url].push(newHighlight);
//         }

//         // Save the updated highlights back to local storage
//         chrome.storage.local.set({ highlights: highlightsData }, function() {
//             console.log('Highlights saved:', highlightsData);
//         });
//     });
// }

// // Function to remove a specific highlight from Chrome's local storage and the DOM
// function removeHighlight(span, startOffset, endOffset, parent) {
//     const url = window.location.href;
//     chrome.storage.local.get('highlights', function(result) {
//         const highlightsData = result.highlights || {};
//         highlightsData[url] = highlightsData[url] || [];

//         // Find and remove the highlight
//         highlightsData[url] = highlightsData[url].filter(h => !(h.startOffset === startOffset && h.endOffset === endOffset && h.parentXPath === getXPath(parent)));

//         // Save the updated highlights back to local storage
//         chrome.storage.local.set({ highlights: highlightsData }, function() {
//             console.log('Highlight removed:', highlightsData);
//         });

//         // Remove the highlight from the DOM
//         let parentElement = span.parentNode;
//         while (span.firstChild) {
//             parentElement.insertBefore(span.firstChild, span);
//         }
//         parentElement.removeChild(span);
//         parentElement.normalize();
//     });
// }

// // Function to load highlights from Chrome's local storage
// function loadHighlights() {
//     const url = window.location.href;
//     console.log('Loading highlights for:', url);

//     chrome.storage.local.get('highlights', function(result) {
//         console.log('Stored highlights:', result);
//         if (result.highlights && result.highlights[url]) {
//             clearHighlights();
//             result.highlights[url].forEach(highlight => {
//                 console.log('Highlight to load:', highlight);

//                 let parent = getNodeByXPath(highlight.parentXPath);
//                 console.log('Parent node:', parent);
//                 if (parent) {
//                     applyHighlight(parent, highlight.startOffset, highlight.endOffset, highlight.color, highlight.note);
//                 }
//             });
//         }
//     });
// }

// // Function to apply highlight using text offsets
// function applyHighlight(parent, startOffset, endOffset, color, note) {
//     let range = document.createRange();
//     let textNodes = getTextNodes(parent);
//     let charCount = 0, startNode = null, endNode = null, startOffsetInNode, endOffsetInNode;

//     textNodes.forEach(node => {
//         let nodeLength = node.textContent.length;
//         if (charCount <= startOffset && charCount + nodeLength > startOffset) {
//             startNode = node;
//             startOffsetInNode = startOffset - charCount;
//         }
//         if (charCount <= endOffset && charCount + nodeLength > endOffset) {
//             endNode = node;
//             endOffsetInNode = endOffset - charCount;
//         }
//         charCount += nodeLength;
//     });

//     if (startNode && endNode) {
//         range.setStart(startNode, startOffsetInNode);
//         range.setEnd(endNode, endOffsetInNode);

//         let span = document.createElement('span');
//         span.className = `highlight highlight-${color}`;
//         span.setAttribute('data-note', note);
//         span.setAttribute('data-color', color);
//         range.surroundContents(span);
//         console.log('Highlight applied:', { range, color, note });

//         // Add click event listener to show note popup
//         span.addEventListener('click', function() {
//             let currentText = span.textContent; // Get the current highlighted text
//             showNoteInputPopup(span, currentText, startOffset, endOffset, parent, note);
//         });
//     } else {
//         console.error('Error: Unable to find text node or apply highlight', {
//             startOffset,
//             endOffset,
//             charCount,
//             parent
//         });
//     }
// }

// // Function to get all text nodes within a parent node
// function getTextNodes(node) {
//     let textNodes = [];
//     if (node.nodeType === Node.TEXT_NODE) {
//         textNodes.push(node);
//     } else {
//         node.childNodes.forEach(child => {
//             textNodes.push(...getTextNodes(child));
//         });
//     }
//     return textNodes;
// }

// // Function to generate XPath for an element
// function getXPath(element) {
//     if (element.id !== '') { // If the element has an ID, use it
//         return 'id("' + element.id + '")';
//     }
//     if (element === document.body) { // If the element is the body, return /html/body
//         return '/html/body';
//     }

//     let ix = 0;
//     let siblings = element.parentNode.childNodes;
//     for (let i = 0; i < siblings.length; i++) {
//         let sibling = siblings[i];
//         if (sibling === element) {
//             return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
//         }
//         if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
//             ix++;
//         }
//     }
// }

// // Function to get node by XPath
// function getNodeByXPath(xpath) {
//     let result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
//     return result.singleNodeValue;
// }

// // Function to clear existing highlights
// function clearHighlights() {
//     document.querySelectorAll('.highlight').forEach(span => {
//         let parent = span.parentNode;
//         while (span.firstChild) {
//             parent.insertBefore(span.firstChild, span);
//         }
//         parent.removeChild(span);
//         parent.normalize();
//     });
// }

// // Function to apply highlight filter
// function applyHighlightFilter(colors) {
//     clearHighlights();
//     const url = window.location.href;
//     chrome.storage.local.get('highlights', function(result) {
//         if (result.highlights && result.highlights[url]) {
//             result.highlights[url].forEach(highlight => {
//                 if (colors.includes(highlight.color)) {
//                     let parent = getNodeByXPath(highlight.parentXPath);
//                     if (parent) {
//                         applyHighlight(parent, highlight.startOffset, highlight.endOffset, highlight.color, highlight.note);
//                     }
//                 }
//             });
//         }
//     });
// }

// // Function to clear highlight filter and show all highlights
// function clearHighlightFilter() {
//     clearHighlights();
//     loadHighlights();
// }

// // Function to export highlights to PDF using jsPDF
// function exportHighlightsToPDF() {
//     const url = window.location.href;
//     chrome.storage.local.get('highlights', function(result) {
//         if (result.highlights && result.highlights[url]) {
//             const highlights = result.highlights[url];
//             const { jsPDF } = window.jspdf;
//             const doc = new jsPDF();
//             const pageWidth = doc.internal.pageSize.getWidth();
//             const pageHeight = doc.internal.pageSize.getHeight();
//             const margin = 10;
//             const maxWidth = pageWidth - 2 * margin; // Set max width for text

//             doc.text(`URL: ${url}`, margin, 10);

//             let yPosition = 20;
//             highlights.forEach((highlight, index) => {
//                 // Add the highlight text
//                 let textLines = doc.splitTextToSize(`Highlight ${index + 1}: ${highlight.text}`, maxWidth);
//                 doc.text(textLines, margin, yPosition);
//                 yPosition += textLines.length * 7; // Adjust y position for text height with smaller line height

//                 // Add the note, if any
//                 if (highlight.note) {
//                     let noteLines = doc.splitTextToSize(`Note: ${highlight.note}`, maxWidth);
//                     doc.text(noteLines, margin, yPosition);
//                     yPosition += noteLines.length * 7; // Adjust y position for note height with smaller line height
//                 }

//                 // Add some space between entries
//                 yPosition += 5;

//                 // Check if we need to add a new page
//                 if (yPosition + 10 > pageHeight) {
//                     doc.addPage();
//                     yPosition = 10; // Reset y position for new page
//                 }
//             });

//             doc.save('highlights.pdf');
//         }
//     });
// }

// // Load highlights when the page loads
// loadHighlights();

// // Listen for messages from the popup to clear highlights, change color, apply filter, clear filter, and export to PDF
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.action === 'clearHighlights') {
//         clearHighlights();
//         const url = window.location.href;
//         chrome.storage.local.get('highlights', function(result) {
//             const highlightsData = result.highlights || {};
//             highlightsData[url] = [];
//             chrome.storage.local.set({ highlights: highlightsData }, function() {
//                 console.log('Highlights cleared:', highlightsData);
//             });
//         });
//         sendResponse({ status: 'highlights_cleared' });
//     } else if (request.action === 'changeColor') {
//         currentColor = request.color;
//         chrome.storage.local.set({ currentColor: request.color }, function() {
//             console.log('Color changed to:', currentColor);
//         });
//         sendResponse({ status: 'color_changed', color: currentColor });
//     } else if (request.action === 'applyFilter') {
//         applyHighlightFilter(request.colors);
//         sendResponse({ status: 'filter_applied', colors: request.colors });
//     } else if (request.action === 'clearFilter') {
//         clearHighlightFilter();
//         sendResponse({ status: 'filter_cleared' });
//     } else if (request.action === 'exportToPDF') {
//         exportHighlightsToPDF();
//         sendResponse({ status: 'export_to_pdf' });
//     }
// });


















let currentColor = 'yellow';
let activePopup = null; // Track the active popup
let activeSpan = null;

document.addEventListener('mouseup', function() {
    let selection = window.getSelection();
    if (selection.toString()) {
        let range = selection.getRangeAt(0);

        let parent = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentNode
            : range.commonAncestorContainer;

        let { startOffset, endOffset } = getRelativeOffsets(range, parent);

        console.log('Calculated offsets:', { startOffset, endOffset });

        let span = document.createElement('span');
        span.className = `highlight highlight-${currentColor}`;
        span.setAttribute('data-color', currentColor); 
        range.surroundContents(span);

        if (activePopup) {
            // document.body.removeChild(activePopup);
            if (activeSpan && !activeSpan.getAttribute('data-note')) {
                // removeHighlight(activeSpan, startOffset, endOffset, parent);
                activeSpan.className=`highlight`;
            }
        }

        showNoteInputPopup(span, selection.toString(), startOffset, endOffset, parent);

        activeSpan = span;

        span.addEventListener('click', function() {
            let note = span.getAttribute('data-note') || '';
            showNoteInputPopup(span, span.textContent, startOffset, endOffset, parent, note); 
        });

        selection.removeAllRanges();
        
        // span.className = `highlight`;
    }
});

function showNoteInputPopup(span, text, startOffset, endOffset, parent, existingNote = '') {
    if (activePopup) {
        // prevSpan.className = `highlight`;
        document.body.removeChild(activePopup);

    }

    let popup = document.createElement('div');
    popup.className = 'note-popup';
    popup.innerHTML = `
        <textarea placeholder="Enter your note here">${existingNote}</textarea>
        <button class="save-button">Save</button>
        <button class="cancel-button">Cancel</button>
        <button class="remove-highlight-button">Remove Highlight</button>
    `;
    document.body.appendChild(popup);

    // let range = document.createRange();
    // range.setStart(span.firstChild, endOffset);
    // range.setEnd(span.firstChild, endOffset);
    // let rect = range.getBoundingClientRect();

    // popup.style.top = `${rect.bottom + window.scrollY + 2}px`;
    // popup.style.left = `${rect.left + window.scrollX}px`;

    popup.style.top = `${span.getBoundingClientRect().bottom + window.scrollY+2}px`;
    popup.style.left = `${span.getBoundingClientRect().left + window.scrollX}px`;
    

    const saveNote = () => {
        let note = popup.querySelector('textarea').value;
        let color = span.getAttribute('data-color'); 
        console.log(text , startOffset , endOffset,parent , color, note);
        saveHighlight(text, startOffset, endOffset, parent, color, note);
        span.setAttribute('data-note', note); 
        document.body.removeChild(popup);
        activePopup = null;
    };

    popup.querySelector('.save-button').addEventListener('click', saveNote);

    popup.querySelector('.cancel-button').addEventListener('click', function() {
        document.body.removeChild(popup);
        if (!existingNote) {
            parent.replaceChild(document.createTextNode(span.textContent), span);
        }
        activePopup = null;
    });

    popup.querySelector('.remove-highlight-button').addEventListener('click', function() {
        removeHighlight(span, startOffset, endOffset, parent);
        document.body.removeChild(popup);
        activePopup = null;
    });

    activePopup = popup;
}



function getRelativeOffsets(range, parent) {
    let textNodes = getTextNodes(parent);
    let startOffset = 0, endOffset = 0, charCount = 0;

    textNodes.forEach(node => {
        if (node === range.startContainer) {
            startOffset = charCount + range.startOffset;
        }
        if (node === range.endContainer) {
            endOffset = charCount + range.endOffset;
        }
        charCount += node.textContent.length;
    });

    return { startOffset, endOffset };
}

function saveHighlight(text, startOffset, endOffset, parent, color, note) {
    const url = window.location.href;
    const newHighlight = {
        text,
        startOffset,
        endOffset,
        parentXPath: getXPath(parent),
        color,
        note
    };

    console.log('Highlight to save:', newHighlight);

    chrome.storage.local.get('highlights', function(result) {
        const highlightsData = result.highlights || {};
        highlightsData[url] = highlightsData[url] || [];

        let highlightIndex = highlightsData[url].findIndex(h => h.startOffset === startOffset && h.endOffset === endOffset && h.parentXPath === newHighlight.parentXPath);
        if (highlightIndex > -1) {
            highlightsData[url][highlightIndex] = newHighlight;
        } else {
            highlightsData[url].push(newHighlight);
        }

        chrome.storage.local.set({ highlights: highlightsData }, function() {
            console.log('Highlights saved:', highlightsData);
        });
    });
}

function removeHighlight(span, startOffset, endOffset, parent) {
    const url = window.location.href;
    chrome.storage.local.get('highlights', function(result) {
        const highlightsData = result.highlights || {};
        highlightsData[url] = highlightsData[url] || [];

        highlightsData[url] = highlightsData[url].filter(h => !(h.startOffset === startOffset && h.endOffset === endOffset && h.parentXPath === getXPath(parent)));

        chrome.storage.local.set({ highlights: highlightsData }, function() {
            console.log('Highlight removed:', highlightsData);
        });

        let parentElement = span.parentNode;
        while (span.firstChild) {
            parentElement.insertBefore(span.firstChild, span);
        }
        parentElement.removeChild(span);
        parentElement.normalize();
    });
}

function loadHighlights() {
    const url = window.location.href;
    console.log('Loading highlights for:', url);

    chrome.storage.local.get('highlights', function(result) {
        console.log('Stored highlights:', result);
        if (result.highlights && result.highlights[url]) {
            clearHighlights();
            result.highlights[url].forEach(highlight => {
                console.log('Highlight to load:', highlight);

                let parent = getNodeByXPath(highlight.parentXPath);
                console.log('Parent node:', parent);
                if (parent) {
                    applyHighlight(parent, highlight.startOffset, highlight.endOffset, highlight.color, highlight.note);
                }
            });
        }
    });
}

function applyHighlight(parent, startOffset, endOffset, color, note) {
    let range = document.createRange();
    let textNodes = getTextNodes(parent);
    let charCount = 0, startNode = null, endNode = null, startOffsetInNode, endOffsetInNode;

    textNodes.forEach(node => {
        let nodeLength = node.textContent.length;
        if (charCount <= startOffset && charCount + nodeLength > startOffset) {
            startNode = node;
            startOffsetInNode = startOffset - charCount;
        }
        if (charCount <= endOffset && charCount + nodeLength > endOffset) {
            endNode = node;
            endOffsetInNode = endOffset - charCount;
        }
        charCount += nodeLength;
    });

    if (startNode && endNode) {
        range.setStart(startNode, startOffsetInNode);
        range.setEnd(endNode, endOffsetInNode);

        let span = document.createElement('span');
        span.className = `highlight highlight-${color}`;
        span.setAttribute('data-note', note);
        span.setAttribute('data-color', color);
        range.surroundContents(span);
        console.log('Highlight applied:', { range, color, note });

        span.addEventListener('click', function() {
            let currentText = span.textContent; 
            showNoteInputPopup(span, currentText, startOffset, endOffset, parent, note);
        });
    } else {
        console.error('Error: Unable to find text node or apply highlight', {
            startOffset,
            endOffset,
            charCount,
            parent
        });
    }
}

function getTextNodes(node) {
    let textNodes = [];
    if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node);
    } else {
        node.childNodes.forEach(child => {
            textNodes.push(...getTextNodes(child));
        });
    }
    return textNodes;
}

function getXPath(element) {
    if (element.id !== '') {
        return 'id("' + element.id + '")';
    }
    if (element === document.body) {
        return '/html/body';
    }

    let ix = 0;
    let siblings = element.parentNode.childNodes;
    for (let i = 0; i < siblings.length; i++) {
        let sibling = siblings[i];
        if (sibling === element) {
            return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
        }
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
            ix++;
        }
    }
}

function getNodeByXPath(xpath) {
    let result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
}

function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(span => {
        let parent = span.parentNode;
        while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
        }
        parent.removeChild(span);
        parent.normalize();
    });
}

function applyHighlightFilter(colors) {
    clearHighlights();
    const url = window.location.href;
    chrome.storage.local.get('highlights', function(result) {
        if (result.highlights && result.highlights[url]) {
            result.highlights[url].forEach(highlight => {
                if (colors.includes(highlight.color)) {
                    let parent = getNodeByXPath(highlight.parentXPath);
                    if (parent) {
                        applyHighlight(parent, highlight.startOffset, highlight.endOffset, highlight.color, highlight.note);
                    }
                }
            });
        }
    });
}

function clearHighlightFilter() {
    clearHighlights();
    loadHighlights();
}

function exportHighlightsToPDF() {
    const url = window.location.href;
    chrome.storage.local.get('highlights', function(result) {
        if (result.highlights && result.highlights[url]) {
            const highlights = result.highlights[url];
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10;
            const maxWidth = pageWidth - 2 * margin;

            doc.text(`URL: ${url}`, margin, 10);

            let yPosition = 20;
            highlights.forEach((highlight, index) => {
                let textLines = doc.splitTextToSize(`Highlight ${index + 1}: ${highlight.text}`, maxWidth);
                doc.text(textLines, margin, yPosition);
                yPosition += textLines.length * 7;

                if (highlight.note) {
                    let noteLines = doc.splitTextToSize(`Note: ${highlight.note}`, maxWidth);
                    doc.text(noteLines, margin, yPosition);
                    yPosition += noteLines.length * 7;
                }

                yPosition += 5;

                if (yPosition + 10 > pageHeight) {
                    doc.addPage();
                    yPosition = 10;
                }
            });

            doc.save('highlights.pdf');
        }
    });
}

loadHighlights();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'clearHighlights') {
        clearHighlights();
        const url = window.location.href;
        chrome.storage.local.get('highlights', function(result) {
            const highlightsData = result.highlights || {};
            highlightsData[url] = [];
            chrome.storage.local.set({ highlights: highlightsData }, function() {
                console.log('Highlights cleared:', highlightsData);
            });
        });
        sendResponse({ status: 'highlights_cleared' });
    } else if (request.action === 'changeColor') {
        currentColor = request.color;
        chrome.storage.local.set({ currentColor: request.color }, function() {
            console.log('Color changed to:', currentColor);
        });
        sendResponse({ status: 'color_changed', color: currentColor });
    } else if (request.action === 'applyFilter') {
        applyHighlightFilter(request.colors);
        sendResponse({ status: 'filter_applied', colors: request.colors });
    } else if (request.action === 'clearFilter') {
        clearHighlightFilter();
        sendResponse({ status: 'filter_cleared' });
    } else if (request.action === 'exportToPDF') {
        exportHighlightsToPDF();
        sendResponse({ status: 'export_to_pdf' });
    }
});
