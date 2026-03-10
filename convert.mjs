import sharp from 'sharp';
import fs from 'fs';

async function convert() {
    try {
        console.log("Converting public/logo.png...");
        await sharp('public/logo.png')
            .png()
            .toFile('public/true_logo.png');
        console.log("Success! Overwriting assets...");

        fs.copyFileSync('public/true_logo.png', 'assets/icon.png');
        fs.copyFileSync('public/true_logo.png', 'assets/logo.png');
        fs.copyFileSync('public/true_logo.png', 'assets/splash.png');
        fs.rmSync('public/true_logo.png');

        console.log("Assets ready!");
    } catch (e) {
        console.error(e);
    }
}
convert();
