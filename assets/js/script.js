// Navigation handling
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation items and content pages
    const navItems = document.querySelectorAll('.nav-item');
    const contentPages = document.querySelectorAll('.content-page');

    // Add click event listener to each navigation item
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Get the page identifier from data attribute
            const pageId = this.dataset.page;

            // Remove active class from all navigation items and content pages
            navItems.forEach(nav => nav.classList.remove('active'));
            contentPages.forEach(page => page.classList.remove('active'));

            // Add active class to clicked item and corresponding page
            this.classList.add('active');
            document.getElementById(`${pageId}-page`).classList.add('active');
        });
    });
});