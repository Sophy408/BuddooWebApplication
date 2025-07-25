"use strict";

/**
 * LOGIN CONTROLLER
 * Handles user authentication and redirection
 */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const forgotPassword = document.getElementById('forgot-password');

  // Form submission handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      email: loginForm.email.value.trim(),
      password: loginForm.password.value
    };

    try {
      // Hier würde der echte API-Call stehen
      // ===================================
      const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData)
       });
      // 
       const data = await response.json();
       if (!response.ok) throw new Error(data.message || 'Login failed');
      // ===================================
      
      // Demo: Simulierter erfolgreicher Login
      console.log('Login attempt with:', formData);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', formData.email);
      
      // Redirect to home with success state
      const redirectUrl = new URL('../index.html', window.location.href);
      redirectUrl.searchParams.set('login', 'success');
      window.location.href = redirectUrl.toString();

    } catch (error) {
      showError(error.message || 'Login fehlgeschlagen. Bitte versuche es erneut.');
      console.error('Login error:', error);
    }
  });

  // Password reset handler
  forgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Passwort-Reset-Link würde an deine Email gesendet werden.');
  });

  // Helper function to display errors
  function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.textContent = message;
    
    const existingError = document.querySelector('.auth-error');
    if (existingError) existingError.remove();
    
    loginForm.prepend(errorElement);
  }
});