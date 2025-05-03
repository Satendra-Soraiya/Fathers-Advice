let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    search: '',
    expertise: '',
    language: '',
    rating: '0',
    availability: '',
    sortBy: 'rating'
};

document.addEventListener('DOMContentLoaded', () => {
    // Load initial mentors
    loadMentors();

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    searchButton.addEventListener('click', () => {
        currentFilters.search = searchInput.value;
        currentPage = 1;
        loadMentors();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentFilters.search = searchInput.value;
            currentPage = 1;
            loadMentors();
        }
    });

    // Filter dropdowns
    document.getElementById('expertiseFilter').addEventListener('change', (e) => {
        currentFilters.expertise = e.target.value;
        currentPage = 1;
        loadMentors();
    });

    document.getElementById('languageFilter').addEventListener('change', (e) => {
        currentFilters.language = e.target.value;
        currentPage = 1;
        loadMentors();
    });

    document.getElementById('ratingFilter').addEventListener('change', (e) => {
        currentFilters.rating = e.target.value;
        currentPage = 1;
        loadMentors();
    });

    document.getElementById('availabilityFilter').addEventListener('change', (e) => {
        currentFilters.availability = e.target.value;
        currentPage = 1;
        loadMentors();
    });

    // Sort dropdown
    document.getElementById('sortBy').addEventListener('change', (e) => {
        currentFilters.sortBy = e.target.value;
        currentPage = 1;
        loadMentors();
    });

    // Pagination buttons
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadMentors();
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadMentors();
        }
    });
}

// Load mentors with current filters and pagination
async function loadMentors() {
    try {
        // Show loading state
        const mentorsGrid = document.getElementById('mentorsGrid');
        mentorsGrid.innerHTML = '<div class="loading">Loading mentors...</div>';

        // Build query string
        const queryParams = new URLSearchParams({
            page: currentPage,
            search: currentFilters.search,
            expertise: currentFilters.expertise,
            language: currentFilters.language,
            rating: currentFilters.rating,
            availability: currentFilters.availability,
            sortBy: currentFilters.sortBy
        });

        console.log('Fetching mentors with params:', queryParams.toString());

        // Fetch mentors
        const response = await fetch(`/api/mentors/search?${queryParams}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to load mentors');
        }

        const data = await response.json();
        console.log('Received mentors data:', data);
        
        const { mentors, total, pages } = data;

        // Update pagination
        totalPages = pages;
        updatePagination();

        // Update mentors grid
        mentorsGrid.innerHTML = mentors.map(mentor => `
            <div class="mentor-card">
                <img src="${mentor.profilePhoto || '/images/default-avatar.png'}" alt="${mentor.name}" class="mentor-photo">
                <div class="mentor-info">
                    <h3>${mentor.name}</h3>
                    <p class="mentor-expertise">${mentor.qualification}</p>
                    <p class="mentor-bio">${mentor.bio ? mentor.bio.substring(0, 100) + '...' : 'No bio available'}</p>
                    <div class="mentor-rating">
                        <i class="fas fa-star"></i>
                        <span>${mentor.rating ? mentor.rating.toFixed(1) : '0.0'}</span>
                        <span>(${mentor.reviews || 0} reviews)</span>
                    </div>
                    <div class="mentor-availability">
                        <i class="fas fa-clock"></i>
                        <span>${mentor.availability || 'Flexible'}</span>
                    </div>
                    <div class="mentor-price">
                        <span>$${mentor.price || 0}/session</span>
                    </div>
                    <a href="/mentor/${mentor._id}" class="btn btn-primary w-100">View Profile</a>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading mentors:', error);
        showError(error.message || 'Failed to load mentors');
    }
}

// Update pagination controls
function updatePagination() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Show error message
function showError(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.role = 'alert';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert error message at the top of the page
    document.body.insertBefore(errorDiv, document.body.firstChild);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
