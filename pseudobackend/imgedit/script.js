import {init, currentTool} from "./draw"

export const $ = require("jquery");

export let drawCanvas;
let canvasStack = [];
let redoStack = [];
let $base;

$(window).keydown((e) => {
    // Either on Undo operation, or ctrl+Z (no shift)
    if (e.key === "Undo" || (e.key.toLowerCase() === "z" && e.ctrlKey && !e.shiftKey)) {
        undo();
    }
    // Either on Redo operation, ctrl+Y, or ctrl+shift+Z
    if (e.key === "Redo" || (e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key.toLowerCase() === "z")))) {
        redo();
    }
});


export function pushNewCanvas() {

    if (drawCanvas) {
        removeListener($(drawCanvas));
    }

    // create a new canvas
    const $canvas = $(`<canvas width='${$base.attr("width")}' height='${$base.attr("height")}'>`);
    $canvas.addClass("imageLayer");

    // add it to our canvas stack
    drawCanvas = $canvas[0];

    $("#imageLayers").append($canvas);

    addListener($canvas);
}

export function peekCanvas() {
    return canvasStack[canvasStack.length - 1];
}

export function undo() {
    if (peekCanvas().id === "main") {
        return;
    }

    // pop from canvas stack -> "erase" it -> add to redo stack
    const $canvas = $(canvasStack.pop());
    $canvas.css({display: "none"});
    redoStack.push($canvas[0]);
}

export function redo() {
    if (redoStack.length === 0) {
        return;
    }

    // pop from redo stack -> display it -> add to canvas stack
    const $canvas = $(redoStack.pop());
    $canvas.css({display: ""});
    canvasStack.push($canvas[0]);
}

export function flattened() {
    const flat = $(`<canvas width='${$base.attr("width")}' height='${$base.attr("height")}'>`)[0];
    const ctx = flat.getContext('2d');

    for (const can of canvasStack) {
        ctx.drawImage(can, 0, 0);
    }
    return flat;
}

/**
 * add listeners
 */
$(document).ready(() => {
    const upload = $("#imageUpload");

    $(window).on("paste", (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file.type.startsWith("image")) {
                    showImage(window.URL.createObjectURL(file));
                } else {
                    console.log("Invalid MIME type: " + file.type);
                }
            } else {
                console.log("Not a file/image: " + item);
            }
        }
    });

    upload.click(() => {
        $("#file-input").click()
    });

    upload.on("dragenter", (e) => {
        upload.css({backgroundColor: "#C5ECAB"});
        e.stopPropagation();
        e.preventDefault();
    });

    upload.on('dragover', (e) => {
        e.stopPropagation();
        e.preventDefault();
    });

    upload.on("dragexit", (e) => {
        upload.css({backgroundColor: "#ECE7AB"});
        e.stopPropagation();
        e.preventDefault();
    });

    upload.on("drop", (e) => {
        e.stopPropagation();
        e.preventDefault();

        let files = e.originalEvent.dataTransfer.files;
        if (!files) {
            console.log("No files!");
            upload.trigger("dragexit");
        } else {
            const file = files[0];
            if (file && file.type.startsWith("image")) {
                showImage(window.URL.createObjectURL(file));
            } else {
                console.log("Invalid MIME type: " + file.type);
                upload.trigger("dragexit");
            }
        }
    });

    $("#file-input").change((e) => {
        showImage(window.URL.createObjectURL(e.target.files[0]));
    });
});

/**
 * Displays an image.
 *
 * @param link The link to the image, usually made with URL.createObjectUrl()
 */
export function showImage(link) {
    $("body").css({backgroundColor: "#685f43"});

    const $main = $("main");
    $main.empty();

    const $imgDiv = $("<div id='imageLayers'>");

    const img = new Image();
    $(img).on("load", () => {

        $base = $(`<canvas id='main' width='${img.width}' height='${img.height}'>`);
        $base.addClass("imageLayer");
        $base[0].getContext('2d').drawImage(img, 0, 0);

        $imgDiv.css({
            width: img.width,
            height: img.height
        });

        canvasStack.push($base[0]);

        $imgDiv.append($base);
        $main.append($imgDiv);

        init();
    });

    img.src = link;
}

function addListener($canvas) {
    let clicking = false;

    $canvas.mousedown((e) => {
        if(!clicking && currentTool().mousedown) {
            clicking = true;
            currentTool().mousedown(e, $canvas[0]);
        }
    });

    $canvas.mousemove((e) => {
        if(clicking && currentTool().mousedrag) {
            currentTool().mousedrag(e, $canvas[0]);
        }
    });

    $canvas.mouseup((e) => {
        if(clicking && currentTool().mouseup) {
            clicking = false;
            currentTool().mouseup(e, $canvas[0]);
        }
        // clear the undo/redo stack
        while(redoStack.length > 0) {
            $(redoStack.pop()).remove();
        }

        // push new canvas
        canvasStack.push($canvas[0]);
        pushNewCanvas();
    });

    $canvas.css({
        cursor: currentTool().cursor
    });
}

function removeListener($canvas) {
    $canvas.off("mousedown mousemove mouseup");
}