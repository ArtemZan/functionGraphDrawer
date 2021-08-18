var batches = []

var colors = []

var a = 0;
var v = 0;
var d = 50;

var t = 0;

window.onload = function () {
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context = canvas.getContext("2d");

    AddDiagram();
    batches["graphs"] = [[], []];
    colors = ["#FF0000", "#00FF00"];


    DrawTexts(batches.numberLine.numbers, "#000000");
    DrawLines(batches.numberLine.lines, "#000000");

    Draw()

    let calculated = false;
    let iterated = false;

    function loop() {
        if (!keysDown["s"]) {
            const dTime = 0.0001;
            setTimeout(loop, 0);
            t += dTime;
            d += v * dTime;
            v += a * dTime;
            a = -1000 / d / d;

            // if (d < 1) {
            //     d = 1;
            //     a = -1;
            //     v *= -0.9; //Kinda jump :)
            // }
            //So it doesn't go to infinity

            if (!calculated && 50 + t * t / 2 * -1000 / 2500 < 0.1) {
                console.log("Calculation: ", t);
                calculated = true;
            }
            
            if (!iterated && d < 0.1) {
                console.log("Iteration", t);
                iterated = true;
            }

            // batches.graphs[0].push(new Vec2(t * scaleX, d * scaleY));
            // batches.graphs[1].push(new Vec2(t * scaleX, (50 + t * t / 2 * -1000 / 2500) * scaleY));
            // //Clear()

            // for (let g in batches.graphs) {
            //     DrawCurve(batches.graphs[g], colors[g]);
            // }
        }
    }

    loop()

}

document.addEventListener("keydown", e => {
    keysDown[e.key] = true;
})

document.addEventListener("keyup", e => {
    keysDown[e.key] = false;
})

document.addEventListener("wheel", e => {
    let k = Math.pow(2, e.wheelDelta / 1000);
    scaleX *= k;
    scaleY *= k;

    for (let g of batches.graphs) {
        for (let p of g) {
            p.x *= k;
            p.y *= k;
        }
    }

    AddDiagram();
    Draw();
})

document.addEventListener("mousedown", e => {
    let mPos = ToWorldSpace(new Vec2(e.clientX, e.clientY));

    let onX = false, onY = false;

    if (Math.abs(mPos.x) < 0.1) {
        onY = true;
    }

    if (Math.abs(mPos.y) < 0.1) {
        onX = true;
    }

    if (onX ^ onY) {
        if (onX) {
            scalingX = true;
        }
        if (onY) {
            scalingY = true;
        }
    }
})

document.addEventListener("mouseup", e => {
    scalingX = false;
    scalingY = false;
})

document.addEventListener("mousemove", e => {
    if (scalingX) {
        let dScale = e.movementX / 100

        for (let g of batches.graphs) {
            for (let p of g) {
                p.x *= 1 + dScale;
            }
        }

        scaleX *= 1 + dScale;

        AddDiagram();
        Draw();
    }

    if (scalingY) {
        let dScale = -e.movementY / 100

        for (let g of batches.graphs) {
            for (let p of g) {
                p.y *= 1 + dScale / scaleY;
            }
        }

        scaleY += dScale;

        AddDiagram();
        Draw();
    }
})


function AddDiagram() {
    batches["numberLine"] = { numbers: [], lines: [] };
    for (let i = -15; i < 16; i++) {
        if (!i)
            continue;

        let xScalePower = Math.round(Math.log10(scaleX * 4));
        let yScalePower = Math.round(Math.log10(scaleY * 4));

        let xStep = Math.pow(10, -xScalePower); //[2.5; 7.5) -> 0.1; [7.5; 12.5) -> 0.01 ...
        let xStepLen = scaleX * xStep;

        let yStep = Math.pow(10, -yScalePower); //[2.5; 7.5) -> 0.1; [7.5; 12.5) -> 0.01 ...
        let yStepLen = scaleY * yStep;

        let xScale = 1, yScale = 1;
        if (window.innerHeight > window.innerWidth) {
            //xScale = window.innerHeight / window.innerWidth;
        }
        else {
            //yScale = window.innerWidth / window.innerHeight;
        }

        let x = (i - 0.01) * xScale * xStepLen;
        let y = (i - 0.01) * yScale * yStepLen;

        batches.numberLine.numbers.push([ClearFloat(i * xStep), new Vec2(x - 0.01, 0.02), {color: "#000000"}]) // Should use font size here really
        batches.numberLine.numbers.push([ClearFloat(i * yStep), new Vec2(0.015, y)]);

        batches.numberLine.lines.push(new Vec2(x, -0.01), new Vec2(x, 0.01));
        batches.numberLine.lines.push(new Vec2(-0.01, y), new Vec2(0.01, y));
    }

    batches.numberLine.numbers.push([0, new Vec2(0.01, 0.01), {color: "#000000"}])

    batches.numberLine.lines.push(new Vec2(0, -1), new Vec2(0, 1), new Vec2(-1, 0), new Vec2(1, 0));
}

function Draw() {
    Clear();
    DrawTexts(batches.numberLine.numbers);
    DrawLines(batches.numberLine.lines, "#000000");
}

var canvas;
var context;

/* Settings */
var WIREFRAME_MODE = false;
var DEFAULT_FONT_SIZE = 16;
var DEFAULT_FONT_FAMILY = 'serif';
/* --- */

/* State */
var scaleX = 1;
var scaleY = 1;
var scalingX = false;
var scalingY = false;
var keysDown = [];
var keysPressed = [];

/* --- */



class Matrix2x2 {
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
}

class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    multiply(matrix) {
        if (matrix instanceof Matrix2x2) {
            var res = new Vec2;
            res.x = matrix.x1 * this.x + matrix.y1 * this.y;
            res.y = matrix.x2 * this.x + matrix.y2 * this.y;
            return res;
        }

        if (matrix instanceof Matrix3x3)//temporary
        {
            var res = new vec3(this.x, this.y, 0);
            res = res.multiply(matrix);
            return (new Vec2(res.x, res.y));
        }
    }

    rotate(rad) {
        return multiply(new Matrix2x2(Math.cos(rad), -Math.sin(rad), Math.sin(rad), Math.cos(rad)));
    }

    normalize() {
        let l = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        return new Vec2(this.x / l, this.y / l);
    }
}


/* General utilities */
const ClearFloat = x => Math.round(x * 1e9) / 1e9

const MinWindowDimension = () => (window.innerWidth < window.innerHeight) ? window.innerWidth : window.innerHeight;
const MaxWindowDimension = () => (window.innerWidth > window.innerHeight) ? window.innerWidth : window.innerHeight;

const ToWindowSpace = vec => (vec instanceof Vec2) && new Vec2((vec.x + 1) / 2 * window.innerWidth, (1 - vec.y) / 2 * window.innerHeight);
const ToWorldSpace = vec => (vec instanceof Vec2) && new Vec2(vec.x / window.innerWidth * 2 - 1, 1 - vec.y / window.innerHeight * 2);

const RelToCenter = vec => (vec instanceof Vec2) && new vec2(vec.x - window.innerWidth / 2, window.innerHeight / 2 - vec.y);
const RelToWindow = vec => (vec instanceof Vec2) && new vec2(vec.x + window.innerWidth / 2, window.innerHeight / 2 - vec.y);
/* --- */

/* Rendering utilities */
function Clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function SetColor(color) {
    if (color !== undefined) {
        context.strokeStyle = color;
        context.fillStyle = color;
    }
}

function DrawText(text, pos, options) {

    let maxWidth = undefined;

    context.font = DEFAULT_FONT_SIZE.toString().concat("px ").concat(DEFAULT_FONT_FAMILY);

    if (options instanceof Object) {
        let font = "";

        function add(data) {
            if (font.length)
                font = font.concat(' ');

            font = font.concat(data);

        }

        if (options.fontSize) {
            add(parseInt(options.fontSize).toString().concat("px"));
        }

        if (options.fontFamily) {
            add(options.fontFamily);
        }

        context.font = font;

        SetColor(options.color);

        if (options.maxWidth) {
            maxWidth = options.maxWidth
        }
    }

    pos = ToWindowSpace(pos);

    if (WIREFRAME_MODE)
        context.strokeText(text, pos.x, pos.y, 1000)
    else
        context.fillText(text, pos.x, pos.y, maxWidth)
}

function DrawLine(start, end, color) {
    SetColor(color);
    start = ToWindowSpace(start);
    end = ToWindowSpace(end);

    context.beginPath();
    context.lineWidth = 1;
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
}

function DrawDot(pos, size) {
    SetColor(color);

    pos = ToWindowSpace(pos);

    context.beginPath();
    context.arc(pos.x, pos.y, size, 0, 2 * Math.PI)
    context.fill();
}

function DrawTriangle(vert1, vert2, vert3, color) {
    SetColor(color);

    vert1 = ToWindowSpace(vert1);
    vert2 = ToWindowSpace(vert2);
    vert3 = ToWindowSpace(vert3);

    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(vert1.x, vert1.y);
    context.lineTo(vert2.x, vert2.y);
    context.lineTo(vert3.x, vert3.y);
    if (WIREFRAME_MODE)
        context.stroke();
    else
        context.fill();
    context.closePath();
}
/* --- */

/* Meshes and groups renderers */
function DrawTriangles(vertices) {
    for (let v = 2; v < vertices.length; v += 3) {
        Triangle(vertices[v - 2], vertices[v - 1], vertices[v]);
    }
}

function DrawLines(vertices, color) {
    for (let v = 1; v < vertices.length; v += 2) {
        DrawLine(vertices[v - 1], vertices[v], color);
    }
}

function DrawCurve(vertices, color) {
    for (let v = 1; v < vertices.length; v++) {
        DrawLine(vertices[v - 1], vertices[v], color);
    }
}

function DrawTexts(texts) {
    for (let text of texts) {
        DrawText(...text);
    }
}
/* --- */

function RunLoop(callback) {

}