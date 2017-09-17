const $canvas = document.getElementById('canvas');
const context = $canvas.getContext('2d');
const $hiddenImage = document.createElement('img');
const $hex = document.querySelector('.hex');
const $rgb = document.querySelector('.rgb');
const $color = document.querySelector('.color');
const $x = document.querySelector('.x');
const $y = document.querySelector('.y');
const $error = document.querySelector('.error');
let pos = {
  x: 0,
  y: 0
};

let isLocked = false;

function rgbToHex(r, g, b) {
  return '#' + ((r << 16) | (g << 8) | b).toString(16);
}

function makeCursor(color) {
  const $cursor = document.createElement('canvas');
  const ctx = $cursor.getContext('2d');

  $cursor.width = 41;
  $cursor.height = 41;

  // Crosshair
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(12, 6);
  ctx.moveTo(6, 0);
  ctx.lineTo(6, 12);
  ctx.lineWidth = 1;
  ctx.lineCap = 'butt';
  ctx.shadowColor = '#FFF';
  ctx.shadowBlur = 2;
  ctx.strokeStyle = '#000';
  ctx.stroke();

  // Color circle
  ctx.beginPath();
  ctx.arc(25, 25, 14, 0, 2 * Math.PI, false);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000';
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();

  $canvas.style.cursor = 'crosshair';
  $canvas.style.cursor = 'url(' + $cursor.toDataURL() + ') 6 6, crosshair';
}

function loadImage(file) {
  if (typeof (file) === 'string' && file.indexOf('http') === 0) {
    fetch(file)
      .then(response => response.blob())
      .then(blob => {
        document.body.className = 'active';
        $hiddenImage.src = URL.createObjectURL(blob);
      })
      .catch(() => {
        $error.textContent = 'This file can\'t be loaded. Try another URL.';
      });

    return;
  }

  if (typeof FileReader !== 'undefined' && file.type.indexOf('image') !== -1) {
    const reader = new FileReader();

    reader.onload = event => {
      $hiddenImage.src = event.target.result;
    };

    reader.readAsDataURL(file);
  }
}

$hiddenImage.addEventListener('load', () => {
  $canvas.width = $hiddenImage.width;
  $canvas.height = $hiddenImage.height;
  context.clearRect(0, 0, $canvas.width, $canvas.height);
  context.drawImage($hiddenImage, 0, 0);
}, false);

$canvas.addEventListener('mousemove', function (event) {
  if (isLocked) {
    return;
  }

  pos = {
    x: event.offsetX,
    y: event.offsetY
  };

  if (pos.x > $canvas.width || pos.y > $canvas.height || pos.x < 1 || pos.y < 1) {
    return;
  }

  const ctx = this.getContext('2d');
  const p = ctx.getImageData(pos.x, pos.y, 1, 1).data;

  const hex = rgbToHex(p[0], p[1], p[2]);
  const rgb = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')';

  $hex.textContent = hex.toUpperCase();
  $rgb.textContent = rgb;
  $x.textContent = pos.x;
  $y.textContent = pos.y;

  $color.style.backgroundColor = hex;

  makeCursor(hex);
});

$canvas.addEventListener('click', event => {
  if (!isLocked) {
    console.log(pos.x, pos.y);
  }
  isLocked = !isLocked;
  event.preventDefault();
});

document.addEventListener('drop', event => {
  document.body.className = 'active';

  const files = event.dataTransfer.files;

  if (files.length > 0) {
    loadImage(files[0]);
  }

  event.preventDefault();
});

document.addEventListener('dragover', event => {
  document.body.className = 'hover';
  event.preventDefault();
});

document.addEventListener('dragenter', event => {
  document.body.className = 'hover';
  event.preventDefault();
});

document.addEventListener('dragleave', event => {
  document.body.className = '';
  event.preventDefault();
});

document.addEventListener('dragend', event => {
  document.body.className = '';
  event.preventDefault();
});

const searchParams = new URLSearchParams(window.location.search); // ?src=123
const src = searchParams.get('src');
if (src) {
  loadImage(src);
}
