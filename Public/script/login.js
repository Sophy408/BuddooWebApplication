  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    const data = {
      email: form.email.value,
      password: form.password.value
    };

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (res.ok) {
      alert('Login erfolgreich!');
      // Beispiel: Weiterleitung auf Profilseite oder Dashboard
      window.location.href = 'dashboard.html';
    } else {
      alert(result.error || 'Fehler beim Login');
    }
  });

