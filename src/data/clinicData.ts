import {
  Doctor,
  Product,
  Language,
  DoctorArrival,
  PathologyTest,
  SpecialOffer,
  DarkColorOption,
  BookingHistoryItem,
} from '../types';
import kneeBraceImg from '../assets/images/ortho_knee_brace_1790317702669.jpg';
import lumbarBeltImg from '../assets/images/lumbar_belt_1790317715183.jpg';
import hotColdPackImg from '../assets/images/hot_cold_pack_1790317728249.jpg';
import pulseOximeterImg from '../assets/images/pulse_oximeter_1790317739685.jpg';
import thermometerImg from '../assets/images/digital_thermometer_1790317750062.jpg';

import drNilamadhabImg from '../assets/images/dr_nilamadhab_mahalik_1790403877647.jpg';
import drManabendraImg from '../assets/images/dr_manabendra_dash_1790403891138.jpg';
import drAjitImg from '../assets/images/dr_ajit_kumar_nayak_1790403903568.jpg';
import drKhirodImg from '../assets/images/dr_khirod_bera_1790403915163.jpg';

export const DOCTOR_BOOKING_URL = 'https://healthmeu.com/application/opdregistration?cl=LIFE6a902f78b9918';
export const PATHOLOGY_BOOKING_URL = 'https://healthmeu.com/application/patholabonlinebooking?cl=LIFE6a902f78b9918';

// Default Female Doctor Photo (Matches uploaded "default doctor female.jpg")
export const DEFAULT_FEMALE_DOCTOR_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
    <!-- Sky Blue Background -->
    <rect width="500" height="500" fill="#79D3EA"/>
    <!-- Back Hair (Dark Charcoal Bob) -->
    <path d="M148 188C148 102 195 66 254 66C312 66 352 106 352 188L340 318H160L148 188Z" fill="#2D3134"/>
    <!-- Neck & Shadow -->
    <path d="M210 250H290V338L250 470L210 338V250Z" fill="#FCE2C4"/>
    <path d="M210 250H290V295C265 308 235 308 210 295V250Z" fill="#EDD0B1"/>
    <!-- Ears -->
    <ellipse cx="174" cy="212" rx="22" ry="28" transform="rotate(-12 174 212)" fill="#FCE2C4"/>
    <ellipse cx="326" cy="212" rx="22" ry="28" transform="rotate(12 326 212)" fill="#FCE2C4"/>
    <!-- Faceless Head -->
    <path d="M175 168C175 118 208 92 250 92C292 92 325 118 325 168V212C325 258 290 286 250 286C210 286 175 258 175 212V168Z" fill="#FCE2C4"/>
    <!-- Side-Parted Front Hair -->
    <path d="M162 198C162 125 202 82 258 82C302 82 336 112 338 175C322 162 312 145 306 128C276 148 216 154 175 198H162Z" fill="#2D3134"/>
    <!-- Teal Inner Scrub V-Neck -->
    <path d="M198 302L250 472L302 302H280L250 356L220 302H198Z" fill="#0C9B9E"/>
    <!-- White Lab Coat -->
    <path d="M104 316C116 304 162 298 200 298L250 472L300 298C338 298 384 304 396 316L436 500H64L104 316Z" fill="#FFFFFF"/>
    <!-- Coat Sleeve Lines -->
    <path d="M144 392L136 500" stroke="#D5DBDD" stroke-width="7"/>
    <path d="M356 392L364 500" stroke="#D5DBDD" stroke-width="7"/>
    <!-- Coat Notched Lapels -->
    <path d="M200 298L154 374L194 380L182 422L250 492V472L200 298Z" fill="#EAEFEF"/>
    <path d="M300 298L346 374L306 380L318 422L250 492V472L300 298Z" fill="#EAEFEF"/>
    <!-- Stethoscope Left Side (Tube + Chestpiece) -->
    <path d="M210 284C185 306 178 365 182 436" stroke="#53585B" stroke-width="11" stroke-linecap="round"/>
    <circle cx="183" cy="442" r="20" fill="#53585B"/>
    <circle cx="183" cy="442" r="14" fill="#E4E8EA"/>
    <circle cx="183" cy="442" r="10" fill="#7F8588"/>
    <!-- Stethoscope Right Side (Binaural U-Loop) -->
    <path d="M290 284C308 296 318 314 318 334" stroke="#53585B" stroke-width="11" stroke-linecap="round"/>
    <path d="M294 362C294 334 312 324 328 324C344 324 362 334 362 362" stroke="#53585B" stroke-width="11" stroke-linecap="round"/>
    <path d="M294 362C294 394 306 410 320 410" stroke="#B6BCBE" stroke-width="7" stroke-linecap="round"/>
    <path d="M362 362C362 394 350 410 336 410" stroke="#B6BCBE" stroke-width="7" stroke-linecap="round"/>
    <circle cx="321" cy="410" r="5.5" fill="#464B4E"/>
    <circle cx="335" cy="410" r="5.5" fill="#464B4E"/>
  </svg>`
)}`;

// Default Male Doctor Photo (Matches uploaded "default doctor male.jpg")
export const DEFAULT_MALE_DOCTOR_PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
    <!-- Warm Cream Background -->
    <rect width="500" height="500" fill="#FFF6E5"/>
    <!-- Neck in Warm Coral-Tan -->
    <path d="M208 252H292V345L250 385L208 345V252Z" fill="#F28E6E"/>
    <path d="M208 252H292V298C266 314 234 314 208 298V252Z" fill="#E47B5B"/>
    <!-- Ears -->
    <ellipse cx="180" cy="212" rx="18" ry="26" transform="rotate(-8 180 212)" fill="#F5B18C"/>
    <ellipse cx="320" cy="212" rx="18" ry="26" transform="rotate(8 320 212)" fill="#F5B18C"/>
    <!-- Faceless Head -->
    <path d="M182 162C182 115 212 92 250 92C288 92 318 115 318 162V214C318 260 286 290 250 290C214 290 182 260 182 214V162Z" fill="#FDDAB7"/>
    <!-- Parted Dark Navy-Slate Hair -->
    <path d="M174 188C168 140 185 95 232 78C262 66 295 76 312 98C332 106 340 135 332 184C325 198 322 210 318 216C316 192 314 166 296 144C272 138 242 140 220 156C204 168 192 192 186 216C180 206 176 196 174 188Z" fill="#173342"/>
    <!-- Aqua-Mint Shirt & Collar -->
    <path d="M196 300L250 455L304 300H196Z" fill="#BCEAE3"/>
    <path d="M206 294L250 342L224 374L194 318L206 294Z" fill="#C7F0EA"/>
    <path d="M294 294L250 342L276 374L306 318L294 294Z" fill="#C7F0EA"/>
    <!-- Deep Teal-Blue Necktie -->
    <path d="M236 334H264L258 360H242L236 334Z" fill="#155B78"/>
    <path d="M242 360H258L266 442L250 462L234 442L242 360Z" fill="#186A8B"/>
    <!-- White Lab Coat -->
    <path d="M92 342C106 312 152 298 198 296L250 458L302 296C348 298 394 312 408 342L440 468C380 482 120 482 60 468L92 342Z" fill="#F4F9F9"/>
    <!-- Soft Coat Shading -->
    <path d="M60 468L92 342C102 322 122 310 146 304L126 474C98 472 76 470 60 468Z" fill="#D8ECEA"/>
    <path d="M440 468L408 342C398 322 378 310 354 304L374 474C402 472 424 470 440 468Z" fill="#D8ECEA"/>
    <!-- Coat Lapels -->
    <path d="M198 296L176 358L202 368L188 394L250 462V448L198 296Z" fill="#FFFFFF" stroke="#D2E6E4" stroke-width="3"/>
    <path d="M302 296L324 358L298 368L312 394L250 462V448L302 296Z" fill="#FFFFFF" stroke="#D2E6E4" stroke-width="3"/>
    <!-- Stethoscope Left Side (Binaural U-Loop) -->
    <path d="M204 282C182 296 168 328 168 368" stroke="#164F68" stroke-width="11" stroke-linecap="round"/>
    <path d="M144 398C144 374 156 364 168 364C180 364 192 374 192 398" stroke="#164F68" stroke-width="11" stroke-linecap="round"/>
    <path d="M144 398V454C144 468 152 474 160 474" stroke="#B7CBCD" stroke-width="8" stroke-linecap="round"/>
    <path d="M192 398V454C192 468 184 474 176 474" stroke="#B7CBCD" stroke-width="8" stroke-linecap="round"/>
    <circle cx="161" cy="474" r="5" fill="#FFFFFF"/>
    <circle cx="175" cy="474" r="5" fill="#FFFFFF"/>
    <!-- Stethoscope Right Side (Tube + Chestpiece with Cross) -->
    <path d="M296 282C324 302 342 348 348 410" stroke="#164F68" stroke-width="11" stroke-linecap="round"/>
    <circle cx="348" cy="422" r="25" fill="#164F68"/>
    <circle cx="348" cy="422" r="15" fill="#FFFFFF"/>
    <path d="M348 415V429M341 422H355" stroke="#164F68" stroke-width="4.5" stroke-linecap="round"/>
  </svg>`
)}`;

export const CLINIC_CONFIG = {
  name: 'Life Care Medicine Store and Poly Clinic',
  subName: 'Life Care Medicine Store and Poly Clinic',
  lat: 21.9321130,
  lng: 86.7270995,
  phone: '+91 82491 80905',
  whatsapp: '+918249180905',
  whatsappDisplay: '+91 82491 80905',
  address: 'Hospital Square / Kabarkhana Road, Baripada, Odisha 757001',
  hours: 'Mon - Sun: 8:00 AM - 10:00 PM',
  emergencyContact: '+91 82491 80905 / 7894547610',
};

// Cohesive single-color theme helper for Light mode (#4987A4 fading to white) vs 3 Dark Theme Color Options (Ocean Green, Black, Baby Pink)
export function getThemePalette(isDark: boolean, darkColor: DarkColorOption = 'ocean') {
  if (!isDark) {
    return {
      backdropClass: 'ocean-green-backdrop',
      outerBg: 'bg-gradient-to-b from-[#4987A4] via-[#9bc2d4] to-white text-slate-800',
      pageBg: 'bg-gradient-to-b from-[#4987A4] via-[#9bc2d4] to-white text-slate-800',
      shellBg: 'bg-gradient-to-b from-[#4987A4] via-[#bcd7e4] to-white border-[#4987A4]/30 text-slate-800',
      headerBg: 'bg-white/95 border-[#4987A4]/25 text-slate-800',
      cardBg: 'bg-white border-slate-200 text-slate-800',
      card: 'bg-white border-slate-200 text-slate-800',
      softCardBg: 'bg-white/95 border-slate-200 text-slate-900',
      cardAlt: 'bg-white/95 border-slate-200 text-slate-900',
      subtleBg: 'bg-slate-50/90 border-slate-200 text-slate-900',
      headingText: 'text-slate-900',
      heading: 'text-slate-900',
      subText: 'text-slate-600',
      subtext: 'text-slate-600',
      mutedText: 'text-slate-500',
      accentText: 'text-teal-700',
      primaryBtn: 'bg-teal-700 hover:bg-teal-800 text-white',
      secondaryBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
      badge: 'bg-teal-50 text-teal-800 border-teal-200',
      border: 'border-slate-200',
      divider: 'border-slate-200',
      input: 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
      navBg: 'bg-white/95 border-[#4987A4]/25',
      footerBg: 'border-slate-200 bg-white/90 text-slate-600',
    };
  }

  if (darkColor === 'black') {
    return {
      backdropClass: 'dark-black-backdrop',
      outerBg: 'bg-[#000000] text-zinc-100',
      pageBg: 'bg-[#000000] text-zinc-100',
      shellBg: 'bg-[#0a0a0a] border-zinc-800 text-zinc-100',
      headerBg: 'bg-[#0a0a0a]/95 border-zinc-800 text-zinc-100',
      cardBg: 'bg-[#121212] border-zinc-800 text-zinc-100',
      card: 'bg-[#121212] border-zinc-800 text-zinc-100',
      softCardBg: 'bg-[#161616] border-zinc-700 text-white',
      cardAlt: 'bg-[#161616] border-zinc-700 text-white',
      subtleBg: 'bg-[#1c1c1c] border-zinc-700 text-zinc-200',
      headingText: 'text-white',
      heading: 'text-white',
      subText: 'text-zinc-400',
      subtext: 'text-zinc-400',
      mutedText: 'text-zinc-500',
      accentText: 'text-zinc-200',
      primaryBtn: 'bg-white hover:bg-zinc-200 text-black',
      secondaryBtn: 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600',
      badge: 'bg-zinc-900 text-zinc-200 border-zinc-700',
      border: 'border-zinc-800',
      divider: 'border-zinc-800',
      input: 'bg-[#161616] border-zinc-700 text-white placeholder:text-zinc-500',
      navBg: 'bg-[#0a0a0a]/95 border-zinc-800',
      footerBg: 'border-zinc-800 bg-[#050505] text-zinc-400',
    };
  }

  if (darkColor === 'babypink') {
    return {
      backdropClass: 'dark-babypink-backdrop',
      outerBg: 'bg-[#1f0a13] text-pink-50',
      pageBg: 'bg-[#1f0a13] text-pink-50',
      shellBg: 'bg-[#2b101c] border-pink-300/40 text-pink-50',
      headerBg: 'bg-[#260e18]/95 border-pink-300/40 text-pink-100',
      cardBg: 'bg-[#361524] border-pink-300/40 text-pink-50',
      card: 'bg-[#361524] border-pink-300/40 text-pink-50',
      softCardBg: 'bg-[#421a2c] border-pink-300/50 text-pink-50',
      cardAlt: 'bg-[#421a2c] border-pink-300/50 text-pink-50',
      subtleBg: 'bg-[#4d1f34] border-pink-300/45 text-pink-100',
      headingText: 'text-pink-100',
      heading: 'text-pink-100',
      subText: 'text-pink-200/80',
      subtext: 'text-pink-200/80',
      mutedText: 'text-pink-300/70',
      accentText: 'text-pink-300',
      primaryBtn: 'bg-[#f9a8d4] hover:bg-[#fbcfe8] text-[#260e18]',
      secondaryBtn: 'bg-[#f472b6] hover:bg-[#f9a8d4] text-[#260e18]',
      badge: 'bg-[#4d1f34] text-pink-200 border-pink-300/50',
      border: 'border-pink-300/35',
      divider: 'border-pink-300/35',
      input: 'bg-[#421a2c] border-pink-300/40 text-pink-50 placeholder:text-pink-200/50',
      navBg: 'bg-[#260e18]/95 border-pink-300/40',
      footerBg: 'border-pink-300/30 bg-[#1f0a13] text-pink-200/80',
    };
  }

  // Default Dark Option 1: Ocean Green ('ocean')
  return {
    backdropClass: 'dark-ocean-backdrop',
    outerBg: 'bg-[#031c19] text-teal-50',
    pageBg: 'bg-[#031c19] text-teal-50',
    shellBg: 'bg-[#062925] border-[#115e59] text-teal-50',
    headerBg: 'bg-[#04221f]/95 border-[#115e59] text-teal-50',
    cardBg: 'bg-[#083530] border-[#136c65] text-teal-50',
    card: 'bg-[#083530] border-[#136c65] text-teal-50',
    softCardBg: 'bg-[#0b423c] border-[#178078] text-white',
    cardAlt: 'bg-[#0b423c] border-[#178078] text-white',
    subtleBg: 'bg-[#0d4f48] border-teal-600/60 text-teal-100',
    headingText: 'text-white',
    heading: 'text-white',
    subText: 'text-teal-200/85',
    subtext: 'text-teal-200/85',
    mutedText: 'text-teal-300/70',
    accentText: 'text-teal-300',
    primaryBtn: 'bg-teal-500 hover:bg-teal-400 text-slate-950',
    secondaryBtn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    badge: 'bg-[#052925] text-teal-200 border-teal-600/60',
    border: 'border-[#115e59]',
    divider: 'border-[#115e59]',
    input: 'bg-[#0b423c] border-[#178078] text-white placeholder:text-teal-200/50',
    navBg: 'bg-[#04221f]/95 border-[#115e59]',
    footerBg: 'border-[#0f524b] bg-[#031c19] text-teal-300/80',
  };
}

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    brand: 'Life Care Medicine Store and Poly Clinic',
    subBrand: 'Pharmacy • Poly Clinic • Pathology',
    badge: '🏥 MEDICINE STORE • POLY CLINIC • PATHOLOGY',
    heroTitle: 'Caring for your family. Supporting your health',
    heroText: 'Consult verified specialist doctors, book pathology blood tests, order authentic medicines, and access certified physiotherapy rehabilitation supports in Baripada.',
    meetDoctors: 'Meet Our Doctors →',
    appointment: 'Book Appointment',
    appointmentText: 'Schedule a consultation with our experienced specialists.',
    pharmacy: 'Pharmacy Products',
    pharmacyText: 'Prescription medicines, baby care, and daily healthcare.',
    physio: 'Physiotherapy',
    physioText: 'Orthopedic braces, pain relief, and rehab essentials.',
    contact: 'Contact Clinic',
    contactText: 'Get live GPS directions or call our reception desk.',
    doctors: 'Meet Our Doctors',
    swipe: 'Swipe cards →',
    book: 'BOOK NOW',
    swipeHint: 'Swipe cards left or right or use arrows to view all 11 specialists',
    locationTitle: 'Find Life Care Medicine Store and Poly Clinic',
    locationSmall: 'Your trusted neighborhood healthcare point',
    mapNote: 'Life Care Medicine Store and Poly Clinic',
    directions: 'GET DIRECTIONS ↗',
    callUs: 'CALL CLINIC',
    pharmacyTitle: '💊 Pharmacy Products',
    pharmacyBody: 'Genuine prescription medicines, vitamins, immunity boosters, first-aid, and daily hygiene essentials.',
    physioTitle: '🦵 Physiotherapy & Orthopedic Essentials',
    physioBody: 'Doctor-recommended orthopedic knee braces, lumbar belts, hot & cold therapy pads, resistance bands, and post-surgery aids.',
    needHelp: 'Need immediate medical assistance?',
    callTeam: 'Direct line to our clinic reception and pharmacists',
    callNow: 'CALL NOW',
    footer: '© 2026 Life Care Medicine Store and Poly Clinic • Baripada • Serving our community with compassion.',
    home: 'Home',
    doctorsNav: 'Doctors',
    bookNav: 'Book',
    storeNav: 'Store',
    cart: 'Cart',
    allCategories: 'All Products',
    inStock: 'In Stock',
    addToCart: 'Order / Request',
    orderOnWhatsApp: 'Inquire on WhatsApp',
    filterByDept: 'All Departments',
  },
  or: {
    brand: 'ଲାଇଫ୍ କେୟାର ମେଡିସିନ୍ ଷ୍ଟୋର ଓ ପଲି କ୍ଲିନିକ୍',
    subBrand: 'ଫାର୍ମାସୀ • ପଲି କ୍ଲିନିକ୍ • ପାଥୋଲୋଜି',
    badge: '🏥 ମେଡିସିନ୍ ଷ୍ଟୋର • ପଲି କ୍ଲିନିକ୍ • ପାଥୋଲୋଜି',
    heroTitle: 'ଆପଣଙ୍କ ପରିବାରର ଯତ୍ନ। ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟର ସୁରକ୍ଷା।',
    heroText: 'ବିଶେଷଜ୍ଞ ଡାକ୍ତରଙ୍କ ସହ ପରାମର୍ଶ ପାଇଁ ସ୍ଲଟ୍ ବୁକ୍ କରନ୍ତୁ, ଅସଲି ଔଷଧ ଏବଂ ପ୍ରମାଣିତ ଫିଜିଓଥେରାପି ସାମଗ୍ରୀ ସହଜରେ ପାଆନ୍ତୁ।',
    meetDoctors: 'ଆମ ଡାକ୍ତରଙ୍କୁ ଦେଖନ୍ତୁ →',
    appointment: 'ନିଯୁକ୍ତି ବୁକ୍ କରନ୍ତୁ',
    appointmentText: 'ଆମ ବିଶେଷଜ୍ଞ ଡାକ୍ତରଙ୍କ ସହିତ ସହଜରେ ସମୟ ନିଅନ୍ତୁ।',
    pharmacy: 'ଔଷଧ ଓ ଫାର୍ମାସୀ',
    pharmacyText: 'ପ୍ରେସକ୍ରିପସନ୍ ଔଷଧ, ଶିଶୁ ଯତ୍ନ ଏବଂ ଦୈନନ୍ଦିନ ସ୍ୱାସ୍ଥ୍ୟ ସାମଗ୍ରୀ।',
    physio: 'ଫିଜିଓଥେରାପି',
    physioText: 'ନି ବ୍ରେସ୍, ବେଲ୍ଟ, ହଟ୍-କୋଲ୍ଡ ପ୍ୟାକ୍ ଓ ରିହାବିଲିଟେସନ୍ ସାମଗ୍ରୀ।',
    contact: 'କ୍ଲିନିକ୍ ସହ ଯୋଗାଯୋଗ',
    contactText: 'ରାସ୍ତା ଦେଖନ୍ତୁ କିମ୍ବା ଆମ କ୍ଲିନିକ୍ ଡେସ୍କ୍ ସହିତ କଥା ହୁଅନ୍ତୁ।',
    doctors: 'ଆମ ବିଶେଷଜ୍ଞ ଡାକ୍ତରମାନେ',
    swipe: 'କାର୍ଡ ସ୍ୱାଇପ୍ କରନ୍ତୁ →',
    book: 'ବୁକ୍ କରନ୍ତୁ',
    swipeHint: 'ପରବର୍ତ୍ତୀ ଡାକ୍ତରଙ୍କୁ ଦେଖିବା ପାଇଁ ବାମ କିମ୍ବା ଡାହାଣକୁ ସ୍ୱାଇପ୍ କରନ୍ତୁ',
    locationTitle: 'ଆମ ଫାର୍ମାସୀ ଓ କ୍ଲିନିକ୍ ସ୍ଥାନ',
    locationSmall: 'ଆପଣଙ୍କ ନିକଟସ୍ଥ ବିଶ୍ୱସନୀୟ ସ୍ୱାସ୍ଥ୍ୟସେବା କେନ୍ଦ୍ର',
    mapNote: 'ଲାଇଫ୍ କେୟାର ମେଡିସିନ୍ ଷ୍ଟୋର ଓ ପଲି କ୍ଲିନିକ୍',
    directions: 'ରାସ୍ତା ଦେଖନ୍ତୁ (GPS) ↗',
    callUs: 'ଫାର୍ମାସୀକୁ କଲ୍ କରନ୍ତୁ',
    pharmacyTitle: '💊 ଫାର୍ମାସୀ ସାମଗ୍ରୀ',
    pharmacyBody: 'ଅସଲି ଡାକ୍ତରୀ ଔଷଧ, ଭିଟାମିନ୍, ରୋଗ ପ୍ରତିରୋଧକ ସପ୍ଲିମେଣ୍ଟ, ପ୍ରାଥମିକ ଚିକିତ୍ସା ଓ ବେବି କେୟାର ସାମଗ୍ରୀ।',
    physioTitle: '🦵 ଫିଜିଓଥେରାପି ଓ ଅର୍ଥୋପେଡିକ୍ ସାମଗ୍ରୀ',
    physioBody: 'ନି ସପୋର୍ଟ, ଲମ୍ବର ବ୍ୟାକ୍ ବେଲ୍ଟ, ସର୍ଭାଇକାଲ୍ କଲାର, ଏବଂ ଫିଜିଓଥେରାପି ବ୍ୟାୟାମ ଉପକରଣ।',
    needHelp: 'ଜରୁରୀକାଳୀନ ଚିକିତ୍ସା ସହାୟତା ଦରକାର?',
    callTeam: 'ଆମ କ୍ଲିନିକ୍ ଟିମ୍ ଓ ଫାର୍ମାସିଷ୍ଟଙ୍କୁ ସିଧାସଳଖ ଫୋନ୍ କରନ୍ତୁ',
    callNow: 'ଏବେ କଲ୍ କରନ୍ତୁ',
    footer: '© ୨୦୨୬ ଲାଇଫ୍ କେୟାର ମେଡିସିନ୍ ଷ୍ଟୋର ଓ ପଲି କ୍ଲିନିକ୍ • ବାରିପଦା, ଓଡ଼ିଶା।',
    home: 'ମୂଳପୃଷ୍ଠା',
    doctorsNav: 'ଡାକ୍ତର',
    bookNav: 'ବୁକ୍',
    storeNav: 'ଷ୍ଟୋର',
    cart: 'କାର୍ଟ',
    allCategories: 'ସମସ୍ତ ସାମଗ୍ରୀ',
    inStock: 'ମହଜୁଦ ଅଛି',
    addToCart: 'ଅର୍ଡର / ପଚାରନ୍ତୁ',
    orderOnWhatsApp: 'ହ୍ୱାଟ୍ସଆପ୍‌ରେ ପଚାରନ୍ତୁ',
    filterByDept: 'ସମସ୍ତ ବିଭାଗ',
  },
  bn: {
    brand: 'লাইফ কেয়ার মেডিসিন স্টোর অ্যান্ড পলি ক্লিনিক',
    subBrand: 'ফার্মেসি • পলি ক্লিনিক • প্যাথলজি',
    badge: '🏥 মেডিসিন স্টোর • পলি ক্লিনিক • প্যাথলজি',
    heroTitle: 'আপনার পরিবারের যত্ন। আপনার সুস্থতার সহায়ক।',
    heroText: 'বিশেষজ্ঞ চিকিৎসকের পরামর্শের জন্য স্লট বুক করুন, আসল প্রেসক্রিপশন ওষুধ এবং প্রত্যয়িত ফিজিওথেরাপি সরঞ্জাম এক ছাদের নিচে পান।',
    meetDoctors: 'আমাদের ডাক্তারদের দেখুন →',
    appointment: 'অ্যাপয়েন্টমেন্ট নিন',
    appointmentText: 'আমাদের অভিজ্ঞ চিকিৎসকদের সঙ্গে আজই সাক্ষাতের সময় নিন।',
    pharmacy: 'ফার্মেসি পণ্য',
    pharmacyText: 'প্রেসক্রিপশন ওষুধ, শিশুর যত্ন ও দৈনিক প্রাথমিক চিকিৎসা সামগ্রী।',
    physio: 'ফিজিওথেরাপি',
    physioText: 'হাঁটুর সাপোর্ট, ব্যাক বেল্ট, হট-কোল্ড প্যাক ও রিহ্যাব পণ্য।',
    contact: 'যোগাযোগ করুন',
    contactText: 'সরাসরি জিপিএস ডিরেকশন দেখুন অথবা কল করুন।',
    doctors: 'আমাদের বিশেষজ্ঞ ডাক্তারগণ',
    swipe: 'কার্ড সোয়াইপ করুন →',
    book: 'বুক করুন',
    swipeHint: 'পরবর্তী ডাক্তার দেখতে ডানে বা বামে কার্ড সরান',
    locationTitle: 'আমাদের ফার্মেসি ও ক্লিনিক',
    locationSmall: 'আপনার স্থানীয় নির্ভরযোগ্য স্বাস্থ্যকেন্দ্র',
    mapNote: 'লাইফ কেয়ার মেডিসিন স্টোর অ্যান্ড পলি ক্লিনিক',
    directions: 'ডিরেকশন দেখুন (GPS) ↗',
    callUs: 'ফার্মেসিতে ফোন',
    pharmacyTitle: '💊 ফার্মেসি পণ্যসমূহ',
    pharmacyBody: '১০০% আসল ওষুধ, ভিটামিন, ইমিউনিটি বুস্টার ও হেলথকেয়ার সামগ্রী।',
    physioTitle: '🦵 ফিজিওথেরাপি ও অর্থোপেডিক সামগ্রী',
    physioBody: 'ডাক্তার নির্দেশিত অর্থোপেডিক নি ব্রেস, লাম্বার বেল্ট, হট জেল প্যাক ও রিহ্যাব ব্যান্ড।',
    needHelp: 'জরুরি স্বাস্থ্যসেবা প্রয়োজন?',
    callTeam: 'আমাদের ক্লিনিক ও ফার্মাসিস্ট দলের সাথে সরাসরি কথা বলুন',
    callNow: 'এখনই কল করুন',
    footer: '© ২০২৬ লাইফ কেয়ার মেডিসিন স্টোর অ্যান্ড পলি ক্লিনিক • বারিপদা।',
    home: 'হোম',
    doctorsNav: 'ডাক্তার',
    bookNav: 'বুকিং',
    storeNav: 'স্টোর',
    cart: 'ব্যাগ',
    allCategories: 'সব পণ্য',
    inStock: 'স্টকে আছে',
    addToCart: 'অর্ডার / জানুন',
    orderOnWhatsApp: 'হোয়াটসঅ্যাপে যোগাযোগ',
    filterByDept: 'সকল বিভাগ',
  },
  sat: {
    brand: 'ᱞᱟᱭᱤᱯᱷ ᱠᱮᱭᱟᱨ ᱢᱮᱰᱤᱥᱤᱱ ᱥᱴᱳᱨ ᱟᱨ ᱯᱚᱞᱤ ᱠᱞᱤᱱᱤᱠ',
    subBrand: 'ᱯᱷᱟᱨᱢᱟᱥᱤ • ᱯᱚᱞᱤ ᱠᱞᱤᱱᱤᱠ • ᱯᱮᱛᱷᱚᱞᱚᱡᱤ',
    badge: '🏥 ᱢᱮᱰᱤᱥᱤᱱ ᱥᱴᱳᱨ • ᱯᱚᱞᱤ ᱠᱞᱤᱱᱤᱠ • ᱯᱮᱛᱷᱚᱞᱚᱡᱤ',
    heroTitle: 'ᱟᱢᱟᱜ ᱜᱷᱟᱨᱚᱸᱡᱽ ᱡᱚᱛᱚᱱ। ᱟᱢᱟᱜ ᱥᱟᱹᱦᱟᱭ ᱜᱚᱲᱚ।',
    heroText: 'ᱵᱤᱥᱮᱥᱚᱜᱽᱭᱚ ᱰᱟᱠᱛᱟᱨ ᱟᱯᱳᱭᱱᱴᱢᱮᱱᱴ ᱵᱩᱠ ᱢᱮ, ᱚᱥᱚᱞ ᱨᱟᱱ ᱟᱨ ᱯᱷᱤᱡᱤᱭᱳᱛᱷᱮᱨᱟᱯᱤ ᱥᱟᱢᱟᱱ ᱥᱟᱹᱦᱟᱭ ᱛᱮ ᱧᱟᱢ ᱢᱮ।',
    meetDoctors: 'ᱰᱟᱠᱛᱟᱨ ᱠᱚ ᱧᱮᱞ ᱠᱚ ᱢᱮ →',
    appointment: 'ᱟᱯᱳᱭᱱᱴᱢᱮᱱᱴ ᱵᱩᱠ ᱢᱮ',
    appointmentText: 'ᱟᱞᱮᱭᱟᱜ ᱵᱤᱥᱮᱥᱚᱜᱽᱭᱚ ᱰᱟᱠᱛᱟᱨ ᱥᱟᱶ ᱚᱠᱛᱚ ᱦᱟᱛᱟᱣ ᱢᱮ।',
    pharmacy: 'ᱯᱷᱟᱨᱢᱟᱥᱤ ᱨᱟᱱ',
    pharmacyText: 'ᱰᱟᱠᱛᱟᱨ ᱚᱞ ᱨᱟᱱ, ᱜᱤᱫᱽᱨᱟᱹ ᱡᱚᱛᱚᱱ ᱟᱨ ᱥᱟᱹᱦᱟᱭ ᱥᱟᱢᱟᱱ।',
    physio: 'ᱯᱷᱤᱡᱤᱭᱳᱛᱷᱮᱨᱟᱯᱤ',
    physioText: 'ᱡᱟᱹᱱᱩ ᱥᱯᱚᱨᱴ, ᱵᱮᱞᱴ, ᱦᱚᱴ-ᱠᱚᱞᱰ ᱯᱮᱠ ᱥᱟᱢᱟᱱ।',
    contact: 'ᱠᱞᱤᱱᱤᱠ ᱥᱟᱶ ᱡᱚᱜᱟᱡᱚᱜ',
    contactText: 'ᱥᱚᱡᱷᱮ ᱫᱟᱲᱟᱱ ᱧᱮᱞ ᱢᱮ ᱟᱨᱵᱟᱝ ᱠᱚᱞ ᱢᱮ।',
    doctors: 'ᱟᱞᱮᱭᱟᱜ ᱰᱟᱠᱛᱟᱨ ᱠᱚ',
    swipe: 'ᱠᱟᱨᱰ ᱥᱩᱣᱟᱭᱯ ᱢᱮ →',
    book: 'ᱱᱤᱛᱚᱜ ᱵᱩᱠ ᱢᱮ',
    swipeHint: 'ᱮᱴᱟᱜ ᱰᱟᱠᱛᱟᱨ ᱧᱮᱞ ᱞᱟᱹᱜᱤᱫ ᱠᱟᱨᱰ ᱞᱮᱸᱜᱟ ᱟᱨᱵᱟᱝ ᱡᱚᱡᱚᱢ ᱥᱩᱣᱟᱭᱯ ᱢᱮ',
    locationTitle: 'ᱟᱞᱮᱭᱟᱜ ᱯᱷᱟᱨᱢᱟᱥᱤ ᱟᱨ ᱠᱞᱤᱱᱤᱠ',
    locationSmall: 'ᱟᱢᱟᱜ ᱥᱩᱨ ᱥᱟᱹᱦᱟᱭ ᱛᱟᱞᱢᱟ',
    mapNote: 'ᱞᱟᱭᱤᱯᱷ ᱠᱮᱭᱟᱨ ᱢᱮᱰᱤᱥᱤᱱ ᱥᱴᱳᱨ ᱟᱨ ᱯᱚᱞᱤ ᱠᱞᱤᱱᱤᱠ',
    directions: 'ᱫᱟᱲᱟᱱ ᱧᱮᱞ ᱢᱮ (GPS) ↗',
    callUs: 'ᱯᱷᱟᱨᱢᱟᱥᱤ ᱠᱚᱞ ᱢᱮ',
    pharmacyTitle: '💊 ᱯᱷᱟᱨᱢᱟᱥᱤ ᱨᱟᱱ ᱠᱚ',
    pharmacyBody: 'ᱚᱥᱚᱞ ᱨᱟᱱ, ᱵᱷᱤᱴᱟᱢᱤᱱ, ᱤᱢᱤᱭᱩᱱᱤᱴᱤ ᱟᱨ ᱥᱟᱹᱦᱟᱭ ᱥᱟᱢᱟᱱ ᱠᱚ।',
    physioTitle: '🦵 ᱯᱷᱤᱡᱤᱭᱳᱛᱷᱮᱨᱟᱯᱤ ᱥᱟᱢᱟᱱ',
    physioBody: 'ᱡᱟᱹᱱᱩ ᱥᱯᱚᱨᱴ, ᱠᱚᱲᱟ ᱵᱮᱞᱴ, ᱦᱚᱴ ᱯᱮᱠ ᱟᱨ ᱨᱤᱦᱟᱵᱤᱞᱤᱴᱮᱥᱚᱱ ᱥᱟᱢᱟᱱ।',
    needHelp: 'ᱞᱟᱹᱠᱛᱤᱭᱟᱱ ᱥᱟᱹᱦᱟᱭ ᱫᱟᱨᱠᱟᱨ?',
    callTeam: 'ᱟᱞᱮᱭᱟᱜ ᱠᱞᱤᱱᱤᱠ ᱴᱤᱢ ᱥᱟᱶ ᱥᱚᱡᱷᱮ ᱯᱷᱳᱱ ᱢᱮ',
    callNow: 'ᱱᱤᱛᱚᱜ ᱠᱚᱞ ᱢᱮ',
    footer: '© ᱒᱐᱒᱖ ᱞᱟᱭᱤᱯᱷ ᱠᱮᱭᱟᱨ ᱢᱮᱰᱤᱥᱤᱱ ᱥᱴᱳᱨ ᱟᱨ ᱯᱚᱞᱤ ᱠᱞᱤᱱᱤᱠ • ᱵᱟᱨᱤᱯᱟᱫᱟ।',
    home: 'ᱚᱲᱟᱜ',
    doctorsNav: 'ᱰᱟᱠᱛᱟᱨ',
    bookNav: 'ᱵᱩᱠ',
    storeNav: 'ᱥᱴᱳᱨ',
    cart: 'ᱡᱷᱚᱞᱟ',
    allCategories: 'ᱡᱚᱛᱚ ᱥᱟᱢᱟᱱ',
    inStock: 'ᱢᱮᱱᱟᱜ-ᱟ',
    addToCart: 'ᱚᱨᱰᱚᱨ / ᱠᱩᱞᱤ',
    orderOnWhatsApp: 'ᱦᱳᱣᱟᱴᱥᱮᱯ ᱨᱮ ᱠᱩᱞᱤ',
    filterByDept: 'ᱡᱚᱛᱚ ᱵᱤᱵᱷᱟᱜᱽ',
  }
};

// All 11 Specialist Doctors:
// - 4 doctors use their exact original uploaded photos
// - Other 7 doctors use the uploaded Default Male / Default Female Doctor images
export const DOCTORS: Doctor[] = [
  {
    id: '6a903663547e9',
    name: 'DR AJIT KUMAR NAYAK',
    specialty: 'Consultant Neurosurgeon (Brain & Spine)',
    department: 'Neurosurgery',
    qualification: 'MS (Neurosurgery)',
    experience: 'Brain, Spine, Headache, Vertigo & Seizure Specialist',
    timing: '12:30 PM - 02:00 PM (14th to 17th • Morning Slots: 09:00 AM - 01:00 PM)',
    fee: 0,
    photo: drAjitImg,
  },
  {
    id: '6a903bfc17c3c',
    name: 'DR NILAMADHABA MAHALILK',
    specialty: 'Gastroenterology, Hepatology & Nutrition',
    department: 'Gastroenterology',
    qualification: 'M.B.B.S., M.D., D.M. (AIIMS New Delhi), FRCP (Edin), FACP',
    experience: 'Asst. Professor, AIIMS Bhubaneswar • Liver & Digestive Care',
    timing: 'Visit Every Friday (12:00 PM - 03:00 PM)',
    fee: 0,
    photo: drNilamadhabImg,
  },
  {
    id: '6a929889e95d9',
    name: 'Dr. Manabendra Dash',
    specialty: 'Consultant Dermatologist, Laser & Hair Transplant Surgeon',
    department: 'Dermatology',
    qualification: 'MD (Dermatology)',
    experience: 'Skin, Acne, Pigmentation, Laser & Hair Specialist',
    timing: 'Every Saturday & Sunday (10:00 AM - 01:00 PM & 06:00 PM - 08:00 PM)',
    fee: 0,
    photo: drManabendraImg,
  },
  {
    id: '6aafa844b4af3',
    name: 'DR.K BERA',
    specialty: 'Physiotherapy, Paralysis, Ortho & Sports Injury Rehab',
    department: 'Physiotherapy',
    qualification: 'BPT, MPT (Physiotherapy & Rehabilitation)',
    experience: 'Stroke Rehab, Back/Neck/Knee Pain, Spondylitis & Post-Surgical Rehab',
    timing: 'Daily Physiotherapy & Pain Management Centre',
    fee: 0,
    photo: drKhirodImg,
  },
  {
    id: '6a926099bf67f',
    name: 'DR.DEEPAK NAIK',
    specialty: 'General Medicine & Internal Medicine Consultant',
    department: 'General Medicine',
    qualification: 'M.B.B.S., M.D. (Medicine)',
    experience: 'Visiting Specialist Physician',
    timing: 'Mon & Wed (10:00 AM - 01:30 PM)',
    fee: 0,
    photo: DEFAULT_MALE_DOCTOR_PHOTO,
  },
  {
    id: '6a929917c2ce5',
    name: 'Dr. Purva Mohapatra',
    specialty: "Obstetrics, Gynaecology & Women's Healthcare",
    department: 'Gynaecology',
    qualification: 'M.B.B.S., M.S. (Obs & Gynae)',
    experience: 'Consultant Specialist',
    timing: 'Mon - Sun (12:00 PM - 02:00 PM)',
    fee: 0,
    photo: DEFAULT_FEMALE_DOCTOR_PHOTO,
  },
  {
    id: '6a9299efca332',
    name: 'Dr. Aditya Prasad Padhy',
    specialty: 'Consultant Specialist Physician',
    department: 'Speciality OPD',
    qualification: 'M.B.B.S., M.D.',
    experience: 'Visiting Senior Consultant',
    timing: 'Every Sunday (12:00 PM - 01:00 PM)',
    fee: 0,
    photo: DEFAULT_MALE_DOCTOR_PHOTO,
  },
  {
    id: '6a929b48cff95',
    name: 'Dr. SIDHESWAR BASKEY',
    specialty: 'Orthopaedics, Bone & Joint Care Consultant',
    department: 'Orthopaedics',
    qualification: 'M.B.B.S., M.S. (Orthopaedics)',
    experience: 'Joint, Fracture & Spine Care',
    timing: 'Mon & Wed (04:30 PM - 07:30 PM)',
    fee: 0,
    photo: DEFAULT_MALE_DOCTOR_PHOTO,
  },
  {
    id: '6a929bdad38b7',
    name: 'Dr.Anjali Tudu',
    specialty: "Women's Health & Family Medicine Specialist",
    department: 'Gynaecology & OPD',
    qualification: 'M.B.B.S., DGO / M.D.',
    experience: 'Consultant Physician',
    timing: 'Tue & Thu (10:30 AM - 01:30 PM)',
    fee: 0,
    photo: DEFAULT_FEMALE_DOCTOR_PHOTO,
  },
  {
    id: '6a991705e2ff5',
    name: 'Dr. K.C.K.D.N. Hembram',
    specialty: 'General Physician & Chronic Care Consultant',
    department: 'General Medicine',
    qualification: 'M.B.B.S., M.D.',
    experience: 'Senior Visiting Consultant',
    timing: 'Tue & Thu (05:00 PM - 08:00 PM)',
    fee: 0,
    photo: DEFAULT_MALE_DOCTOR_PHOTO,
  },
  {
    id: '6ab385e175ffe',
    name: 'DR.JAGANNATH MAJHI',
    specialty: 'General Medicine & Multi-Speciality OPD Consultant',
    department: 'General Medicine',
    qualification: 'M.B.B.S., M.D.',
    experience: 'Visiting Specialist Consultant',
    timing: 'Tue, Thu & Sat (06:00 PM - 08:30 PM)',
    fee: 0,
    photo: DEFAULT_MALE_DOCTOR_PHOTO,
  },
];

// Notifications for Doctors Arriving Unannounced
const todayDateObj = new Date();
const todayISO = todayDateObj.toISOString().split('T')[0];
const tomorrowDateObj = new Date(Date.now() + 86400000);
const tomorrowISO = tomorrowDateObj.toISOString().split('T')[0];

export const DEFAULT_UNANNOUNCED_ARRIVALS: DoctorArrival[] = [
  {
    id: 'unannounced-1',
    doctorId: '6a903bfc17c3c',
    doctorName: 'DR NILAMADHABA MAHALILK',
    specialty: 'Gastroenterology, Hepatology & Nutrition (AIIMS)',
    department: 'Gastroenterology',
    photo: drNilamadhabImg,
    date: todayISO,
    dayOfMonth: todayDateObj.getDate(),
    timing: 'Today • 04:00 PM - 06:30 PM (Unannounced Visit)',
    note: 'Special unscheduled liver, stomach & digestive consultation session today.',
    isUnannounced: true,
    sentByAdminAt: 'Today',
  },
  {
    id: 'unannounced-2',
    doctorId: '6a903663547e9',
    doctorName: 'DR AJIT KUMAR NAYAK',
    specialty: 'Consultant Neurosurgeon (Brain & Spine)',
    department: 'Neurosurgery',
    photo: drAjitImg,
    date: tomorrowISO,
    dayOfMonth: tomorrowDateObj.getDate(),
    timing: 'Tomorrow • 11:00 AM - 02:00 PM (Unannounced Visit)',
    note: 'Special Brain & Spine OPD consultation slots opened.',
    isUnannounced: true,
    sentByAdminAt: 'Upcoming',
  },
  {
    id: 'unannounced-3',
    doctorId: '6a929889e95d9',
    doctorName: 'Dr. Manabendra Dash',
    specialty: 'Dermatologist, Laser & Hair Transplant Surgeon',
    department: 'Dermatology',
    photo: drManabendraImg,
    date: todayISO,
    dayOfMonth: todayDateObj.getDate(),
    timing: 'Today • 05:30 PM - 08:00 PM (Unannounced Visit)',
    note: 'Extra evening skin & laser consultation session.',
    isUnannounced: true,
    sentByAdminAt: 'Today',
  },
];

export function getUnannouncedArrivals(): DoctorArrival[] {
  try {
    const saved = localStorage.getItem('lifecare_unannounced_arrivals');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_UNANNOUNCED_ARRIVALS;
}

// Compact Booking History Helpers
export function getBookingHistory(): BookingHistoryItem[] {
  try {
    const saved = localStorage.getItem('lifecare_compact_booking_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function addBookingHistoryItem(
  typeOrObj:
    | 'doctor'
    | 'pathology'
    | { type: 'doctor' | 'pathology'; title: string; subtitle: string; url?: string },
  titleArg?: string,
  subtitleArg?: string,
  urlArg?: string
): BookingHistoryItem[] {
  const current = getBookingHistory();
  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const type = typeof typeOrObj === 'object' ? typeOrObj.type : typeOrObj;
  const title = typeof typeOrObj === 'object' ? typeOrObj.title : titleArg || '';
  const subtitle = typeof typeOrObj === 'object' ? typeOrObj.subtitle : subtitleArg || '';
  const defaultUrl = type === 'pathology' ? PATHOLOGY_BOOKING_URL : DOCTOR_BOOKING_URL;
  const url = (typeof typeOrObj === 'object' ? typeOrObj.url : urlArg) || defaultUrl;

  const newItem: BookingHistoryItem = {
    id: `hist-${Date.now()}`,
    type,
    title,
    subtitle,
    dateLabel,
    timestamp: dateLabel,
    url,
    status: 'Booked',
  };
  const updated = [newItem, ...current].slice(0, 6);
  try {
    localStorage.setItem('lifecare_compact_booking_history', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('booking-history-updated'));
  } catch (e) {
    console.error(e);
  }
  return updated;
}

export function clearBookingHistory(): void {
  try {
    localStorage.removeItem('lifecare_compact_booking_history');
    window.dispatchEvent(new CustomEvent('booking-history-updated'));
  } catch (e) {
    console.error(e);
  }
}

// Returns all doctors coming on a specific calendar date when tapped once
export function getDoctorsForDate(year: number, monthIndex: number, day: number): DoctorArrival[] {
  const monthStr = String(monthIndex + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const dateStr = `${year}-${monthStr}-${dayStr}`;
  const weekday = new Date(year, monthIndex, day).getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  const doctorsOnDay: DoctorArrival[] = [];

  // 1. Include any Unannounced Doctor Arrivals for this date
  const unannounced = getUnannouncedArrivals().filter((u) => u.date === dateStr);
  for (const item of unannounced) {
    doctorsOnDay.push(item);
  }

  const addDocIfNotPresent = (doc: Doctor, timing: string, note: string, isUnannounced = false) => {
    if (!doctorsOnDay.some((d) => d.doctorId === doc.id)) {
      doctorsOnDay.push({
        id: `cal-${dateStr}-${doc.id}`,
        doctorId: doc.id,
        doctorName: doc.name,
        specialty: doc.specialty,
        department: doc.department,
        photo: doc.photo,
        date: dateStr,
        dayOfMonth: day,
        timing,
        note,
        isUnannounced,
      });
    }
  };

  // 2. 14th to 17th: DR AJIT KUMAR NAYAK (Neurosurgery)
  if (day >= 14 && day <= 17) {
    addDocIfNotPresent(
      DOCTORS[0],
      '12:30 PM - 02:00 PM (Morning Slots: 09:00 AM - 01:00 PM)',
      'Brain, Spine, Headache, Vertigo & Seizures Consultation'
    );
  }

  // 3. Every Friday: DR NILAMADHABA MAHALILK (Gastroenterology)
  if (weekday === 5) {
    addDocIfNotPresent(
      DOCTORS[1],
      '12:00 PM - 03:00 PM (Friday Speciality OPD)',
      'Gastroenterology, Hepatology & Liver Care'
    );
  }

  // 4. Every Saturday: Dr. Manabendra Dash & DR.JAGANNATH MAJHI
  if (weekday === 6) {
    addDocIfNotPresent(
      DOCTORS[2],
      '10:00 AM - 01:00 PM & 06:00 PM - 08:00 PM',
      'Dermatology, Skin, Laser & Hair Consultation'
    );
    const jagannath = DOCTORS.find((d) => d.id === '6ab385e175ffe');
    if (jagannath) {
      addDocIfNotPresent(jagannath, '06:00 PM - 08:30 PM', 'General Medicine OPD');
    }
  }

  // 5. Every Sunday: Dr. Manabendra Dash & Dr. Aditya Prasad Padhy
  if (weekday === 0) {
    addDocIfNotPresent(
      DOCTORS[2],
      '10:00 AM - 01:00 PM & 06:00 PM - 08:00 PM',
      'Sunday Dermatology & Laser Consultation'
    );
    const aditya = DOCTORS.find((d) => d.id === '6a9299efca332');
    if (aditya) {
      addDocIfNotPresent(aditya, '12:00 PM - 01:00 PM', 'Sunday Senior Specialist OPD');
    }
  }

  // 6. Monday & Wednesday: DR.DEEPAK NAIK & Dr. SIDHESWAR BASKEY
  if (weekday === 1 || weekday === 3) {
    const deepak = DOCTORS.find((d) => d.id === '6a926099bf67f');
    const baskey = DOCTORS.find((d) => d.id === '6a929b48cff95');
    if (deepak) addDocIfNotPresent(deepak, '10:00 AM - 01:30 PM', 'General & Internal Medicine OPD');
    if (baskey) addDocIfNotPresent(baskey, '04:30 PM - 07:30 PM', 'Orthopaedics, Bone & Joint OPD');
  }

  // 7. Tuesday & Thursday: Dr.Anjali Tudu, Dr. K.C.K.D.N. Hembram & DR.JAGANNATH MAJHI
  if (weekday === 2 || weekday === 4) {
    const anjali = DOCTORS.find((d) => d.id === '6a929bdad38b7');
    const hembram = DOCTORS.find((d) => d.id === '6a991705e2ff5');
    const jagannath = DOCTORS.find((d) => d.id === '6ab385e175ffe');
    if (anjali) addDocIfNotPresent(anjali, '10:30 AM - 01:30 PM', "Women's Health & Family Medicine");
    if (hembram) addDocIfNotPresent(hembram, '05:00 PM - 08:00 PM', 'General Physician & Chronic Care');
    if (jagannath) addDocIfNotPresent(jagannath, '06:00 PM - 08:30 PM', 'Multi-Speciality General OPD');
  }

  // 8. Daily Specialists (Mon - Sun): Dr. Purva Mohapatra & DR.K BERA
  const purva = DOCTORS.find((d) => d.id === '6a929917c2ce5');
  if (purva) {
    addDocIfNotPresent(purva, '12:00 PM - 02:00 PM (Daily OPD)', 'Obstetrics & Gynaecology Consultation');
  }
  addDocIfNotPresent(
    DOCTORS[3],
    '08:30 AM - 01:30 PM & 04:30 PM - 08:30 PM (Daily)',
    'Physiotherapy, Ortho & Paralysis Rehabilitation'
  );

  return doctorsOnDay;
}

export const PRODUCTS: Product[] = [
  // Physiotherapy items
  {
    id: 'physio-1',
    name: 'Orthopedic Hinged Knee Brace with Patella Ring',
    category: 'physio',
    isPhysio: true,
    price: 850,
    originalPrice: 1100,
    unit: '1 Unit',
    inStock: true,
    image: kneeBraceImg,
    description: 'Bilateral metal hinges provide maximum lateral support for ligament tears, osteoarthritis, and joint rehabilitation.'
  },
  {
    id: 'physio-2',
    name: 'Contoured Lumbar Sacral Back Support Belt',
    category: 'physio',
    isPhysio: true,
    price: 680,
    originalPrice: 890,
    unit: '1 Unit (Adjustable)',
    inStock: true,
    image: lumbarBeltImg,
    description: 'Double pull elastic mechanism with rigid splints for lower back pain, sciatica, and postural alignment.'
  },
  {
    id: 'physio-3',
    name: 'Multi-Temp Gel Hot & Cold Compression Pack',
    category: 'physio',
    isPhysio: true,
    price: 290,
    originalPrice: 380,
    unit: 'Pack of 1 with Sleeve',
    inStock: true,
    image: hotColdPackImg,
    description: 'Reusable non-toxic gel pad for microwave heating or freezer cooling. Fast relief for sprains, muscle soreness, and swelling.'
  },
  {
    id: 'physio-4',
    name: 'Resistance Therapy Loop Bands (Set of 5 Strengths)',
    category: 'physio',
    isPhysio: true,
    price: 450,
    originalPrice: 650,
    unit: 'Set of 5',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=600&q=80',
    description: 'Graduated latex resistance bands for physical therapy, knee/hip recovery, rotator cuff training, and home mobility.'
  },
  {
    id: 'physio-5',
    name: 'Soft Cervical Collar Neck Support',
    category: 'physio',
    isPhysio: true,
    price: 340,
    originalPrice: 420,
    unit: '1 Unit',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    description: 'High-density foam with cotton stockinette for neck spasms, cervical spondylosis, and whiplash support.'
  },
  
  // Pharmacy medicines & essentials
  {
    id: 'med-1',
    name: 'Digital Rapid Clinical Thermometer',
    category: 'medicines',
    price: 195,
    originalPrice: 250,
    unit: '1 Unit with Case',
    inStock: true,
    image: thermometerImg,
    description: 'Accurate 10-second oral/armpit temperature reading with beeper alert and fever indicator.'
  },
  {
    id: 'med-2',
    name: 'Pulse Oximeter Finger Sensor with OLED Display',
    category: 'medicines',
    price: 799,
    originalPrice: 1200,
    unit: '1 Device',
    inStock: true,
    image: pulseOximeterImg,
    description: 'Instant SpO2 oxygen saturation and pulse rate monitor with plethysmograph wave.'
  },
  {
    id: 'med-3',
    name: 'Vitamin C 500mg + Zinc Immunity Chewables',
    category: 'wellness',
    price: 140,
    originalPrice: 175,
    unit: 'Strip of 15 Tabs',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    description: 'Tangy orange flavor immunity booster for daily defense against seasonal cold and fatigue.'
  },
  {
    id: 'med-4',
    name: 'Gentle Baby Diaper Rash Zinc Oxide Cream',
    category: 'babycare',
    price: 165,
    originalPrice: 210,
    unit: '75g Tube',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    description: 'Dermatologist-tested protective moisture barrier enriched with almond oil and calendula.'
  },
  {
    id: 'med-5',
    name: 'Antiseptic Liquid Solution (Chlorhexidine + Cetrimide)',
    category: 'medicines',
    price: 110,
    originalPrice: 130,
    unit: '250ml Bottle',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80',
    description: 'For wound cleaning, skin disinfection, and household first-aid hygiene.'
  },
  {
    id: 'med-6',
    name: 'Vaporizing Steam Inhaler with Facial Mask',
    category: 'wellness',
    price: 360,
    originalPrice: 480,
    unit: '1 Set (3-in-1)',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=600&q=80',
    description: 'Warm steam inhalation for nasal congestion, throat irritation, and sinus discomfort relief.'
  }
];

export const PATHOLOGY_TESTS: PathologyTest[] = [
  { id: '1-3', name: 'COMPLETE BLOOD COUNT (CBC)', category: 'HAEMATOLOGY', price: 300, parameters: 'Hemoglobin, TLC, DLC, Platelet Count, RBC, Hct, MCV, MCH, MCHC' },
  { id: '19-7', name: 'CBC (WITH ABSOLUTE COUNTS)', category: 'HAEMATOLOGY', price: 500, parameters: 'Complete Blood Count with Absolute Neutrophil, Lymphocyte & Eosinophil Counts' },
  { id: '41-8', name: 'CBC WITH ESR', category: 'HAEMATOLOGY', price: 500, parameters: 'Complete Hemogram + Erythrocyte Sedimentation Rate (Wintrobe)' },
  { id: '69-6', name: 'LIVER FUNCTION TEST (LFT)', category: 'BIOCHEMISTRY', price: 500, parameters: 'Bilirubin (Total/Direct/Indirect), SGOT, SGPT, Alkaline Phosphatase, Total Protein, Albumin, A/G Ratio' },
  { id: '79-10', name: 'KIDNEY FUNCTION TEST (KFT)', category: 'BIOCHEMISTRY', price: 900, parameters: 'BUN, Serum Urea, Serum Creatinine, Uric Acid, Sodium, Potassium, Chloride' },
  { id: '88-11', name: 'LIPID PROFILE', category: 'BIOCHEMISTRY', price: 500, parameters: 'Total Cholesterol, Triglycerides, HDL, LDL, VLDL, Cholesterol Ratios' },
  { id: '104-13', name: 'THYROID FUNCTION TEST (TFT)', category: 'ENDOCRINOLOGY', price: 700, parameters: 'T3, T4 & Thyroid-Stimulating Hormone (TSH)' },
  { id: '107-14', name: 'FREE THYROID FUNCTION TEST (FTFT)', category: 'ENDOCRINOLOGY', price: 800, parameters: 'Free T3 (FT3), Free T4 (FT4) & Ultra-sensitive TSH' },
  { id: '243-64', name: 'FASTING BLOOD SUGAR (FBS)', category: 'BIOCHEMISTRY', price: 50, parameters: 'Fasting Plasma Glucose Evaluation' },
  { id: '244-65', name: 'BLOOD SUGAR (PPBS)', category: 'BIOCHEMISTRY', price: 50, parameters: 'Post-Prandial Blood Glucose Evaluation' },
  { id: '264-85', name: 'RANDOM BLOOD SUGAR (RBS)', category: 'BIOCHEMISTRY', price: 50, parameters: 'Instant Capillary / Venous Blood Glucose' },
  { id: '266-87', name: 'HbA1c (GLYCOSYLATED HEMOGLOBIN)', category: 'BIOCHEMISTRY', price: 500, parameters: '3-Month Average Blood Sugar Control Marker' },
  { id: '271-91', name: '25 HYDROXY (OH) VITAMIN D', category: 'BIOCHEMISTRY', price: 1200, parameters: 'Total 25-(OH) Vitamin D Bone & Immunity Assay' },
  { id: '349-121', name: 'VITAMIN B12', category: 'BIOCHEMISTRY', price: 1000, parameters: 'Serum Cyanocobalamin Nerve & Red Cell Assay' },
  { id: '210-35', name: 'THYROID-STIMULATING HORMONE (TSH)', category: 'ENDOCRINOLOGY', price: 400, parameters: 'Primary Thyroid Screening Hormone' },
  { id: '346-120', name: 'FT4, TSH', category: 'ENDOCRINOLOGY', price: 400, parameters: 'Free Thyroxine + Thyroid Stimulating Hormone' },
  { id: '110-15', name: 'FSH, LH, PRL (HORMONE PANEL)', category: 'ENDOCRINOLOGY', price: 1500, parameters: 'Follicle Stimulating Hormone, Luteinising Hormone & Prolactin' },
  { id: '151-19', name: 'URINE ROUTINE EXAMINATION', category: 'CLINICAL PATHOLOGY', price: 100, parameters: 'Physical, Chemical & Microscopic Urine Analysis' },
  { id: '132-18', name: 'STOOL ROUTINE EXAMINATION', category: 'MICROBIOLOGY', price: 100, parameters: 'Physical, Microscopic, Ova/Cyst & Cellular Exudates' },
  { id: '181-21', name: 'HEMOGLOBIN (Hb)', category: 'HAEMATOLOGY', price: 50, parameters: 'Blood Hemoglobin Level (g/dL)' },
  { id: '197-28', name: 'BLOOD GROUP & RH TYPING', category: 'HAEMATOLOGY', price: 100, parameters: 'ABO & Rh Factor Grouping' },
  { id: '195-26', name: 'PLATELET COUNT', category: 'HAEMATOLOGY', price: 250, parameters: 'Total Thrombocyte Count' },
  { id: '201-31', name: 'MALARIA PARASITE (CARD TEST)', category: 'HAEMATOLOGY', price: 150, parameters: 'Rapid Pf / Pv Malaria Antigen Detection' },
  { id: '113-16', name: 'WIDAL TEST (SLIDE METHOD)', category: 'SEROLOGY & IMMUNOLOGY', price: 200, parameters: 'Typhoid Fever Agglutination Screening' },
  { id: '231-54', name: 'DENGUE (CARD METHOD)', category: 'SEROLOGY & IMMUNOLOGY', price: 600, parameters: 'Dengue NS1 Antigen & IgG/IgM Antibody Rapid Test' },
  { id: '7604-624', name: 'SCRUB TYPHUS', category: 'SEROLOGY & IMMUNOLOGY', price: 800, parameters: 'Scrub Typhus IgM / Rapid Serology' },
  { id: '228-51', name: 'C-REACTIVE PROTEIN, CRP (QUANTITATIVE)', category: 'SEROLOGY & IMMUNOLOGY', price: 350, parameters: 'Inflammation & Infection Marker' },
  { id: '226-49', name: 'RHEUMATOID FACTOR, RA (QUANTITATIVE)', category: 'SEROLOGY & IMMUNOLOGY', price: 350, parameters: 'Arthritis & Autoimmune Joint Screening' },
  { id: '241-62', name: 'SERUM CREATININE', category: 'BIOCHEMISTRY', price: 250, parameters: 'Renal Filtration Marker' },
  { id: '242-63', name: 'SERUM UREA', category: 'BIOCHEMISTRY', price: 250, parameters: 'Blood Urea Nitrogen Evaluation' },
  { id: '248-69', name: 'SERUM URIC ACID', category: 'BIOCHEMISTRY', price: 250, parameters: 'Gout & Joint Crystal Screening' },
  { id: '256-77', name: 'SERUM ELECTROLYTE (SODIUM, POTASSIUM)', category: 'BIOCHEMISTRY', price: 400, parameters: 'Na+ & K+ Electrolyte Balance' },
  { id: '262-83', name: 'SERUM CALCIUM', category: 'BIOCHEMISTRY', price: 400, parameters: 'Total Serum Calcium' },
  { id: '276-96', name: 'TROPONIN I (CARDIAC MARKER)', category: 'CARDIOLOGY', price: 1200, parameters: 'Rapid Cardiac Muscle Injury Biomarker' },
  { id: '235-56', name: 'FREE PSA (PROSTATE SPECIFIC ANTIGEN)', category: 'OTHERS', price: 1000, parameters: 'Prostate Health Screening' },
  { id: '279-99', name: 'CA 125', category: 'OTHERS', price: 900, parameters: 'Ovarian & Women Wellness Biomarker' },
];

export const DEFAULT_SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: 'offer-master-patho',
    badge: '🔥 LIMITED TIME PATHOLOGY OFFER',
    title: 'Complete Full Body Blood Profile Package',
    subtitle: 'CBC + LFT + KFT + Lipid Profile + Fasting Blood Sugar + Thyroid (TSH)',
    description: 'Get 6 essential diagnostic panels tested at Life Care Medicine Store and Poly Clinic Pathology Lab with home sample collection option and same-day digital reports.',
    discountText: 'FLAT 25% OFF',
    validUntil: 'Valid all month at Life Care Poly Clinic',
    category: 'pathology',
    promoCode: 'LIFECARE25',
    originalPrice: 2650,
    offerPrice: 1999,
  },
  {
    id: 'offer-diabetes-camp',
    badge: '🧪 DIABETES & THYROID CARE',
    title: 'HbA1c + Fasting & PP Blood Sugar + Lipid Profile',
    subtitle: 'Complete Diabetes & Heart Risk Monitoring Package',
    description: 'Recommended for diabetic & blood pressure patients. Includes free Blood Pressure & BMI checkup at the clinic reception.',
    discountText: 'SAVE ₹250',
    validUntil: 'Every Morning 7:00 AM - 11:00 AM',
    category: 'pathology',
    promoCode: 'SUGARCARE',
    originalPrice: 1100,
    offerPrice: 850,
  },
  {
    id: 'offer-physio-rehab',
    badge: '🦵 PHYSIOTHERAPY & PAIN RELIEF OFFER',
    title: '7-Day Physiotherapy & Pain Management Package',
    subtitle: 'With Dr. K. Bera (Back Pain, Knee Pain, Spondylitis & Stroke Rehab)',
    description: 'Book a 7-day continuous electrotherapy, ultrasound therapy, and guided rehabilitation package with special discount on orthopedic belts & braces.',
    discountText: '20% OFF PACKAGE',
    validUntil: 'Available Daily at Physiotherapy Centre',
    category: 'doctor',
    promoCode: 'PHYSIO20',
  },
  {
    id: 'offer-pharmacy-store',
    badge: '💊 MEDICINE STORE SPECIAL',
    title: 'Up to 15% OFF on Prescription Medicines & Braces',
    subtitle: '100% Genuine Medicines, Vitamins & Orthopedic Supports',
    description: 'Show this special offer notification at the Life Care Medicine Counter or inquire via WhatsApp for instant discount on your bill.',
    discountText: 'UP TO 15% OFF',
    validUntil: 'Open Daily 8:00 AM - 10:00 PM',
    category: 'pharmacy',
    promoCode: 'LIFECARE15',
  },
];
