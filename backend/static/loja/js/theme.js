/**
 * Theme Toggle - Dark/Light Mode
 */

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update icon
    const icons = document.querySelectorAll('.theme-toggle i, .btn-icon i');
    icons.forEach(icon => {
        if (icon.classList.contains('fa-moon') || icon.classList.contains('fa-sun')) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);

        const icons = document.querySelectorAll('.theme-toggle i, .btn-icon i');
        icons.forEach(icon => {
            if (icon.classList.contains('fa-moon') || icon.classList.contains('fa-sun')) {
                icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }
});
