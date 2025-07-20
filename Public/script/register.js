
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
      username: form.username.value,
      email: form.email.value,
      password: form.password.value
    };

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (res.ok) {
      alert('Registrierung erfolgreich!');
      window.location.href = 'index.html'; // Weiterleitung zum Login
    } else {
      alert(result.error || 'Fehler bei der Registrierung');
    }
  });

