const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let c = 0xffffffff;
  for (let n = 0; n < buf.length; n++) c = crc32.table[(c ^ buf[n]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
crc32.table = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crc32.table[n] = c;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crcData = Buffer.concat([t, data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(crcData));
  return Buffer.concat([len, t, data, c]);
}

function makePng(W, H, pixels) {
  const raw = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const p = pixels(x, y);
      raw[i]=p[0]; raw[i+1]=p[1]; raw[i+2]=p[2]; raw[i+3]=p[3];
    }
  }
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W,0); ihdr.writeUInt32BE(H,4); ihdr[8]=8; ihdr[9]=6;
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR',ihdr), chunk('IDAT',idat), chunk('IEND',Buffer.alloc(0))]);
}

function insideShield(x, y, W, H) {
  const top = H * 0.15, bot = H * 0.88, mid = H * 0.50;
  if (y < top || y > bot) return false;
  let margin;
  if (y <= mid) {
    const t = (y - top) / (mid - top);
    margin = W * 0.15 + t * (W * 0.05);
  } else {
    const t = (y - mid) / (bot - mid);
    margin = W * 0.20 + t * (W * 0.35);
  }
  return x >= margin && x <= W - 1 - margin;
}

function lineDist(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  if (len === 0) return Math.sqrt((px-x1)*(px-x1) + (py-y1)*(py-y1));
  const t = Math.max(0, Math.min(1, ((px-x1)*dx + (py-y1)*dy) / (len*len)));
  const projX = x1 + t * dx, projY = y1 + t * dy;
  return Math.sqrt((px-projX)*(px-projX) + (py-projY)*(py-projY));
}

function shield(size) {
  const S = size;
  return makePng(S, S, (x, y) => {
    if (!insideShield(x, y, S, S)) return [0,0,0,0];

    const cx = S/2, cy = S/2;
    // Checkmark as a thick white line
    const d = lineDist(x, y,
      cx - S*0.25, cy + S*0.15,
      cx - S*0.05, cy - S*0.05
    );
    const d2 = lineDist(x, y,
      cx - S*0.05, cy - S*0.05,
      cx + S*0.25, cy - S*0.20
    );
    const strokeW = Math.max(1.5, S * 0.08);
    if (d < strokeW || d2 < strokeW) return [255,255,255,230];

    return [0x3B, 0x82, 0xF6, 230];
  });
}

for (const S of [16, 48, 128]) {
  const png = shield(S);
  fs.writeFileSync(`extension/icons/icon${S}.png`, png);
  if (S === 48) {
    console.log(`Icon ${S}x${S}: ${png.length} bytes`);
    console.log('data:image/png;base64,' + png.toString('base64'));
  } else {
    console.log(`Icon ${S}x${S}: ${png.length} bytes`);
  }
}
