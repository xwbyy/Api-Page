document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const body = document.body;
    body.classList.add("no-scroll");

    // Simulate loading
    setTimeout(() => {
        loadingScreen.style.display = "none";
        body.classList.remove("no-scroll");
    }, 1500);

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});