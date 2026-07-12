import type { RiskBand } from "@/lib/egress";

// Deterministic, fully-typed UI dictionary. Fixed interface strings are
// translated here (testable, no hallucination); only free-text operator input
// and AI narration flow through Gemini. Six languages spanning the FIFA 2026
// host regions and travelling fanbases, including Arabic (RTL) and Hindi.

export const LOCALES = ["en", "es", "pt", "fr", "ar", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export interface LocaleMeta {
  code: Locale;
  label: string;
  dir: "ltr" | "rtl";
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { code: "en", label: "English", dir: "ltr" },
  es: { code: "es", label: "Español", dir: "ltr" },
  pt: { code: "pt", label: "Português", dir: "ltr" },
  fr: { code: "fr", label: "Français", dir: "ltr" },
  ar: { code: "ar", label: "العربية", dir: "rtl" },
  hi: { code: "hi", label: "हिन्दी", dir: "ltr" },
};

export type MessageKey =
  | "tagline"
  | "commandTitle"
  | "commandPlaceholder"
  | "analyse"
  | "analysing"
  | "venue"
  | "language"
  | "theme"
  | "peakDensity"
  | "clearance"
  | "diversions"
  | "before"
  | "after"
  | "mapTitle"
  | "gatesTitle"
  | "ordersTitle"
  | "forecastTitle"
  | "queue"
  | "clearsIn"
  | "notWithin"
  | "closed"
  | "open"
  | "mapHint"
  | "balanced"
  | "gemini"
  | "deterministic"
  | "min"
  | "people"
  | "reset"
  | "error"
  | "tryLabel"
  | "riskSafe"
  | "riskComfortable"
  | "riskModerate"
  | "riskRestricted"
  | "riskDangerous"
  | "riskCritical";

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en: {
    tagline: "Predictive crowd-egress console",
    commandTitle: "What's happening on the ground?",
    commandPlaceholder: "e.g. Gate south just closed, 5 minutes to full-time",
    analyse: "Analyse",
    analysing: "Analysing",
    venue: "Venue",
    language: "Language",
    theme: "Theme",
    peakDensity: "Peak density",
    clearance: "Clearance",
    diversions: "Diversions",
    before: "Before",
    after: "After",
    mapTitle: "Gate map",
    gatesTitle: "Gate status",
    ordersTitle: "Steward orders",
    forecastTitle: "Density forecast",
    queue: "Queue",
    clearsIn: "Clears in",
    notWithin: "Not cleared in forecast",
    closed: "Closed",
    open: "Open",
    mapHint: "Select a gate to close or reopen it",
    balanced: "Plan balanced — no diversions needed",
    gemini: "Answered by Gemini",
    deterministic: "Deterministic engine",
    min: "min",
    people: "people",
    reset: "Reset",
    error: "Something went wrong. Please try again.",
    tryLabel: "Try",
    riskSafe: "Safe",
    riskComfortable: "Comfortable",
    riskModerate: "Moderate",
    riskRestricted: "Restricted",
    riskDangerous: "Dangerous",
    riskCritical: "Critical",
  },
  es: {
    tagline: "Consola predictiva de evacuación de multitudes",
    commandTitle: "¿Qué está pasando sobre el terreno?",
    commandPlaceholder: "ej. La puerta sur se cerró, 5 minutos para el final",
    analyse: "Analizar",
    analysing: "Analizando",
    venue: "Recinto",
    language: "Idioma",
    theme: "Tema",
    peakDensity: "Densidad máxima",
    clearance: "Evacuación",
    diversions: "Desvíos",
    before: "Antes",
    after: "Después",
    mapTitle: "Mapa de puertas",
    gatesTitle: "Estado de las puertas",
    ordersTitle: "Órdenes para acomodadores",
    forecastTitle: "Pronóstico de densidad",
    queue: "Cola",
    clearsIn: "Se despeja en",
    notWithin: "No se despeja en el pronóstico",
    closed: "Cerrada",
    open: "Abierta",
    mapHint: "Selecciona una puerta para cerrarla o reabrirla",
    balanced: "Plan equilibrado — sin desvíos necesarios",
    gemini: "Respondido por Gemini",
    deterministic: "Motor determinista",
    min: "min",
    people: "personas",
    reset: "Reiniciar",
    error: "Algo salió mal. Inténtalo de nuevo.",
    tryLabel: "Prueba",
    riskSafe: "Seguro",
    riskComfortable: "Cómodo",
    riskModerate: "Moderado",
    riskRestricted: "Restringido",
    riskDangerous: "Peligroso",
    riskCritical: "Crítico",
  },
  pt: {
    tagline: "Console preditivo de evacuação de multidões",
    commandTitle: "O que está a acontecer no terreno?",
    commandPlaceholder: "ex. O portão sul fechou, 5 minutos para o fim",
    analyse: "Analisar",
    analysing: "A analisar",
    venue: "Recinto",
    language: "Idioma",
    theme: "Tema",
    peakDensity: "Densidade máxima",
    clearance: "Evacuação",
    diversions: "Desvios",
    before: "Antes",
    after: "Depois",
    mapTitle: "Mapa de portões",
    gatesTitle: "Estado dos portões",
    ordersTitle: "Ordens para assistentes",
    forecastTitle: "Previsão de densidade",
    queue: "Fila",
    clearsIn: "Esvazia em",
    notWithin: "Não esvazia na previsão",
    closed: "Fechado",
    open: "Aberto",
    mapHint: "Selecione um portão para fechar ou reabrir",
    balanced: "Plano equilibrado — sem desvios necessários",
    gemini: "Respondido pelo Gemini",
    deterministic: "Motor determinístico",
    min: "min",
    people: "pessoas",
    reset: "Repor",
    error: "Algo correu mal. Tente novamente.",
    tryLabel: "Experimente",
    riskSafe: "Seguro",
    riskComfortable: "Confortável",
    riskModerate: "Moderado",
    riskRestricted: "Restrito",
    riskDangerous: "Perigoso",
    riskCritical: "Crítico",
  },
  fr: {
    tagline: "Console prédictive d'évacuation des foules",
    commandTitle: "Que se passe-t-il sur le terrain ?",
    commandPlaceholder: "ex. La porte sud vient de fermer, 5 minutes avant la fin",
    analyse: "Analyser",
    analysing: "Analyse",
    venue: "Site",
    language: "Langue",
    theme: "Thème",
    peakDensity: "Densité maximale",
    clearance: "Évacuation",
    diversions: "Déviations",
    before: "Avant",
    after: "Après",
    mapTitle: "Plan des portes",
    gatesTitle: "État des portes",
    ordersTitle: "Consignes aux stadiers",
    forecastTitle: "Prévision de densité",
    queue: "File",
    clearsIn: "Se vide en",
    notWithin: "Non évacué dans la prévision",
    closed: "Fermée",
    open: "Ouverte",
    mapHint: "Sélectionnez une porte pour la fermer ou la rouvrir",
    balanced: "Plan équilibré — aucune déviation nécessaire",
    gemini: "Répondu par Gemini",
    deterministic: "Moteur déterministe",
    min: "min",
    people: "personnes",
    reset: "Réinitialiser",
    error: "Une erreur s'est produite. Réessayez.",
    tryLabel: "Essayez",
    riskSafe: "Sûr",
    riskComfortable: "Confortable",
    riskModerate: "Modéré",
    riskRestricted: "Restreint",
    riskDangerous: "Dangereux",
    riskCritical: "Critique",
  },
  ar: {
    tagline: "لوحة تنبؤية لإخلاء الحشود",
    commandTitle: "ماذا يحدث على أرض الملعب؟",
    commandPlaceholder: "مثال: أُغلقت البوابة الجنوبية، خمس دقائق على النهاية",
    analyse: "تحليل",
    analysing: "جارٍ التحليل",
    venue: "الملعب",
    language: "اللغة",
    theme: "المظهر",
    peakDensity: "ذروة الكثافة",
    clearance: "الإخلاء",
    diversions: "التحويلات",
    before: "قبل",
    after: "بعد",
    mapTitle: "خريطة البوابات",
    gatesTitle: "حالة البوابات",
    ordersTitle: "تعليمات المنظمين",
    forecastTitle: "توقع الكثافة",
    queue: "الطابور",
    clearsIn: "يُخلى خلال",
    notWithin: "لا يُخلى ضمن التوقع",
    closed: "مغلقة",
    open: "مفتوحة",
    mapHint: "اختر بوابة لإغلاقها أو إعادة فتحها",
    balanced: "الخطة متوازنة — لا حاجة إلى تحويلات",
    gemini: "بواسطة Gemini",
    deterministic: "محرك حتمي",
    min: "دقيقة",
    people: "شخص",
    reset: "إعادة تعيين",
    error: "حدث خطأ ما. حاول مرة أخرى.",
    tryLabel: "جرّب",
    riskSafe: "آمن",
    riskComfortable: "مريح",
    riskModerate: "متوسط",
    riskRestricted: "مقيّد",
    riskDangerous: "خطير",
    riskCritical: "حرج",
  },
  hi: {
    tagline: "भीड़ निकासी पूर्वानुमान कंसोल",
    commandTitle: "मैदान पर क्या हो रहा है?",
    commandPlaceholder: "उदा. दक्षिण गेट अभी बंद हुआ, पूर्ण समय में 5 मिनट",
    analyse: "विश्लेषण करें",
    analysing: "विश्लेषण हो रहा है",
    venue: "स्थल",
    language: "भाषा",
    theme: "थीम",
    peakDensity: "अधिकतम घनत्व",
    clearance: "निकासी",
    diversions: "मार्ग परिवर्तन",
    before: "पहले",
    after: "बाद",
    mapTitle: "गेट मानचित्र",
    gatesTitle: "गेट स्थिति",
    ordersTitle: "स्टीवर्ड आदेश",
    forecastTitle: "घनत्व पूर्वानुमान",
    queue: "कतार",
    clearsIn: "खाली होगा",
    notWithin: "पूर्वानुमान में खाली नहीं",
    closed: "बंद",
    open: "खुला",
    mapHint: "बंद या फिर से खोलने के लिए गेट चुनें",
    balanced: "योजना संतुलित — मार्ग परिवर्तन आवश्यक नहीं",
    gemini: "Gemini द्वारा उत्तर",
    deterministic: "नियतात्मक इंजन",
    min: "मिनट",
    people: "लोग",
    reset: "रीसेट",
    error: "कुछ गड़बड़ हो गई। पुनः प्रयास करें।",
    tryLabel: "आज़माएँ",
    riskSafe: "सुरक्षित",
    riskComfortable: "आरामदायक",
    riskModerate: "मध्यम",
    riskRestricted: "सीमित",
    riskDangerous: "खतरनाक",
    riskCritical: "गंभीर",
  },
};

/** Demonstration prompts for the command bar, one set per locale. */
export const EXAMPLES: Record<Locale, string[]> = {
  en: ["Gate south just closed", "Surge building at gate east", "5 minutes to full-time"],
  es: ["La puerta sur se cerró", "Aglomeración en la puerta este", "5 minutos para el final"],
  pt: ["O portão sul fechou", "Multidão a crescer no portão este", "5 minutos para o fim"],
  fr: ["La porte sud vient de fermer", "Affluence à la porte est", "5 minutes avant la fin"],
  ar: ["أُغلقت البوابة الجنوبية", "ازدحام عند البوابة الشرقية", "خمس دقائق على النهاية"],
  hi: ["दक्षिण गेट बंद हुआ", "पूर्व गेट पर भीड़ बढ़ रही है", "पूर्ण समय में 5 मिनट"],
};

export function t(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale][key];
}

export function isRtl(locale: Locale): boolean {
  return LOCALE_META[locale].dir === "rtl";
}

/** Maps an engine risk band to its localised label key. */
export const RISK_BAND_KEY: Record<RiskBand, MessageKey> = {
  safe: "riskSafe",
  comfortable: "riskComfortable",
  moderate: "riskModerate",
  restricted: "riskRestricted",
  dangerous: "riskDangerous",
  critical: "riskCritical",
};

/** Maps an engine risk band to its CSS colour custom-property. */
export const RISK_BAND_VAR: Record<RiskBand, string> = {
  safe: "--los-safe",
  comfortable: "--los-comfort",
  moderate: "--los-moderate",
  restricted: "--los-restricted",
  dangerous: "--los-danger",
  critical: "--los-critical",
};
