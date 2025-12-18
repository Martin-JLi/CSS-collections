function loadStylesheets(hrefs) {
    hrefs.forEach((href) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
    });
}

loadStylesheets([
    "cockatiel/base/cockatiel-style.css",
    "cockatiel/base/cockatiel-animation.css",
    "cockatiel/custom/cockatiel-style-custom.css",
    "cockatiel/custom/cockatiel-animation-custom.css",
]);

const bird = document.querySelector(".cockatiel-fly");
const animatedEls = [bird, ...bird.querySelectorAll("*")];

let progress = 0; // 0 ~ 1
const duration = 12; // 秒（和你 animation-duration 一致）

window.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();

        // 滚轮灵敏度（自己调）
        const step = 0.005;

        if (e.deltaY > 0) {
            progress += step; // 向前
        } else {
            progress -= step; // 回退
        }

        progress = Math.max(0, Math.min(1, progress));

        animatedEls.forEach((el) => {
            el.style.animationDelay = `-${progress * duration}s`;
        });
    },
    { passive: false }
);
