const header = document.querySelector(".site-header");
const navigation = document.querySelector("#hovedmenu");
const mobileToggle = document.querySelector(".mobile-toggle");
const hoverMenu = window.matchMedia("(min-width: 1001px) and (hover: hover) and (pointer: fine)");
let openMenu = null;
let pinned = false;

function setMenu(button, keepOpen = false) {
    if (openMenu) {
        openMenu.setAttribute("aria-expanded", "false");
        document.getElementById(openMenu.getAttribute("aria-controls")).hidden = true;
    }

    openMenu = button;
    pinned = keepOpen;

    if (button) {
        button.setAttribute("aria-expanded", "true");
        document.getElementById(button.getAttribute("aria-controls")).hidden = false;
    }
}

function closeNavigation() {
    setMenu(null);
    mobileToggle.setAttribute("aria-expanded", "false");
}

for (const item of navigation.querySelectorAll(".main-menu > li")) {
    const button = item.querySelector("button");

    item.addEventListener("pointerenter", (event) => {
        const keyboardInMenu = openMenu?.nextElementSibling.contains(document.activeElement);
        if (event.pointerType === "mouse" && hoverMenu.matches && !pinned && !keyboardInMenu) {
            setMenu(button);
        }
    });

    item.addEventListener("pointerleave", () => {
        if (openMenu === button && !pinned && !item.contains(document.activeElement)) {
            setMenu(null);
        }
    });

    button.addEventListener("click", () => {
        if (openMenu === button && pinned) {
            setMenu(null);
        } else {
            setMenu(button, true);
        }
    });
}

mobileToggle.addEventListener("click", () => {
    if (mobileToggle.getAttribute("aria-expanded") === "true") {
        closeNavigation();
    } else {
        mobileToggle.setAttribute("aria-expanded", "true");
    }
});

navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNavigation();
});

document.addEventListener("pointerdown", (event) => {
    if (!navigation.contains(event.target) && !mobileToggle.contains(event.target)) {
        closeNavigation();
    }
});

document.addEventListener("focusin", (event) => {
    if (!header.contains(event.target)) closeNavigation();
});

header.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (openMenu) {
        openMenu.focus();
        setMenu(null);
    } else if (mobileToggle.getAttribute("aria-expanded") === "true") {
        closeNavigation();
        mobileToggle.focus();
    } else {
        return;
    }

    event.preventDefault();
});

window.matchMedia("(max-width: 1000px)").addEventListener("change", closeNavigation);

const searchableContent = [...document.querySelectorAll("[data-search]")].map((section) => ({
    title: section.querySelector("h1, h2, h3, h4").textContent.trim(),
    content: section.textContent,
    href: "#" + section.id
}));

const searchableLinks = [...navigation.querySelectorAll("a")].map((link) => ({
    title: link.textContent,
    content: link.closest(".main-menu > li").querySelector("button").textContent,
    href: link.getAttribute("href")
}));

const searchResults = document.querySelector("#soegeresultater");
const searchStatus = document.querySelector("#search-status");
const searchMatches = document.querySelector("#search-matches");

const views = [...document.querySelectorAll("[data-view]")];
const homeView = document.querySelector(".home-view");

function showView(moveFocus = false) {
    const target = document.getElementById(location.hash.slice(1));
    const view = target?.closest("[data-view]") || (target ? views.find((item) => !item.hidden) : homeView);
    for (const item of views) item.hidden = item !== view;

    searchResults.hidden = true;
    const destination = target || view;
    if (moveFocus) {
        destination.setAttribute("tabindex", "-1");
        destination.focus({ preventScroll: true });
    }

    if (destination === view) {
        window.scrollTo(0, 0);
    } else {
        destination.scrollIntoView({ block: "start" });
    }
}

window.addEventListener("hashchange", () => showView(true));
if (location.hash) showView();

function normalizeSearch(text) {
    return text.toLocaleLowerCase("da-DK").normalize("NFD").replace(/\p{Mark}/gu, "").replace(/ø/g, "o");
}

header.querySelector(".site-search").addEventListener("submit", (event) => {
    event.preventDefault();

    const query = event.currentTarget.elements.q.value.trim();
    if (!query) {
        event.currentTarget.elements.q.focus();
        return;
    }

    const words = normalizeSearch(query).split(/\s+/);
    const matches = new Map();
    for (const entry of [...searchableLinks, ...searchableContent]) {
        const text = normalizeSearch(entry.title + " " + entry.content);
        if (words.every((word) => text.includes(word)) && !matches.has(entry.href)) {
            matches.set(entry.href, entry);
        }
    }

    searchMatches.replaceChildren();
    for (const { title, href } of matches.values()) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = href;
        link.textContent = title;
        item.append(link);
        searchMatches.append(item);
        link.addEventListener("click", () => {
            if (link.hash === location.hash) showView(true);
        });
    }

    searchStatus.textContent = matches.size
        ? matches.size + (matches.size === 1 ? " resultat" : " resultater") + " for “" + query + "”."
        : "Ingen resultater for “" + query + "”.";
    searchResults.hidden = false;
    closeNavigation();
    document.querySelector("#search-title").focus({ preventScroll: true });
    searchResults.scrollIntoView({ block: "start" });
});

const memberForm = document.querySelector("#member-form");
const memberStatus = document.querySelector("#member-status");

memberForm.addEventListener("input", () => {
    memberStatus.textContent = "";
});

memberForm.addEventListener("submit", (event) => {
    event.preventDefault();
    memberStatus.textContent = "Felterne er udfyldt. Tilmelding er ikke sendt.";
});
