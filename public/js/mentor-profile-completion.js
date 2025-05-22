// Store selected expertise and languages
let selectedExpertise = [];
let selectedLanguages = [];

// Handle profile photo upload
document.getElementById('profilePhoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profilePreview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Add expertise tag
function addExpertise() {
    const input = document.getElementById('expertiseInput');
    const expertise = input.value.trim();
    
    if (expertise && !selectedExpertise.includes(expertise)) {
        selectedExpertise.push(expertise);
        updateExpertiseTags();
        input.value = '';
    }
}

// Remove expertise tag
function removeExpertise(expertise) {
    selectedExpertise = selectedExpertise.filter(e => e !== expertise);
    updateExpertiseTags();
}

// Update expertise tags display
function updateExpertiseTags() {
    const container = document.getElementById('expertiseTags');
    container.innerHTML = selectedExpertise.map(expertise => `
        <span class="expertise-tag">
            ${expertise}
            <span class="remove-tag" onclick="removeExpertise('${expertise}')">×</span>
        </span>
    `).join('');
}

// Add language
function addLanguage() {
    const select = document.getElementById('languageInput');
    const language = select.value;
    
    if (language && !selectedLanguages.includes(language)) {
        selectedLanguages.push(language);
        updateLanguageTags();
    }
}

// Remove language
function removeLanguage(language) {
    selectedLanguages = selectedLanguages.filter(l => l !== language);
    updateLanguageTags();
}

// Update language tags display
function updateLanguageTags() {
    const container = document.getElementById('languageTags');
    container.innerHTML = selectedLanguages.map(language => `
        <span class="expertise-tag">
            ${language.charAt(0).toUpperCase() + language.slice(1)}
            <span class="remove-tag" onclick="removeLanguage('${language}')">×</span>
        </span>
    `).join('');
}

// Handle form submission
document.getElementById('mentorProfileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData();
    
    // Add profile photo if selected
    const profilePhoto = document.getElementById('profilePhoto').files[0];
    if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
    }
    
    // Add basic information
    formData.append('fullName', document.getElementById('fullName').value);
    formData.append('professionalTitle', document.getElementById('professionalTitle').value);
    formData.append('bio', document.getElementById('bio').value);
    
    // Add professional information
    formData.append('primaryExpertise', document.getElementById('primaryExpertise').value);
    formData.append('additionalExpertise', JSON.stringify(selectedExpertise));
    formData.append('yearsExperience', document.getElementById('yearsExperience').value);
    formData.append('currentPosition', document.getElementById('currentPosition').value);
    formData.append('previousPositions', document.getElementById('previousPositions').value);
    
    // Add education information
    formData.append('highestEducation', document.getElementById('highestEducation').value);
    formData.append('fieldOfStudy', document.getElementById('fieldOfStudy').value);
    formData.append('certifications', document.getElementById('certifications').value);
    
    // Add mentoring details
    formData.append('mentoringStyle', document.getElementById('mentoringStyle').value);
    formData.append('sessionDuration', document.getElementById('sessionDuration').value);
    formData.append('sessionPrice', document.getElementById('sessionPrice').value);
    
    // Add availability
    const availability = [];
    if (document.getElementById('morningAvailability').checked) availability.push('morning');
    if (document.getElementById('afternoonAvailability').checked) availability.push('afternoon');
    if (document.getElementById('eveningAvailability').checked) availability.push('evening');
    formData.append('availability', JSON.stringify(availability));
    
    // Add communication preferences
    const communication = [];
    if (document.getElementById('videoCall').checked) communication.push('video');
    if (document.getElementById('voiceCall').checked) communication.push('voice');
    if (document.getElementById('chat').checked) communication.push('chat');
    formData.append('communication', JSON.stringify(communication));
    
    // Add languages
    formData.append('primaryLanguage', document.getElementById('primaryLanguage').value);
    formData.append('additionalLanguages', JSON.stringify(selectedLanguages));
    
    try {
        // Show loading state
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        
        // Send data to server
        const response = await fetch('/api/mentor/profile', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to save profile');
        }
        
        // Show success message
        alert('Profile completed successfully!');
        window.location.href = '/dashboard';
        
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please try again.');
        
        // Reset button state
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Complete Profile';
    }
}); 