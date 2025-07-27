"use strict";

/**
 * LOGIN FORM HANDLER
 * Handles user authentication form submission
 */

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;

    const loginData = {
        email: form.email.value.trim(),
        password: form.password.value
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            credentials: 'include', // ← wichtig für Session
            body: JSON.stringify(loginData)
        });

        const responseData = await response.json();

        if (response.ok) {
            alert('Login erfolgreich!');
            window.location.href = 'home.html';
        } else {
            const errorMessage = responseData.error || 'Fehler beim Login';
            alert(errorMessage);
        }

    } catch (error) {
        console.error('Login error:', error);
        alert('Ein unerwarteter Fehler ist aufgetreten');
    }
});
