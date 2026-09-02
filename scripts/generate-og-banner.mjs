import sharp from "sharp";
import path from "node:path";

const logoPath = path.join(process.cwd(), "public", "assets", "brand", "sialkot-cricket-kits-logo.png");

async function createOgImage() {
  const logoResized = await sharp(logoPath)
    .resize(480, 480, { fit: "contain" })
    .toBuffer();

  const svgOverlay = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="#360810" />
          <stop offset="60%" stop-color="#180306" />
          <stop offset="100%" stop-color="#0a0102" />
        </radialGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#d97706" />
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#bgGrad)" />
      <rect x="20" y="20" width="1160" height="590" rx="16" fill="none" stroke="rgba(245, 158, 11, 0.25)" stroke-width="2" />
      
      <text x="540" y="235" font-family="sans-serif" font-size="36" font-weight="800" fill="#ffffff" letter-spacing="1">
        SIALKOT CRICKET KITS
      </text>
      <text x="540" y="285" font-family="sans-serif" font-size="18" font-weight="600" fill="url(#goldGrad)" letter-spacing="2">
        HANDCRAFTED IN SIALKOT, PAKISTAN
      </text>
      <text x="540" y="340" font-family="sans-serif" font-size="18" font-weight="400" fill="#e2e8f0">
        • Grade 1+ English Willow Cricket Bats
      </text>
      <text x="540" y="375" font-family="sans-serif" font-size="18" font-weight="400" fill="#e2e8f0">
        • Custom Bat Specs &amp; Live Ping Videos
      </text>
      <text x="540" y="410" font-family="sans-serif" font-size="18" font-weight="400" fill="#e2e8f0">
        • Protective Gear &amp; Tracked Worldwide Delivery
      </text>

      <rect x="540" y="455" width="300" height="44" rx="22" fill="#f59e0b" />
      <text x="690" y="483" font-family="sans-serif" font-size="16" font-weight="700" fill="#000000" text-anchor="middle">
        sialkotcricketkits.com
      </text>
    </svg>
  `);

  await sharp(svgOverlay)
    .composite([
      {
        input: logoResized,
        top: 75,
        left: 40,
      },
    ])
    .png({ quality: 100 })
    .toFile(path.join(process.cwd(), "public", "og.png"));

  console.log("Successfully generated public/og.png (1200x630)");
}

createOgImage().catch(console.error);
