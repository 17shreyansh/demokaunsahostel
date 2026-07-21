const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

let cachedLogoBase64 = null;
let cachedLogoMeta = null;

async function getLogoInfo() {
  if (cachedLogoBase64 && cachedLogoMeta) {
    return { base64: cachedLogoBase64, meta: cachedLogoMeta };
  }

  const logoPath = path.resolve(__dirname, '../../frontend/src/assets/logo.png');
  const logoBuffer = await fs.readFile(logoPath);
  cachedLogoBase64 = logoBuffer.toString('base64');
  cachedLogoMeta = await sharp(logoBuffer).metadata();

  return { base64: cachedLogoBase64, meta: cachedLogoMeta };
}

/**
 * Generates a watermark buffer with the given target width
 */
async function getWatermarkBuffer(targetImageWidth) {
  const { base64, meta } = await getLogoInfo();

  // Base logo width is 30% of target image width for a pro look
  let logoWidth = Math.round(targetImageWidth * 0.30);
  if (logoWidth < 100) logoWidth = 100;
  if (logoWidth > 400) logoWidth = 400;

  const logoHeight = Math.round(meta.height * (logoWidth / meta.width));

  // Padding for the white background pill
  const paddingX = Math.round(logoWidth * 0.12);
  const paddingY = Math.round(logoHeight * 0.15);

  const bgWidth = logoWidth + (paddingX * 2);
  const bgHeight = logoHeight + (paddingY * 2);
  const borderRadius = Math.round(bgHeight * 0.25); // Rounded corners

  // Extra space so it sits a little above the bottom edge
  const marginBottom = Math.round(targetImageWidth * 0.04);
  const totalWidth = bgWidth;
  const totalHeight = bgHeight + marginBottom;

  const svgWrapper = `
    <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.8">
        <image 
          href="data:image/png;base64,${base64}" 
          width="${logoWidth}" height="${logoHeight}" 
          x="${paddingX}" y="${paddingY}"
        />
      </g>
    </svg>
  `;

  return sharp(Buffer.from(svgWrapper))
    .png()
    .toBuffer();
}

/**
 * Applies a watermark to a sharp instance
 * @param {sharp.Sharp} sharpInstance 
 * @param {number} targetWidth The width of the image (or max width) to size the watermark
 * @returns {Promise<sharp.Sharp>}
 */
async function applyWatermark(sharpInstance, targetWidth) {
  try {
    const watermarkBuffer = await getWatermarkBuffer(targetWidth || 800);
    return sharpInstance.composite([
      {
        input: watermarkBuffer,
        gravity: 'south'
      }
    ]);
  } catch (error) {
    console.error('Error applying watermark:', error);
    return sharpInstance;
  }
}

module.exports = {
  applyWatermark,
  getWatermarkBuffer
};
