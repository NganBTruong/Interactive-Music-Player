// Inside the soundcloudWidget.bind(SC.Widget.Events.READY, ...) callback:
soundcloudWidget.getDuration((duration) => {
    // Check if durationElem exists first!
    if (durationElem) {
        if (duration > 0) {
          durationElem.textContent = formatTime(duration / 1000);
        } else {
          durationElem.textContent = "0:00";
        }
    } else {
        console.error("Element with ID 'duration' not found when trying to set text.");
    }
});
// Make similar checks for other elements accessed in SoundCloud callbacks if needed.
