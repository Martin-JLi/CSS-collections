const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHorizontal = 24;
const cellsVertical = 16;
const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;

const unitlengthX = width / cellsHorizontal;
const unitlengthY = height / cellsVertical;

const engine = Engine.create();

const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height,
    },
});

const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startCol = Math.floor(Math.random() * cellsHorizontal);

Render.run(render);
Runner.run(Runner.create(), engine);

//maze generation
const cleanCell = () => {
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            grid[row][col] = false;
        }
    }
    for (let row = 0; row < horizontals.length; row++) {
        for (let col = 0; col < horizontals[row].length; col++) {
            horizontals[row][col] = false;
        }
    }
    for (let row = 0; row < verticals.length; row++) {
        for (let col = 0; col < verticals[row].length; col++) {
            verticals[row][col] = false;
        }
    }
};

const stepThroughCell = (row, col) => {
    //return if the cell is already visited
    if (grid[row][col]) return;

    //mark the cell as visited
    grid[row][col] = true;

    //randomly shuffle the neighbors
    const neighbors = shuffle([
        [row - 1, col, "up"], // up
        [row + 1, col, "down"], // down
        [row, col - 1, "left"], // left
        [row, col + 1, "right"], // right
    ]);

    for (let neighbor of neighbors) {
        const [nextRow, nextCol, direction] = neighbor;

        //check if the neighbor is within bounds
        if (
            nextRow < 0 ||
            nextRow >= cellsVertical ||
            nextCol < 0 ||
            nextCol >= cellsHorizontal
        ) {
            continue; // skip if out of bounds
        }

        if (grid[nextRow][nextCol]) {
            continue;
        }

        //if the neighbor is not visited, carve a path to it
        switch (direction) {
            case "up":
                horizontals[row - 1][col] = true; // carve the horizontal wall above
                break;
            case "down":
                horizontals[row][col] = true; // carve the horizontal wall below
                break;
            case "left":
                verticals[row][col - 1] = true; // carve the vertical wall to the left
                break;
            case "right":
                verticals[row][col] = true; // carve the vertical wall to the right
                break;
        }

        stepThroughCell(nextRow, nextCol); // recursively step through the neighbor
    }
};

const goal = Bodies.rectangle(
    width - unitlengthX / 2,
    height - unitlengthY / 2,
    unitlengthX / 1.1,
    unitlengthY / 1.1,
    { isStatic: true, label: "goal", render: { fillStyle: "green" } }
);
World.add(world, goal);

const ballRadius = Math.min(unitlengthX, unitlengthY) / 4;
const ball = Bodies.circle(unitlengthX / 2, unitlengthY / 2, ballRadius, {
    label: "ball",
});
World.add(world, ball);

//Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 10, {
        isStatic: true,
        label: "ground",
    }),
    Bodies.rectangle(width / 2, height, width, 10, {
        isStatic: true,
        label: "ground",
    }),
    Bodies.rectangle(0, height / 2, 10, height, {
        isStatic: true,
        label: "ground",
    }),
    Bodies.rectangle(width, height / 2, 10, height, {
        isStatic: true,
        label: "ground",
    }),
];

World.add(world, walls);

// Add a keydown event listener to move the ball
document.addEventListener("keydown", (event) => {
    const { x, y } = ball.velocity;
    const speed = 3;
    const maxSpeed = 12;

    switch (event.key) {
        case "w":
            if (Body.getVelocity(ball).y > -maxSpeed) {
                Body.setVelocity(ball, { x, y: y - speed });
            }
            break;
        case "s":
            if (Body.getVelocity(ball).y < maxSpeed) {
                Body.setVelocity(ball, { x, y: y + speed });
            }
            break;
        case "a":
            if (Body.getVelocity(ball).x > -maxSpeed) {
                Body.setVelocity(ball, { x: x - speed, y });
            }
            break;
        case "d":
            if (Body.getVelocity(ball).x < maxSpeed) {
                Body.setVelocity(ball, { x: x + speed, y });
            }

            break;
    }
});

//Win condition
Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
        const labels = ["ball", "goal"];
        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ) {
            document.querySelector(".winner").classList.remove("hidden");
            world.gravity.y = 1; // Enable gravity to drop the ball
            world.bodies.forEach((body) => {
                if (body.label === "wall") {
                    Body.setStatic(body, false);
                    Body.setMass(body, 0.25);
                    Body.setInertia(body, 500);
                }
            });
        }
    });
});

function startGame() {
    world.bodies
        .filter((body) => body.label === "wall")
        .forEach((body) => World.remove(world, body));
    cleanCell();
    document.querySelector(".winner").classList.add("hidden");
    engine.world.gravity.y = 0; // Disable gravity for this maze
    Body.setPosition(ball, { x: unitlengthX / 2, y: unitlengthY / 2 });
    Body.setVelocity(ball, { x: 0, y: 0 });
    Body.setAngularVelocity(ball, 0);

    stepThroughCell(startRow, startCol);

    horizontals.forEach((row, rowIndex) => {
        row.forEach((open, colIndex) => {
            if (open) return;

            const wall = Bodies.rectangle(
                unitlengthX * (colIndex + 0.5),
                unitlengthY * (rowIndex + 1),
                unitlengthX,
                5,
                { isStatic: true, label: "wall", render: { fillStyle: "grey" } }
            );
            World.add(world, wall);
        });
    });

    verticals.forEach((col, colIndex) => {
        col.forEach((open, rowIndex) => {
            if (open) return;

            const wall = Bodies.rectangle(
                unitlengthX * (rowIndex + 1),
                unitlengthY * (colIndex + 0.5),
                5,
                unitlengthY,
                { isStatic: true, label: "wall", render: { fillStyle: "grey" } }
            );
            World.add(world, wall);
        });
    });
}

startGame();
