document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");

  menuBtn?.addEventListener("click", () => {
    sidebar.classList.toggle("mobile-open");
  });

  document.querySelectorAll(".nav-parent").forEach(button => {
    button.addEventListener("click", () => {
      const children = button.nextElementSibling;
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      children.classList.toggle("open", !isOpen);
    });
  });

  document.querySelectorAll(".nav-children a, .nav-home").forEach(link => {
    if (link.href === window.location.href) link.classList.add("current");
    link.addEventListener("click", () => sidebar?.classList.remove("mobile-open"));
  });
});