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

  /**
   * Start Button Click Handler
   * Redirects to register page
   */
  const handleStartClick = () => {
    window.location.href = "../html/register.html";
  };

  /**
   * Check login status and show appropriate content
   */
  const checkLoginStatus = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
      heroContent.classList.add("hidden");
      heroNav.classList.remove("hidden");
      heroNav.classList.add("show");
    } else {
      heroContent.classList.remove("hidden");
      heroNav.classList.add("hidden");
    }
  };

  // Navigation Handlers
  const navHandlers = {
    "nav-tasks": () => (window.location.href = "../html/todos.html"),
    "nav-notes": () => (window.location.href = "../html/notes.html"),
    "nav-focus": () => (window.location.href = "../html/focus.html"),
    "nav-events": () => (window.location.href = "../html/events.html")
  };

  // ======================
  // INITIALIZATION
  // ======================

  // Set up event listeners
  startBtn?.addEventListener("click", handleStartClick);

  // Set up navigation buttons
  Object.entries(navHandlers).forEach(([id, handler]) => {
    document.getElementById(id)?.addEventListener("click", handler);
  });

  // Check login status on page load
  checkLoginStatus();

  // Log author info if available
  const author = document.querySelector('meta[name="author"]')?.getAttribute("content");
  if (author) {
    console.log("👩‍💻 Autor:", author);
  }
});