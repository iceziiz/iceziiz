const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const workDialog = document.querySelector(".work-dialog");
const dialogImage = document.querySelector(".dialog-image");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "開啟導覽選單");
    primaryNav.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.setAttribute("aria-label", expanded ? "開啟導覽選單" : "關閉導覽選單");
    primaryNav.classList.toggle("is-open", !expanded);
});

navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
            history.replaceState(null, "", link.getAttribute("href"));
        }
        closeMenu();
    });
});

if ("IntersectionObserver" in window) {
    const activeSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                const active = link.getAttribute("href") === `#${entry.target.id}`;
                link.classList.toggle("is-active", active);
                if (active) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            });
        });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });

    sections.forEach((section) => activeSectionObserver.observe(section));
}

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12 });
    revealElements.forEach((element) => revealObserver.observe(element));
} else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
}

const closeDialog = () => {
    if (workDialog.open) workDialog.close();
};

document.querySelectorAll(".work-card, .product-slide").forEach((card) => {
    card.addEventListener("click", () => {
        const image = card.querySelector("img");
        dialogImage.src = image.currentSrc || image.src;
        dialogImage.alt = image.alt;
        workDialog.querySelector("#dialog-title").textContent = card.dataset.previewTitle
            || card.querySelector(".work-date")?.textContent
            || image.alt;
        workDialog.showModal();
        document.body.classList.add("dialog-open");
    });
});

const featureBackdrop = document.querySelector(".feature-backdrop");
const featureBackgroundButtons = [...document.querySelectorAll(".feature-image[data-background-image]")];
const featureBackgroundStatus = document.querySelector("#feature-background-status");
let activeFeatureBackground = Math.max(0, featureBackgroundButtons.findIndex((button) => button.getAttribute("aria-pressed") === "true"));

const showFeatureBackground = (index) => {
    activeFeatureBackground = (index + featureBackgroundButtons.length) % featureBackgroundButtons.length;
    const activeButton = featureBackgroundButtons[activeFeatureBackground];
    featureBackdrop.style.setProperty("--feature-background", `url("${activeButton.dataset.backgroundImage}")`);
    featureBackgroundButtons.forEach((button, buttonIndex) => {
        button.setAttribute("aria-pressed", String(buttonIndex === activeFeatureBackground));
    });
    featureBackgroundStatus.textContent = `目前背景：${activeButton.dataset.backgroundImage.split("/").pop().replace(".jpg", "")}`;
};

featureBackgroundButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        showFeatureBackground(index);
    });
});

showFeatureBackground(activeFeatureBackground);
if (!reducedMotion) {
    window.setInterval(() => {
        const featureBounds = document.querySelector(".work-feature").getBoundingClientRect();
        const inView = featureBounds.bottom > 0 && featureBounds.top < window.innerHeight;
        if (inView && !document.hidden) {
            showFeatureBackground(activeFeatureBackground + 1);
        }
    }, 3000);
}

document.querySelector(".dialog-close").addEventListener("click", closeDialog);
workDialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    dialogImage.removeAttribute("src");
});
workDialog.addEventListener("click", (event) => {
    if (event.target === workDialog) closeDialog();
});
workDialog.addEventListener("cancel", () => document.body.classList.remove("dialog-open"));

document.querySelector(".back-to-top").addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector("#home").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    history.replaceState(null, "", "#home");
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
});