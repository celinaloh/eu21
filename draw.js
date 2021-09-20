let isMouseDown = false;

let undoStack = [];
let redoStack = [];

function undoMaker() {
    if (undoStack.length > 0) {
        // clear board
        ctx.clearRect(0, 0, board.width, board.height);
        // pop last point
        // undoStack.pop();
        while (undoStack.length > 0) {
            let curObj = undoStack[undoStack.length - 1];
            redoStack.push(undoStack.pop());
            if (curObj.identifier === "mousedown") {
                break;
            }
        }
        redraw();
    }
}

function redoMaker() {
    if (redoStack.length > 0) {
        ctx.clearRect(0, 0, board.width, board.height);
        undoStack.push(redoStack.pop());
        while (redoStack.length > 0) {
            let curObj = redoStack[redoStack.length - 1];
            undoStack.push(redoStack.pop());
            if (curObj.identifier === "mousedown") {
                break;
            }
        }
        redraw();
    }
}

board.addEventListener("mousedown", function (e) {
    ctx.beginPath(); // to get the cursor at the top left of the canvas.
    let top = getLocation();
    redoStack = [];
    // e is the mouse location where it is clicked.
    // e.clientX and e.clientY are the x and y coordinates of the mouse
    // ctx is placed at the top left position of the canvas when beginpath function is called
    // so we add an offset of (e.clientY - top) in it's y coordinate and 
    // e.clientY in it's x coordinate to align it with the mouse clicking position
    ctx.moveTo(e.clientX, e.clientY - top);
    isMouseDown = true;
    let point = {
        x: e.clientX,
        y: e.clientY - top,
        identifier: "mousedown",
        color: Activetool === "pencil" ? ctx.strokeStyle : "#2A2D34",
        width: ctx.lineWidth
    };

    undoStack.push(point);

    socket.emit("mousedown", point);

});

board.addEventListener("mousemove", function (e) {
    // lineto is used to create a line between the
    // current position and the previous moveto position
    // the line created by lineto is invisible
    // and stroke is used to fill colour on that line and make it visible

    // all this will be done only when the mouse is clicked
    if (isMouseDown == true) {
        // console.log("mousemove");
        let top = getLocation();
        // draw a line from its previous point to itself
        ctx.lineTo(e.clientX, e.clientY - top);
        ctx.stroke();
        let point = {
            x: e.clientX,
            y: e.clientY - top,
            identifier: "mousemove",
            color: Activetool === "pencil" ? ctx.strokeStyle : "#2A2D34",
            width: ctx.lineWidth
        };
        undoStack.push(point);
        socket.emit("mousemove", point);
    }
});

board.addEventListener("mouseup", function (e) {
    console.log(undoStack);
    isMouseDown = false;
});

const undo = document.querySelector(".undo");
const redo = document.querySelector(".redo");


undo.addEventListener("mousedown", function () {
    undoMaker();
    socket.emit("undo");
});

redo.addEventListener("mousedown", function () {
    redoMaker();
    socket.emit("redo");
});


function redraw() {
    // clear the board
    ctx.clearRect(0, 0, board.width, board.height);
    console.log("inside redraw");
    console.log(undoStack);
    // redraw
    for (let i = 0; i < undoStack.length; i++) {
        console.log("printing the stack back");
        let { x, y, identifier, color, width } = undoStack[i];
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (identifier === "mousedown") {
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
}



function getLocation() {
    // brings all the information about the distance from top, bottom, left etc
    // we need to return only the distance from the top.
    const { top } = board.getBoundingClientRect();
    return top;
}


