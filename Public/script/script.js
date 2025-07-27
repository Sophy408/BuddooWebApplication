"use strict";

/**
 * BUDDOO LANDING PAGE SCRIPT
 * Handles hero section transitions and navigation
 */
window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Buddoo gestartet!");

  // DOM Elements
  const startBtn = document.getElementById("start-btn");
  const heroContent = document.querySelector(".hero-content");
  const heroNav = document.getElementById("hero-nav");

  // ======================
  // EVENT HANDLERS
  // ======================

  const handleStartClick = () => {
    heroContent.classList.add("fade-out");

    heroNav.classList.remove("hidden");
    requestAnimationFrame(() => {
      heroNav.classList.add("show");
    });

    setTimeout(() => {
      heroContent.classList.add("hidden");
      heroNav.classList.add("show");
    }, 800);
  };

  const navHandlers = {
    "nav-tasks": () => (window.location.href = "/html/todos.html"),
    "nav-notes": () => (window.location.href = "/html/notes.html"),
    "nav-focus": () => (window.location.href = "/html/focus.html"),
    "nav-events": () => (window.location.href = "/html/events.html")
  };

  startBtn?.addEventListener("click", handleStartClick);

  Object.entries(navHandlers).forEach(([id, handler]) => {
    document.getElementById(id)?.addEventListener("click", handler);
  });

  const author = document.querySelector('meta[name="author"]')?.getAttribute("content");
  if (author) {
    console.log("👩‍💻 Autor:", author);
  }

  // ======================
  // LOAD SESSION USER
  // ======================
  fetch('/api/me', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => {
      if (!response.ok) throw new Error('Nicht eingeloggt');
      return response.json();
    })
    .then(user => {
      const welcome = document.getElementById("welcome-message");
      if (welcome) {
        welcome.textContent = `Hello, ${user.username}!`;
      }
    })
    .catch(() => {
      window.location.href = "/html/index.html";
    });

  // ======================
  // LOGOUT HANDLER
  // ======================
  document.getElementById("logout-btn")?.addEventListener("click", async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        window.location.href = "/html/index.html";
      } else {
        alert("Logout fehlgeschlagen");
      }
    } catch (err) {
      console.error("Logout-Fehler:", err);
      alert("Ein Fehler ist beim Logout aufgetreten.");
    }
  });
}); 
