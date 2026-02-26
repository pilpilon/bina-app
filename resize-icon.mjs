import sharp from 'sharp';
import fs from 'fs';

const inputPath = 'C:\\Users\\Aorus\\.gemini\\antigravity\\brain\\0d236246-b2ac-49e2-920d-e05842041d01\\bina_app_icon_1772105467725.png';
const outDir = 'c:\\Users\\Aorus\\Documents\\psichometri\\public';

async function resize() {
    try {
        const img = sharp(inputPath);

        await img.resize(192, 192).toFile(`${outDir}/icon-192.png`);
        await img.resize(512, 512).toFile(`${outDir}/icon-512.png`);
        await img.resize(180, 180).toFile(`${outDir}/apple-touch-icon.png`);
        await img.resize(64, 64).toFile(`${outDir}/favicon.png`);

        console.log('Icons generated successfully.');
    } catch (err) {
        console.error('Error generating icons:', err);
    }
}

resize();
