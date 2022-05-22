const app = {
    pages: [],
    init: function () {
        app.pages = document.querySelectorAll('.page');
        document.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', app.nav);
        })
        history.replaceState({}, 'Home', '#home');
        window.addEventListener('popstate', app.hist);
    },
    nav: function (ev) {
        ev.preventDefault();
        let currentPage = ev.target.getAttribute('data-target');
        app.toggleActive(currentPage);
        history.pushState({}, currentPage, `#${currentPage}`);
    },
    hist: function () {
        let hash = location.hash.replace('#', '');
        app.toggleActive(hash);
    },
    toggleActive: function (link) {
        document.querySelector('.active').classList.remove('active');
        document.getElementById(link).classList.add('active');
    }
}
document.addEventListener('DOMContentLoaded', app.init);

const navbarToggler = document.querySelector('#tooglebutton');
navbarToggler.addEventListener('click', () => {
    let toToggle = document.querySelector('#menu')

    if (toToggle.classList.contains("show"))
        toToggle.classList.remove('show');
    else
        toToggle.classList.add('show');
})

let degree = 0;
let coefficients = [];

const increaseXButton = document.querySelector('#increaseX');
increaseXButton.addEventListener('click', () => {
    let equation = document.querySelector('.equation');
    const inputCoefficient = createInputField(degree);

    if (degree >= 9) {
        return;
    }
    let staticText = createPlainText(degree);
    equation.appendChild(inputCoefficient);
    equation.appendChild(staticText);
    degree++;
})

function createInputField(degree) {
    const inputField = document.createElement("INPUT");
    inputField.setAttribute("type", "number");

    if (coefficients[degree] !== null) {
        inputField.setAttribute("value", coefficients[degree]);
    } else {
        inputField.setAttribute("value", "0");
    }

    inputField.setAttribute("class", "equation-coefficient");
    inputField.setAttribute('id', 'dc_' + degree.toString());
    inputField.setAttribute('min', "0"); // TODO: przerobić aby jednak akceptowało liczby ujemne

    inputField.addEventListener('input', function () {
        coefficients[degree] = this.value;
    });

    return inputField;
}

function createPlainText(degree) {
    const plainText = document.createElement("p");
    plainText.setAttribute("type", "text");
    plainText.setAttribute("class", "equation-static");
    plainText.setAttribute('id', 'dp_' + degree.toString());
    let node;

    //TODO: ogarnij plusy dobrze
    //TODO: ogarnąć wpisywanie liczb do okinenek

    if (degree === 0) {
        node = document.createTextNode("+");
    } else if (degree === 1) {
        node = document.createTextNode("X +");
    } else if (degree === 8) {
        node = document.createTextNode("X^" + degree.toString());
    } else {
        node = document.createTextNode("X^" + degree.toString() + "+ ");
    }
    plainText.appendChild(node);

    return plainText;
}

const decreaseXButton = document.querySelector('#decreaseX');
decreaseXButton.addEventListener('click', () => {
    let equation = document.querySelector('.equation');

    if (degree <= 0)
        return;

    equation.removeChild(document.querySelector('#dc_' + (degree - 1)));
    equation.removeChild(document.querySelector('#dp_' + (degree - 1)));
    degree--;
})

const makeChartButton = document.querySelector('#drawChart');
makeChartButton.addEventListener('click', () => {
    let dateToDrawAPlot = [];

    document.getElementById("allZeroError").innerText = "";

    for (let i = 0; i < degree; i++) {
        if (typeof coefficients[i] === 'undefined') {
            dateToDrawAPlot[i] = 0;
        } else {
            dateToDrawAPlot[i] = coefficients[i];
        }
    }

    console.log(dateToDrawAPlot.toString());

    const isAllZero = dateToDrawAPlot.every(item => item === 0);

    if (dateToDrawAPlot.length === 0 || isAllZero) { //TODO: inaczej rozwiązać te exceptiony
        document.getElementById("allZeroError").innerText = "Z Podanych wartości nie można narysować wykresu!!";
        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://drawplot-new.herokuapp.com/makePlot");
    // xhr.open("POST", "http://localhost:8080/makePlot");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = () => {
        drawPlot(xhr.responseText);
    }

    dateToDrawAPlot = dateToDrawAPlot.reverse();
    let data = {
        equation: dateToDrawAPlot
    };
    let json = JSON.stringify(data);

    xhr.send(json);
})

function makeEquation(equation, x) {
    equation.replace('x', x);
    return eval(equation);
}

function drawPlot(response) {
    let plot = document.getElementById("plot");
    const context = plot.getContext('2d');
    context.clearRect(0, 0, plot.width, plot.height);

    if (!plot.getContext) return;

    let axes = {}, ctx = plot.getContext("2d");
    axes.x0 = .5 + .5 * plot.width;  // x0 pixels from left to x=0
    axes.y0 = .5 + .5 * plot.height; // y0 pixels from top to y=0
    axes.scale = 40;                 // 40 pixels from x=0 to x=1
    axes.doNegativeX = true;

    showAxes(ctx, axes);
    funGraph(ctx, axes, response, "rgb(11,153,11)", 1);
}

function funGraph(ctx, axes, equation, color, thick) {
    let xx, yy, dx = 4, x0 = axes.x0, y0 = axes.y0, scale = axes.scale;
    let iMax = Math.round((ctx.canvas.width - x0) / dx);
    let iMin = axes.doNegativeX ? Math.round(-x0 / dx) : 0;
    ctx.beginPath();
    ctx.lineWidth = thick;
    ctx.strokeStyle = color;

    for (let i = iMin; i <= iMax; i++) {
        xx = dx * i;
        // yy = scale * func(xx / scale);
        yy = scale * makeEquation(equation, xx / scale);
        if (i === iMin) ctx.moveTo(x0 + xx, y0 - yy);
        else ctx.lineTo(x0 + xx, y0 - yy);
    }
    ctx.stroke();
}

function showAxes(ctx, axes) {
    let x0 = axes.x0, w = ctx.canvas.width;
    let y0 = axes.y0, h = ctx.canvas.height;
    let xmin = axes.doNegativeX ? 0 : x0;
    ctx.beginPath();
    ctx.strokeStyle = "rgb(128,128,128)";
    ctx.moveTo(xmin, y0);
    ctx.lineTo(w, y0);  // X axis
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, h);  // Y axis
    ctx.stroke();
}

