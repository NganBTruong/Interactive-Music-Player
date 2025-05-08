// --- Debounce Utility Function ---
// Prevents a function from running too frequently
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// --- Constants & State ---
const leftColumn = document.getElementById('left-column');
const rightColumn = document.getElementById('right-column');
const dragHandle = document.getElementById('drag-handle');
const playerTabs = document.querySelectorAll('.player-tab-btn');
const playerTabContents = document.querySelectorAll('.player-tab-content');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBarElem = document.getElementById('progress');
const progressBarContainer = document.getElementById('progress-bar');
const currentTimeElem = document.getElementById('current-time');
const durationElem = document.getElementById('duration');
const playlistContainerDisplay = document.getElementById('playlist-container-display');
const playlistEditorList = document.getElementById('playlist-editor-list');
const volumeSlider = document.getElementById('volume-slider');
const volumeThumb = volumeSlider ? volumeSlider.querySelector('.volume-thumb') : null;
const songTitleElem = document.getElementById('song-title');
const mainVideoPlayerContainer = document.getElementById('main-video-player');
const playerControlsArea = document.querySelector('.player-controls-area');
const mediaUrlInput = document.getElementById('media-url-input');
const loadMediaBtn = document.getElementById('load-media-btn');
const widgetTabs = document.querySelectorAll('.widget-tab-btn');
const widgetContents = document.querySelectorAll('.widget-content-area .widget-card');
const checklistItemInput = document.getElementById('checklist-item-input');
const addChecklistItemBtn = document.getElementById('add-checklist-item-btn');
const checklist = document.getElementById('checklist');
const flashcardDisplay = document.getElementById('flashcard-display');
const flashcardFront = document.getElementById('flashcard-front');
const flashcardBack = document.getElementById('flashcard-back');
const prevFlashcardBtn = document.getElementById('prev-flashcard-btn');
const nextFlashcardBtn = document.getElementById('next-flashcard-btn');
const flipFlashcardBtn = document.getElementById('flip-flashcard-btn');
const currentCardInfo = document.getElementById('current-card-info');

// Flashcard specific elements - with immediate logging
const flashcardTermInput = document.getElementById('flashcard-term-input');
const flashcardDefinitionInput = document.getElementById('flashcard-definition-input');
const addNewFlashcardBtn = document.getElementById('add-new-flashcard-btn');
const flashcardTermListUL = document.getElementById('flashcard-term-list');

console.log("DEBUG: flashcardTermInput element:", flashcardTermInput);
console.log("DEBUG: flashcardDefinitionInput element:", flashcardDefinitionInput);
console.log("DEBUG: addNewFlashcardBtn element:", addNewFlashcardBtn);
console.log("DEBUG: flashcardTermListUL element:", flashcardTermListUL);


const addStickyNoteBtn = document.getElementById('add-sticky-note-btn');
const stickyNotesBoard = document.getElementById('sticky-notes-board');
const notesAreaElement = document.getElementById('notes-area');

// State variables
let isResizing = false;
let initialPosX = 0;
let initialLeftWidth = 0;
let calculatedLeftMinWidth = 320;
let audio = new Audio();
let currentTrackIndex = -1;
let currentMediaType = null;
let activeMediaFrame = null;
let tracks = [];
let isDraggingProgress = false;
let isDraggingVolume = false;
let sortableInstance = null;
let checklistItemIdCounter = 0;
let flashcards = [];
let currentFlashcardIndex = -1;
let isFlashcardFlipped = false;
let stickyNoteZIndex = 1;

let youtubePlayer = null;
let soundcloudWidget = null;
let ytProgressInterval = null;

const defaultThumbnail = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 10 10"><rect width="10" height="10" fill="%23eeeeee"/></svg>';

// --- YouTube API Loading ---
function onYouTubeIframeAPIReady() {
    console.log("YouTube API Ready globally"); // Original DEBUG
}

// --- COLUMN RESIZER ---
function calculateLeftMinWidth() { const mediaInputArea = document.querySelector('.media-input-area'); const controlsArea = document.querySelector('.controls'); let requiredWidth = 0; if(mediaInputArea && mediaInputArea.offsetParent !== null) { requiredWidth = mediaInputArea.scrollWidth + 40; } if(controlsArea && controlsArea.offsetParent !== null) { let controlsWidth = Array.from(controlsArea.children).reduce((sum, el) => sum + el.offsetWidth + 10, 0) + 20; requiredWidth = Math.max(requiredWidth, controlsWidth); } const cssMin = parseFloat(getComputedStyle(leftColumn).minWidth) || 320; calculatedLeftMinWidth = Math.max(cssMin, requiredWidth, 320); }
function handleResizerMouseMove(e) { if (!isResizing) return; const deltaX = e.clientX - initialPosX; let newLeftWidth = initialLeftWidth + deltaX; const rightMinWidth = parseFloat(getComputedStyle(rightColumn).minWidth) || 350; const containerWidth = leftColumn.parentElement.offsetWidth; const resizerWidth = dragHandle.offsetWidth || 10; newLeftWidth = Math.max(calculatedLeftMinWidth, Math.min(newLeftWidth, containerWidth - rightMinWidth - resizerWidth)); leftColumn.style.flexBasis = `${newLeftWidth}px`; }
function handleResizerMouseUp() { if (!isResizing) return; isResizing = false; document.body.classList.remove('is-resizing'); document.removeEventListener('mousemove', handleResizerMouseMove); document.removeEventListener('mouseup', handleResizerMouseUp); saveState(); }
if (dragHandle) { dragHandle.addEventListener('mousedown', function(e) { e.preventDefault(); isResizing = true; initialPosX = e.clientX; initialLeftWidth = leftColumn.offsetWidth; calculateLeftMinWidth(); document.body.classList.add('is-resizing'); document.addEventListener('mousemove', handleResizerMouseMove); document.addEventListener('mouseup', handleResizerMouseUp); }); }


// --- LEFT PLAYER TABS ---
playerTabs.forEach(tab => { tab.addEventListener('click', () => { playerTabs.forEach(t => t.classList.remove('active')); playerTabContents.forEach(c => c.classList.remove('active')); tab.classList.add('active'); const targetTabName = tab.dataset.playerTab; let targetContentId = ''; if (targetTabName === 'player') targetContentId = 'player-content-area'; else if (targetTabName === 'load-link') targetContentId = 'link-loader-area'; const targetContent = document.getElementById(targetContentId); if (targetContent) { targetContent.classList.add('active'); } else { console.error("Target content area not found for player tab:", targetTabName); } }); });

// --- MEDIA PLAYER & PLAYLIST ---
function renderPlaylistView(container, isEditable) { /* ... (unchanged) ... */ }
function startRenameMode(titleElement, trackIndex) { /* ... (unchanged) ... */ }
function handlePlaylistDoubleClick(event) { /* ... (unchanged) ... */ }
if (playlistContainerDisplay) { /* ... (unchanged) ... */ }
if (playlistEditorList) { /* ... (unchanged) ... */ }
function renderAllPlaylists() { renderPlaylistView(playlistContainerDisplay, false); renderPlaylistView(playlistEditorList, true); }
function deleteTrack(index) { /* ... (unchanged) ... */ }
function initializePlaylist() { /* ... (unchanged) ... */ }
function initializePlaylistEditorSortable() { /* ... (unchanged) ... */ }
function clearPlayerScreen() { /* ... (unchanged) ... */ }
function getYouTubeVideoID(url) { /* ... (unchanged) ... */ return (url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/) && RegExp.$2.length === 11) ? RegExp.$2 : null; } // Simplified
function getSoundCloudEmbedSrc(iframeCode) { /* ... (unchanged) ... */ }
function loadMediaToPlayer(urlOrId, type, title = "Loading...") { /* ... (unchanged) ... */ }
function onPlayerReady(event) { /* ... (unchanged) ... */ }
function onPlayerStateChange(event) { /* ... (unchanged) ... */ }
function onPlayerError(event) { /* ... (unchanged) ... */ }
function updateYouTubeProgress() { /* ... (unchanged) ... */ }
if (loadMediaBtn) { /* ... (unchanged) ... */ }
if(mediaUrlInput) { /* ... (unchanged) ... */ }
function loadTrackFromPlaylist(index) { /* ... (unchanged) ... */ }
function playCurrentMedia() { /* ... (unchanged) ... */ }
function pauseCurrentMedia() { /* ... (unchanged) ... */ }
if (playBtn) { /* ... (unchanged) ... */ }
if (pauseBtn) { /* ... (unchanged) ... */ }
audio.addEventListener('loadedmetadata', updateProgressBar); audio.addEventListener('durationchange', updateProgressBar); audio.addEventListener('timeupdate', updateProgressBar); audio.addEventListener('ended', () => { if (nextBtn) nextBtn.click()}); audio.addEventListener('play', () => { if (currentMediaType === 'audio') { if (playBtn) playBtn.style.display = 'none'; if (pauseBtn) pauseBtn.style.display = 'inline-block'; } }); audio.addEventListener('pause', () => { if (currentMediaType === 'audio') { if (playBtn) playBtn.style.display = 'inline-block'; if (pauseBtn) pauseBtn.style.display = 'none'; } });
function updateProgressBar() { /* ... (unchanged) ... */ }
function formatTime(seconds) { /* ... (unchanged) ... */ return `${Math.floor(seconds / 60)}:${('0' + Math.floor(seconds % 60)).slice(-2)}`;} // Simplified
if (prevBtn) { /* ... (unchanged) ... */ }
if (nextBtn) { /* ... (unchanged) ... */ }
if (progressBarContainer) { /* ... (unchanged) ... */ }
window.addEventListener('mousemove', (e) => { if (isDraggingProgress) handleProgressBarSeek(e); if (isDraggingVolume) handleVolumeSliderDrag(e); }); // Combined
window.addEventListener('mouseup', () => { if (isDraggingProgress) isDraggingProgress = false; if (isDraggingVolume) isDraggingVolume = false; }); // Combined
function handleProgressBarSeek(e) { /* ... (unchanged) ... */ }
if (volumeSlider) { /* ... (unchanged) ... */ }
// window.addEventListener('mousemove', (e) => { if (isDraggingVolume) handleVolumeSliderDrag(e); }); // Duplicate, removed
// window.addEventListener('mouseup', () => { if (isDraggingVolume) isDraggingVolume = false; }); // Duplicate, removed
function handleVolumeSliderDrag(e) { /* ... (unchanged) ... */ }
function setInitialVolume() { /* ... (unchanged) ... */ }

// --- RIGHT WIDGET TAB Switching ---
widgetTabs.forEach(tab => { /* ... (unchanged as in user's provided code) ... */ });

// --- CHECKLIST JavaScript ---
function addChecklistItem(taskText = null, isChecked = false, shouldSave = true) { /* ... (unchanged as in user's provided code) ... */ }
if(addChecklistItemBtn) { /* ... (unchanged as in user's provided code) ... */ }
if(checklistItemInput) { /* ... (unchanged as in user's provided code) ... */ }

// --- FLASHCARDS JavaScript ---
function renderFlashcard() {
    try {
        if (!flashcardDisplay) { console.warn("DEBUG: flashcardDisplay element not found in renderFlashcard."); return; }
        if (currentFlashcardIndex === -1 || flashcards.length === 0) {
            if (flashcardFront) flashcardFront.textContent = 'No flashcards available.';
            else console.warn("DEBUG: flashcardFront not found in renderFlashcard");
            if (flashcardBack) flashcardBack.textContent = '';
            else console.warn("DEBUG: flashcardBack not found in renderFlashcard");
            flashcardDisplay.classList.remove('flipped');
            if (currentCardInfo) currentCardInfo.textContent = '0/0';
            else console.warn("DEBUG: currentCardInfo not found in renderFlashcard");
        } else {
            const card = flashcards[currentFlashcardIndex];
            if (!card) {
                console.error("DEBUG: Card not found at currentFlashcardIndex:", currentFlashcardIndex, "Flashcards array:", flashcards);
                if (flashcardFront) flashcardFront.textContent = 'Error: Card not found.';
                if (flashcardBack) flashcardBack.textContent = '';
                return;
            }
            if (flashcardFront) flashcardFront.textContent = card.term;
            else console.warn("DEBUG: flashcardFront not found in renderFlashcard");
            if (flashcardBack) flashcardBack.textContent = card.definition;
            else console.warn("DEBUG: flashcardBack not found in renderFlashcard");

            if (isFlashcardFlipped) {
                flashcardDisplay.classList.add('flipped');
            } else {
                flashcardDisplay.classList.remove('flipped');
            }
            if (currentCardInfo) currentCardInfo.textContent = `${currentFlashcardIndex + 1}/${flashcards.length}`;
            else console.warn("DEBUG: currentCardInfo not found in renderFlashcard");
        }
    } catch (error) {
        console.error("ERROR in renderFlashcard:", error);
    }
}

function flipCurrentFlashcard() {
    try {
        if (flashcards.length === 0 || currentFlashcardIndex === -1) return;
        isFlashcardFlipped = !isFlashcardFlipped;
        if (flashcardDisplay) {
          flashcardDisplay.classList.toggle('flipped');
        } else {
            console.warn("DEBUG: flashcardDisplay not found in flipCurrentFlashcard");
        }
        saveState();
    } catch (error) {
        console.error("ERROR in flipCurrentFlashcard:", error);
    }
}

function renderFlashcardTermList() {
    console.log("--------------------------------------------------"); // Separator
    console.log("DEBUG: renderFlashcardTermList CALLED. Flashcards count:", flashcards.length); // Original DEBUG, emphasized
    try {
        if (!flashcardTermListUL) {
            console.error("FATAL DEBUG: flashcardTermListUL is NULL or UNDEFINED here. Cannot render list."); // Original DEBUG, emphasized
            return;
        }
        console.log("DEBUG: flashcardTermListUL found:", flashcardTermListUL);
        flashcardTermListUL.innerHTML = ''; // Clear existing list items
        console.log("DEBUG: Cleared flashcardTermListUL innerHTML.");

        if (flashcards.length === 0) {
            console.log("DEBUG: No flashcards to render in the list.");
            const emptyMsg = document.createElement('li');
            emptyMsg.textContent = "No terms yet. Add some flashcards!";
            emptyMsg.style.padding = "10px";
            emptyMsg.style.color = "#777";
            flashcardTermListUL.appendChild(emptyMsg);
            return;
        }

        const sortedForDisplay = flashcards.map((card, index) => ({ ...card, originalIndex: index }))
                                          .sort((a, b) => a.term.localeCompare(b.term));
        console.log("DEBUG: Sorted flashcards for display:", sortedForDisplay);

        sortedForDisplay.forEach((cardData, displayIndex) => {
            console.log(`DEBUG: Processing card #${displayIndex + 1} in renderFlashcardTermList: Term='${cardData.term}', OriginalIndex=${cardData.originalIndex}`); // Original DEBUG, more info
            const originalIndex = cardData.originalIndex;

            const listItem = document.createElement('li');
            listItem.dataset.originalIndex = originalIndex;
            console.log("DEBUG: Created listItem:", listItem);

            const termSpan = document.createElement('span');
            termSpan.className = 'term';
            termSpan.textContent = cardData.term;

            const defSpan = document.createElement('span');
            defSpan.className = 'definition';
            defSpan.textContent = cardData.definition;
            // defSpan.style.marginLeft = '10px'; // Already in CSS
            // defSpan.style.color = '#555'; // Already in CSS

            const deleteBtn = document.createElement('button');
            console.log("DEBUG: Creating delete button for card:", cardData.term); // Original DEBUG
            deleteBtn.innerHTML = '🗑️';
            deleteBtn.className = 'delete-item-btn';
            deleteBtn.title = 'Delete Flashcard';
            // deleteBtn.style.marginLeft = '10px'; // Already in CSS via .delete-item-btn margin-left: auto and li gap

            deleteBtn.addEventListener('click', (event) => {
                try {
                    console.log("DEBUG: Delete button clicked for card with originalIndex:", originalIndex);
                    event.stopPropagation();
                    deleteFlashcard(originalIndex);
                } catch (e) {
                    console.error("ERROR in deleteBtn click listener:", e);
                }
            });

            listItem.appendChild(termSpan);
            listItem.appendChild(defSpan);

            console.log("DEBUG: ListItem BEFORE appending button:", listItem.innerHTML); // New DEBUG
            console.log("DEBUG: Is deleteBtn a valid element?", deleteBtn instanceof HTMLElement, deleteBtn); // New DEBUG
            
            listItem.appendChild(deleteBtn); // THE CRUCIAL LINE

            console.log("DEBUG: ListItem AFTER appending button:", listItem.innerHTML); // New DEBUG
            console.log("DEBUG: Full listItem element (can expand in console):", listItem); // New DEBUG

            listItem.addEventListener('click', function(event) {
                try {
                    console.log("DEBUG: List item clicked. Target:", event.target);
                    // Check if target is not deleteBtn or its child (emoji is often a child text node)
                    if (event.target !== deleteBtn && !deleteBtn.contains(event.target)) {
                         currentFlashcardIndex = parseInt(this.dataset.originalIndex, 10);
                         isFlashcardFlipped = false;
                         renderFlashcard();
                         saveState();
                    } else {
                        console.log("DEBUG: Click was on delete button or its child, not processing as list item click.");
                    }
                } catch (e) {
                    console.error("ERROR in listItem click listener:", e);
                }
            });
            flashcardTermListUL.appendChild(listItem);
            console.log(`DEBUG: Appended listItem for '${cardData.term}' to flashcardTermListUL. Current UL children count:`, flashcardTermListUL.children.length); // New DEBUG
        });
        console.log("DEBUG: Finished rendering all flashcard terms.");
    } catch (error) {
        console.error("MAJOR ERROR in renderFlashcardTermList function:", error);
    }
    console.log("--------------------------------------------------"); // Separator
}


if(flashcardDisplay) flashcardDisplay.addEventListener('click', flipCurrentFlashcard);
if(flipFlashcardBtn) flipFlashcardBtn.addEventListener('click', flipCurrentFlashcard);

if(prevFlashcardBtn) {
    prevFlashcardBtn.addEventListener('click', () => {
        try {
            if (flashcards.length === 0) return;
            currentFlashcardIndex = (currentFlashcardIndex - 1 + flashcards.length) % flashcards.length;
            isFlashcardFlipped = false;
            renderFlashcard();
            saveState();
        } catch (error) {
            console.error("ERROR in prevFlashcardBtn click:", error);
        }
    });
}

if(nextFlashcardBtn) {
    nextFlashcardBtn.addEventListener('click', () => {
        try {
            if (flashcards.length === 0) return;
            currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcards.length;
            isFlashcardFlipped = false;
            renderFlashcard();
            saveState();
        } catch (error) {
            console.error("ERROR in nextFlashcardBtn click:", error);
        }
    });
}

if(addNewFlashcardBtn) {
    addNewFlashcardBtn.addEventListener('click', () => {
        console.log("--------------------------------------------------"); // Separator
        console.log("DEBUG: Add New Flashcard button CLICKED!"); // New DEBUG, emphasized
        try {
            if (!flashcardTermInput || !flashcardDefinitionInput) {
                console.error("FATAL DEBUG: flashcardTermInput or flashcardDefinitionInput is NULL. Cannot add card.");
                alert("Error: Input fields not found. Please refresh.");
                return;
            }

            const term = flashcardTermInput.value.trim();
            const definition = flashcardDefinitionInput.value.trim();
            console.log(`DEBUG: Term='${term}', Definition='${definition}'`);

            if (term && definition) {
                flashcards.push({ term, definition });
                console.log("DEBUG: Pushed to flashcards array. New count:", flashcards.length, flashcards);
                
                flashcardTermInput.value = '';
                flashcardDefinitionInput.value = '';

                if (currentFlashcardIndex === -1 && flashcards.length > 0) {
                    currentFlashcardIndex = 0;
                } else if (flashcards.length > 0) {
                     currentFlashcardIndex = flashcards.length -1;
                }
                isFlashcardFlipped = false;
                console.log("DEBUG: currentFlashcardIndex set to:", currentFlashcardIndex);

                renderFlashcard();
                console.log("DEBUG: About to call renderFlashcardTermList from addNewFlashcardBtn"); // New DEBUG
                renderFlashcardTermList(); // CRUCIAL CALL
                saveState();
                console.log("DEBUG: Flashcard added and state saved.");
            } else {
                alert("Please enter both a term and a definition.");
                console.log("DEBUG: Term or definition was empty.");
            }
        } catch (error) {
            console.error("MAJOR ERROR in addNewFlashcardBtn click listener:", error);
            alert("An error occurred while adding the flashcard. Check console.");
        }
        console.log("--------------------------------------------------"); // Separator
    });
} else {
    console.error("FATAL DEBUG: addNewFlashcardBtn element was NOT FOUND. Add card functionality will not work.");
}

document.addEventListener('keydown', function(e) { /* ... (unchanged as in user's provided code, but consider adding try-catch if issues arise here) ... */ });

function deleteFlashcard(indexToDelete) {
    console.log("--------------------------------------------------"); // Separator
    console.log("DEBUG: deleteFlashcard CALLED for originalIndex:", indexToDelete);
    try {
        if (indexToDelete < 0 || indexToDelete >= flashcards.length) {
            console.error("Invalid index for deleting flashcard:", indexToDelete);
            return;
        }

        const cardToDelete = flashcards[indexToDelete];
        if (!confirm(`Are you sure you want to delete the flashcard:\nTerm: "${cardToDelete.term}"\nDefinition: "${cardToDelete.definition.substring(0, 50)}..."?`)) {
            console.log("DEBUG: Flashcard deletion cancelled by user.");
            return;
        }

        flashcards.splice(indexToDelete, 1);
        console.log("DEBUG: Spliced flashcard. New flashcards array:", flashcards);

        if (flashcards.length === 0) {
            currentFlashcardIndex = -1;
        } else if (currentFlashcardIndex === indexToDelete) {
            currentFlashcardIndex = Math.max(0, indexToDelete - 1);
        } else if (currentFlashcardIndex > indexToDelete) {
            currentFlashcardIndex--;
        }
        console.log("DEBUG: currentFlashcardIndex after delete logic:", currentFlashcardIndex);

        isFlashcardFlipped = false;
        renderFlashcard();
        renderFlashcardTermList();
        saveState();
        console.log("DEBUG: Flashcard deleted and UI updated.");
    } catch (error) {
        console.error("MAJOR ERROR in deleteFlashcard function:", error);
    }
    console.log("--------------------------------------------------"); // Separator
}

function createStickyNote(id = `sticky-${Date.now()}`, content = '', top = 20, left = 20, z = ++stickyNoteZIndex, shouldSave = true) { /* ... (unchanged as in user's provided code) ... */ }
if (addStickyNoteBtn) { /* ... (unchanged as in user's provided code) ... */ }

// --- LOCAL STORAGE ---
function saveState() { /* ... (unchanged but ensure checks for null elements if adding more interactions) ... */ }
function loadState() { /* ... (unchanged but ensure checks for null elements if adding more interactions) ... */ }

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => { /* ... (unchanged, but ensure the fetchGreeting simulation or actual call is what's intended) ... */ });

// --- MAKE SURE ALL FUNCTIONS ARE DEFINED BEFORE THEY ARE CALLED ---
// e.g. renderPlaylistView, deleteTrack, etc. should be defined above where they are first used.
// The provided code seems to follow this, but it's a good general check.
// Functions used as callbacks (like in event listeners) are fine as long as the listener is attached after function definition.
