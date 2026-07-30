(() => {
  const root = document.documentElement;
  const theme = localStorage.getItem("book-theme");
  if (theme) root.dataset.theme = theme;

  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("book-theme", root.dataset.theme);
  });

  const progress = document.querySelector(".progress");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const input = document.querySelector("[data-search]");
  const panel = document.querySelector("[data-search-results]");
  if (input && panel && window.BOOK_SEARCH) {
    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      if (query.length < 2) {
        panel.classList.add("hidden");
        panel.innerHTML = "";
        return;
      }
      const terms = query.split(/\s+/);
      const matches = window.BOOK_SEARCH
        .map(item => {
          const haystack = `${item.title} ${item.text}`.toLowerCase();
          const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
          return { ...item, score };
        })
        .filter(item => item.score === terms.length)
        .slice(0, 12);
      panel.innerHTML = matches.length
        ? matches.map(item => `<a class="search-result" href="${item.url}">${item.title}<small>${item.snippet}</small></a>`).join("")
        : '<span class="search-result">No matching chapter</span>';
      panel.classList.remove("hidden");
    });
    document.addEventListener("click", event => {
      if (!panel.contains(event.target) && event.target !== input) panel.classList.add("hidden");
    });
  }

  document.querySelector("[data-print]")?.addEventListener("click", () => window.print());
})();
