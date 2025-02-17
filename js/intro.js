document.addEventListener("DOMContentLoaded", function () {
    const welcomeScreen = document.getElementById("welcomeScreen");
    const mainContent = document.getElementById("mainContent");
    const quranAudio = document.getElementById("quranAudio");
    
    quranAudio.play().catch(error => console.log("Audio playback failed: ", error));
    
    setTimeout(() => {
        welcomeScreen.style.opacity = "0";
        
        setTimeout(() => {
            welcomeScreen.style.display = "none";
            mainContent.style.display = "block";
            mainContent.style.opacity = "1";
            quranAudio.pause();
            quranAudio.currentTime = 0;
        }, 1000);
    }, 5000);
});