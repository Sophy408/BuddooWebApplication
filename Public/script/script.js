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
   * Transitions from hero content to navigation buttons
   */
  const handleStartClick = () => {
    // Fade out hero content
    heroContent.classList.add("fade-out");

    // Immediately show nav (without display:none) and start fade-in
    heroNav.classList.remove("hidden");
    requestAnimationFrame(() => {
      heroNav.classList.add("show");
    });

    // Complete transition after animation
    setTimeout(() => {
      heroContent.classList.add("hidden");
      heroNav.classList.add("show");
    }, 800); // Matches CSS transition duration
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

  // Log author info if available
  const author = document.querySelector('meta[name="author"]')?.getAttribute("content");
  if (author) {
    console.log("👩‍💻 Autor:", author);
  }
});