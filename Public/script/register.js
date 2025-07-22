"use strict"
/**
 * REGISTRATION FORM HANDLER
 * Handles new user registration form submission
 */
document.getElementById('register-form').addEventListener('submit', async (e) => {
    // Prevent default form submission
    e.preventDefault();
    
    // Get form reference
    const form = e.target;

    // Prepare registration data with trimmed values
    const userData = {
        username: form.username.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value
    };

    try {
        // Send registration request to server
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(userData)
        });

        // Process response
        const responseData = await response.json();

        if (response.ok) {
            // Successful registration
            alert('Registrierung erfolgreich!');
            // Redirect to login page
            window.location.href = 'index.html';
        } else {
            // Handle registration error
            const errorMessage = responseData.error || 'Fehler bei der Registrierung';
            alert(errorMessage);
        }
        
    } catch (error) {
        // Handle network or unexpected errors
        console.error('Registration error:', error);
        alert('Ein unerwarteter Fehler ist aufgetreten');
    }
});