// --- Dark Mode Logic ---
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-toggle i');
    if (!icon) return;
    
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// --- Navbar Sticky ---
document.addEventListener('DOMContentLoaded', () => {
    let scrollTimeout;
    const navbar = document.getElementById("mainNavbar");
    if(navbar) {
        window.onscroll = function() {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                if (window.pageYOffset > 50) navbar.classList.add("sticky");
                else navbar.classList.remove("sticky");
                scrollTimeout = null;
            }, 10);
        };
    }
});