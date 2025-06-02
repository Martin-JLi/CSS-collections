const cube = document.getElementById("cube");
const scene = document.getElementById("scene");

let isRotationEnabled = false; // flag to toggle rotation
cube.style.transform = `rotateX(0deg) rotateY(0deg)`;

document.addEventListener("click", () => {
    cube.classList.toggle("active");
    isRotationEnabled = !isRotationEnabled;
});

document.addEventListener("mousemove", (e) => {
    if (!isRotationEnabled) return; // exit if rotation is disabled

    const { width, height, left, top } = scene.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const offsetX = (x / width - 0.5) * 3;
    const offsetY = (y / height - 0.5) * 3;

    const rotateX = offsetY * -45;
    const rotateY = offsetX * 45;

    cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});
