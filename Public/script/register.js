document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  const userData = {
    username: form.username.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Expected JSON, got ${contentType}: ${text}`);
    }

    if (response.ok) {
      alert('Registration successful!');
      window.location.href = '/html/login.html';
    } else {
      throw new Error(responseData.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert(`Error: ${error.message}`);
  } finally {
    submitBtn.disabled = false;
  }
});
