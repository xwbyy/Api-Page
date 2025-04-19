document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const body = document.body;
    
    // Hide loading screen after content is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.style.display = "none";
            body.classList.remove("no-scroll");
        }, 500);
    });

    // Fallback in case load event doesn't fire
    setTimeout(() => {
        loadingScreen.style.display = "none";
        body.classList.remove("no-scroll");
    }, 2000);
});