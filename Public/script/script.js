"use strict";

window.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Buddoo gestartet!");

  const startBtn = document.getElementById("start-btn");
  const heroContent = document.querySelector(".hero-content");
  const heroNav = document.getElementById("hero-nav");


  startBtn?.addEventListener("click", () => {
    // Hero-Content ausfaden
    heroContent.classList.add("fade-out");

    // Buttons sofort einblenden (während heroContent ausfadet)
    heroNav.classList.remove("hidden");      // sichtbar machen (nicht display:none)
    requestAnimationFrame(() => {
    heroNav.classList.add("show");         // fade-in starten direkt im nächsten Frame
});

    // Nach dem Ausfaden wirklich ausblenden (optional)
    setTimeout(() => {
      heroContent.classList.add("hidden");
      heroNav.classList.add("show");
    }, 800);
  });

  // Navigation zu Seiten
  document.getElementById("nav-tasks")?.addEventListener("click", () => {
    window.location.href = "../html/todos.html";
  });
  document.getElementById("nav-notes")?.addEventListener("click", () => {
    window.location.href = "../html/notes.html";
  });
  document.getElementById("nav-focus")?.addEventListener("click", () => {
    window.location.href = "../html/focus.html";
  });
  document.getElementById("nav-events")?.addEventListener("click", () => {
    window.location.href = "../html/events.html";
  });

  // 👩‍💻 Autor anzeigen
  const author = document.querySelector('meta[name="author"]')?.getAttribute("content");
  if (author) {
    console.log("👩‍💻 Autor:", author);
  }
});
