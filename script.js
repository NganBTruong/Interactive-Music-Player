// --- Debounce Utility Function ---
 function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
 };

// --- Constants & State ---
// Ensure ALL these elements exist in your HTML with the correct IDs
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
 const playlistContainerDisplay = document.getElementById('playlist-container-display'); // <<< ENSURE THIS IS CORRECT
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
 const flashcardTermInput = document.getElementById('flashcard-term-input');
 const flashcardDefinitionInput = document.getElementById('flashcard-definition-input');
 const addNewFlashcardBtn = document.getElementById('add-new-flashcard-btn');
 const flashcardTermListUL = document.getElementById('flashcard-term-list');
 const addStickyNoteBtn = document.getElementById('add-sticky-note-btn');
 const stickyNotesBoard = document.getElementById('sticky-notes-board');
 const notesAreaElement = document.getElementById('notes-area');

// Log initial element findings (Keep these)
 console.log("DEBUG: playlistContainerDisplay element:", playlistContainerDisplay); // Log the specific element from the error
 console.log("DEBUG: flashcardTermInput element:", flashcardTermInput);
 console.log("DEBUG: flashcardDefinitionInput element:", flashcardDefinitionInput);
 console.log("DEBUG: addNewFlashcardBtn element:", addNewFlashcardBtn);
 console.log("DEBUG: flashcardTermListUL element:", flashcardTermListUL);

// State variables (Keep these)
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


// --- Function Definitions ---
// (Keep all your function definitions here: onYouTubeIframeAPIReady, calculateLeftMinWidth, renderPlaylistView, renderFlashcard, addChecklistItem, deleteFlashcard, saveState, loadState, etc.)
// Ensure functions correctly access the constants defined above.

 function onYouTubeIframeAPIReady() { console.log("YouTube API Ready globally"); }
 function calculateLeftMinWidth() { /* ... unchanged ... */ }
 function handleResizerMouseMove(e) { /* ... unchanged ... */ }
 function handleResizerMouseUp() { /* ... unchanged ... */ }
 function renderPlaylistView(container, isEditable) { // This function uses playlistContainerDisplay indirectly via renderAllPlaylists
    console.log("DEBUG: renderPlaylistView called for container:", container, "Editable:", isEditable);
    // Ensure playlistContainerDisplay is accessible if needed directly here, but likely ok if called correctly
    if (!container) { console.error("Playlist container (argument) not found:", container); return; }
    const fragment = document.createDocumentFragment();
    if (tracks.length === 0) {
        const emptyMsg = document.createElement(isEditable ? 'li' : 'div');
        emptyMsg.textContent = isEditable ? 'Playlist empty.' : 'Playlist empty. Add in "Add & Organize" tab.';
        emptyMsg.style.padding = '10px'; emptyMsg.style.color = '#777';
        fragment.appendChild(emptyMsg);
    } else {
        tracks.forEach((track, index) => {
            const item = document.createElement(isEditable ? 'li' : 'div');
            item.classList.add('playlist-item');
            // This check needs the **global** currentTrackIndex
            if (!isEditable && index === currentTrackIndex) {
                item.classList.add('active-track');
            }
            item.dataset.index = index;
            const img = document.createElement('img');
            img.src = track.thumbnail || defaultThumbnail;
            img.alt = track.title ? track.title.substring(0, 10) : 'Track';
            img.onerror = function() { this.onerror=null; this.src = defaultThumbnail; };
            item.appendChild(img);
            const titleDiv = document.createElement('div');
            titleDiv.classList.add('playlist-item-title-display');
            titleDiv.textContent = track.title || "Unknown Title";
            item.appendChild(titleDiv);
            if (isEditable) {
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '🗑️'; deleteBtn.className = 'delete-item-btn';
                deleteBtn.title = 'Remove from Playlist'; deleteBtn.type = "button";
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Remove "${track.title}" from playlist?`)) {
                        deleteTrack(index); // Calls global deleteTrack
                    }
                });
                item.appendChild(deleteBtn);
            }
            fragment.appendChild(item);
        });
    }
    container.innerHTML = '';
    container.appendChild(fragment);
}
 function startRenameMode(titleElement, trackIndex) { /* ... unchanged ... */ }
 function handlePlaylistDoubleClick(event) { // Called by listener inside DOMContentLoaded
     console.log("DEBUG: handlePlaylistDoubleClick called");
     // Ensure tracks is accessible (it's global 'let')
     const RENAME_INPUT_SELECTOR = 'input.playlist-item-rename-input';
     const clickedListItem = event.target.closest('.playlist-item');
     if (!clickedListItem || clickedListItem.querySelector(RENAME_INPUT_SELECTOR)) { return; }
     const titleDisplayElement = event.target.closest('.playlist-item-title-display');
     if (titleDisplayElement && clickedListItem.contains(titleDisplayElement)) {
         const trackIndex = parseInt(clickedListItem.dataset.index);
         if (!isNaN(trackIndex) && tracks[trackIndex]) { startRenameMode(titleDisplayElement, trackIndex); }
     }
 }
 function renderAllPlaylists() { // This is likely where the error occurred if line 325 was inside it
     console.log("DEBUG: renderAllPlaylists called");
     // Critical: Ensure playlistContainerDisplay and playlistEditorList (top-level consts) are accessible here.
     if (!playlistContainerDisplay) console.error("ERROR: playlistContainerDisplay is not accessible within renderAllPlaylists!");
     if (!playlistEditorList) console.error("ERROR: playlistEditorList is not accessible within renderAllPlaylists!");
     try {
        renderPlaylistView(playlistContainerDisplay, false);
        renderPlaylistView(playlistEditorList, true);
     } catch (error) {
         console.error("ERROR inside renderAllPlaylists calling renderPlaylistView:", error);
     }
 }
 function deleteTrack(index) { /* ... unchanged ... calls renderAllPlaylists */ }
 function initializePlaylist() { /* ... unchanged ... calls renderAllPlaylists and loadTrackFromPlaylist */ }
 function initializePlaylistEditorSortable() { /* ... unchanged ... uses playlistEditorList */ }
 function clearPlayerScreen() { /* ... unchanged ... uses mainVideoPlayerContainer */ }
 function getYouTubeVideoID(url) { /* ... unchanged ... */ }
 function getSoundCloudEmbedSrc(iframeCode) { /* ... unchanged ... */ }
 function loadMediaToPlayer(urlOrId, type, title = "Loading...") { /* ... unchanged ... uses mainVideoPlayerContainer, songTitleElem, etc. */ }
 function onPlayerReady(event) { /* ... unchanged ... */ }
 function onPlayerStateChange(event) { /* ... unchanged ... */ }
 function onPlayerError(event) { /* ... unchanged ... */ }
 function updateYouTubeProgress() { /* ... unchanged ... */ }
 function loadTrackFromPlaylist(index) { // Called from initializePlaylist & event listeners
     console.log("DEBUG: loadTrackFromPlaylist called for index:", index);
     // Uses playlistContainerDisplay indirectly via saveState and maybe directly for toggling class?
     if (ytProgressInterval) clearInterval(ytProgressInterval); ytProgressInterval = null;
     if (index < 0 || index >= tracks.length) { console.error(`Invalid track index: ${index}`); clearPlayerScreen(); if (songTitleElem) songTitleElem.textContent = "Error: Track not found"; updateProgressBar(); return; }
     currentTrackIndex = index;
     const track = tracks[index];
     if (track) { loadMediaToPlayer(track.src, track.type, track.title); }
     else { console.error(`Track not found at index ${index}`); clearPlayerScreen(); if (songTitleElem) songTitleElem.textContent = "Error: Track not found"; updateProgressBar(); }
     // Ensure playlistContainerDisplay is accessible here
     if (playlistContainerDisplay) {
         const displayItems = playlistContainerDisplay.querySelectorAll('.playlist-item');
         displayItems.forEach(item => { item.classList.toggle('active-track', parseInt(item.dataset.index) === currentTrackIndex); });
     } else {
         console.error("ERROR: playlistContainerDisplay not accessible in loadTrackFromPlaylist!");
     }
     saveState();
 }
 function playCurrentMedia() { /* ... unchanged ... */ }
 function pauseCurrentMedia() { /* ... unchanged ... */ }
 function updateProgressBar() { /* ... unchanged ... */ }
 function formatTime(seconds) { /* ... unchanged ... */ }
 function handleProgressBarSeek(e) { /* ... unchanged ... */ }
 function handleVolumeSliderDrag(e) { /* ... unchanged ... */ }
 function setInitialVolume() { /* ... unchanged ... */ }
 function addChecklistItem(taskText = null, isChecked = false, shouldSave = true) { /* ... unchanged ... uses checklist */ }
 function renderFlashcard() { /* ... unchanged ... uses flashcard constants */ }
 function flipCurrentFlashcard() { /* ... unchanged ... uses flashcardDisplay */ }
 function renderFlashcardTermList() { /* ... unchanged ... uses flashcardTermListUL and calls deleteFlashcard */ }
 function deleteFlashcard(indexToDelete) { /* ... unchanged ... calls renderFlashcard, renderFlashcardTermList */ }
 function createStickyNote(id = `sticky-${Date.now()}`, content = '', top = 20, left = 20, z = ++stickyNoteZIndex, shouldSave = true) { /* ... unchanged ... uses stickyNotesBoard */ }
 function saveState() { /* ... unchanged ... uses many top-level constants */ }
 function loadState() { /* ... unchanged ... calls many render functions */ }
 async function fetchGreeting() { /* ... unchanged ... */ }
 async function loadNotesFromBackend() { /* ... unchanged ... uses notesAreaElement */ }
 async function saveNotesToBackend() { /* ... unchanged ... uses notesAreaElement */ }


// --- INITIAL LOAD & EVENT LISTENER ATTACHMENT ---
 document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOMContentLoaded event fired.");
    try { // Wrap the whole DOMContentLoaded in a try-catch for safety

        // --- Attach Listeners for STATIC Elements ---

        // Resizer
        if (dragHandle) {
            dragHandle.addEventListener('mousedown', function(e) {
                try {
                    e.preventDefault(); isResizing = true; initialPosX = e.clientX; initialLeftWidth = leftColumn.offsetWidth; calculateLeftMinWidth(); document.body.classList.add('is-resizing'); document.addEventListener('mousemove', handleResizerMouseMove); document.addEventListener('mouseup', handleResizerMouseUp);
                } catch (error) { console.error("ERROR in dragHandle mousedown:", error); }
            });
        } else { console.warn("DEBUG: dragHandle element not found."); }

        // Player Tabs
        if (playerTabs) {
            playerTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    try {
                        playerTabs.forEach(t => t.classList.remove('active'));
                        playerTabContents.forEach(c => c.classList.remove('active'));
                        tab.classList.add('active');
                        const targetTabName = tab.dataset.playerTab;
                        let targetContentId = '';
                        if (targetTabName === 'player') targetContentId = 'player-content-area';
                        else if (targetTabName === 'load-link') targetContentId = 'link-loader-area';
                        const targetContent = document.getElementById(targetContentId);
                        if (targetContent) {
                            targetContent.classList.add('active');
                        } else {
                            console.error("Target content area not found for player tab:", targetTabName);
                        }
                    } catch (error) { console.error("ERROR in player tab click listener:", error); }
                });
            });
        } else { console.warn("DEBUG: playerTabs NodeList not found or empty."); }

         // Playlist Click/DoubleClick (if elements exist)
         // Check playlistContainerDisplay *before* adding listener
         if (playlistContainerDisplay) {
            playlistContainerDisplay.addEventListener('click', (event) => {
                 try {
                    if (event.target.tagName === 'INPUT' && event.target.classList.contains('playlist-item-rename-input')) { return; }
                    const clickedItem = event.target.closest('.playlist-item');
                    if (clickedItem && playlistContainerDisplay.contains(clickedItem)) {
                        const index = parseInt(clickedItem.dataset.index);
                        if (!isNaN(index) && index >= 0 && index < tracks.length) {
                            currentTrackIndex = index;
                            loadTrackFromPlaylist(currentTrackIndex); // Check if loadTrackFromPlaylist causes issues
                        }
                    }
                 } catch(error) { console.error("ERROR in playlistContainerDisplay click:", error); }
            });
            playlistContainerDisplay.addEventListener('dblclick', handlePlaylistDoubleClick); // handlePlaylistDoubleClick needs to be defined above
         } else { console.warn("DEBUG: playlistContainerDisplay not found when attaching listeners."); } // Warn if null here

         // Check playlistEditorList before adding listener
         if (playlistEditorList) {
            playlistEditorList.addEventListener('dblclick', handlePlaylistDoubleClick);
         } else { console.warn("DEBUG: playlistEditorList not found when attaching listener."); }


        // Player Controls
        if (playBtn) playBtn.addEventListener('click', playCurrentMedia); else console.warn("DEBUG: playBtn not found.");
        if (pauseBtn) pauseBtn.addEventListener('click', pauseCurrentMedia); else console.warn("DEBUG: pauseBtn not found.");
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                try { if (tracks.length === 0) return; currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length; loadTrackFromPlaylist(currentTrackIndex); } catch(error) { console.error("ERROR in prevBtn click:", error); }
            });
        } else { console.warn("DEBUG: prevBtn not found."); }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                 try { if (tracks.length === 0) return; currentTrackIndex = (currentTrackIndex + 1) % tracks.length; loadTrackFromPlaylist(currentTrackIndex); } catch(error) { console.error("ERROR in nextBtn click:", error); }
            });
         } else { console.warn("DEBUG: nextBtn not found."); }

        // Player Progress/Volume Bars
        if (progressBarContainer) {
            progressBarContainer.addEventListener('mousedown', (e) => {
                try { if (currentMediaType === 'audio' && audio.duration && isFinite(audio.duration) || currentMediaType === 'soundcloud' && soundcloudWidget || currentMediaType === 'youtube' && youtubePlayer && youtubePlayer.getDuration && youtubePlayer.getDuration() > 0) { isDraggingProgress = true; handleProgressBarSeek(e); } } catch(error) { console.error("ERROR in progressBarContainer mousedown:", error); }
             });
        } else { console.warn("DEBUG: progressBarContainer not found."); }
        if (volumeSlider) {
             volumeSlider.addEventListener('mousedown', (e) => {
                 try { isDraggingVolume = true; handleVolumeSliderDrag(e); } catch(error) { console.error("ERROR in volumeSlider mousedown:", error); }
            });
        } else { console.warn("DEBUG: volumeSlider not found."); }

        // Media Loader
        if (loadMediaBtn) {
            loadMediaBtn.addEventListener('click', () => {
                 try {
                    const inputVal = mediaUrlInput.value.trim(); if (inputVal === "") return; let type = 'unknown'; let src = inputVal; let title = "User Added Media"; let thumbnail = defaultThumbnail; const youtubeID = getYouTubeVideoID(inputVal); const soundcloudEmbedCodeSrc = getSoundCloudEmbedSrc(inputVal); if (youtubeID) { type = 'youtube'; src = inputVal; title = `YouTube Video`; thumbnail = `https://i.ytimg.com/vi/${youtubeID}/default.jpg`; } else if (soundcloudEmbedCodeSrc) { type = 'soundcloud'; src = soundcloudEmbedCodeSrc; const titleMatch = inputVal.match(/title="([^"]*)"/); title = titleMatch && titleMatch[1] ? titleMatch[1] : "SoundCloud Track"; } else if (inputVal.startsWith('http') && (inputVal.endsWith('.mp3') || inputVal.endsWith('.ogg') || inputVal.endsWith('.wav') || inputVal.includes('audio'))) { type = 'audio'; src = inputVal; try { const urlParts = new URL(inputVal).pathname.split('/'); title = decodeURIComponent(urlParts[urlParts.length -1]) || "Audio Track"; } catch(e) { title = "Audio Track"; } } if (type !== 'unknown') { const newTrackData = { src, title, thumbnail, type }; tracks.push(newTrackData); renderAllPlaylists(); saveState(); if (tracks.length === 1 && currentTrackIndex === -1) { currentTrackIndex = 0; loadTrackFromPlaylist(currentTrackIndex); } mediaUrlInput.value = ''; } else { alert("Could not load. Please paste a valid YouTube URL, full SoundCloud Embed Code, or direct audio link."); }
                 } catch(error) { console.error("ERROR in loadMediaBtn click:", error); }
            });
        } else { console.warn("DEBUG: loadMediaBtn not found."); }
        if(mediaUrlInput) {
            mediaUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && loadMediaBtn) loadMediaBtn.click(); });
        } else { console.warn("DEBUG: mediaUrlInput not found."); }

        // Widget Tabs
        if(widgetTabs) {
            widgetTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    try {
                        widgetTabs.forEach(t => t.classList.remove('active'));
                        widgetContents.forEach(c => c.style.display = 'none');
                        tab.classList.add('active');
                        const targetWidgetName = tab.dataset.widget;
                        const targetWidget = document.getElementById(`${targetWidgetName}-widget`);
                        if (targetWidget) {
                            targetWidget.style.display = 'flex';
                        } else {
                            console.error("Target widget content not found for tab:", targetWidgetName);
                        }
                    } catch (error) { console.error("ERROR in widget tab click listener:", error); }
                });
            });
        } else { console.warn("DEBUG: widgetTabs NodeList not found or empty."); }

        // Checklist Add Button / Input
        if(addChecklistItemBtn) {
             addChecklistItemBtn.addEventListener('click', () => {
                 try { addChecklistItem(); } catch(e){ console.error("ERROR in addChecklistItemBtn click:", e); }
             });
        } else { console.warn("DEBUG: addChecklistItemBtn not found."); }
        if(checklistItemInput) {
             checklistItemInput.addEventListener('keypress', (e) => {
                try { if (e.key === 'Enter') addChecklistItem(); } catch(e){ console.error("ERROR in checklistItemInput keypress:", e); }
            });
        } else { console.warn("DEBUG: checklistItemInput not found."); }

        // Flashcard Buttons
        if(flashcardDisplay) { flashcardDisplay.addEventListener('click', flipCurrentFlashcard); } else { console.warn("DEBUG: flashcardDisplay not found."); }
        if(flipFlashcardBtn) { flipFlashcardBtn.addEventListener('click', flipCurrentFlashcard); } else { console.warn("DEBUG: flipFlashcardBtn not found."); }
        if(prevFlashcardBtn) { prevFlashcardBtn.addEventListener('click', () => { try { if (flashcards.length === 0) return; currentFlashcardIndex = (currentFlashcardIndex - 1 + flashcards.length) % flashcards.length; isFlashcardFlipped = false; renderFlashcard(); saveState(); } catch (error) { console.error("ERROR in prevFlashcardBtn click:", error); } }); } else { console.warn("DEBUG: prevFlashcardBtn not found."); }
        if(nextFlashcardBtn) { nextFlashcardBtn.addEventListener('click', () => { try { if (flashcards.length === 0) return; currentFlashcardIndex = (currentFlashcardIndex + 1) % flashcards.length; isFlashcardFlipped = false; renderFlashcard(); saveState(); } catch (error) { console.error("ERROR in nextFlashcardBtn click:", error); } }); } else { console.warn("DEBUG: nextFlashcardBtn not found."); }

        // Sticky Note Add Button
        if (addStickyNoteBtn) { addStickyNoteBtn.addEventListener('click', () => { try { createStickyNote(); } catch(e){ console.error("ERROR in addStickyNoteBtn click:", e); } }); } else { console.warn("DEBUG: addStickyNoteBtn not found."); }

        // Notes Area Auto-Save
        const debouncedSaveNotesToBackend = debounce(saveNotesToBackend, 1500);
        if (notesAreaElement) {
            notesAreaElement.addEventListener('input', () => { try { debouncedSaveNotesToBackend(); saveState(); } catch(e) { console.error("ERROR in notesArea input listener:", e); } });
            console.log("Frontend: Auto-save listener added to notes area.");
        } else { console.error("Notes area element not found! Cannot add auto-save listener."); }

        // Global Keydown Listener
         document.addEventListener('keydown', function(e) { try { const activeElement = document.activeElement; const isInputFocused = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable; if (isInputFocused) { if (activeElement === mediaUrlInput && e.key === 'Enter' && loadMediaBtn) { loadMediaBtn.click(); } else if (activeElement === checklistItemInput && e.key === 'Enter' && addChecklistItemBtn) { addChecklistItemBtn.click(); } return; } const flashcardsWidget = document.getElementById('flashcards-widget'); const isFlashcardsWidgetActive = flashcardsWidget && getComputedStyle(flashcardsWidget).display !== 'none'; if (isFlashcardsWidgetActive) { if (e.key === 'ArrowLeft') { if (prevFlashcardBtn) prevFlashcardBtn.click(); } else if (e.key === 'ArrowRight') { if (nextFlashcardBtn) nextFlashcardBtn.click(); } else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); if (flipFlashcardBtn) flipFlashcardBtn.click(); else if (flashcardDisplay) flipCurrentFlashcard(); } } } catch(error) { console.error("ERROR in keydown listener:", error); } });

        // Window Listeners for Dragging/Unload
        window.addEventListener('mousemove', (e) => { try { if (isDraggingProgress) handleProgressBarSeek(e); if (isDraggingVolume) handleVolumeSliderDrag(e); if (isResizing) handleResizerMouseMove(e); } catch(error) { console.error("ERROR in window mousemove:", error); } });
        window.addEventListener('mouseup', () => { try { if (isDraggingProgress) isDraggingProgress = false; if (isDraggingVolume) isDraggingVolume = false; if (isResizing) handleResizerMouseUp(); } catch(error) { console.error("ERROR in window mouseup:", error); } });
        window.addEventListener('beforeunload', () => { try { saveState(); } catch(e) { console.error("ERROR in beforeunload saveState:", e); } });


         // --- Initialization Calls ---
         // Inject YouTube API Script
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) { firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); }
        else { document.head.appendChild(tag); }

        // Set initial tab states (visual only, listeners are attached above)
        const initialActivePlayerTab = document.querySelector('.player-tab-btn.active'); if(initialActivePlayerTab) { const initialPlayerTabName = initialActivePlayerTab.dataset.playerTab; let initialPlayerContentId = ''; if (initialPlayerTabName === 'player') initialPlayerContentId = 'player-content-area'; else if (initialPlayerTabName === 'load-link') initialPlayerContentId = 'link-loader-area'; const initialPlayerContent = document.getElementById(initialPlayerContentId); if(playerTabContents) playerTabContents.forEach(c => c.classList.remove('active')); if(initialPlayerContent) initialPlayerContent.classList.add('active'); }
        const initialActiveWidgetTab = document.querySelector('.widget-tab-btn.active'); if(initialActiveWidgetTab) { const initialWidgetName = initialActiveWidgetTab.dataset.widget; const initialWidgetContent = document.getElementById(`${initialWidgetName}-widget`); if(widgetContents) widgetContents.forEach(c => c.style.display = 'none'); if(initialWidgetContent) initialWidgetContent.style.display = 'flex'; }

        // Load saved state and initialize components
        loadState(); // This calls render functions internally
        initializePlaylistEditorSortable(); // Depends on playlistEditorList
        loadNotesFromBackend(); // Load notes after potentially getting fallback from loadState

        // Add New Flashcard Listener (Specific one with detailed logs)
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
                        if (currentFlashcardIndex === -1 && flashcards.length > 0) { currentFlashcardIndex = 0; }
                        else if (flashcards.length > 0) { currentFlashcardIndex = flashcards.length -1; }
                        isFlashcardFlipped = false;
                        console.log("DEBUG: currentFlashcardIndex set to:", currentFlashcardIndex);
                        renderFlashcard();
                        console.log("DEBUG: About to call renderFlashcardTermList from addNewFlashcardBtn");
                        renderFlashcardTermList();
                        saveState();
                        console.log("DEBUG: Flashcard added and state saved.");
                    } else { alert("Please enter both a term and a definition."); console.log("DEBUG: Term or definition was empty."); }
                } catch (error) { console.error("MAJOR ERROR in addNewFlashcardBtn click listener:", error); alert("An error occurred while adding the flashcard. Check console."); }
                console.log("--------------------------------------------------");
            });
         } else { console.error("FATAL DEBUG: addNewFlashcardBtn element was NOT FOUND. Add card functionality will not work."); }


        // --- Calls that might depend on other initializations ---
        console.log("DEBUG: About to call fetchGreeting().");
        fetchGreeting(); // Call this last? Or does it matter? Keep as is for now.
        console.log("DEBUG: Called fetchGreeting().");

    } catch(error) {
        console.error("MAJOR ERROR within DOMContentLoaded listener:", error);
    }
 }); // End of DOMContentLoaded listener
