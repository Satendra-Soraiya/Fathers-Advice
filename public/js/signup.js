document.addEventListener('DOMContentLoaded', () => {
  // Password visibility toggle
  const toggleButtons = document.querySelectorAll('.toggle-password');
  const passwordInputs = {
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword')
  };

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const inputId = button.closest('.password-input-group').querySelector('input').id;
      const input = passwordInputs[inputId];
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      button.querySelector('i').classList.toggle('fa-eye');
      button.querySelector('i').classList.toggle('fa-eye-slash');
    });
  });

  // Password strength indicator
  const strengthBar = document.querySelector('.strength-bar');
  const strengthText = document.querySelector('.strength-text');
  
  if (passwordInputs.password && strengthBar && strengthText) {
    passwordInputs.password.addEventListener('input', () => {
      const password = passwordInputs.password.value;
      let strength = 0;
      let color = '#ff4444';
      let text = 'Weak';

      // Check password strength
      if (password.length >= 8) strength++;
      if (password.match(/[A-Z]/)) strength++;
      if (password.match(/[0-9]/)) strength++;
      if (password.match(/[^A-Za-z0-9]/)) strength++;

      // Update strength indicator
      switch (strength) {
        case 1:
          color = '#ff4444';
          text = 'Weak';
          break;
        case 2:
          color = '#ffbb33';
          text = 'Fair';
          break;
        case 3:
          color = '#00C851';
          text = 'Good';
          break;
        case 4:
          color = '#007E33';
          text = 'Strong';
          break;
      }

      strengthBar.style.setProperty('--strength-color', color);
      strengthBar.style.width = `${(strength / 4) * 100}%`;
      strengthText.textContent = text;
      strengthText.style.color = color;
    });
  }

  // Form validation and submission
  const form = document.getElementById('signupForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Check if terms are accepted
      const termsCheckbox = document.getElementById('terms');
      if (!termsCheckbox.checked) {
        showError('Please accept the terms and conditions');
        return;
      }

      // Validate password strength
      const password = passwordInputs.password.value;
      if (password.length < 8) {
        showError('Password must be at least 8 characters long');
        return;
      }

      // Validate role selection
      const roleSelect = document.getElementById('role');
      console.log('Selected role value:', roleSelect.value); // Debug log
      
      if (!roleSelect.value) {
        showError('Please select a role (Mentor or Mentee)');
        return;
      }

      try {
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        submitBtn.disabled = true;

        // Create form data
        const formData = new FormData(form);
        
        // Log all form data entries
        console.log('All form data entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }

        const response = await fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(formData)
        });

        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;

        if (response.redirected) {
          // If the server redirected, follow the redirect
          window.location.href = response.url;
        } else {
          // If not redirected, show error
          const text = await response.text();
          showError(text || 'Signup failed. Please try again.');
          console.error('Signup error:', text);
        }
      } catch (error) {
        // Show detailed error message
        showError(`An error occurred: ${error.message}`);
        console.error('Signup error:', error);
      }
    });
  }

  // Social signup buttons
  const socialButtons = document.querySelectorAll('.social-btn');
  socialButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const provider = button.classList.contains('google') ? 'Google' : 'LinkedIn';
      showMessage(`Signing up with ${provider}...`);
      // Add your social signup logic here
    });
  });

  // Animate feature items on scroll
  const featureItems = document.querySelectorAll('.feature-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, { threshold: 0.1 });

  featureItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(30px)';
    observer.observe(item);
  });

  // Helper functions
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing error message
    const existingError = document.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    form.insertBefore(errorDiv, form.firstChild);
    
    // Animate the error message
    errorDiv.style.opacity = '0';
    errorDiv.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      errorDiv.style.opacity = '1';
      errorDiv.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
      errorDiv.style.opacity = '0';
      errorDiv.style.transform = 'translateY(-20px)';
      setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
  }

  function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Animate the message
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      messageDiv.style.opacity = '1';
      messageDiv.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove message after 5 seconds
    setTimeout(() => {
      messageDiv.style.opacity = '0';
      messageDiv.style.transform = 'translateY(20px)';
      setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
  }
}); 