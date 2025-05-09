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
 const flashcardTermInput = document.getElementById('flashcard-term-input');
 const flashcardDefinitionInput = document.getElementById('flashcard-definition-input');
 const addNewFlashcardBtn = document.getElementById('add-new-flashcard-btn');
 const flashcardTermListUL = document.getElementById('flashcard-term-list');
 const addStickyNoteBtn = document.getElementById('add-sticky-note-btn');
 const stickyNotesBoard = document.getElementById('sticky-notes-board');
 // --- Notes Persistence Elements ---
 const notesAreaElement = document.getElementById('notes-area'); // Main notes text area
 // const saveNotesButton = document.getElementById('save-notes-btn'); // REMOVED - No longer needed

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

// --- DEBOUNCE UTILITY ---
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// --- YouTube API Loading ---
 function onYouTubeIframeAPIReady() {
    console.log("YouTube API Ready globally");
 }

// --- COLUMN RESIZER ---
 function calculateLeftMinWidth() { const mediaInputArea = document.querySelector('.media-input-area'); const controlsArea = document.querySelector('.controls'); let requiredWidth = 0; if(mediaInputArea && mediaInputArea.offsetParent !== null) { requiredWidth = mediaInputArea.scrollWidth + 40; } if(controlsArea && controlsArea.offsetParent !== null) { let controlsWidth = Array.from(controlsArea.children).reduce((sum, el) => sum + el.offsetWidth + 10, 0) + 20; requiredWidth = Math.max(requiredWidth, controlsWidth); } const cssMin = parseFloat(getComputedStyle(leftColumn).minWidth) || 320; calculatedLeftMinWidth = Math.max(cssMin, requiredWidth, 320); }
 function handleResizerMouseMove(e) { if (!isResizing) return; const deltaX = e.clientX - initialPosX; let newLeftWidth = initialLeftWidth + deltaX; const rightMinWidth = parseFloat(getComputedStyle(rightColumn).minWidth) || 350; const containerWidth = leftColumn.parentElement.offsetWidth; const resizerWidth = dragHandle.offsetWidth || 10; newLeftWidth = Math.max(calculatedLeftMinWidth, Math.min(newLeftWidth, containerWidth - rightMinWidth - resizerWidth)); leftColumn.style.flexBasis = `${newLeftWidth}px`; }
 function handleResizerMouseUp() { if (!isResizing) return; isResizing = false; document.body.classList.remove('is-resizing'); document.removeEventListener('mousemove', handleResizerMouseMove); document.removeEventListener('mouseup', handleResizerMouseUp); saveState(); }
 if (dragHandle) { dragHandle.addEventListener('mousedown', function(e) { e.preventDefault(); isResizing = true; initialPosX = e.clientX; initialLeftWidth = leftColumn.offsetWidth; calculateLeftMinWidth(); document.body.classList.add('is-resizing'); document.addEventListener('mousemove', handleResizerMouseMove); document.addEventListener('mouseup', handleResizerMouseUp); }); }

 // --- LEFT PLAYER TABS ---
 playerTabs.forEach(tab => { tab.addEventListener('click', () => { playerTabs.forEach(t => t.classList.remove('active')); playerTabContents.forEach(c => c.classList.remove('active')); tab.classList.add('active'); const targetTabName = tab.dataset.playerTab; let targetContentId = ''; if (targetTabName === 'player') targetContentId = 'player-content-area'; else if (targetTabName === 'load-link') targetContentId = 'link-loader-area'; const targetContent = document.getElementById(targetContentId); if (targetContent) { targetContent.classList.add('active'); } else { console.error("Target content area not found for player tab:", targetTabName); } }); });

// --- MEDIA PLAYER & PLAYLIST ---
 function renderPlaylistView(container, isEditable) {
    if (!container) { console.error("Playlist container not found:", container); return; }
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
                        deleteTrack(index);
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
function startRenameMode(titleElement, trackIndex) {
    const currentTitle = tracks[trackIndex].title;
    titleElement.style.display = 'none';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.classList.add('playlist-item-rename-input');
    input.style.flexGrow = '1';
    input.style.marginRight = '5px';
    titleElement.parentNode.insertBefore(input, titleElement.nextSibling);
    input.focus();
    input.select();
    const finishRename = (saveChanges) => {
        if (saveChanges) {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== currentTitle) {
                tracks[trackIndex].title = newTitle;
                if (parseInt(currentTrackIndex) === parseInt(trackIndex)) {
                    if (songTitleElem) songTitleElem.textContent = newTitle;
                }
            }
        }
        if(input.parentNode) input.remove();
        titleElement.style.display = '';
        renderAllPlaylists();
        saveState();
    };
    const onBlur = () => {
        setTimeout(() => { if (input.parentNode) { finishRename(true); } }, 100);
    };
    const onKeydown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); input.removeEventListener('blur', onBlur); finishRename(true); }
        else if (e.key === 'Escape') { e.preventDefault(); input.removeEventListener('blur', onBlur); finishRename(false); }
    };
    input.addEventListener('blur', onBlur);
    input.addEventListener('keydown', onKeydown);
 }
function handlePlaylistDoubleClick(event) {
    const RENAME_INPUT_SELECTOR = 'input.playlist-item-rename-input';
    const clickedListItem = event.target.closest('.playlist-item');
    if (!clickedListItem || clickedListItem.querySelector(RENAME_INPUT_SELECTOR)) { return; }
    const titleDisplayElement = event.target.closest('.playlist-item-title-display');
    if (titleDisplayElement && clickedListItem.contains(titleDisplayElement)) {
        const trackIndex = parseInt(clickedListItem.dataset.index);
        if (!isNaN(trackIndex) && tracks[trackIndex]) { startRenameMode(titleDisplayElement, trackIndex); }
    }
 }
if (playlistContainerDisplay) {
     playlistContainerDisplay.addEventListener('click', (event) => {
         if (event.target.tagName === 'INPUT' && event.target.classList.contains('playlist-item-rename-input')) { return; }
         const clickedItem = event.target.closest('.playlist-item');
         if (clickedItem && playlistContainerDisplay.contains(clickedItem)) {
             const index = parseInt(clickedItem.dataset.index);
             if (!isNaN(index) && index >= 0 && index < tracks.length) { currentTrackIndex = index; loadTrackFromPlaylist(currentTrackIndex); }
         }
     });
     playlistContainerDisplay.addEventListener('dblclick', handlePlaylistDoubleClick);
 }
 if (playlistEditorList) { playlistEditorList.addEventListener('dblclick', handlePlaylistDoubleClick); }
function renderAllPlaylists() { renderPlaylistView(playlistContainerDisplay, false); renderPlaylistView(playlistEditorList, true); }
function deleteTrack(index) {
    if (index >= 0 && index < tracks.length) {
        const isCurrentTrack = parseInt(currentTrackIndex) === parseInt(index); tracks.splice(index, 1);
        if (isCurrentTrack) {
            currentTrackIndex = -1; clearPlayerScreen(); if (songTitleElem) songTitleElem.textContent = "Select a Song or Video";
            if (tracks.length > 0) { currentTrackIndex = Math.min(index, tracks.length - 1); if (currentTrackIndex < 0) currentTrackIndex = 0; if(tracks.length > 0) loadTrackFromPlaylist(currentTrackIndex); else updateProgressBar(); }
            else { updateProgressBar(); }
        } else if (currentTrackIndex > index) { currentTrackIndex--; }
        renderAllPlaylists(); saveState();
    }
 }
function initializePlaylist() {
     renderAllPlaylists();
     if (tracks.length > 0) { if (currentTrackIndex === -1 || currentTrackIndex >= tracks.length) { currentTrackIndex = 0; } loadTrackFromPlaylist(currentTrackIndex); }
     else { if(songTitleElem) songTitleElem.textContent = "Playlist Empty"; updateProgressBar(); }
 }
function initializePlaylistEditorSortable() {
    if (playlistEditorList && !sortableInstance) {
        try {
            sortableInstance = new Sortable(playlistEditorList, { animation: 150, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag',
                onEnd: function (evt) {
                    if (evt.oldIndex !== evt.newIndex) {
                        const movedItem = tracks.splice(evt.oldIndex, 1)[0]; tracks.splice(evt.newIndex, 0, movedItem);
                        if (currentTrackIndex === evt.oldIndex) { currentTrackIndex = evt.newIndex; }
                        else { if (evt.oldIndex < currentTrackIndex && evt.newIndex >= currentTrackIndex) { currentTrackIndex--; } else if (evt.oldIndex > currentTrackIndex && evt.newIndex <= currentTrackIndex) { currentTrackIndex++; } }
                        renderPlaylistView(playlistContainerDisplay, false); renderPlaylistView(playlistEditorList, true); saveState();
                    }
                },
            });
        } catch (error) { console.error("Failed to initialize SortableJS:", error); }
    } else if (!playlistEditorList) { console.error("Playlist editor list element not found for SortableJS init."); }
 }
function clearPlayerScreen() {
    if (ytProgressInterval) clearInterval(ytProgressInterval);
    ytProgressInterval = null;
    if (soundcloudWidget) {
        soundcloudWidget = null;
    }
    if (youtubePlayer) {
        if (typeof youtubePlayer.destroy === 'function') {
           youtubePlayer.destroy();
        }
        youtubePlayer = null;
    }
    mainVideoPlayerContainer.innerHTML = '';
    mainVideoPlayerContainer.style.backgroundImage = 'none';
    mainVideoPlayerContainer.style.paddingBottom = "56.25%";
    mainVideoPlayerContainer.style.height = "0";
    activeMediaFrame = null;
 }
function getYouTubeVideoID(url) { const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; const match = url.match(regExp); return (match && match[2] && match[2].length === 11) ? match[2] : null; }
 function getSoundCloudEmbedSrc(iframeCode) { if (typeof iframeCode === 'string' && iframeCode.trim().startsWith('<iframe')) { const match = iframeCode.match(/src="([^"]*)"/); if (match && match[1] && match[1].includes('w.soundcloud.com/player')) return match[1]; } return null; }
function loadMediaToPlayer(urlOrId, type, title = "Loading...") {
    clearPlayerScreen();
    audio.pause();
    if (songTitleElem) songTitleElem.textContent = title;
    currentMediaType = type;
    if (type === 'youtube') {
        const videoID = getYouTubeVideoID(urlOrId);
        if (videoID) {
            if (mainVideoPlayerContainer) {
                mainVideoPlayerContainer.innerHTML = '<div id="youtube-player-div"></div>';
                mainVideoPlayerContainer.style.paddingBottom = "56.25%";
                mainVideoPlayerContainer.style.height = "0";
            }
            if (typeof YT !== "undefined" && YT.Player) {
                try {
                    youtubePlayer = new YT.Player('youtube-player-div', {
                        height: '100%',
                        width: '100%',
                        videoId: videoID,
                        playerVars: { 'autoplay': 1, 'modestbranding': 1, 'rel': 0, 'origin': window.location.origin, 'enablejsapi': 1 },
                        events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange, 'onError': onPlayerError }
                    });
                } catch (e) {
                    console.error("Error creating YouTube player:", e);
                    if (songTitleElem) songTitleElem.textContent = "Error creating YouTube player.";
                    updateProgressBar();
                }
            } else {
                console.warn("YouTube API not ready yet. Video will not load.");
                if (songTitleElem) songTitleElem.textContent = "YT API loading... Try again shortly.";
            }
            if (playerControlsArea) playerControlsArea.style.display = 'block';
        } else {
            if (songTitleElem) songTitleElem.textContent = "Invalid YouTube URL";
            updateProgressBar();
        }
    } else if (type === 'soundcloud') {
        mainVideoPlayerContainer.innerHTML = '';
        if (urlOrId.includes('w.soundcloud.com/player')) {
            activeMediaFrame = document.createElement('iframe'); activeMediaFrame.id = 'soundcloud-player-' + Date.now();
            activeMediaFrame.width = "100%"; activeMediaFrame.height = "166"; activeMediaFrame.scrolling = "no"; activeMediaFrame.frameborder = "no"; activeMediaFrame.allow = "autoplay";
            let scSrc = urlOrId; if (!scSrc.includes('visual=')) { scSrc += (scSrc.includes('?') ? '&' : '?') + 'visual=true'; }
            if (!scSrc.includes('auto_play=')) { scSrc += (scSrc.includes('?') ? '&' : '?') + 'auto_play=true'; } else { scSrc = scSrc.replace(/auto_play=false/gi, 'auto_play=true'); }
            activeMediaFrame.src = scSrc;
            if (mainVideoPlayerContainer) {
                mainVideoPlayerContainer.style.paddingBottom = "0";
                mainVideoPlayerContainer.style.height = "166px";
                mainVideoPlayerContainer.appendChild(activeMediaFrame);
            }
            try {
                soundcloudWidget = SC.Widget(activeMediaFrame);
                soundcloudWidget.bind(SC.Widget.Events.READY, () => {
                    console.log("SoundCloud Widget Ready");
                    soundcloudWidget.setVolume(audio.volume * 100);
                    soundcloudWidget.getDuration((duration) => {
                        if (durationElem) {
                            if (duration > 0) { durationElem.textContent = formatTime(duration / 1000); }
                            else { durationElem.textContent = "0:00"; }
                        } else { console.error("Element with ID 'duration' not found when trying to set SC duration text."); }
                    });
                    soundcloudWidget.getCurrentSound((currentSound) => { if (currentSound && (songTitleElem.textContent === "Loading..." || tracks[currentTrackIndex]?.title === "SoundCloud Track" || songTitleElem.textContent === "SoundCloud Track")) { const newSCTitle = currentSound.title || title; songTitleElem.textContent = newSCTitle; if (tracks[currentTrackIndex] && (tracks[currentTrackIndex].title === "SoundCloud Track" || tracks[currentTrackIndex].title === "User Added Media")) { tracks[currentTrackIndex].title = newSCTitle; renderAllPlaylists(); saveState(); } } });
                    soundcloudWidget.bind(SC.Widget.Events.PLAY, () => { if (playBtn) playBtn.style.display = 'none'; if (pauseBtn) pauseBtn.style.display = 'inline-block'; });
                    soundcloudWidget.bind(SC.Widget.Events.PAUSE, () => { if (playBtn) playBtn.style.display = 'inline-block'; if (pauseBtn) pauseBtn.style.display = 'none'; });
                    soundcloudWidget.bind(SC.Widget.Events.PLAY_PROGRESS, (data) => { if (!isDraggingProgress) { if (currentTimeElem) currentTimeElem.textContent = formatTime(data.currentPosition / 1000); soundcloudWidget.getDuration((duration) => { if (duration > 0) { if(durationElem) durationElem.textContent = formatTime(duration / 1000); if (progressBarElem) progressBarElem.style.width = (data.currentPosition / duration) * 100 + '%'; } else if(durationElem) { durationElem.textContent = "0:00"; } }); } });
                    soundcloudWidget.bind(SC.Widget.Events.FINISH, () => { if (nextBtn) nextBtn.click(); });
                    soundcloudWidget.bind(SC.Widget.Events.ERROR, (err) => { console.error("SoundCloud Widget Error:", err); if(songTitleElem) songTitleElem.textContent = "Error loading SoundCloud track."; updateProgressBar(); });
                });
            } catch (e) {
                 console.error("Error creating SoundCloud widget:", e);
                 if(songTitleElem) songTitleElem.textContent = "Error with SoundCloud.";
                 updateProgressBar();
            }
            if (playerControlsArea) playerControlsArea.style.display = 'block';
        } else {
            if (songTitleElem) songTitleElem.textContent = "Invalid SoundCloud Embed SRC";
            updateProgressBar();
        }
    } else { // Audio
        mainVideoPlayerContainer.innerHTML = '';
        audio.src = urlOrId; audio.load();
        const trackData = tracks.find(t => t.src === urlOrId && t.type === 'audio');
        if (mainVideoPlayerContainer) {
            mainVideoPlayerContainer.style.backgroundImage = `url('${trackData ? trackData.thumbnail : defaultThumbnail}')`;
            mainVideoPlayerContainer.style.height = "0";
            mainVideoPlayerContainer.style.paddingBottom = "56.25%";
        }
        if (playerControlsArea) playerControlsArea.style.display = 'block';
        updateProgressBar();
    }
 }
// --- YouTube Player Event Handlers ---
 function onPlayerReady(event) {
    console.log("YouTube Player instance Ready (onPlayerReady)");
    updateProgressBar();
    if (youtubePlayer && typeof youtubePlayer.setVolume === 'function') {
        youtubePlayer.setVolume(audio.volume * 100);
    }
 }
function onPlayerStateChange(event) {
    console.log("YouTube Player State Change:", event.data);
    if (ytProgressInterval) clearInterval(ytProgressInterval);
    if (event.data === YT.PlayerState.PLAYING) {
        if (playBtn) playBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'inline-block';
        updateProgressBar();
        ytProgressInterval = setInterval(updateYouTubeProgress, 250);
    } else if (event.data === YT.PlayerState.PAUSED) {
        if (playBtn) playBtn.style.display = 'inline-block';
        if (pauseBtn) pauseBtn.style.display = 'none';
    } else if (event.data === YT.PlayerState.ENDED) {
        if (playBtn) playBtn.style.display = 'inline-block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        if (nextBtn) nextBtn.click();
    }
 }
function onPlayerError(event) {
    console.error("YouTube Player Error:", event.data);
    if (songTitleElem) songTitleElem.textContent = "Error playing YouTube video (Code: " + event.data + ")";
    updateProgressBar();
    if (playBtn) playBtn.style.display = 'inline-block';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (ytProgressInterval) clearInterval(ytProgressInterval);
 }
 function updateYouTubeProgress() {
    if (youtubePlayer && typeof youtubePlayer.getCurrentTime === 'function' && typeof youtubePlayer.getDuration === 'function') {
        const currentTime = youtubePlayer.getCurrentTime();
        const duration = youtubePlayer.getDuration();
        if (!isDraggingProgress) {
            if (currentTimeElem) currentTimeElem.textContent = formatTime(currentTime);
            if (duration > 0) {
                if (durationElem) durationElem.textContent = formatTime(duration);
                if (progressBarElem) progressBarElem.style.width = (currentTime / duration) * 100 + '%';
            } else {
                if (durationElem) durationElem.textContent = "0:00";
                if (progressBarElem) progressBarElem.style.width = '0%';
            }
        }
    }
 }
 if (loadMediaBtn) {
     loadMediaBtn.addEventListener('click', () => {
         const inputVal = mediaUrlInput.value.trim(); if (inputVal === "") return;
         let type = 'unknown'; let src = inputVal; let title = "User Added Media"; let thumbnail = defaultThumbnail;
         const youtubeID = getYouTubeVideoID(inputVal);
         const soundcloudEmbedCodeSrc = getSoundCloudEmbedSrc(inputVal);
         if (youtubeID) { type = 'youtube'; src = inputVal; title = `YouTube Video`; thumbnail = `http://img.youtube.com/vi/${youtubeID}/0.jpg`; }
         else if (soundcloudEmbedCodeSrc) { type = 'soundcloud'; src = soundcloudEmbedCodeSrc; const titleMatch = inputVal.match(/title="([^"]*)"/); title = titleMatch && titleMatch[1] ? titleMatch[1] : "SoundCloud Track"; }
         else if (inputVal.startsWith('http') && (inputVal.endsWith('.mp3') || inputVal.endsWith('.ogg') || inputVal.endsWith('.wav') || inputVal.includes('audio'))) { type = 'audio'; src = inputVal; try { const urlParts = new URL(inputVal).pathname.split('/'); title = decodeURIComponent(urlParts[urlParts.length -1]) || "Audio Track"; } catch(e) { title = "Audio Track"; } }
         if (type !== 'unknown') {
             const newTrackData = { src, title, thumbnail, type }; tracks.push(newTrackData);
             renderAllPlaylists(); saveState();
             if (tracks.length === 1 && currentTrackIndex === -1) { currentTrackIndex = 0; loadTrackFromPlaylist(currentTrackIndex); }
              mediaUrlInput.value = '';
         } else { alert("Could not load. Please paste a valid YouTube URL, full SoundCloud Embed Code, or direct audio link."); }
     });
 }
 if(mediaUrlInput) mediaUrlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && loadMediaBtn) loadMediaBtn.click(); });
function loadTrackFromPlaylist(index) {
    if (ytProgressInterval) clearInterval(ytProgressInterval);
    ytProgressInterval = null;
    if (index < 0 || index >= tracks.length) { console.error(`Invalid track index: ${index}`); clearPlayerScreen(); if (songTitleElem) songTitleElem.textContent = "Error: Track not found"; updateProgressBar(); return; }
    currentTrackIndex = index; const track = tracks[index];
    if (track) {
        loadMediaToPlayer(track.src, track.type, track.title);
    }
    else { console.error(`Track not found at index ${index}`); clearPlayerScreen(); if (songTitleElem) songTitleElem.textContent = "Error: Track not found"; updateProgressBar(); }
    const displayItems = playlistContainerDisplay.querySelectorAll('.playlist-item');
    displayItems.forEach(item => { item.classList.toggle('active-track', parseInt(item.dataset.index) === currentTrackIndex); });
    saveState();
 }
function playCurrentMedia() {
    if (currentMediaType === 'audio') {
        audio.play().catch(error => console.error("Error playing audio:", error));
    } else if (currentMediaType === 'youtube' && youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
        youtubePlayer.playVideo();
    } else if (currentMediaType === 'soundcloud' && soundcloudWidget && typeof soundcloudWidget.play === 'function') {
        soundcloudWidget.play();
    }
 }
 function pauseCurrentMedia() {
    if (currentMediaType === 'audio') {
        audio.pause();
    } else if (currentMediaType === 'youtube' && youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') {
        youtubePlayer.pauseVideo();
    } else if (currentMediaType === 'soundcloud' && soundcloudWidget && typeof soundcloudWidget.pause === 'function') {
        soundcloudWidget.pause();
    }
 }
if (playBtn) playBtn.addEventListener('click', playCurrentMedia);
 if (pauseBtn) pauseBtn.addEventListener('click', pauseCurrentMedia);
audio.addEventListener('loadedmetadata', updateProgressBar);
 audio.addEventListener('durationchange', updateProgressBar);
 audio.addEventListener('timeupdate', updateProgressBar);
 audio.addEventListener('ended', () => { if (nextBtn) nextBtn.click()});
 audio.addEventListener('play', () => { if (currentMediaType === 'audio') { if (playBtn) playBtn.style.display = 'none'; if (pauseBtn) pauseBtn.style.display = 'inline-block'; } });
 audio.addEventListener('pause', () => { if (currentMediaType === 'audio') { if (playBtn) playBtn.style.display = 'inline-block'; if (pauseBtn) pauseBtn.style.display = 'none'; } });
function updateProgressBar() {
    if (currentMediaType === 'audio' && audio.duration && isFinite(audio.duration)) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        if (progressBarElem && !isDraggingProgress) progressBarElem.style.width = progressPercent + '%';
        if (currentTimeElem) currentTimeElem.textContent = formatTime(audio.currentTime);
        if (durationElem) durationElem.textContent = formatTime(audio.duration);
    } else if (currentMediaType === 'soundcloud') {
        if (soundcloudWidget) {
            soundcloudWidget.getDuration(duration => {
                if (duration > 0) {
                    if(durationElem) durationElem.textContent = formatTime(duration / 1000);
                    soundcloudWidget.getPosition(position => {
                        if(currentTimeElem) currentTimeElem.textContent = formatTime(position / 1000);
                        if(progressBarElem && !isDraggingProgress) progressBarElem.style.width = (position / duration) * 100 + '%';
                    });
                } else {
                    if(durationElem) durationElem.textContent = "0:00";
                    if(currentTimeElem) currentTimeElem.textContent = "0:00";
                    if(progressBarElem && !isDraggingProgress) progressBarElem.style.width = '0%';
                }
            });
        } else {
            if (progressBarElem) progressBarElem.style.width = '0%'; if (currentTimeElem) currentTimeElem.textContent = "0:00"; if (durationElem) durationElem.textContent = "0:00";
        }
    } else if (currentMediaType === 'youtube') {
        if (youtubePlayer && typeof youtubePlayer.getDuration === 'function') {
            const duration = youtubePlayer.getDuration();
            const currentTime = youtubePlayer.getCurrentTime ? youtubePlayer.getCurrentTime() : 0;
            if (duration > 0) {
                if(durationElem) durationElem.textContent = formatTime(duration);
                if(currentTimeElem) currentTimeElem.textContent = formatTime(currentTime);
                if(progressBarElem && !isDraggingProgress) progressBarElem.style.width = (currentTime / duration) * 100 + '%';
            } else {
                if(durationElem) durationElem.textContent = "0:00";
                if(currentTimeElem) currentTimeElem.textContent = "0:00";
                if(progressBarElem && !isDraggingProgress) progressBarElem.style.width = '0%';
            }
        } else {
             if (progressBarElem) progressBarElem.style.width = '0%'; if (currentTimeElem) currentTimeElem.textContent = "0:00"; if (durationElem) durationElem.textContent = "0:00";
        }
    } else {
        if (progressBarElem) progressBarElem.style.width = '0%'; if (currentTimeElem) currentTimeElem.textContent = "0:00"; if (durationElem) durationElem.textContent = "0:00";
    }
 }
 function formatTime(seconds) { if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00"; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${mins}:${secs < 10 ? '0' : ''}${secs}`; }
if (prevBtn) prevBtn.addEventListener('click', () => { if (tracks.length === 0) return; currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length; loadTrackFromPlaylist(currentTrackIndex); });
 if (nextBtn) nextBtn.addEventListener('click', () => { if (tracks.length === 0) return; currentTrackIndex = (currentTrackIndex + 1) % tracks.length; loadTrackFromPlaylist(currentTrackIndex); });
if (progressBarContainer) progressBarContainer.addEventListener('mousedown', (e) => {
    if (currentMediaType === 'audio' && audio.duration && isFinite(audio.duration) ||
        currentMediaType === 'soundcloud' && soundcloudWidget ||
        currentMediaType === 'youtube' && youtubePlayer && youtubePlayer.getDuration && youtubePlayer.getDuration() > 0) {
        isDraggingProgress = true;
        handleProgressBarSeek(e);
    }
 });
 window.addEventListener('mousemove', (e) => { if (isDraggingProgress) handleProgressBarSeek(e); });
 window.addEventListener('mouseup', () => { if (isDraggingProgress) isDraggingProgress = false; });
function handleProgressBarSeek(e) {
    const rect = progressBarContainer.getBoundingClientRect(); const offsetX = e.clientX - rect.left; const progressWidth = Math.min(Math.max(offsetX, 0), rect.width); const seekRatio = progressWidth / rect.width;
    if (currentMediaType === 'audio' && audio.duration && isFinite(audio.duration)) {
        const seekTime = seekRatio * audio.duration;
        audio.currentTime = seekTime;
        if (currentTimeElem) currentTimeElem.textContent = formatTime(seekTime);
        if (progressBarElem) progressBarElem.style.width = seekRatio * 100 + '%';
    }
    else if (currentMediaType === 'soundcloud' && soundcloudWidget) {
        soundcloudWidget.getDuration((duration) => {
            if (duration > 0) {
                const seekPositionMs = seekRatio * duration;
                soundcloudWidget.seekTo(seekPositionMs);
                if (currentTimeElem) currentTimeElem.textContent = formatTime(seekPositionMs / 1000);
                if (progressBarElem) progressBarElem.style.width = seekRatio * 100 + '%';
            }
        });
    } else if (currentMediaType === 'youtube' && youtubePlayer && typeof youtubePlayer.seekTo === 'function') {
        const duration = youtubePlayer.getDuration();
        if (duration > 0) {
            const seekToTime = seekRatio * duration;
            youtubePlayer.seekTo(seekToTime, true);
            if (currentTimeElem) currentTimeElem.textContent = formatTime(seekToTime);
            if (progressBarElem) progressBarElem.style.width = seekRatio * 100 + '%';
        }
    }
 }
if (volumeSlider) volumeSlider.addEventListener('mousedown', (e) => { isDraggingVolume = true; handleVolumeSliderDrag(e); });
 window.addEventListener('mousemove', (e) => { if (isDraggingVolume) handleVolumeSliderDrag(e); });
 window.addEventListener('mouseup', () => { if (isDraggingVolume) isDraggingVolume = false; });
function handleVolumeSliderDrag(e) {
    const rect = volumeSlider.getBoundingClientRect(); let offsetX = e.clientX - rect.left; offsetX = Math.max(0, Math.min(offsetX, rect.width)); const volumeRatio = offsetX / rect.width;
    audio.volume = volumeRatio;
    if (soundcloudWidget && typeof soundcloudWidget.setVolume === 'function') soundcloudWidget.setVolume(volumeRatio * 100);
    if (youtubePlayer && typeof youtubePlayer.setVolume === 'function') youtubePlayer.setVolume(volumeRatio * 100);
    if (volumeThumb) { const thumbWidth = volumeThumb.offsetWidth; const maxThumbLeft = rect.width - thumbWidth; const thumbLeft = Math.max(0, Math.min(volumeRatio * rect.width - (thumbWidth / 2), maxThumbLeft)); volumeThumb.style.left = `${thumbLeft}px`; }
    saveState();
 }
function setInitialVolume() {
    const savedVolume = (localStorage.getItem('studyHubState') && JSON.parse(localStorage.getItem('studyHubState')).volume !== undefined) ? JSON.parse(localStorage.getItem('studyHubState')).volume : 0.5;
    audio.volume = savedVolume;
    if (soundcloudWidget && typeof soundcloudWidget.setVolume === 'function') soundcloudWidget.setVolume(savedVolume * 100);
    if (youtubePlayer && typeof youtubePlayer.setVolume === 'function') youtubePlayer.setVolume(savedVolume * 100);
    if (volumeSlider && volumeThumb) { const rect = volumeSlider.getBoundingClientRect(); const thumbWidth = volumeThumb.offsetWidth; if (rect.width > 0) { const maxThumbLeft = rect.width - thumbWidth; const initialThumbPos = savedVolume * rect.width - (thumbWidth / 2); volumeThumb.style.left = `${Math.max(0, Math.min(initialThumbPos, maxThumbLeft))}px`; } else { volumeThumb.style.left = `calc(${savedVolume * 100}% - ${thumbWidth / 2}px)`; } }
 }

// --- RIGHT WIDGET TAB Switching ---
 widgetTabs.forEach(tab => { tab.addEventListener('click', () => { widgetTabs.forEach(t => t.classList.remove('active')); widgetContents.forEach(c => c.style.display = 'none'); tab.classList.add('active'); const widgetName = tab.dataset.widget; const activeWidgetContent = document.getElementById(`${widgetName}-widget`); if (activeWidgetContent) activeWidgetContent.style.display = 'flex'; }); });

// --- CHECKLIST JavaScript ---
 function addChecklistItem(taskText = null, isChecked = false, shouldSave = true) {
    const itemText = taskText || (checklistItemInput ? checklistItemInput.value.trim() : ""); if (itemText === "" && !taskText) { alert("Please enter a task!"); return; }
    const listItem = document.createElement('li'); const checkboxId = `task-${checklistItemIdCounter++}`; const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = checkboxId; checkbox.checked = isChecked;
    const label = document.createElement('label'); label.htmlFor = checkboxId; label.textContent = itemText; if(isChecked) { label.style.textDecoration = 'line-through'; label.style.color = '#aaa'; }
    checkbox.addEventListener('change', function() { label.style.textDecoration = this.checked ? 'line-through' : 'none'; label.style.color = this.checked ? '#aaa' : '#333'; saveState(); });
    const deleteBtn = document.createElement('button'); deleteBtn.textContent = '🗑️'; deleteBtn.className = 'delete-item-btn'; deleteBtn.title = 'Delete task'; deleteBtn.addEventListener('click', function() { listItem.remove(); saveState(); });
    listItem.appendChild(checkbox); listItem.appendChild(label); listItem.appendChild(deleteBtn); if(checklist) checklist.appendChild(listItem);
    if (!taskText && checklistItemInput) checklistItemInput.value = ""; if (shouldSave && !taskText) saveState();
 }
 if(addChecklistItemBtn) addChecklistItemBtn.addEventListener('click', () => addChecklistItem());
 if(checklistItemInput) checklistItemInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addChecklistItem(); });

// --- FLASHCARDS JavaScript ---
 function renderFlashcard() {
    if (!flashcardDisplay || !flashcardFront || !flashcardBack || !currentCardInfo) return;
    if (flashcards.length === 0) { flashcardFront.textContent = "No cards yet!"; flashcardBack.textContent = "Add some cards below."; flashcardDisplay.classList.remove('is-flipped'); isFlashcardFlipped = false; currentCardInfo.textContent = "0/0"; if(prevFlashcardBtn) prevFlashcardBtn.disabled = true; if(nextFlashcardBtn) nextFlashcardBtn.disabled = true; if(flipFlashcardBtn) flipFlashcardBtn.disabled = true; return; }
    if(prevFlashcardBtn) prevFlashcardBtn.disabled = currentFlashcardIndex <= 0; if(nextFlashcardBtn) nextFlashcardBtn.disabled = currentFlashcardIndex >= flashcards.length - 1; if(flipFlashcardBtn) flipFlashcardBtn.disabled = false;
    const card = flashcards[currentFlashcardIndex]; flashcardFront.textContent = card.term; flashcardBack.textContent = card.definition; flashcardDisplay.classList.toggle('is-flipped', isFlashcardFlipped); currentCardInfo.textContent = `${currentFlashcardIndex + 1}/${flashcards.length}`;
 }
 function flipCurrentFlashcard() { if (flashcards.length === 0) return; isFlashcardFlipped = !isFlashcardFlipped; renderFlashcard(); }
 function renderFlashcardTermList() {
    if (!flashcardTermListUL) return; flashcardTermListUL.innerHTML = ''; const sortedForDisplay = [...flashcards].sort((a, b) => a.term.localeCompare(b.term));
    sortedForDisplay.forEach(card => { const originalIndex = flashcards.findIndex(fc => fc.term === card.term && fc.definition === card.definition); const listItem = document.createElement('li'); listItem.dataset.originalIndex = originalIndex; const termSpan = document.createElement('span'); termSpan.className = 'term'; termSpan.textContent = card.term; const defSpan = document.createElement('span'); defSpan.className = 'definition'; defSpan.textContent = card.definition; listItem.appendChild(termSpan); listItem.appendChild(defSpan); listItem.addEventListener('click', function() { currentFlashcardIndex = parseInt(this.dataset.originalIndex); isFlashcardFlipped = false; renderFlashcard(); saveState(); }); flashcardTermListUL.appendChild(listItem); });
 }
 if(flashcardDisplay) flashcardDisplay.addEventListener('click', flipCurrentFlashcard); if(flipFlashcardBtn) flipFlashcardBtn.addEventListener('click', flipCurrentFlashcard);
 if(prevFlashcardBtn) { prevFlashcardBtn.addEventListener('click', () => { if (currentFlashcardIndex > 0) { currentFlashcardIndex--; isFlashcardFlipped = false; renderFlashcard(); saveState();} }); }
 if(nextFlashcardBtn) { nextFlashcardBtn.addEventListener('click', () => { if (currentFlashcardIndex < flashcards.length - 1) { currentFlashcardIndex++; isFlashcardFlipped = false; renderFlashcard(); saveState();} }); }
 if(addNewFlashcardBtn) { addNewFlashcardBtn.addEventListener('click', () => { const term = flashcardTermInput.value.trim(); const definition = flashcardDefinitionInput.value.trim(); if (term && definition) { flashcards.push({ term, definition }); flashcardTermInput.value = ''; flashcardDefinitionInput.value = ''; if (currentFlashcardIndex === -1 && flashcards.length > 0) currentFlashcardIndex = 0; else currentFlashcardIndex = flashcards.length - 1; isFlashcardFlipped = false; renderFlashcard(); renderFlashcardTermList(); saveState(); if(flashcardTermInput) flashcardTermInput.focus(); } else { alert("Please enter both a term and a definition."); } }); }
 document.addEventListener('keydown', function(e) { const flashcardsTab = document.querySelector('.widget-tab-btn[data-widget="flashcards"]'); if (flashcardsTab && flashcardsTab.classList.contains('active') && e.code === 'Space') { if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); flipCurrentFlashcard(); } } });

// --- STICKY NOTES JavaScript ---
 function createStickyNote(id = `sticky-${Date.now()}`, content = '', top = 20, left = 20, z = ++stickyNoteZIndex, shouldSave = true) {
    const note = document.createElement('div'); note.classList.add('sticky-note'); if (!stickyNotesBoard) return;
    const boardScrollWidth = stickyNotesBoard.scrollWidth; const boardScrollHeight = stickyNotesBoard.scrollHeight; const noteWidth = 180; const noteHeight = 180;
    note.style.top = `${Math.max(0, Math.min(parseFloat(top) || 20, boardScrollHeight - noteHeight))}px`; note.style.left = `${Math.max(0, Math.min(parseFloat(left) || 20, boardScrollWidth - noteWidth))}px`;
    note.style.zIndex = z; note.dataset.id = id; const header = document.createElement('div'); header.className = 'sticky-note-header';
    const deleteBtn = document.createElement('button'); deleteBtn.innerHTML = '×'; deleteBtn.className = 'delete-sticky-btn'; deleteBtn.title = "Delete Note"; deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); if (confirm('Delete this sticky note?')) { note.remove(); saveState(); } });
    header.appendChild(deleteBtn); note.appendChild(header); const textarea = document.createElement('textarea'); textarea.value = content; textarea.placeholder = "Write something...";
    textarea.addEventListener('input', () => { saveState(); }); textarea.addEventListener('mousedown', (e) => e.stopPropagation()); note.appendChild(textarea);
    let isDraggingNote = false; let noteStartX, noteStartY, initialMouseX, initialMouseY;
    note.addEventListener('mousedown', (e) => { if (e.target === deleteBtn || e.target === textarea || e.button !== 0) return; isDraggingNote = true; noteStartX = note.offsetLeft; noteStartY = note.offsetTop; initialMouseX = e.clientX; initialMouseY = e.clientY; note.style.zIndex = ++stickyNoteZIndex; note.style.cursor = 'grabbing'; document.body.classList.add('is-resizing'); document.addEventListener('mousemove', handleStickyMouseMove); document.addEventListener('mouseup', handleStickyMouseUp); });
    function handleStickyMouseMove(e) { if (!isDraggingNote || !stickyNotesBoard) return; const dx = e.clientX - initialMouseX; const dy = e.clientY - initialMouseY; let newLeft = Math.max(0, Math.min(noteStartX + dx, stickyNotesBoard.scrollWidth - note.offsetWidth)); let newTop = Math.max(0, Math.min(noteStartY + dy, stickyNotesBoard.scrollHeight - note.offsetHeight)); note.style.left = `${newLeft}px`; note.style.top = `${newTop}px`; }
    function handleStickyMouseUp() { if (!isDraggingNote) return; isDraggingNote = false; note.style.cursor = 'move'; document.body.classList.remove('is-resizing'); document.removeEventListener('mousemove', handleStickyMouseMove); document.removeEventListener('mouseup', handleStickyMouseUp); saveState(); }
    if (stickyNotesBoard) stickyNotesBoard.appendChild(note); if (shouldSave && id.startsWith('sticky-')) saveState();
 }
 if (addStickyNoteBtn) { addStickyNoteBtn.addEventListener('click', () => { const topPos = 20 + (stickyNotesBoard ? stickyNotesBoard.scrollTop : 0); const leftPos = 20 + (stickyNotesBoard ? stickyNotesBoard.scrollLeft : 0); createStickyNote(undefined, '', topPos, leftPos); });}

// --- LOCAL STORAGE ---
 function saveState() {
    try {
        const state = {
            tracks: tracks,
            currentTrackIndex: currentTrackIndex,
            volume: audio.volume,
            leftColumnWidth: leftColumn.style.flexBasis || '320px',
            checklistItems: [],
            flashcards: flashcards,
            currentFlashcardIndex: currentFlashcardIndex,
            isFlashcardFlipped: isFlashcardFlipped,
            mainNote: notesAreaElement ? notesAreaElement.value : '',
            stickyNotes: []
        };
        if (checklist) { checklist.querySelectorAll('li').forEach(li => { const checkbox = li.querySelector('input[type="checkbox"]'); const label = li.querySelector('label'); if (checkbox && label) { state.checklistItems.push({ text: label.textContent, checked: checkbox.checked }); } }); }
        if (stickyNotesBoard) { stickyNotesBoard.querySelectorAll('.sticky-note').forEach(note => { const textarea = note.querySelector('textarea'); if (textarea) { state.stickyNotes.push({ id: note.dataset.id, content: textarea.value, top: note.offsetTop, left: note.offsetLeft, zIndex: parseInt(note.style.zIndex) || 1 }); } }); }
        localStorage.setItem('studyHubState', JSON.stringify(state));
    } catch (error) { console.error("Error saving state to localStorage:", error); }
 }
 function loadState() {
    const savedStateJSON = localStorage.getItem('studyHubState');
    if (savedStateJSON) {
        try {
            const state = JSON.parse(savedStateJSON);
            tracks = state.tracks || [];
            currentTrackIndex = state.currentTrackIndex !== undefined ? state.currentTrackIndex : -1;
            audio.volume = state.volume !== undefined ? state.volume : 0.5;
            if (state.leftColumnWidth) leftColumn.style.flexBasis = state.leftColumnWidth;
            if (state.checklistItems && checklist) { checklist.innerHTML = ''; state.checklistItems.forEach(item => addChecklistItem(item.text, item.checked, false)); }
            flashcards = state.flashcards || [];
            currentFlashcardIndex = state.currentFlashcardIndex !== undefined ? state.currentFlashcardIndex : -1;
            isFlashcardFlipped = state.isFlashcardFlipped || false;
            if (state.stickyNotes && stickyNotesBoard) { stickyNotesBoard.innerHTML = ''; let maxZ = 0; state.stickyNotes.forEach(noteData => { createStickyNote(noteData.id, noteData.content, noteData.top, noteData.left, noteData.zIndex, false); if (noteData.zIndex > maxZ) maxZ = noteData.zIndex; }); stickyNoteZIndex = maxZ || 1; }
            setInitialVolume();
            renderAllPlaylists();
            renderFlashcard();
            renderFlashcardTermList();
            if (tracks.length > 0 && currentTrackIndex >= 0 && currentTrackIndex < tracks.length) {
                 const track = tracks[currentTrackIndex];
                 if (songTitleElem) songTitleElem.textContent = track.title;
                 updateProgressBar();
            } else if (tracks.length > 0) {
                currentTrackIndex = 0;
                const track = tracks[currentTrackIndex];
                if (songTitleElem) songTitleElem.textContent = track.title;
                updateProgressBar();
            } else {
                if(songTitleElem) songTitleElem.textContent = "Playlist Empty";
                updateProgressBar();
            }
            if (currentTrackIndex !== -1 && tracks[currentTrackIndex]) {
                 const track = tracks[currentTrackIndex];
                 loadMediaToPlayer(track.src, track.type, track.title);
                 if (youtubePlayer && typeof youtubePlayer.pauseVideo === 'function') youtubePlayer.pauseVideo();
                 if (soundcloudWidget && typeof soundcloudWidget.pause === 'function') soundcloudWidget.pause();
                 audio.pause();
                 updateProgressBar();
                 const displayItems = playlistContainerDisplay.querySelectorAll('.playlist-item');
                 displayItems.forEach(item => { item.classList.toggle('active-track', parseInt(item.dataset.index) === currentTrackIndex); });
            }
        } catch (error) {
            console.error("Error parsing saved state:", error);
            initializePlaylist(); setInitialVolume(); updateProgressBar(); renderFlashcard(); renderFlashcardTermList();
        }
    } else {
        initializePlaylist(); setInitialVolume(); updateProgressBar(); renderFlashcard(); renderFlashcardTermList();
    }
 }

// --- INITIAL LOAD ---
 document.addEventListener('DOMContentLoaded', () => {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
        document.head.appendChild(tag);
    }

    const initialActivePlayerTab = document.querySelector('.player-tab-btn.active'); if(initialActivePlayerTab) { const initialPlayerTabName = initialActivePlayerTab.dataset.playerTab; let initialPlayerContentId = ''; if (initialPlayerTabName === 'player') initialPlayerContentId = 'player-content-area'; else if (initialPlayerTabName === 'load-link') initialPlayerContentId = 'link-loader-area'; const initialPlayerContent = document.getElementById(initialPlayerContentId); if(playerTabContents) playerTabContents.forEach(c => c.classList.remove('active')); if(initialPlayerContent) initialPlayerContent.classList.add('active'); }
    const initialActiveWidgetTab = document.querySelector('.widget-tab-btn.active'); if(initialActiveWidgetTab) { const initialWidgetName = initialActiveWidgetTab.dataset.widget; const initialWidgetContent = document.getElementById(`${initialWidgetName}-widget`); if(widgetContents) widgetContents.forEach(c => c.style.display = 'none'); if(initialWidgetContent) initialWidgetContent.style.display = 'flex'; }
    
    loadState();
    initializePlaylistEditorSortable();

    // --- Notes Persistence Logic ---
    async function loadNotesFromBackend() {
        if (!notesAreaElement) return;
        console.log("Frontend: Attempting to load notes from /api/notes/load...");
        try {
            const response = await fetch('/api/notes/load');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const noteText = await response.text();
            notesAreaElement.value = noteText;
            console.log("Frontend: Notes loaded successfully from backend.");
        } catch (error) {
            console.error("Frontend: Failed to load notes from backend:", error);
             const fallbackState = localStorage.getItem('studyHubState');
             if (fallbackState) {
                 try {
                     const parsedState = JSON.parse(fallbackState);
                     if (notesAreaElement && parsedState.mainNote !== undefined) {
                         notesAreaElement.value = parsedState.mainNote;
                         console.log("Frontend: Loaded notes from localStorage as fallback.");
                     }
                 } catch (e) { console.error("Error parsing fallback state", e);}
             }
        }
    }

    async function saveNotesToBackend() {
        if (!notesAreaElement) {
            console.warn("Frontend: notesAreaElement not found for saving.");
            return;
        }
        const currentNotes = notesAreaElement.value;
        console.log("Frontend: Attempting to save notes to /api/notes/save...");
        try {
            const response = await fetch('/api/notes/save', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: currentNotes
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            console.log("Frontend: Notes sent to backend successfully.");
        } catch (error) {
            console.error("Frontend: Failed to save notes to backend:", error);
        }
    }

    // --- Create Debounced Save Function for Notes ---
    const debouncedAutoSaveNotesToBackend = debounce(async function() {
        if (!notesAreaElement || typeof notesAreaElement.value === 'undefined') {
            console.warn("Notes area element not available for auto-save.");
            return;
        }
        console.log("Auto-saving notes to backend...");
        await saveNotesToBackend();
    }, 1500); // Delay of 1.5 seconds after last input

    // --- Event Listeners for Notes ---
    loadNotesFromBackend(); // Load notes from backend when app starts

    // REMOVED: Manual Save Button functionality
    // if (saveNotesButton) {
    //     saveNotesButton.addEventListener('click', async () => {
    //         await saveNotesToBackend();
    //         alert("Notes saved to cloud!");
    //     });
    // } else {
    //     console.error("Save Notes button (save-notes-btn) not found!"); // This will now likely log if HTML still has button but JS const is removed
    // }

    // Auto-Save for Notes Area
    if (notesAreaElement) {
        notesAreaElement.addEventListener('input', () => {
            debouncedAutoSaveNotesToBackend();
        });
        console.log("Auto-save feature for notes area initialized (sole save method for notes).");
    } else {
        console.error("Notes Area Element (notes-area) not found for auto-save initialization!");
    }
    
    window.addEventListener('beforeunload', saveState);
 });
