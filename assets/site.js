const root = document.documentElement;
const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
});

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "فتح القائمة" : "إغلاق القائمة");
        navLinks.classList.toggle("is-open", !isOpen);
    });

    navLinks.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "فتح القائمة");
            navLinks.classList.remove("is-open");
        }
    });
}

document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.addEventListener("click", () => {
        const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
        root.dataset.theme = nextTheme;
        button.setAttribute("aria-label", nextTheme === "light" ? "تفعيل المظهر الداكن" : "تفعيل المظهر الفاتح");
        const glyph = button.querySelector(".theme-glyph");
        if (glyph) glyph.textContent = nextTheme === "light" ? "☼" : "◐";
    });
});

const progressBar = document.querySelector(".scroll-progress span");
let scrollFrame = 0;
const updateScrollProgress = () => {
    if (!progressBar) return;
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        scrollFrame = 0;
    });
};
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

document.querySelectorAll("[data-back-top]").forEach((button) => {
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) {
    body.classList.add("motion-off");
} else if ("IntersectionObserver" in window) {
    body.classList.add("motion-ready");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
} else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

const tiltCard = document.querySelector("[data-tilt]");
if (tiltCard && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    tiltCard.addEventListener("pointermove", (event) => {
        const bounds = tiltCard.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        tiltCard.style.transform = `rotateY(${-7 + x * 10}deg) rotateX(${-y * 8}deg) translateZ(30px)`;
    });
    tiltCard.addEventListener("pointerleave", () => {
        tiltCard.style.transform = "";
    });
}

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const projectCards = [...document.querySelectorAll(".gallery-card[data-category]")];
const searchInput = document.querySelector("[data-project-search]");
const emptyState = document.querySelector("[data-empty-state]");
let activeFilter = "all";

const updateProjects = () => {
    if (!projectCards.length) return;
    const query = searchInput ? searchInput.value.trim().toLocaleLowerCase("ar") : "";
    let visibleCount = 0;

    projectCards.forEach((card) => {
        const categoryMatches = activeFilter === "all" || card.dataset.category === activeFilter;
        const searchMatches = !query || `${card.dataset.search} ${card.textContent}`.toLocaleLowerCase("ar").includes(query);
        const isVisible = categoryMatches && searchMatches;
        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount > 0;
};

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach((filterButton) => {
            const isActive = filterButton === button;
            filterButton.classList.toggle("is-active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
        });
        updateProjects();
    });
});

if (searchInput) searchInput.addEventListener("input", updateProjects);

const projectDialog = document.querySelector("[data-project-dialog]");
if (projectDialog) {
    const dialogImage = projectDialog.querySelector("[data-dialog-image]");
    const dialogTitle = projectDialog.querySelector("[data-dialog-title]");
    const dialogCopy = projectDialog.querySelector("[data-dialog-copy]");

    document.querySelectorAll("[data-modal-title]").forEach((button) => {
        button.addEventListener("click", () => {
            dialogTitle.textContent = button.dataset.modalTitle;
            dialogCopy.textContent = button.dataset.modalCopy;
            dialogImage.src = button.dataset.modalImage;
            dialogImage.alt = button.dataset.modalTitle;
            projectDialog.showModal();
        });
    });

    projectDialog.querySelector("[data-dialog-close]").addEventListener("click", () => projectDialog.close());
    projectDialog.addEventListener("click", (event) => {
        if (event.target === projectDialog) projectDialog.close();
    });
    projectDialog.addEventListener("close", () => {
        dialogImage.removeAttribute("src");
    });
}

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const status = contactForm.querySelector("[data-form-status]");
        const recipient = contactForm.dataset.recipient.trim();

        if (!recipient || recipient === "your-email@example.com") {
            status.textContent = "النموذج جاهز، لكن أضف بريد الاستقبال بدل your-email@example.com أولًا.";
            return;
        }

        const formData = new FormData(contactForm);
        const senderName = String(formData.get("name")).trim();
        const senderEmail = String(formData.get("email")).trim();
        const topic = String(formData.get("topic")).trim();
        const message = String(formData.get("message")).trim();
        const subject = encodeURIComponent(`رسالة موقع يوسف: ${topic}`);
        const bodyText = encodeURIComponent(`الاسم: ${senderName}\nالبريد: ${senderEmail}\nالموضوع: ${topic}\n\n${message}`);
        window.location.href = `mailto:${recipient}?subject=${subject}&body=${bodyText}`;
        status.textContent = "فتحنا تطبيق البريد برسالتك. راجعها ثم أرسلها.";
    });
}
