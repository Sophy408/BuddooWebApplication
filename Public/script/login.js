/**
 * LOGIN FORM HANDLER
 * Handles user authentication form submission
 */

"use strict";

document.getElementById('login-form').addEventListener('submit', async (e) => {
    // Prevent default form submission
    e.preventDefault();
    
    // Get form reference
    const form = e.target;

    // Prepare login data
    const loginData = {
        email: form.email.value.trim(),
        password: form.password.value
    };

    try {
        // Send login request to server
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(loginData)
        });

        // Process response
        const responseData = await response.json();

        if (response.ok) {
            // Successful login
            alert('Login erfolgreich!');
            // Redirect to dashboard
            window.location.href = 'home.html';
        } else {
            // Handle login error
            const errorMessage = responseData.error || 'Fehler beim Login';
            alert(errorMessage);
        }
        
    } catch (error) {
        // Handle network or unexpected errors
        console.error('Login error:', error);
        alert('Ein unerwarteter Fehler ist aufgetreten');
    }
});