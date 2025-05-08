// --- Debounce Utility Function ---
 function debounce(func, wait) { /* ... unchanged ... */ }

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
 // Checklist elements
 const checklistItemInput = document.getElementById('checklist-item-input');
 const addChecklistItemBtn = document.getElementById('add-checklist-item-btn');
 const checklist = document.getElementById('checklist');
 // Flashcard elements
 const flashcardDisplay = document.getElementById('flashcard-display');
 const flashcardFront = document.getElementById('flashcard-front');
 const flashcardBack = document.getElementById('flashcard-back');
 const prevFlashcardBtn = document.getElementById('prev-flashcard-btn');
 const nextFlashcardBtn = document.getElementById('next-flashcard-btn');
 const flipFlashcardBtn = document.getElementById('flip-flashcard-btn');
 const currentCardInfo = document.getElementById('current-card-info');
 const flashcardTermInput = document.getElementById('flashcard-term-input');
 const flashcardDefinitionInput = document.getElementById('flashcard-definition-input');
 const addNewFlashcardBtn = document.getElementById('add-new-flashcard-btn');
 const flashcardTermListUL = document.getElementById('flashcard-term-list');
 // Sticky Note elements
 const addStickyNoteBtn = document.getElementById('add-sticky-note-btn');
 const stickyNotesBoard = document.getElementById('sticky-notes-board');
 // Notes Area element
 const notesAreaElement = document.getElementById('notes-area');

// --- Initial Element Finding Logs ---
 console.log("--- Initial Element Checks ---");
 console.log("DEBUG: playlistContainerDisplay element:", playlistContainerDisplay);
 console.log("DEBUG: checklistItemInput element:", checklistItemInput);
 console.log("DEBUG: addChecklistItemBtn element:", addChecklistItemBtn);
 console.log("DEBUG: checklist element:", checklist);
 console.log("DEBUG: flashcardTermInput element:", flashcardTermInput);
 console.log("DEBUG: flashcardDefinitionInput element:", flashcardDefinitionInput);
 console.log("DEBUG: addNewFlashcardBtn element:", addNewFlashcardBtn);
 console.log("DEBUG: flashcardTermListUL element:", flashcardTermListUL);
 console.log("DEBUG: addStickyNoteBtn element:", addStickyNoteBtn);
 console.log("DEBUG: stickyNotesBoard element:", stickyNotesBoard);
 console.log("DEBUG: notesAreaElement element:", notesAreaElement);
 console.log("--- End Initial Element Checks ---");


// State variables (Keep these)
 let isResizing = false; /* ... */ let initialPosX = 0; /* ... */ let initialLeftWidth = 0; /* ... */ let calculatedLeftMinWidth = 320; /* ... */ let audio = new Audio(); /* ... */ let currentTrackIndex = -1; /* ... */ let currentMediaType = null; /* ... */ let activeMediaFrame = null; /* ... */ let tracks = []; /* ... */ let isDraggingProgress = false; /* ... */ let isDraggingVolume = false; /* ... */ let sortableInstance = null; /* ... */ let checklistItemIdCounter = 0; /* ... */ let flashcards = []; /* ... */ let currentFlashcardIndex = -1; /* ... */ let isFlashcardFlipped = false; /* ... */ let stickyNoteZIndex = 1; /* ... */ let youtubePlayer = null; /* ... */ let soundcloudWidget = null; /* ... */ let ytProgressInterval = null; /* ... */ const defaultThumbnail = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 10 10"><rect width="10" height="10" fill="%23eeeeee"/></svg>';

// --- Function Definitions ---
 function onYouTubeIframeAPIReady() { /* ... unchanged ... */ }
 function calculateLeftMinWidth() { /* ... unchanged ... */ }
 function handleResizerMouseMove(e) { /* ... unchanged ... */ }
 function handleResizerMouseUp() { /* ... unchanged ... */ }
 function renderPlaylistView(container, isEditable) { /* ... unchanged ... */ }
 function startRenameMode(titleElement, trackIndex) { /* ... unchanged ... */ }
 function handlePlaylistDoubleClick(event) { /* ... unchanged ... */ }
 function renderAllPlaylists() { /* ... unchanged ... CHECK TYPOS INSIDE IF CALLED */ }
 function deleteTrack(index) { /* ... unchanged ... */ }
 function initializePlaylist() { /* ... unchanged ... */ }
 function initializePlaylistEditorSortable() { /* ... unchanged ... */ }
 function clearPlayerScreen() { /* ... unchanged ... */ }
 function getYouTubeVideoID(url) { /* ... unchanged ... */ }
 function getSoundCloudEmbedSrc(iframeCode) { /* ... unchanged ... */ }
 function loadMediaToPlayer(urlOrId, type, title = "Loading...") { /* ... unchanged ... */ }
 function onPlayerReady(event) { /* ... unchanged ... */ }
 function onPlayerStateChange(event) { /* ... unchanged ... */ }
 function onPlayerError(event) { /* ... unchanged ... */ }
 function updateYouTubeProgress() { /* ... unchanged ... */ }
 function loadTrackFromPlaylist(index) { /* ... unchanged ... */ }
 function playCurrentMedia() { /* ... unchanged ... */ }
 function pauseCurrentMedia() { /* ... unchanged ... */ }
 function updateProgressBar() { /* ... unchanged ... */ }
 function formatTime(seconds) { /* ... unchanged ... */ }
 function handleProgressBarSeek(e) { /* ... unchanged ... */ }
 function handleVolumeSliderDrag(e) { /* ... unchanged ... */ }
 function setInitialVolume() { /* ... unchanged ... */ }

 // --- Checklist Function (with try/catch added) ---
 function addChecklistItem(taskText = null, isChecked = false, shouldSave = true) {
    console.log("DEBUG: addChecklistItem function CALLED");
    try {
        // Ensure necessary elements exist before proceeding
        if (!checklistItemInput) { console.error("ERROR: checklistItemInput is null inside addChecklistItem"); return; }
        if (!checklist) { console.error("ERROR: checklist element is null inside addChecklistItem"); return; }

        const text = taskText !== null ? taskText : checklistItemInput.value.trim();
        console.log("DEBUG: Checklist item text:", text);
        if (text === "") {
             console.log("DEBUG: Checklist item text empty, returning.");
             return;
        }

        const listItem = document.createElement('li');
        const checkboxId = `task-${checklistItemIdCounter++}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.checked = isChecked;
        checkbox.addEventListener('change', () => { // Wrap saveState in try/catch within listener
             try { saveState(); } catch(e) { console.error("ERROR in checklist checkbox change listener:", e); }
         });

        const label = document.createElement('label');
        label.htmlFor = checkboxId;
        label.textContent = text;

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.className = 'delete-item-btn'; // Make sure this class is styled
        deleteBtn.title = 'Delete item';
        deleteBtn.addEventListener('click', () => {
             try {
                 console.log("DEBUG: Checklist delete button clicked for item:", text);
                 listItem.remove();
                 saveState();
             } catch(e) { console.error("ERROR in checklist deleteBtn click listener:", e); }
        });

        listItem.appendChild(checkbox);
        listItem.appendChild(label);
        listItem.appendChild(deleteBtn);
        checklist.appendChild(listItem);
        console.log("DEBUG: Appended checklist item to checklist UL.");

        if (taskText === null) checklistItemInput.value = ''; // Clear input only if it was a new item
        if (shouldSave) {
            console.log("DEBUG: Calling saveState from addChecklistItem");
            saveState();
        }
    } catch (error) {
        console.error("MAJOR ERROR in addChecklistItem function:", error);
        alert("An error occurred adding the checklist item. Check console.");
    }
 }

 // --- Flashcard Functions (already have try/catch) ---
 function renderFlashcard() { /* ... unchanged ... */ }
 function flipCurrentFlashcard() { /* ... unchanged ... */ }
 function renderFlashcardTermList() { /* ... unchanged ... CHECK FOR TYPOS IN NAME! */ }
 function deleteFlashcard(indexToDelete) { /* ... unchanged ... */ }

 // --- Sticky Note Function (with try/catch added) ---
 function createStickyNote(id = `sticky-${Date.now()}`, content = '', top = 20, left = 20, z = ++stickyNoteZIndex, shouldSave = true) {
    console.log("DEBUG: createStickyNote function CALLED");
    try {
        if (!stickyNotesBoard) { console.error("ERROR: stickyNotesBoard is null inside createStickyNote"); return; }

        const note = document.createElement('div');
        note.classList.add('sticky-note');
        note.dataset.id = id;
        note.style.position = 'absolute';
        note.style.top = `${top}px`;
        note.style.left = `${left}px`;
        note.style.zIndex = z;

        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.placeholder = 'Type something...';
        textarea.addEventListener('input', () => {
            try {
                textarea.style.height = 'auto'; textarea.style.height = textarea.scrollHeight + 'px'; saveState();
            } catch(e) { console.error("ERROR in sticky note textarea input listener:", e); }
        });
        textarea.addEventListener('focus', () => {
             try { note.style.zIndex = ++stickyNoteZIndex; saveState(); } catch(e) { console.error("ERROR in sticky note textarea focus listener:", e); }
        });

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.classList.add('sticky-note-close-btn');
        closeBtn.title = "Delete Note";
         // Add basic styling here if not present/sufficient in CSS to ensure it's clickable
         closeBtn.style.position = 'absolute'; closeBtn.style.top = '2px'; closeBtn.style.right = '2px'; closeBtn.style.background = 'rgba(0,0,0,0.1)'; closeBtn.style.border = 'none'; closeBtn.style.borderRadius = '50%'; closeBtn.style.width = '18px'; closeBtn.style.height = '18px'; closeBtn.style.lineHeight = '16px'; closeBtn.style.textAlign = 'center'; closeBtn.style.cursor = 'pointer'; closeBtn.style.zIndex = '10'; // Ensure clickable

        closeBtn.addEventListener('click', (e) => {
             try {
                e.stopPropagation(); if (confirm("Delete this sticky note?")) { note.remove(); saveState(); }
             } catch(e) { console.error("ERROR in sticky note closeBtn click listener:", e); }
        });

        note.appendChild(textarea);
        note.appendChild(closeBtn);
        stickyNotesBoard.appendChild(note);
        console.log("DEBUG: Appended sticky note to board.");

        // Drag logic (keep as is, but errors might occur here too)
        let isDraggingNote = false; let dragOffsetX, dragOffsetY;
        note.addEventListener('mousedown', (e) => { if (e.target === textarea || e.target === closeBtn || closeBtn.contains(e.target)) return; isDraggingNote = true; note.style.zIndex = ++stickyNoteZIndex; dragOffsetX = e.clientX - note.offsetLeft; dragOffsetY = e.clientY - note.offsetTop; note.style.cursor = 'grabbing'; e.preventDefault(); });
        // Consider moving mousemove/mouseup listeners added here to be removed on mouseup for efficiency
        document.addEventListener('mousemove', (e) => { if (!isDraggingNote) return; let newTop = e.clientY - dragOffsetY; let newLeft = e.clientX - dragOffsetX; if (stickyNotesBoard) { const boardRect = stickyNotesBoard.getBoundingClientRect(); const noteRect = note.getBoundingClientRect(); newTop = Math.max(0, Math.min(newTop, boardRect.height - noteRect.height)); newLeft = Math.max(0, Math.min(newLeft, boardRect.width - noteRect.width)); } note.style.top = `${newTop}px`; note.style.left = `${newLeft}px`; });
        document.addEventListener('mouseup', () => { if (isDraggingNote) { isDraggingNote = false; note.style.cursor = 'grab'; saveState(); } });

         if (shouldSave) {
            console.log("DEBUG: Calling saveState from createStickyNote");
            saveState();
         }
         textarea.style.height = 'auto'; textarea.style.height = textarea.scrollHeight + 'px';
    } catch (error) {
        console.error("MAJOR ERROR in createStickyNote function:", error);
        alert("An error occurred creating the sticky note. Check console.");
    }
 }

 // --- saveState (with try/catch added) ---
 function saveState() {
    console.log("DEBUG: saveState CALLED"); // Log when called
    try {
        const state = {
            tracks: tracks,
            currentTrackIndex: currentTrackIndex,
            volume: audio.volume,
            leftColumnWidth: leftColumn ? leftColumn.style.flexBasis : '320px',
            checklistItems: [],
            flashcards: flashcards,
            currentFlashcardIndex: currentFlashcardIndex,
            isFlashcardFlipped: isFlashcardFlipped,
            mainNote: notesAreaElement ? notesAreaElement.value : '',
            stickyNotes: []
        };
        // Add checks for checklist and stickyNotesBoard before querying
        if (checklist) {
            checklist.querySelectorAll('li').forEach(li => {
                const checkbox = li.querySelector('input[type="checkbox"]');
                const label = li.querySelector('label');
                if (checkbox && label) {
                    state.checklistItems.push({ text: label.textContent, checked: checkbox.checked });
                }
            });
        } else { console.warn("DEBUG: Checklist UL not found in saveState"); }

        if (stickyNotesBoard) {
            stickyNotesBoard.querySelectorAll('.sticky-note').forEach(note => {
                const textarea = note.querySelector('textarea');
                if (textarea) {
                    state.stickyNotes.push({ id: note.dataset.id, content: textarea.value, top: note.offsetTop, left: note.offsetLeft, zIndex: parseInt(note.style.zIndex) || 1 });
                }
            });
        } else { console.warn("DEBUG: StickyNotesBoard not found in saveState"); }

        localStorage.setItem('studyHubState', JSON.stringify(state));
        console.log("DEBUG: saveState successfully saved to localStorage."); // Confirm success
    } catch (error) {
        console.error("MAJOR ERROR in saveState function:", error);
    }
 }

 function loadState() { /* ... unchanged ... */ }
 async function fetchGreeting() { /* ... unchanged ... */ }
 async function loadNotesFromBackend() { /* ... unchanged ... */ }
 async function saveNotesToBackend() { /* ... unchanged ... */ }


// --- INITIAL LOAD & EVENT LISTENER ATTACHMENT ---
 document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOMContentLoaded event fired.");
    try {
        // --- Attach Listeners for STATIC Elements ---

        // Resizer
        if (dragHandle) { dragHandle.addEventListener('mousedown', function(e) { try { e.preventDefault(); isResizing = true; initialPosX = e.clientX; initialLeftWidth = leftColumn.offsetWidth; calculateLeftMinWidth(); document.body.classList.add('is-resizing'); document.addEventListener('mousemove', handleResizerMouseMove); document.addEventListener('mouseup', handleResizerMouseUp); } catch (error) { console.error("ERROR in dragHandle mousedown:", error); } }); } else { console.warn("DEBUG: dragHandle element not found."); }
        // Player Tabs
        if (playerTabs) { playerTabs.forEach(tab => { tab.addEventListener('click', () => { try { playerTabs.forEach(t => t.classList.remove('active')); playerTabContents.forEach(c => c.classList.remove('active')); tab.classList.add('active'); const targetTabName = tab.dataset.playerTab; let targetContentId = ''; if (targetTabName === 'player') targetContentId = 'player-content-area'; else if (targetTabName === 'load-link') targetContentId = 'link-loader-area'; const targetContent = document.getElementById(targetContentId); if (targetContent) { targetContent.classList.add('active'); } else { console.error("Target content area not found for player tab:", targetTabName); } } catch (error) { console.error("ERROR in player tab click listener:", error); } }); }); } else { console.warn("DEBUG: playerTabs NodeList not found or empty."); }
        // Playlist Click/DoubleClick
        if (playlistContainerDisplay) { playlistContainerDisplay.addEventListener('click', (event) => { try { if (event.target.tagName === 'INPUT' && event.target.classList.contains('playlist-item-rename-input')) { return; } const clickedItem = event.target.closest('.playlist-item'); if (clickedItem && playlistContainerDisplay.contains(clickedItem)) { const index = parseInt(clickedItem.dataset.index); if (!isNaN(index) && index >= 0 && index < tracks.length) { currentTrackIndex = index; loadTrackFromPlaylist(currentTrackIndex); } } } catch(error) { console.error("ERROR in playlistContainerDisplay click:", error); } }); playlistContainerDisplay.addEventListener('dblclick', handlePlaylistDoubleClick); } else { console.warn("DEBUG: playlistContainerDisplay not found when attaching listeners."); }
        if (playlistEditorList) { playlistEditorList.addEventListener('dblclick', handlePlaylistDoubleClick); } else { console.warn("DEBUG: playlistEditorList not found when attaching listener."); }
        // Player Controls
        if (playBtn) playBtn.addEventListener('click', playCurrentMedia); else console.warn("DEBUG: playBtn not found.");
        if (pauseBtn) pauseBtn.addEventListener('click', pauseCurrentMedia); else console.warn("DEBUG: pauseBtn not found.");
        if (prevBtn) { prevBtn.addEventListener('click', () => { try { if (tracks.length === 0) return; currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length; loadTrackFromPlaylist(currentTrackIndex); } catch(error) { console.error("ERROR in prevBtn click:", error); } }); } else { console.warn("DEBUG: prevBtn not found."); }
        if (nextBtn) { nextBtn.addEventListener('click', () => { try { if (tracks.length === 0) return; currentTrackIndex = (currentTrackIndex + 1) % tracks.length; loadTrackFromPlaylist(currentTrackIndex); } catch(error) { console.error("ERROR in nextBtn click:", error); } }); } else { console.warn("DEBUG: nextBtn not found."); }
        // Player Progress/Volume Bars
        if (progressBarContainer) { progressBarContainer.addEventListener('mousedown', (e) => { try { if (currentMediaType === 'audio' && audio.duration && isFinite(audio.duration) || currentMediaType === 'soundcloud' && soundcloudWidget || currentMediaType === 'youtube' && youtubePlayer && youtubePlayer.getDuration && youtubePlayer.getDuration() > 0) { isDraggingProgress = true; handleProgressBarSeek(e); } } catch(error) { console.error("ERROR in progressBarContainer mousedown:", error); } }); } else { console.warn("DEBUG: progressBarContainer not found."); }
        if (volumeSlider) { volumeSlider.addEventListener('mousedown', (e) => { try { isDraggingVolume = true; handleVolumeSliderDrag(e); } catch(error) { console.error("ERROR in volumeSlider mousedown:", error); } }); } else { console.warn("DEBUG: volumeSlider not found."); }
        // Media Loader
        if (loadMediaBtn) { loadMediaBtn.addEventListener('click', () => { try { /* ... load media logic ... */ } catch(error) { console.error("ERROR in loadMediaBtn click:", error); } }); } else { console.warn("DEBUG: loadMediaBtn not found."); } // Shortened for brevity, keep full logic
        if(mediaUrlInput) { mediaUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && loadMediaBtn) loadMediaBtn.click(); }); } else { console.warn("DEBUG: mediaUrlInput not found."); }
        // Widget Tabs
        if(widgetTabs) { widgetTabs.forEach(tab => { tab.addEventListener('click', () => { try { /* ... tab switching logic ... */ } catch (error) { console.error("ERROR in widget tab click listener:", error); } }); }); } else { console.warn("DEBUG: widgetTabs NodeList not found or empty."); } // Shortened

        // --- Checklist Listener ---
        if(addChecklistItemBtn) {
             addChecklistItemBtn.addEventListener('click', () => {
                 console.log("DEBUG: Add Checklist Item button CLICKED!"); // CLICK LOG
                 try { addChecklistItem(); } catch(e){ console.error("ERROR in addChecklistItemBtn click callback:", e); }
             });
        } else { console.warn("DEBUG: addChecklistItemBtn not found."); }
        if(checklistItemInput) {
             checklistItemInput.addEventListener('keypress', (e) => {
                try { if (e.key === 'Enter') { console.log("DEBUG: Checklist Input ENTER pressed!"); addChecklistItem(); } } catch(e){ console.error("ERROR in checklistItemInput keypress:", e); }
            });
        } else { console.warn("DEBUG: checklistItemInput not found."); }

        // --- Flashcard Button Listeners ---
        if(flashcardDisplay) { flashcardDisplay.addEventListener('click', flipCurrentFlashcard); } else { console.warn("DEBUG: flashcardDisplay not found."); }
        if(flipFlashcardBtn) { flipFlashcardBtn.addEventListener('click', flipCurrentFlashcard); } else { console.warn("DEBUG: flipFlashcardBtn not found."); }
        if(prevFlashcardBtn) { prevFlashcardBtn.addEventListener('click', () => { try { /* ... prev logic ... */ } catch (error) { console.error("ERROR in prevFlashcardBtn click:", error); } }); } else { console.warn("DEBUG: prevFlashcardBtn not found."); } // Shortened
        if(nextFlashcardBtn) { nextFlashcardBtn.addEventListener('click', () => { try { /* ... next logic ... */ } catch (error) { console.error("ERROR in nextFlashcardBtn click:", error); } }); } else { console.warn("DEBUG: nextFlashcardBtn not found."); } // Shortened

        // --- Sticky Note Listener ---
        if (addStickyNoteBtn) {
             addStickyNoteBtn.addEventListener('click', () => {
                 console.log("DEBUG: Add Sticky Note button CLICKED!"); // CLICK LOG
                 try { createStickyNote(); } catch(e){ console.error("ERROR in addStickyNoteBtn click callback:", e); }
             });
        } else { console.warn("DEBUG: addStickyNoteBtn not found."); }

        // --- Notes Area Listener ---
        const debouncedSaveNotesToBackend = debounce(saveNotesToBackend, 1500);
        if (notesAreaElement) {
            notesAreaElement.addEventListener('input', () => {
                console.log("DEBUG: Notes area INPUT event fired!"); // INPUT LOG
                try {
                    debouncedSaveNotesToBackend();
                    saveState(); // Also save to general LS state
                } catch(e) { console.error("ERROR in notesArea input listener callback:", e); }
            });
            console.log("Frontend: Auto-save listener added to notes area.");
        } else {
            console.error("FATAL DEBUG: notesAreaElement not found! Cannot add auto-save listener.");
        }

        // Global Keydown Listener
         document.addEventListener('keydown', function(e) { try { /* ... keydown logic ... */ } catch(error) { console.error("ERROR in keydown listener:", error); } }); // Shortened

        // Window Listeners for Dragging/Unload
        window.addEventListener('mousemove', (e) => { try { if (isDraggingProgress) handleProgressBarSeek(e); if (isDraggingVolume) handleVolumeSliderDrag(e); if (isResizing) handleResizerMouseMove(e); } catch(error) { console.error("ERROR in window mousemove:", error); } });
        window.addEventListener('mouseup', () => { try { if (isDraggingProgress) isDraggingProgress = false; if (isDraggingVolume) isDraggingVolume = false; if (isResizing) handleResizerMouseUp(); } catch(error) { console.error("ERROR in window mouseup:", error); } });
        window.addEventListener('beforeunload', () => { try { saveState(); } catch(e) { console.error("ERROR in beforeunload saveState:", e); } });


         // --- Initialization Calls ---
         // Inject YouTube API Script
        var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api"; var firstScriptTag = document.getElementsByTagName('script')[0]; if (firstScriptTag && firstScriptTag.parentNode) { firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); } else { document.head.appendChild(tag); }
        // Set initial tab states
        const initialActivePlayerTab = document.querySelector('.player-tab-btn.active'); if(initialActivePlayerTab) { const initialPlayerTabName = initialActivePlayerTab.dataset.playerTab; let initialPlayerContentId = ''; if (initialPlayerTabName === 'player') initialPlayerContentId = 'player-content-area'; else if (initialPlayerTabName === 'load-link') initialPlayerContentId = 'link-loader-area'; const initialPlayerContent = document.getElementById(initialPlayerContentId); if(playerTabContents) playerTabContents.forEach(c => c.classList.remove('active')); if(initialPlayerContent) initialPlayerContent.classList.add('active'); }
        const initialActiveWidgetTab = document.querySelector('.widget-tab-btn.active'); if(initialActiveWidgetTab) { const initialWidgetName = initialActiveWidgetTab.dataset.widget; const initialWidgetContent = document.getElementById(`${initialWidgetName}-widget`); if(widgetContents) widgetContents.forEach(c => c.style.display = 'none'); if(initialWidgetContent) initialWidgetContent.style.display = 'flex'; }
        // Load saved state and initialize components
        loadState();
        initializePlaylistEditorSortable();
        loadNotesFromBackend();


        // --- Add New Flashcard Listener ---
        // (Copied from your provided code, including logs and try/catch)
        if(addNewFlashcardBtn) {
            addNewFlashcardBtn.addEventListener('click', () => {
                console.log("--------------------------------------------------");
                console.log("DEBUG: Add New Flashcard button CLICKED!");
                try {
                    if (!flashcardTermInput || !flashcardDefinitionInput) { console.error("FATAL DEBUG: flashcardTermInput or flashcardDefinitionInput is NULL. Cannot add card."); alert("Error: Input fields not found. Please refresh."); return; }
                    const term = flashcardTermInput.value.trim();
                    const definition = flashcardDefinitionInput.value.trim();
                    console.log(`DEBUG: Term='${term}', Definition='${definition}'`);
                    if (term && definition) {
                        flashcards.push({ term, definition });
                        console.log("DEBUG: Pushed to flashcards array. New count:", flashcards.length, flashcards);
                        flashcardTermInput.value = '';
                        flashcardDefinitionInput.value = '';
                        if (currentFlashcardIndex === -1 && flashcards.length > 0) { currentFlashcardIndex = 0; } else if (flashcards.length > 0) { currentFlashcardIndex = flashcards.length -1; }
                        isFlashcardFlipped = false;
                        console.log("DEBUG: currentFlashcardIndex set to:", currentFlashcardIndex);
                        renderFlashcard();
                        console.log("DEBUG: About to call renderFlashcardTermList from addNewFlashcardBtn");
                        renderFlashcardTermList(); // *** CHECK FOR TYPO IN FUNCTION NAME HERE OR DEFINITION ***
                        saveState();
                        console.log("DEBUG: Flashcard added and state saved.");
                    } else { alert("Please enter both a term and a definition."); console.log("DEBUG: Term or definition was empty."); }
                } catch (error) { console.error("MAJOR ERROR in addNewFlashcardBtn click listener:", error); alert("An error occurred while adding the flashcard. Check console."); }
                console.log("--------------------------------------------------");
            });
         } else { console.error("FATAL DEBUG: addNewFlashcardBtn element was NOT FOUND. Add card functionality will not work."); }

        // --- Calls that might depend on other initializations ---
        console.log("DEBUG: About to call fetchGreeting().");
        fetchGreeting();
        console.log("DEBUG: Called fetchGreeting().");

    } catch(error) {
        console.error("MAJOR ERROR within DOMContentLoaded listener:", error);
    }
 }); // End of DOMContentLoaded listener
