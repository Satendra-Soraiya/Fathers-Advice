document.addEventListener('DOMContentLoaded', () => {
    // Load featured mentors
    loadFeaturedMentors();
    
    // Load testimonials
    loadTestimonials();
    
    // Handle mentor filters
    setupMentorFilters();
    
    // Handle smooth scrolling for navigation links
    setupSmoothScrolling();
});

// Load featured mentors
async function loadFeaturedMentors() {
    try {
        const response = await fetch('/api/mentors/featured');
        if (!response.ok) throw new Error('Failed to load mentors');
        
        const mentors = await response.json();
        const mentorsGrid = document.getElementById('mentorsGrid');
        
        mentorsGrid.innerHTML = mentors.map(mentor => `
            <div class="mentor-card">
                <img src="" alt="" class="mentor-photo"><!-- TODO: Set image src after image setup -->
                <div class="mentor-info">
                    <h3>${mentor.name}</h3>
                    <p class="mentor-expertise">${mentor.expertise}</p>
                    <p class="mentor-bio">${mentor.bio.substring(0, 100)}...</p>
                    <div class="mentor-rating">
                        <i class="fas fa-star"></i>
                        <span>${mentor.rating.toFixed(1)}</span>
                        <span>(${mentor.reviews} reviews)</span>
                    </div>
                    <a href="/mentor/${mentor._id}" class="btn btn-outline-primary">View Profile</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading mentors:', error);
        showError('Failed to load mentors');
    }
}

// Load testimonials
async function loadTestimonials() {
    try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) throw new Error('Failed to load testimonials');
        
        const testimonials = await response.json();
        const testimonialsSlider = document.querySelector('.testimonials-slider');
        
        testimonialsSlider.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial">
                <div class="testimonial-content">
                    <p>"${testimonial.content}"</p>
                    <div class="testimonial-author">
                        <img src="${testimonial.authorPhoto || '../images/default-avatar.png'}" alt="${testimonial.authorName}">
                        <div>
                            <h4>${testimonial.authorName}</h4>
                            <p>${testimonial.authorRole}</p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading testimonials:', error);
        showError('Failed to load testimonials');
    }
}

// Setup mentor filters
function setupMentorFilters() {
    const expertiseFilter = document.getElementById('expertiseFilter');
    const languageFilter = document.getElementById('languageFilter');
    
    expertiseFilter.addEventListener('change', filterMentors);
    languageFilter.addEventListener('change', filterMentors);
}

// Filter mentors based on selected criteria
async function filterMentors() {
    const expertise = document.getElementById('expertiseFilter').value;
    const language = document.getElementById('languageFilter').value;
    
    try {
        const response = await fetch(`/api/mentors/filter?expertise=${expertise}&language=${language}`);
        if (!response.ok) throw new Error('Failed to filter mentors');
        
        const mentors = await response.json();
        const mentorsGrid = document.getElementById('mentorsGrid');
        
        mentorsGrid.innerHTML = mentors.map(mentor => `
            <div class="mentor-card">
                <img src="${mentor.profilePhoto || '../images/default-avatar.png'}" alt="${mentor.name}" class="mentor-photo">
                <div class="mentor-info">
                    <h3>${mentor.name}</h3>
                    <p class="mentor-expertise">${mentor.expertise}</p>
                    <p class="mentor-bio">${mentor.bio.substring(0, 100)}...</p>
                    <div class="mentor-rating">
                        <i class="fas fa-star"></i>
                        <span>${mentor.rating.toFixed(1)}</span>
                        <span>(${mentor.reviews} reviews)</span>
                    </div>
                    <a href="/mentor/${mentor._id}" class="btn btn-outline-primary">View Profile</a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error filtering mentors:', error);
        showError('Failed to filter mentors');
    }
}

// Setup smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
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