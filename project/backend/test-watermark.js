const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function testWatermark() {
  const logoPath = path.resolve(__dirname, '../frontend/src/assets/logo.png');
  
  // create dummy image
  const dummyImagePath = path.join(__dirname, 'dummy.jpg');
  await sharp({
    create: {
      width: 1200,
      height: 800,
      channels: 4,
      background: { r: 200, g: 200, b: 200, alpha: 1 }
    }
  }).jpeg().toFile(dummyImagePath);

  const logoBuffer = await fs.promises.readFile(logoPath);
  const logoBase64 = logoBuffer.toString('base64');
  const logoMeta = await sharp(logoBuffer).metadata();
  
  // Resize logo for watermark
  const watermarkWidth = 200;
  const watermarkHeight = Math.round(logoMeta.height * (watermarkWidth / logoMeta.width));
  
  const svgWrapper = `
    <svg width="${watermarkWidth}" height="${watermarkHeight}">
      <g opacity="0.5">
        <image href="data:image/png;base64,${logoBase64}" width="${watermarkWidth}" height="${watermarkHeight}"/>
      </g>
    </svg>
  `;

  const watermarkBuffer = await sharp(Buffer.from(svgWrapper))
    .png()
    .toBuffer();

  const outPath = path.join(__dirname, 'dummy-watermarked.webp');
  await sharp(dummyImagePath)
    .composite([
      {
        input: watermarkBuffer,
        gravity: 'south'
      }
    ])
    .webp()
    .toFile(outPath);
    
  console.log('Watermark added:', outPath);
}

testWatermark().catch(console.error);
