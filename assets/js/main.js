/* ==========================================================================
   WordPress / WooCommerce Code Library
   Version: 1.0.0
   Features: search, category filter, copy code
   ========================================================================== */

(function () {
  const searchInput = document.querySelector("#searchInput");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = Array.from(document.querySelectorAll(".code-card"));
  const visibleCount = document.querySelector("#visibleCount");
  const totalCount = document.querySelector("#totalCount");
  const emptyState = document.querySelector("#emptyState");

  let activeFilter = "all";

  function normalizeText(value) {
    return (value || "").toLowerCase().trim();
  }

  function updateStats(visibleCards) {
    totalCount.textContent = String(cards.length);
    visibleCount.textContent = String(visibleCards.length);
    emptyState.hidden = visibleCards.length !== 0;
  }

  function filterCards() {
    const keyword = normalizeText(searchInput.value);
    const visibleCards = [];

    cards.forEach((card) => {
      const category = card.dataset.category;
      const tags = card.dataset.tags || "";
      const content = normalizeText(card.innerText + " " + tags);

      const categoryMatched = activeFilter === "all" || category === activeFilter;
      const keywordMatched = !keyword || content.includes(keyword);

      const shouldShow = categoryMatched && keywordMatched;
      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCards.push(card);
      }
    });

    updateStats(visibleCards);
  }

  function bindFilters() {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        activeFilter = button.dataset.filter || "all";
        filterCards();
      });
    });
  }

  function bindSearch() {
    searchInput.addEventListener("input", filterCards);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      return true;
    } catch (error) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  function bindCopyButtons() {
    document.querySelectorAll(".copy-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const card = button.closest(".code-card");
        const code = card.querySelector("code").innerText;
        const oldText = button.innerText;

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(code);
          } else {
            fallbackCopy(code);
          }

          button.innerText = "已复制";
          button.classList.add("copied");

          window.setTimeout(() => {
            button.innerText = oldText;
            button.classList.remove("copied");
          }, 1400);
        } catch (error) {
          button.innerText = "复制失败";
          window.setTimeout(() => {
            button.innerText = oldText;
          }, 1600);
        }
      });
    });
  }

  function init() {
    bindFilters();
    bindSearch();
    bindCopyButtons();
    filterCards();
  }

  init();
})();
