(() => {

  const loadComponent = async (id, file) => {
    const el = document.getElementById(id);

    if (!el) return;

    try {
      const response = await fetch(file);
      const html = await response.text();
      el.innerHTML = html;

      // Re-run nav active state after header loads
      if (id === "header") {
        const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();

        document.querySelectorAll("a[data-nav]").forEach((a) => {
          const href = (a.getAttribute("href") || "").toLowerCase();

          const current =
            href.endsWith(path) ||
            (path === "" && href.endsWith("index.html"));

          a.classList.toggle("is-active", current);
        });
      }
    } catch (err) {
      console.error(`Failed to load ${file}`, err);
    }
  };

  loadComponent("header", "./header.html");
  loadComponent("footer", "./footer.html");

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Navbar background on scroll
  const nav = $("#siteNav");
  const setNav = () => {
    if (!nav) return;
    const solid = window.scrollY > 24;
    nav.classList.toggle("is-solid", solid);
  };
  setNav();
  window.addEventListener("scroll", setNav, { passive: true });

  // Active nav link based on current page
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$("a[data-nav]").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    const current = href.endsWith(path) || (path === "" && href.endsWith("index.html"));
    a.classList.toggle("is-active", current);
  });

  // Scroll reveal
  const revealEls = $$("[data-reveal]");
  const revealNow = (el) => {
    el.classList.add("is-visible");
    el.addEventListener("transitionend", () => {
      el.style.willChange = "auto";
    }, { once: true });
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          revealNow(entry.target);
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach(revealNow);
  }

  // Smooth anchor scroll (accounts for sticky header)
  const headerOffset = () => {
    const h = nav?.offsetHeight ?? 72;
    return Math.max(64, h + 10);
  };

  const scrollToHash = (hash) => {
    const target = hash ? document.querySelector(hash) : null;
    if (!target) return false;
    const y = target.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({ top: y, behavior: "smooth" });
    return true;
  };

  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href^='#']");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const ok = scrollToHash(href);
    if (ok) e.preventDefault();
  });

  // Prevent gallery dummy links from jumping
  $$("[data-gallery]").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  // Lightbox for pellet gallery
  const lightboxOverlay = $("#lightboxOverlay");
  const lightboxImage = $("#lightboxImage");
  const lightboxClose = $("#lightboxClose");

  const openLightbox = (src, alt) => {
    if (!lightboxOverlay || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "Gallery image";
    lightboxOverlay.hidden = false;
    lightboxOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!lightboxOverlay || !lightboxImage) return;
    lightboxOverlay.classList.remove("is-open");
    lightboxOverlay.hidden = true;
    lightboxImage.src = "";
    document.body.style.overflow = "";
  };

  $$("[data-lightbox]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-lightbox");
      const img = btn.querySelector("img");
      openLightbox(src, img?.alt || "");
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxOverlay?.addEventListener("click", (e) => {
    if (e.target === lightboxOverlay) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxOverlay?.classList.contains("is-open")) closeLightbox();
  });

  // Contact form (frontend-only, premium feedback)
  const form = $("#contactForm");
  const hint = $("#formHint");
  if (form && hint) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      hint.classList.remove("is-ok", "is-bad");
      hint.textContent = "Sending…";

      // Simulate request
      setTimeout(() => {
        const fd = new FormData(form);
        const name = String(fd.get("name") || "").trim().split(" ")[0] || "there";
        hint.classList.add("is-ok");
        hint.textContent = `Thanks, ${name}. We received your request — our team will reach out shortly.`;
        form.reset();
      }, 650);
    });
  }

  // Lazy-load below-fold images without explicit loading attribute
  if ("loading" in HTMLImageElement.prototype) {
    $$("main img:not([loading])").forEach((img, i) => {
      if (i > 0) img.loading = "lazy";
      img.decoding = "async";
    });
  }
  if (location.hash) {
    setTimeout(() => scrollToHash(location.hash), 50);
  }
})();

