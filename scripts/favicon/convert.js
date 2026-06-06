// convert.js
const opentype = require('opentype.js');
const fs = require('fs');

const font = opentype.parse(fs.readFileSync('/usr/share/fonts/opentype/ebgaramond/EBGaramond12-Regular.otf'));

const fontSize = 200;
const text = 'OWL';
const width = 512;
const height = 512;

// measure to center
const bbox = font.getPath(text, 0, 0, fontSize).getBoundingBox();
const textWidth = bbox.x2 - bbox.x1;
const textHeight = bbox.y2 - bbox.y1;
const x = (width - textWidth) / 2 - bbox.x1;
const y = (height - textHeight) / 2 - bbox.y1;

const path = font.getPath(text, x, y, fontSize);
path.fill = 'white';
const pathData = path.toSVG(2);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#800000"/>
  ${pathData}
</svg>`;

fs.writeFileSync('owl-favicon.512x512.svg', svg);
console.log('Done');
