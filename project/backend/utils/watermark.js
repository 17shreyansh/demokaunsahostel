const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

let cachedLogoBase64 = null;
let cachedLogoMeta = null;

async function getLogoInfo() {
  if (cachedLogoBase64 && cachedLogoMeta) {
    return { base64: cachedLogoBase64, meta: cachedLogoMeta };
  }

  const logoPath = path.resolve(__dirname, '../../frontend/src/assets/logo-white.png');
  const logoBuffer = await fs.readFile(logoPath);
  cachedLogoBase64 = logoBuffer.toString('base64');
  cachedLogoMeta = await sharp(logoBuffer).metadata();

  return { base64: cachedLogoBase64, meta: cachedLogoMeta };
}

/**
 * Generates a watermark buffer with the given target width
 */
async function getWatermarkBuffer(targetImageWidth, targetImageHeight) {
  const { base64, meta } = await getLogoInfo();

  // Base logo width is 50% of target image width
  let logoWidth = Math.round(targetImageWidth * 0.50);
  if (logoWidth < 100) logoWidth = 100;
  if (logoWidth > 800) logoWidth = 800;

  const logoHeight = Math.round(meta.height * (logoWidth / meta.width));

  // Padding for the white background pill (though removed, we still have padding around logo)
  const paddingX = Math.round(logoWidth * 0.12);
  const paddingY = Math.round(logoHeight * 0.15);

  const bgWidth = logoWidth + (paddingX * 2);
  const bgHeight = logoHeight + (paddingY * 2);

  const totalWidth = bgWidth;
  const totalHeight = bgHeight;

  const svgWrapper = `
    <svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.4">
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
    const meta = await sharpInstance.metadata();
    
    // Calculate actual resized dimensions
    // Sharp resize only provides width, so it scales height proportionally.
    // withoutEnlargement means it won't scale up if smaller than target.
    const originalWidth = meta.width || 800;
    const originalHeight = meta.height || 600;
    
    let finalWidth = originalWidth;
    let finalHeight = originalHeight;
    
    if (targetWidth && originalWidth > targetWidth) {
      finalWidth = targetWidth;
      finalHeight = Math.round(originalHeight * (targetWidth / originalWidth));
    }
    
    const watermarkBuffer = await getWatermarkBuffer(finalWidth, finalHeight);
    return sharpInstance.composite([
      {
        input: watermarkBuffer,
        gravity: 'center'
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
