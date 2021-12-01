const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext("2d");

// wait for the content of the window element
// to load, then performs the operations.
// This is considered best practice.
window.addEventListener('load', ()=>{
        
    resize(); // Resizes the canvas once the window loads
    brush();
    color(initColorObj);
    getWidth(initLnWidthObj);
    document.addEventListener('mousedown', startPainting);
    document.addEventListener('mouseup', stopPainting);
    document.addEventListener('mousemove', sketch);
    //window.addEventListener('resize', resize);
});

let strStyle = "black";
let lnWidth = 1;
let isEraser = false;

function color(obj) {
  if (!isEraser) {
    ctx.strokeStyle = obj.id;
    strStyle = obj.id;
    changeSelectedElement(obj.id, "colorID");
  }
}

function getWidth(obj) {
  if (!isEraser) {
    ctx.lineWidth = obj.id;
    lnWidth = obj.id;
    ctx.strokeStyle = strStyle;
    changeSelectedElement(obj.id, "lineID");
  }
}

function erase() {
  var m = confirm("Want to clear");
  if (m) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function download() {
  var dt = canvas.toDataURL('image/jpg');
  //dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
  //dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');
  this.href = dt;
};
downloadLnk.addEventListener('click', download, false);

function eraser() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 15;
  isEraser = true;
  shape = false;

  changeSelectedElement("eraser", "drawID");
  canvas.style.cursor = "url('./images/eraser.cur'), auto";
}

//Resizes the canvas to the available size of the window.
function resize(){
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

// Stores the initial position of the cursor
let coord = {x:0 , y:0}; 

// This is the flag that we are going to use to 
// trigger drawing
let paint = false;
let shape = false;
var shapeType = "rectangle";
var x, y;
let drawID = "brush", lineID =  "1", colorID = "black", old;
var buttonID = "drawID";
var initColorObj = { id: "black" };
var initLnWidthObj = { id:"1" };

function changeSelectedElement(newID, buttonID) {
  switch(buttonID) {
    case 'drawID':
      old = drawID;
      drawID = newID;
      break;
    case 'lineID':
      old = lineID;
      lineID = newID;
      break;
    case 'colorID':
      old = colorID;
      colorID = newID;
      break;
  }
  document.getElementById(old).style.border = "1px solid black";
  document.getElementById(newID).style.border = "double black 5px";
}

function isShape(obj) {
  shapeType = obj.id;
  shape = true;
  leaveEraser();

  changeSelectedElement(obj.id, "drawID");
  canvas.style.cursor = "default";
}

function brush() {
  shape = false;
  leaveEraser();

  changeSelectedElement("brush", "drawID");
  canvas.style.cursor = "url('./images/brush-cursor.cur'), auto";
}

function leaveEraser() {
  if (isEraser) {
    isEraser = false;
    ctx.strokeStyle = strStyle;
    ctx.lineWidth = lnWidth;
    canvas.style.cursor = "default";
  }
}
  
// Updates the coordianates of the cursor when 
// an event e is triggered to the coordinates where 
// the said event is triggered.
// getBoundingClientRect() is used to negate bad effects from scrolling
function getPosition(event){
  coord.x = event.clientX - canvas.getBoundingClientRect().left;
  coord.y = event.clientY - canvas.getBoundingClientRect().top;
}
  
// The following functions toggle the flag to start
// and stop drawing
function startPainting(event){
  getPosition(event);
  if (shape) {
    canvas.style.cursor = "crosshair";
  }
  else {
    paint = true;

    ctx.beginPath();
    ctx.fillStyle = ctx.strokeStyle;
    //ctx.fillRect(coord.x, coord.y, ctx.lineWidth, ctx.lineWidth);
    ctx.arc(coord.x, coord.y, ctx.lineWidth / 2, 0, 2 * Math.PI);
    ctx.fill();
  }
}
  
function stopPainting(){
  if (shape) {
    x = coord.x;
    y = coord.y;
    getPosition(event);
    ctx.beginPath();
    switch (shapeType) {
      case "rectangle":
        ctx.strokeRect(x, y, coord.x - x, coord.y - y);
        break;
      case "circle":
        ctx.arc(x + (coord.x - x) / 2, y + (coord.y - y) / 2, (coord.x - x) / 2, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "star":
        drawStar(x + (coord.x - x) / 2, y + (coord.y - y) / 2, 5, (coord.x - x) / 2, (coord.x - x) / 4);
        break;
    }
    canvas.style.cursor = "default";
  }
  else {
    paint = false;
  }
}

function drawStar(cx,cy,spikes,outerRadius,innerRadius){
  var rot=Math.PI/2*3;
  var x=cx;
  var y=cy;
  var step=Math.PI/spikes;
  ctx.beginPath();
  ctx.moveTo(cx,cy-outerRadius)
  for(i=0;i<spikes;i++){
    x=cx+Math.cos(rot)*outerRadius;
    y=cy+Math.sin(rot)*outerRadius;
    ctx.lineTo(x,y)
    rot+=step
    x=cx+Math.cos(rot)*innerRadius;
    y=cy+Math.sin(rot)*innerRadius;
    ctx.lineTo(x,y)
    rot+=step
  }
  ctx.lineTo(cx,cy-outerRadius);
  ctx.closePath();
  ctx.stroke();
}

function sketch(event){
  if (shape || !paint) return;
  ctx.beginPath();
  
  ctx.lineCap = 'round';
  
  // The cursor to start drawing
  // moves to this coordinate
  ctx.moveTo(coord.x, coord.y);
  
  // The position of the cursor
  // gets updated as we move the
  // mouse around.
  getPosition(event);
  
  // A line is traced from start
  // coordinate to this coordinate
  ctx.lineTo(coord.x , coord.y);
  
  // Draws the line.
  ctx.stroke();
}