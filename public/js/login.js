document.addEventListener('DOMContentLoaded', () => {
  // Password visibility toggle
  const togglePassword = document.querySelector('.toggle-password');
  const passwordInput = document.getElementById('password');
  
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.querySelector('i').classList.toggle('fa-eye');
      togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });
  }

  // Form validation and submission
  const loginForm = document.getElementById('loginForm');
  const submitBtn = document.querySelector('.submit-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');
      const remember = formData.get('remember') === 'on';

      // Validate input
      if (!email || !password) {
        showError('Email and password are required');
        return;
      }

      // Disable submit button and show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, remember })
        });

        const data = await response.json();

        if (response.ok && data.success && data.redirect) {
          // Store user data in localStorage
          if (data.user) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
          }
          
          showSuccess('Login successful! Redirecting...');
          window.location.href = data.redirect;
        } else {
          showError(data.error || 'Login failed. Please try again.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
        }
      } catch (error) {
        console.error('Login error:', error);
        showError('An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
      }
    });
  }

  // Social login buttons
  const socialButtons = document.querySelectorAll('.social-btn');
  socialButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const provider = button.classList.contains('google') ? 'Google' : 'LinkedIn';
      showMessage(`Signing in with ${provider}...`);
      // Add your social login logic here
    });
  });

  // Forgot password link
  const forgotPassword = document.querySelector('.forgot-password');
  if (forgotPassword) {
    forgotPassword.addEventListener('click', (e) => {
      e.preventDefault();
      showMessage('Password reset link sent to your email!');
      // Add your forgot password logic here
    });
  }

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
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    loginForm.insertBefore(successDiv, loginForm.firstChild);
    setTimeout(() => successDiv.remove(), 5000);
  }

  function showMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert alert-info';
    messageDiv.textContent = message;
    loginForm.insertBefore(messageDiv, loginForm.firstChild);
    setTimeout(() => messageDiv.remove(), 3000);
  }
}); 