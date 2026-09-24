// Authentic High-Resolution Vector Poster Artworks replicating the 6 Tamil Movie Posters

export const POSTER_ART = {
  coolie: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <radialGradient id="coolieGlow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#ffb703" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="#b07d10" stop-opacity="0.7"/>
      <stop offset="70%" stop-color="#2d1b00" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#090500" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="goldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe6a7"/>
      <stop offset="25%" stop-color="#d4af37"/>
      <stop offset="50%" stop-color="#8c6d1f"/>
      <stop offset="75%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#583e0a"/>
    </linearGradient>
    <filter id="grunge">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0"/>
      <feComposite in2="SourceGraphic" in="gl" operator="in"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="600" height="900" fill="url(#coolieGlow)"/>

  <!-- Dramatic Lighting Rays -->
  <path d="M0 0 L600 400 L600 900 L0 900 Z" fill="#d4af37" opacity="0.06"/>
  <path d="M600 0 L0 350 L0 900 L600 900 Z" fill="#ffb703" opacity="0.05"/>

  <!-- Circular Gold Dial / Pocket Watch Silhouette -->
  <circle cx="300" cy="380" r="230" fill="none" stroke="#d4af37" stroke-width="4" stroke-dasharray="8 6" opacity="0.4"/>
  <circle cx="300" cy="380" r="215" fill="none" stroke="#ffe6a7" stroke-width="1.5" opacity="0.5"/>
  <circle cx="300" cy="380" r="170" fill="#000" opacity="0.3"/>

  <!-- Character / Hero Dramatic Silhouette -->
  <path d="M220 540 Q300 230 380 540 Q340 560 300 560 Q260 560 220 540 Z" fill="#140d02"/>
  <!-- Head Silhouette & Beard -->
  <circle cx="300" cy="270" r="62" fill="#1f1404"/>
  <path d="M255 270 Q300 350 345 270 Q355 330 300 360 Q245 330 255 270 Z" fill="#140d02"/>
  <!-- Glasses Reflection -->
  <rect x="268" y="258" width="26" height="14" rx="3" fill="#ffe6a7" opacity="0.85"/>
  <rect x="306" y="258" width="26" height="14" rx="3" fill="#ffe6a7" opacity="0.85"/>
  <line x1="294" y1="265" x2="306" y2="265" stroke="#ffe6a7" stroke-width="2"/>

  <!-- Sun & Production Tag -->
  <text x="300" y="70" fill="#d4af37" font-size="12" font-weight="900" letter-spacing="6" text-anchor="middle" font-family="system-ui, sans-serif">SUN PICTURES PRESENTS</text>
  <text x="300" y="95" fill="#ffffff" font-size="14" font-weight="800" letter-spacing="4" text-anchor="middle" font-family="system-ui, sans-serif">SUPERSTAR RAJINIKANTH</text>

  <!-- Golden Number Tag/Badge -->
  <g transform="translate(300, 640)">
    <!-- Plate -->
    <rect x="-190" y="-55" width="380" height="100" rx="50" fill="#100a02" stroke="url(#goldPlate)" stroke-width="5"/>
    <rect x="-182" y="-47" width="364" height="84" rx="42" fill="none" stroke="#d4af37" stroke-width="1.5" stroke-dasharray="4 4"/>
    
    <!-- Title Text -->
    <text x="0" y="20" fill="url(#goldPlate)" font-size="64" font-weight="900" letter-spacing="12" text-anchor="middle" font-family="Arial Black, Impact, sans-serif">COOLIE</text>
  </g>

  <!-- Credits Footer -->
  <text x="300" y="775" fill="#fef08a" font-size="14" font-weight="800" letter-spacing="3" text-anchor="middle" font-family="system-ui, sans-serif">A LOKESH KANAGARAJ FILM</text>
  <text x="300" y="805" fill="#a1a1aa" font-size="12" font-weight="700" letter-spacing="4" text-anchor="middle" font-family="system-ui, sans-serif">AN ANIRUDH MUSICAL</text>

  <!-- Languages Bar -->
  <rect x="120" y="835" width="360" height="28" rx="6" fill="#000000" opacity="0.6" stroke="#d4af37" stroke-width="0.8"/>
  <text x="300" y="853" fill="#d4af37" font-size="10" font-weight="800" letter-spacing="2.5" text-anchor="middle" font-family="system-ui, sans-serif">TAMIL | TELUGU | KANNADA | MALAYALAM</text>
</svg>
`)}`,

  janaNayagan: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <radialGradient id="redAura" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.9"/>
      <stop offset="40%" stop-color="#9f1239" stop-opacity="0.85"/>
      <stop offset="75%" stop-color="#4c0519" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0a0003" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="bladeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#fda4af"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
  </defs>

  <!-- Red Atmosphere -->
  <rect width="600" height="900" fill="url(#redAura)"/>

  <!-- Smoke Swirls -->
  <path d="M100 100 Q400 300 200 600 Q500 700 400 900" fill="none" stroke="#f43f5e" stroke-width="40" opacity="0.15"/>
  <path d="M500 50 Q200 400 450 700" fill="none" stroke="#fda4af" stroke-width="25" opacity="0.12"/>

  <!-- KVN Logo Tag -->
  <text x="510" y="55" fill="#fecdd3" font-size="11" font-weight="900" letter-spacing="2" text-anchor="middle" font-family="system-ui, sans-serif">KVN</text>
  <text x="510" y="70" fill="#f43f5e" font-size="8" font-weight="700" letter-spacing="1" text-anchor="middle" font-family="system-ui, sans-serif">PRODUCTIONS</text>

  <!-- Hero Stance (Khaki Officer Silhouette & Sword) -->
  <g transform="translate(180, 150)">
    <!-- Head & Aviator Profile -->
    <circle cx="95" cy="55" r="46" fill="#1c0309"/>
    <!-- Hair style -->
    <path d="M55 45 Q90 0 145 35 Q130 75 95 65 Z" fill="#0f0105"/>
    <!-- Sunglasses -->
    <ellipse cx="120" cy="55" rx="14" ry="9" fill="#f43f5e" opacity="0.9"/>
    <!-- Body / Khaki Shirt Silhouette -->
    <path d="M50 100 L140 100 L170 260 L30 260 Z" fill="#310a12"/>
    <!-- Police Badge & Epaulette -->
    <rect x="55" y="105" width="22" height="6" fill="#fbbf24"/>
    <rect x="115" y="105" width="22" height="6" fill="#fbbf24"/>
    <!-- Arm Extended Holding Sword -->
    <path d="M60 140 L-20 300 L20 330 L100 220 Z" fill="#20040a"/>
    <!-- Sword Blade with Blood/Fire Gleam -->
    <line x1="-15" y1="290" x2="280" y2="520" stroke="url(#bladeGlow)" stroke-width="8" stroke-linecap="round"/>
    <line x1="-15" y1="290" x2="280" y2="520" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Tagline Top of Title -->
  <text x="300" y="715" fill="#fecdd3" font-size="11" font-weight="800" letter-spacing="3" text-anchor="middle" font-family="system-ui, sans-serif">THE HONOURABLE CHIEF OF THE PEOPLE</text>
  <text x="300" y="735" fill="#fda4af" font-size="13" font-weight="900" letter-spacing="4" text-anchor="middle" font-family="system-ui, sans-serif">THALAPATHY VIJAY</text>

  <!-- Big Stylized Title -->
  <text x="300" y="795" fill="#ffffff" font-size="48" font-weight="900" letter-spacing="4" text-anchor="middle" font-family="Arial Black, Impact, sans-serif">JANA</text>
  <text x="300" y="845" fill="#ffffff" font-size="48" font-weight="900" letter-spacing="4" text-anchor="middle" font-family="Arial Black, Impact, sans-serif">NAYAGAN</text>

  <!-- Director & Music -->
  <text x="300" y="878" fill="#fb7185" font-size="12" font-weight="800" letter-spacing="4" text-anchor="middle" font-family="system-ui, sans-serif">H. VINOTH  •  ANIRUDH</text>
</svg>
`)}`,

  goodBadUgly: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <radialGradient id="fireInferno" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#ff7b00" stop-opacity="0.95"/>
      <stop offset="30%" stop-color="#ea580c" stop-opacity="0.9"/>
      <stop offset="65%" stop-color="#7c1a06" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#120301" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="metalPlate" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>

  <rect width="600" height="900" fill="url(#fireInferno)"/>

  <!-- Fiery Embers & Sparks -->
  <circle cx="150" cy="220" r="3" fill="#fef08a"/>
  <circle cx="480" cy="180" r="4" fill="#fed7aa"/>
  <circle cx="380" cy="290" r="2.5" fill="#fef08a"/>
  <circle cx="100" cy="450" r="3.5" fill="#fdba74"/>
  <circle cx="520" cy="520" r="4" fill="#fed7aa"/>

  <!-- Iconic Block Logo Top: GOOD BAD UGLY with Knuckle Dusters -->
  <g transform="translate(300, 150)">
    <rect x="-140" y="-70" width="280" height="130" rx="10" fill="#080c14" opacity="0.85" stroke="#3b82f6" stroke-width="2"/>
    <text x="0" y="-30" fill="#93c5fd" font-size="28" font-weight="900" letter-spacing="6" text-anchor="middle" font-family="Arial Black, Impact, sans-serif">GOOD</text>
    <text x="0" y="5" fill="#60a5fa" font-size="28" font-weight="900" letter-spacing="6" text-anchor="middle" font-family="Arial Black, Impact, sans-serif">BAD</text>
    <text x="0" y="42" fill="#3b82f6" font-size="30" font-weight="900" letter-spacing="6" text-anchor="middle" font-family="Arial Black, Impact, sans-serif">UGLY</text>
    <!-- Knuckle ring dots -->
    <circle cx="-45" cy="53" r="5" fill="#1e3a8a"/>
    <circle cx="-15" cy="53" r="5" fill="#1e3a8a"/>
    <circle cx="15" cy="53" r="5" fill="#1e3a8a"/>
    <circle cx="45" cy="53" r="5" fill="#1e3a8a"/>
  </g>

  <!-- Ajith Kumar Stylized Head & Sunglasses Silhouette in Floral Shirt -->
  <g transform="translate(300, 520)">
    <!-- Floral patterned torso -->
    <path d="M-170 180 Q0 60 170 180 Z" fill="#431407"/>
    <!-- Head & Salt-Pepper Hair -->
    <circle cx="0" cy="-60" r="85" fill="#1f0904"/>
    <path d="M-75 -90 Q0 -160 75 -90 Q40 -60 0 -65 Q-40 -60 -75 -90 Z" fill="#94a3b8"/>
    <!-- Red Tinted Aviator Sunglasses -->
    <rect x="-58" y="-70" width="48" height="28" rx="7" fill="#fb923c" stroke="#fed7aa" stroke-width="2"/>
    <rect x="10" y="-70" width="48" height="28" rx="7" fill="#fb923c" stroke="#fed7aa" stroke-width="2"/>
    <line x1="-10" y1="-56" x2="10" y2="-56" stroke="#fed7aa" stroke-width="3"/>
    <!-- Knuckles Clasped with Rings & Watch -->
    <circle cx="-20" cy="65" r="30" fill="#2d0c04"/>
    <circle cx="20" cy="65" r="30" fill="#2d0c04"/>
    <rect x="40" y="90" width="30" height="16" rx="4" fill="#fbbf24"/>
  </g>

  <!-- Bottom Title & Cast Info -->
  <text x="300" y="790" fill="#fdba74" font-size="18" font-weight="900" letter-spacing="4" text-anchor="middle" font-family="system-ui, sans-serif">AJITH KUMAR</text>
  <text x="300" y="825" fill="#ffffff" font-size="13" font-weight="800" letter-spacing="3" text-anchor="middle" font-family="system-ui, sans-serif">DIRECTED BY ADHIK RAVICHANDRAN</text>
  <text x="300" y="855" fill="#f97316" font-size="11" font-weight="700" letter-spacing="4" text-anchor="middle" font-family="system-ui, sans-serif">MYTHRI MOVIE MAKERS  •  DSP</text>
</svg>
`)}`,

  jailer: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <linearGradient id="corridorWall" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#05131a"/>
      <stop offset="35%" stop-color="#0f2631"/>
      <stop offset="50%" stop-color="#2d5262"/>
      <stop offset="65%" stop-color="#0f2631"/>
      <stop offset="100%" stop-color="#05131a"/>
    </linearGradient>
  </defs>

  <!-- Industrial Prison Corridor Background -->
  <rect width="600" height="900" fill="url(#corridorWall)"/>
  
  <!-- Backlight Doorway Frame -->
  <rect x="200" y="0" width="200" height="420" fill="#e0f2fe" opacity="0.35"/>
  <rect x="220" y="0" width="160" height="400" fill="#ffffff" opacity="0.75"/>

  <!-- Sun Pictures Logo Tag Top Right -->
  <circle cx="530" cy="50" r="16" fill="#f59e0b"/>
  <text x="530" y="78" fill="#cbd5e1" font-size="8" font-weight="800" letter-spacing="1" text-anchor="middle" font-family="system-ui, sans-serif">SUN PICTURES</text>

  <!-- Left Credits -->
  <text x="120" y="420" fill="#94a3b8" font-size="9" font-weight="800" letter-spacing="2" text-anchor="middle" font-family="system-ui, sans-serif">KALANITHI MARAN</text>
  <text x="120" y="435" fill="#64748b" font-size="8" font-weight="600" letter-spacing="1" text-anchor="middle" font-family="system-ui, sans-serif">PRESENTS</text>
  <text x="120" y="460" fill="#f1f5f9" font-size="10" font-weight="900" letter-spacing="2" text-anchor="middle" font-family="system-ui, sans-serif">SUPERSTAR RAJINIKANTH</text>

  <!-- Full Height Rajinikanth Silhouette (Spectacles, Hands Clapsed Behind Back) -->
  <g transform="translate(300, 100)">
    <!-- Head & Glasses -->
    <circle cx="0" cy="45" r="38" fill="#0f172a"/>
    <!-- Glasses Outline -->
    <rect x="-24" y="38" width="18" height="10" rx="2" fill="#020617" stroke="#38bdf8" stroke-width="1.5"/>
    <rect x="6" y="38" width="18" height="10" rx="2" fill="#020617" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="-6" y1="43" x2="6" y2="43" stroke="#38bdf8" stroke-width="1.5"/>
    <!-- Grey Shirt & Trousers Silhouette -->
    <path d="M-40 85 L40 85 L50 260 L-50 260 Z" fill="#1e293b"/>
    <!-- Belt & Pants -->
    <rect x="-45" y="260" width="90" height="12" fill="#020617"/>
    <path d="M-45 272 L-10 520 L-40 535 L-65 272 Z" fill="#334155"/>
    <path d="M45 272 L10 520 L40 535 L65 272 Z" fill="#334155"/>
  </g>

  <!-- Giant Distressed Stencil Title: JAILER -->
  <g transform="translate(300, 560)">
    <!-- Shadow -->
    <text x="4" y="6" fill="#020617" font-size="110" font-weight="900" letter-spacing="10" text-anchor="middle" font-family="Arial Black, Impact, sans-serif">JAILER</text>
    <!-- Main Textured Title -->
    <text x="0" y="0" fill="#f8fafc" font-size="110" font-weight="900" letter-spacing="10" text-anchor="middle" font-family="Arial Black, Impact, sans-serif">JAILER</text>
  </g>

  <!-- Director Tag Right -->
  <text x="490" y="640" fill="#94a3b8" font-size="9" font-weight="800" letter-spacing="2" text-anchor="middle" font-family="system-ui, sans-serif">WRITER • DIRECTOR</text>
  <text x="490" y="655" fill="#f8fafc" font-size="11" font-weight="900" letter-spacing="3" text-anchor="middle" font-family="system-ui, sans-serif">NELSON</text>
  <text x="490" y="672" fill="#38bdf8" font-size="9" font-weight="800" letter-spacing="2" text-anchor="middle" font-family="system-ui, sans-serif">ANIRUDH MUSICAL</text>

  <!-- Floor Tag -->
  <text x="300" y="865" fill="#64748b" font-size="10" font-weight="800" letter-spacing="6" text-anchor="middle" font-family="system-ui, sans-serif">SUN PICTURES BLOCKBUSTER</text>
</svg>
`)}`,

  karuppu: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <radialGradient id="rusticRed" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#b91c1c" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#7f1d1d" stop-opacity="0.9"/>
      <stop offset="75%" stop-color="#450a0a" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0f0202" stop-opacity="1"/>
    </radialGradient>
  </defs>

  <rect width="600" height="900" fill="url(#rusticRed)"/>

  <!-- Suriya Birthday & Production Header -->
  <text x="300" y="50" fill="#fca5a5" font-size="11" font-weight="900" letter-spacing="5" text-anchor="middle" font-family="system-ui, sans-serif">DREAM WARRIOR PICTURES</text>
  <text x="300" y="75" fill="#fecaca" font-size="14" font-weight="900" letter-spacing="4" text-anchor="middle" font-family="system-ui, sans-serif">SURIYA</text>

  <!-- Ayyanar Deity Statues & Traditional Guardians Silhouette Background -->
  <!-- Sacred Horse in Center Background -->
  <path d="M220 220 Q300 120 380 220 L350 360 L250 360 Z" fill="#2b0707" opacity="0.7"/>
  <!-- Guardian Deities Left & Right holding Aruval / Swords -->
  <path d="M80 400 Q150 260 200 480 Z" fill="#1c0404"/>
  <line x1="80" y1="420" x2="60" y2="200" stroke="#fca5a5" stroke-width="4" stroke-linecap="round"/>
  <path d="M520 400 Q450 260 400 480 Z" fill="#1c0404"/>
  <line x1="520" y1="420" x2="540" y2="200" stroke="#fca5a5" stroke-width="4" stroke-linecap="round"/>

  <!-- Suriya Seated on Throne in Rustic Maroon Shirt & Green Dhoti -->
  <g transform="translate(300, 360)">
    <!-- Stone Throne -->
    <rect x="-110" y="100" width="220" height="150" fill="#180303"/>
    <!-- Head & Beard -->
    <circle cx="0" cy="0" r="48" fill="#1c0404"/>
    <path d="M-30 0 Q0 50 30 0 Q40 40 0 55 Q-40 40 -30 0 Z" fill="#0d0202"/>
    <!-- Maroon Kurta Body -->
    <path d="M-60 45 L60 45 L75 160 L-75 160 Z" fill="#7f1d1d"/>
    <!-- Green Dhoti -->
    <path d="M-75 160 L75 160 L90 280 L-90 280 Z" fill="#064e3b"/>
  </g>

  <!-- Big Calligraphic Title: Karuppu -->
  <g transform="translate(300, 770)">
    <text x="0" y="0" fill="#ffffff" font-size="76" font-weight="900" letter-spacing="3" text-anchor="middle" font-family="Brush Script MT, Georgia, cursive, sans-serif" font-style="italic">Karuppu</text>
    <text x="0" y="32" fill="#fca5a5" font-size="12" font-weight="800" letter-spacing="6" text-anchor="middle" font-family="system-ui, sans-serif">WRITTEN &amp; DIRECTED BY RJB</text>
  </g>

  <!-- Music & Producers -->
  <text x="300" y="855" fill="#f87171" font-size="10" font-weight="800" letter-spacing="3" text-anchor="middle" font-family="system-ui, sans-serif">PRODUCED BY S.R. PRAKASH BABU • S.R. PRABHU</text>
</svg>
`)}`,

  dude: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="100%" height="100%">
  <defs>
    <radialGradient id="pinkGrunge" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#be185d" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#831843" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="#500724" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#140108" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="dudeYellow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
  </defs>

  <rect width="600" height="900" fill="url(#pinkGrunge)"/>

  <!-- Top Logo: Mythri Movie Makers -->
  <polygon points="60,40 68,58 88,58 72,70 78,88 60,76 42,88 48,70 32,58 52,58" fill="#e11d48"/>
  <text x="60" y="105" fill="#fda4af" font-size="8" font-weight="900" letter-spacing="1" text-anchor="middle" font-family="system-ui, sans-serif">MYTHRI MOVIE MAKERS</text>

  <!-- Pradeep Ranganathan Stylized Silhouette -->
  <g transform="translate(300, 260)">
    <!-- Curly Hair & Face -->
    <circle cx="0" cy="0" r="80" fill="#2a0513"/>
    <path d="M-75 -40 Q0 -130 75 -40 Q50 30 0 35 Q-50 30 -75 -40 Z" fill="#19020b"/>
    <!-- Intense Eyes & Beard -->
    <ellipse cx="-25" cy="-5" rx="8" ry="5" fill="#fbcfe8"/>
    <ellipse cx="25" cy="-5" rx="8" ry="5" fill="#fbcfe8"/>
    <path d="M-30 20 Q0 50 30 20 Z" fill="#0f0107"/>

    <!-- Raised Punching Fist in Foreground Wrapped in Yellow Holy Thread -->
    <g transform="translate(-10, 190)">
      <!-- Clenched Fist -->
      <circle cx="0" cy="0" r="65" fill="#3b071b" stroke="#f43f5e" stroke-width="2"/>
      <!-- Yellow Knuckle Cord Ties -->
      <path d="M-55 -10 Q0 -30 55 -10 Q45 20 -45 20 Z" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
      <!-- Dangling Yellow Cord and Amulet Tag -->
      <path d="M-10 15 Q-15 90 -5 160" fill="none" stroke="#fde047" stroke-width="6" stroke-linecap="round"/>
      <path d="M10 15 Q5 90 15 160" fill="none" stroke="#fde047" stroke-width="6" stroke-linecap="round"/>
      <polygon points="5,150 15,185 -5,185" fill="#facc15"/>
    </g>
  </g>

  <!-- Actor Name -->
  <text x="300" y="660" fill="#fbcfe8" font-size="14" font-weight="900" letter-spacing="5" text-anchor="middle" font-family="system-ui, sans-serif">PRADEEP RANGANATHAN</text>

  <!-- Huge Bold Graffiti Logo: DUDE -->
  <g transform="translate(300, 740)">
    <!-- Drop Shadow / Border -->
    <text x="4" y="6" fill="#000000" font-size="95" font-weight="900" letter-spacing="4" text-anchor="middle" font-family="Impact, Arial Black, sans-serif">DUDE</text>
    <!-- Main Yellow Comic Cut Title -->
    <text x="0" y="0" fill="url(#dudeYellow)" font-size="95" font-weight="900" letter-spacing="4" text-anchor="middle" font-family="Impact, Arial Black, sans-serif">DUDE</text>
  </g>

  <!-- Diwali Release Stamp Badge Bottom Left -->
  <g transform="translate(100, 830)">
    <rect x="-60" y="-35" width="120" height="55" fill="#000000" stroke="#facc15" stroke-width="1.5"/>
    <text x="0" y="-18" fill="#facc15" font-size="8" font-weight="900" letter-spacing="1" text-anchor="middle" font-family="system-ui, sans-serif">MASSIVE DIWALI</text>
    <text x="0" y="-5" fill="#ffffff" font-size="11" font-weight="900" letter-spacing="1" text-anchor="middle" font-family="system-ui, sans-serif">RELEASE 2025</text>
    <text x="0" y="10" fill="#f43f5e" font-size="7" font-weight="800" letter-spacing="2" text-anchor="middle" font-family="system-ui, sans-serif">WORLDWIDE</text>
  </g>

  <!-- Crew Footer Right -->
  <text x="420" y="820" fill="#fda4af" font-size="9" font-weight="800" letter-spacing="2" text-anchor="middle" font-family="system-ui, sans-serif">WRITTEN &amp; DIRECTED BY</text>
  <text x="420" y="836" fill="#ffffff" font-size="12" font-weight="900" letter-spacing="2" text-anchor="middle" font-family="system-ui, sans-serif">KEERTHISWARAN</text>
  <text x="420" y="855" fill="#fde047" font-size="9" font-weight="800" letter-spacing="2" text-anchor="middle" font-family="system-ui, sans-serif">SAI ABHYANKKAR MUSICAL</text>
</svg>
`)}`
};
