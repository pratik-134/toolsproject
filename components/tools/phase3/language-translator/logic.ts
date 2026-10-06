/**
 * Domain Logic for In-Browser Language & Phrasal Translator
 * 100% Client-Side Privacy: All translation, heuristics, and phonetic mappings
 * execute in browser memory with zero network requests.
 */

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  detectedLang?: string;
  wordCount: number;
  charCount: number;
  matchedTokensCount: number;
  totalTokensCount: number;
  accuracyScore: number; // 0 to 100 percentage
  phoneticGuide?: string;
  tokens: Array<{
    original: string;
    translated: string;
    isExactMatch: boolean;
  }>;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "it", name: "Italian", nativeName: "Italiano", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", dir: "ltr" },
  { code: "ru", name: "Russian", nativeName: "Русский", dir: "ltr" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", dir: "ltr" },
  { code: "ja", name: "Japanese", nativeName: "日本語", dir: "ltr" },
  { code: "ko", name: "Korean", nativeName: "한국어", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", dir: "ltr" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", dir: "ltr" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr" },
  { code: "pl", name: "Polish", nativeName: "Polski", dir: "ltr" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", dir: "ltr" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", dir: "ltr" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", dir: "ltr" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", dir: "ltr" },
  { code: "cs", name: "Czech", nativeName: "Čeština", dir: "ltr" },
  { code: "he", name: "Hebrew", nativeName: "עברית", dir: "rtl" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", dir: "ltr" },
  { code: "th", name: "Thai", nativeName: "ไทย", dir: "ltr" },
  { code: "ro", name: "Romanian", nativeName: "Română", dir: "ltr" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", dir: "ltr" },
  { code: "da", name: "Danish", nativeName: "Dansk", dir: "ltr" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", dir: "ltr" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", dir: "ltr" },
  { code: "fa", name: "Persian", nativeName: "فارسی", dir: "rtl" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", dir: "ltr" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", dir: "ltr" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", dir: "ltr" },
];

/**
 * Universal Multilingual Core Lexicon & Phrases
 * Key: Canonical English token/phrase in lowercase
 */
interface LexiconEntry {
  en: string;
  es: string;
  fr: string;
  de: string;
  it: string;
  pt: string;
  nl: string;
  ru: string;
  zh: string;
  ja: string;
  hi: string;
  ar: string;
  pinyin?: string;
  romaji?: string;
}

export const PHRASE_LEXICON: LexiconEntry[] = [
  // Greetings & Conversational
  {
    en: "hello",
    es: "hola",
    fr: "bonjour",
    de: "hallo",
    it: "ciao",
    pt: "olá",
    nl: "hallo",
    ru: "здравствуйте",
    zh: "你好",
    ja: "こんにちは",
    hi: "नमस्ते",
    ar: "مرحبا",
    pinyin: "nǐ hǎo",
    romaji: "konnichiwa",
  },
  {
    en: "welcome",
    es: "bienvenido",
    fr: "bienvenue",
    de: "willkommen",
    it: "benvenuto",
    pt: "bem-vindo",
    nl: "welkom",
    ru: "добро пожаловать",
    zh: "欢迎",
    ja: "ようこそ",
    hi: "स्वागत है",
    ar: "أهلاً بك",
    pinyin: "huān yíng",
    romaji: "yōkoso",
  },
  {
    en: "good morning",
    es: "buenos días",
    fr: "bonjour",
    de: "guten morgen",
    it: "buongiorno",
    pt: "bom dia",
    nl: "goedemorgen",
    ru: "доброе утро",
    zh: "早上好",
    ja: "おはようございます",
    hi: "शुभ प्रभात",
    ar: "صباح الخير",
    pinyin: "zǎo shang hǎo",
    romaji: "ohayō gozaimasu",
  },
  {
    en: "good evening",
    es: "buenas tardes",
    fr: "bonsoir",
    de: "guten abend",
    it: "buonasera",
    pt: "boa tarde",
    nl: "goedenavond",
    ru: "добрый вечер",
    zh: "晚上好",
    ja: "こんばんは",
    hi: "शुभ संध्या",
    ar: "مساء الخير",
    pinyin: "wǎn shang hǎo",
    romaji: "konbanwa",
  },
  {
    en: "good night",
    es: "buenas noches",
    fr: "bonne nuit",
    de: "gute nacht",
    it: "buonanotte",
    pt: "boa noite",
    nl: "goedenacht",
    ru: "спокойной ночи",
    zh: "晚安",
    ja: "おやすみなさい",
    hi: "शुभ रात्रि",
    ar: "تصبح على خير",
    pinyin: "wǎn'ān",
    romaji: "oyasuminasai",
  },
  {
    en: "goodbye",
    es: "adiós",
    fr: "au revoir",
    de: "auf wiedersehen",
    it: "arrivederci",
    pt: "adeus",
    nl: "tot ziens",
    ru: "до свидания",
    zh: "再见",
    ja: "さようなら",
    hi: "अलविदा",
    ar: "وداعا",
    pinyin: "zài jiàn",
    romaji: "sayōnara",
  },
  {
    en: "thank you",
    es: "gracias",
    fr: "merci",
    de: "danke",
    it: "grazie",
    pt: "obrigado",
    nl: "dank u",
    ru: "спасибо",
    zh: "谢谢",
    ja: "ありがとう",
    hi: "धन्यवाद",
    ar: "شكرا لك",
    pinyin: "xiè xie",
    romaji: "arigatō",
  },
  {
    en: "thank you very much",
    es: "muchas gracias",
    fr: "merci beaucoup",
    de: "vielen dank",
    it: "grazie mille",
    pt: "muito obrigado",
    nl: "hartelijk dank",
    ru: "большое спасибо",
    zh: "非常感谢",
    ja: "どうもありがとうございます",
    hi: "बहुत बहुत धन्यवाद",
    ar: "شكرا جزيلا",
    pinyin: "fēi cháng xiè xiè",
    romaji: "dōmo arigatō gozaimasu",
  },
  {
    en: "please",
    es: "por favor",
    fr: "s'il vous plaît",
    de: "bitte",
    it: "per favore",
    pt: "por favor",
    nl: "alstublieft",
    ru: "пожалуйста",
    zh: "请",
    ja: "お願いします",
    hi: "कृपया",
    ar: "من فضلك",
    pinyin: "qǐng",
    romaji: "onegaishimasu",
  },
  {
    en: "yes",
    es: "sí",
    fr: "oui",
    de: "ja",
    it: "sì",
    pt: "sim",
    nl: "ja",
    ru: "да",
    zh: "是",
    ja: "はい",
    hi: "हाँ",
    ar: "نعم",
    pinyin: "shì",
    romaji: "hai",
  },
  {
    en: "no",
    es: "no",
    fr: "non",
    de: "nein",
    it: "no",
    pt: "não",
    nl: "nee",
    ru: "нет",
    zh: "不",
    ja: "いいえ",
    hi: "नहीं",
    ar: "لا",
    pinyin: "bù",
    romaji: "iie",
  },
  {
    en: "how are you",
    es: "¿cómo estás?",
    fr: "comment allez-vous?",
    de: "wie geht es dir?",
    it: "come stai?",
    pt: "como você está?",
    nl: "hoe gaat het?",
    ru: "как дела?",
    zh: "你好吗？",
    ja: "お元気ですか？",
    hi: "आप कैसे हैं?",
    ar: "كيف حالك؟",
    pinyin: "nǐ hǎo ma?",
    romaji: "o-genki desu ka?",
  },
  {
    en: "i am fine",
    es: "estoy bien",
    fr: "je vais bien",
    de: "mir geht es gut",
    it: "sto bene",
    pt: "estou bem",
    nl: "het gaat goed met mij",
    ru: "я в порядке",
    zh: "我很好",
    ja: "元気です",
    hi: "मैं ठीक हूँ",
    ar: "أنا بخير",
    pinyin: "wǒ hěn hǎo",
    romaji: "genki desu",
  },
  {
    en: "sorry",
    es: "lo siento",
    fr: "désolé",
    de: "entschuldigung",
    it: "scusa",
    pt: "desculpe",
    nl: "het spijt me",
    ru: "извините",
    zh: "对不起",
    ja: "すみません",
    hi: "क्षमा करें",
    ar: "آسف",
    pinyin: "duì bu qǐ",
    romaji: "sumimasen",
  },
  {
    en: "excuse me",
    es: "disculpe",
    fr: "excusez-moi",
    de: "entschuldigen sie",
    it: "mi scusi",
    pt: "com licença",
    nl: "pardon",
    ru: "простите",
    zh: "不好意思",
    ja: "失礼します",
    hi: "माफ़ कीजिये",
    ar: "عذرا",
    pinyin: "bù hǎo yì si",
    romaji: "shitsurei shimasu",
  },

  // Tech, Professional & Privacy
  {
    en: "privacy",
    es: "privacidad",
    fr: "confidentialité",
    de: "datenschutz",
    it: "privacy",
    pt: "privacidade",
    nl: "privacy",
    ru: "конфиденциальность",
    zh: "隐私",
    ja: "プライバシー",
    hi: "गोपनीयता",
    ar: "الخصوصية",
    pinyin: "yǐn sī",
    romaji: "puraibashī",
  },
  {
    en: "security",
    es: "seguridad",
    fr: "sécurité",
    de: "sicherheit",
    it: "sicurezza",
    pt: "segurança",
    nl: "veiligheid",
    ru: "безопасность",
    zh: "安全",
    ja: "セキュリティ",
    hi: "सुरक्षा",
    ar: "الأمان",
    pinyin: "ān quán",
    romaji: "sekyuriti",
  },
  {
    en: "privacy policy",
    es: "política de privacidad",
    fr: "politique de confidentialité",
    de: "datenschutzerklärung",
    it: "informativa sulla privacy",
    pt: "política de privacidade",
    nl: "privacybeleid",
    ru: "политика конфиденциальности",
    zh: "隐私政策",
    ja: "プライバシーポリシー",
    hi: "गोपनीयता नीति",
    ar: "سياسة الخصوصية",
    pinyin: "yǐn sī zhèng cè",
    romaji: "puraibashī porishī",
  },
  {
    en: "terms of service",
    es: "términos de servicio",
    fr: "conditions d'utilisation",
    de: "nutzungsbedingungen",
    it: "termini di servizio",
    pt: "termos de serviço",
    nl: "algemene voorwaarden",
    ru: "условия обслуживания",
    zh: "服务条款",
    ja: "利用規約",
    hi: "सेवा की शर्तें",
    ar: "شروط الخدمة",
    pinyin: "fú wù tiáo kuǎn",
    romaji: "riyō kiyaku",
  },
  {
    en: "artificial intelligence",
    es: "inteligencia artificial",
    fr: "intelligence artificielle",
    de: "künstliche intelligenz",
    it: "intelligenza artificiale",
    pt: "inteligência artificial",
    nl: "kunstmatige intelligentie",
    ru: "искусственный интеллект",
    zh: "人工智能",
    ja: "人工知能",
    hi: "कृत्रिम बुद्धिमत्ता",
    ar: "الذكاء الاصطناعي",
    pinyin: "rén gōng zhì néng",
    romaji: "jinkō chinō",
  },
  {
    en: "machine learning",
    es: "aprendizaje automático",
    fr: "apprentissage automatique",
    de: "maschinelles lernen",
    it: "apprendimento automatico",
    pt: "aprendizado de máquina",
    nl: "machinaal leren",
    ru: "машинное обучение",
    zh: "机器学习",
    ja: "機械学習",
    hi: "मशीन लर्निंग",
    ar: "تعلم الآلة",
    pinyin: "jī qì xué xí",
    romaji: "kikai gakushū",
  },
  {
    en: "open source",
    es: "código abierto",
    fr: "code source ouvert",
    de: "open source",
    it: "open source",
    pt: "código aberto",
    nl: "open source",
    ru: "открытый исходный код",
    zh: "开源",
    ja: "オープンソース",
    hi: "ओपन सोर्स",
    ar: "المصدر المفتوح",
    pinyin: "kāi yuán",
    romaji: "ōpun sōsu",
  },
  {
    en: "file",
    es: "archivo",
    fr: "fichier",
    de: "datei",
    it: "file",
    pt: "arquivo",
    nl: "bestand",
    ru: "файл",
    zh: "文件",
    ja: "ファイル",
    hi: "फ़ाइल",
    ar: "ملف",
    pinyin: "wén jiàn",
    romaji: "fairu",
  },
  {
    en: "document",
    es: "documento",
    fr: "document",
    de: "dokument",
    it: "documento",
    pt: "documento",
    nl: "document",
    ru: "документ",
    zh: "文档",
    ja: "ドキュメント",
    hi: "दस्तावेज़",
    ar: "وثيقة",
    pinyin: "wén dàng",
    romaji: "dokyumento",
  },
  {
    en: "password",
    es: "contraseña",
    fr: "mot de passe",
    de: "passwort",
    it: "password",
    pt: "senha",
    nl: "wachtwoord",
    ru: "пароль",
    zh: "密码",
    ja: "パスワード",
    hi: "पासवर्ड",
    ar: "كلمة المرور",
    pinyin: "mì mǎ",
    romaji: "pasuwādo",
  },
  {
    en: "developer",
    es: "desarrollador",
    fr: "développeur",
    de: "entwickler",
    it: "sviluppatore",
    pt: "desenvolvedor",
    nl: "ontwikkelaar",
    ru: "разработчик",
    zh: "开发者",
    ja: "開発者",
    hi: "डेवलपर",
    ar: "مطور",
    pinyin: "kāi fā zhě",
    romaji: "kaihatsusha",
  },
  {
    en: "project",
    es: "proyecto",
    fr: "projet",
    de: "projekt",
    it: "progetto",
    pt: "projeto",
    nl: "project",
    ru: "проект",
    zh: "项目",
    ja: "プロジェクト",
    hi: "परियोजना",
    ar: "مشروع",
    pinyin: "xiàng mù",
    romaji: "purojekuto",
  },
  {
    en: "tool",
    es: "herramienta",
    fr: "outil",
    de: "werkzeug",
    it: "strumento",
    pt: "ferramenta",
    nl: "gereedschap",
    ru: "инструмент",
    zh: "工具",
    ja: "ツール",
    hi: "उपकरण",
    ar: "أداة",
    pinyin: "gōng jù",
    romaji: "tsūru",
  },
  {
    en: "save",
    es: "guardar",
    fr: "enregistrer",
    de: "speichern",
    it: "salva",
    pt: "salvar",
    nl: "opslaan",
    ru: "сохранить",
    zh: "保存",
    ja: "保存",
    hi: "सहेजें",
    ar: "حفظ",
    pinyin: "bǎo cún",
    romaji: "hozon",
  },
  {
    en: "download",
    es: "descargar",
    fr: "télécharger",
    de: "herunterladen",
    it: "scarica",
    pt: "baixar",
    nl: "downloaden",
    ru: "скачать",
    zh: "下载",
    ja: "ダウンロード",
    hi: "डाउनलोड",
    ar: "تحميل",
    pinyin: "xià zǎi",
    romaji: "daunrōdo",
  },
  {
    en: "upload",
    es: "subir",
    fr: "téléverser",
    de: "hochladen",
    it: "carica",
    pt: "enviar",
    nl: "uploaden",
    ru: "загрузить",
    zh: "上传",
    ja: "アップロード",
    hi: "अपलोड",
    ar: "رفع",
    pinyin: "shàng chuán",
    romaji: "appurōdo",
  },
  {
    en: "delete",
    es: "eliminar",
    fr: "supprimer",
    de: "löschen",
    it: "elimina",
    pt: "excluir",
    nl: "verwijderen",
    ru: "удалить",
    zh: "删除",
    ja: "削除",
    hi: "हटाएं",
    ar: "حذف",
    pinyin: "shān chú",
    romaji: "sakujo",
  },
  {
    en: "search",
    es: "buscar",
    fr: "rechercher",
    de: "suchen",
    it: "cerca",
    pt: "pesquisar",
    nl: "zoeken",
    ru: "поиск",
    zh: "搜索",
    ja: "検索",
    hi: "खोज",
    ar: "بحث",
    pinyin: "sōu suǒ",
    romaji: "kensaku",
  },
  {
    en: "cancel",
    es: "cancelar",
    fr: "annuler",
    de: "abbrechen",
    it: "annulla",
    pt: "cancelar",
    nl: "annuleren",
    ru: "отмена",
    zh: "取消",
    ja: "キャンセル",
    hi: "रद्द करें",
    ar: "إلغاء",
    pinyin: "qǔ xiāo",
    romaji: "kyanseru",
  },
  {
    en: "help",
    es: "ayuda",
    fr: "aide",
    de: "hilfe",
    it: "aiuto",
    pt: "ajuda",
    nl: "hulp",
    ru: "помощь",
    zh: "帮助",
    ja: "ヘルプ",
    hi: "मदद",
    ar: "مساعدة",
    pinyin: "bāng zhù",
    romaji: "herupu",
  },

  // Everyday Common Nouns & Verbs
  {
    en: "friend",
    es: "amigo",
    fr: "ami",
    de: "freund",
    it: "amico",
    pt: "amigo",
    nl: "vriend",
    ru: "друг",
    zh: "朋友",
    ja: "友達",
    hi: "मित्र",
    ar: "صديق",
    pinyin: "péng you",
    romaji: "tomodachi",
  },
  {
    en: "family",
    es: "familia",
    fr: "famille",
    de: "familie",
    it: "famiglia",
    pt: "família",
    nl: "familie",
    ru: "семья",
    zh: "家庭",
    ja: "家族",
    hi: "परिवार",
    ar: "عائلة",
    pinyin: "jiā tíng",
    romaji: "kazoku",
  },
  {
    en: "work",
    es: "trabajo",
    fr: "travail",
    de: "arbeit",
    it: "lavoro",
    pt: "trabalho",
    nl: "werk",
    ru: "работа",
    zh: "工作",
    ja: "仕事",
    hi: "काम",
    ar: "عمل",
    pinyin: "gōng zuò",
    romaji: "shigoto",
  },
  {
    en: "home",
    es: "hogar",
    fr: "maison",
    de: "zuhause",
    it: "casa",
    pt: "casa",
    nl: "thuis",
    ru: "дом",
    zh: "家",
    ja: "家",
    hi: "घर",
    ar: "منزل",
    pinyin: "jiā",
    romaji: "ie",
  },
  {
    en: "water",
    es: "agua",
    fr: "eau",
    de: "wasser",
    it: "acqua",
    pt: "água",
    nl: "water",
    ru: "вода",
    zh: "水",
    ja: "水",
    hi: "पानी",
    ar: "ماء",
    pinyin: "shuǐ",
    romaji: "mizu",
  },
  {
    en: "food",
    es: "comida",
    fr: "nourriture",
    de: "essen",
    it: "cibo",
    pt: "comida",
    nl: "eten",
    ru: "еда",
    zh: "食物",
    ja: "食べ物",
    hi: "भोजन",
    ar: "طعام",
    pinyin: "shí wù",
    romaji: "tabemono",
  },
  {
    en: "time",
    es: "tiempo",
    fr: "temps",
    de: "zeit",
    it: "tempo",
    pt: "tempo",
    nl: "tijd",
    ru: "время",
    zh: "时间",
    ja: "時間",
    hi: "समय",
    ar: "وقت",
    pinyin: "shí jiān",
    romaji: "jikan",
  },
  {
    en: "day",
    es: "día",
    fr: "jour",
    de: "tag",
    it: "giorno",
    pt: "dia",
    nl: "dag",
    ru: "день",
    zh: "天",
    ja: "日",
    hi: "दिन",
    ar: "يوم",
    pinyin: "tiān",
    romaji: "hi",
  },
  {
    en: "world",
    es: "mundo",
    fr: "monde",
    de: "welt",
    it: "mondo",
    pt: "mundo",
    nl: "wereld",
    ru: "мир",
    zh: "世界",
    ja: "世界",
    hi: "संसार",
    ar: "عالم",
    pinyin: "shì jiè",
    romaji: "sekai",
  },
  {
    en: "love",
    es: "amor",
    fr: "amour",
    de: "liebe",
    it: "amore",
    pt: "amor",
    nl: "liefde",
    ru: "любовь",
    zh: "爱",
    ja: "愛",
    hi: "प्यार",
    ar: "حب",
    pinyin: "ài",
    romaji: "ai",
  },
  {
    en: "peace",
    es: "paz",
    fr: "paix",
    de: "frieden",
    it: "pace",
    pt: "paz",
    nl: "vrede",
    ru: "мир",
    zh: "和平",
    ja: "平和",
    hi: "शांति",
    ar: "سلام",
    pinyin: "hé píng",
    romaji: "heiwa",
  },
  {
    en: "success",
    es: "éxito",
    fr: "succès",
    de: "erfolg",
    it: "successo",
    pt: "sucesso",
    nl: "succes",
    ru: "успех",
    zh: "成功",
    ja: "成功",
    hi: "सफलता",
    ar: "نجاح",
    pinyin: "chéng gōng",
    romaji: "seikō",
  },
];

/**
 * Stopwords map for fast language heuristic detection
 */
const LANGUAGE_STOPWORDS: Record<string, string[]> = {
  es: ["de", "la", "que", "el", "en", "y", "a", "los", "se", "del", "las", "por", "un", "para", "con", "no", "una", "su", "al", "lo", "como", "más", "pero", "sus", "le", "ya", "o", "este", "sí", "porque", "esta", "entre", "cuando", "muy", "sin", "sobre", "también", "me", "hasta", "hay", "donde", "quien", "desde", "todo", "nos", "durante", "todos", "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "e", "esto", "mí", "antes", "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto", "esa", "estos", "mucho", "quienes", "nada", "muchos", "cual", "poco", "ella", "estar", "estas", "algunas", "algo", "nosotros", "mi", "mis", "tú", "te", "ti", "tu", "tus", "ellas", "nosotras", "vosostros", "vosostras", "os", "mío", "mía", "míos", "mías", "tuyo", "tuya", "tuyos", "tuyas", "suyo", "suya", "suyos", "suyas", "nuestro", "nuestra", "nuestros", "nuestras", "vuestro", "vuestra", "vuestros", "vuestras", "esos", "esas", "estoy", "estás", "está", "estamos", "estáis", "están", "esté", "estés", "estemos", "estéis", "estén", "estaré", "estarás", "estará", "estaremos", "estaréis", "estarán", "estaría", "estarías", "estaríamos", "estaríais", "estarían", "estaba", "estabas", "estábamos", "estabais", "estaban", "estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron", "estuviera", "estuvieras", "estuviéramos", "estuvierais", "estuvieran", "estuviese", "estuvieses", "estuviésemos", "estuvieseis", "estuviesen", "estando", "estado", "estada", "estados", "estadas", "estad"],
  fr: ["de", "la", "le", "et", "les", "des", "en", "un", "du", "une", "que", "est", "pour", "qui", "dans", "ce", "il", "par", "sur", "pas", "plus", "au", "avec", "ne", "se", "sont", "son", "sa", "ses", "mais", "comme", "ou", "si", "leur", "y", "cette", "ont", "aux", "tout", "nous", "vous", "faire", "lui", "même", "ces", "sans", "peut", "deux", "elle", "après", "bien", "mon", "ma", "mes", "ton", "ta", "tes", "notre", "votre", "leurs"],
  de: ["der", "die", "und", "in", "den", "von", "zu", "das", "mit", "sich", "des", "auf", "für", "ist", "im", "dem", "nicht", "ein", "eine", "als", "auch", "es", "an", "werden", "aus", "er", "hat", "dass", "sie", "nach", "wird", "bei", "einer", "um", "am", "sind", "noch", "wie", "einem", "über", "einen", "so", "zum", "war", "haben", "nur", "oder", "aber", "vor", "zur", "bis", "mehr", "durch", "man", "sein", "wurde", "sei"],
  it: ["di", "il", "che", "la", "in", "del", "da", "un", "ha", "per", "una", "in", "dei", "delle", "con", "sono", "le", "si", "della", "e", "non", "nel", "al", "ad", "degli", "gli", "alla", "sul", "dalla", "ai", "dall", "anche", "più", "nelle", "come", "alla", "agli", "ci", "questo", "sua", "suo", "nostro", "vostro"],
  pt: ["de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "é", "com", "não", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas", "foi", "ao", "ele", "das", "tem", "à", "seu", "sua", "ou", "ser", "quando", "muito", "nos", "já", "está", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem", "nas", "me", "esse", "eles", "estão", "você", "tinha", "foram", "essa", "num", "nem", "suas", "meu", "às", "minha", "têm", "numa", "pelos", "elas", "havia", "seja", "qual", "será", "nós", "tenho", "lhe", "deles", "essas", "esses", "pelas", "este", "fosse", "dele", "tu", "te", "vocês", "vos", "lhes", "meus", "minhas", "teu", "tua", "teus", "tuas", "nosso", "nossa", "nossos", "nossas"],
  nl: ["de", "van", "een", "en", "het", "in", "is", "op", "te", "dat", "die", "voor", "zijn", "niet", "met", "aan", "er", "als", "om", "ook", "naar", "omdat", "maar", "door", "over", "ze", "zich", "bij", "tot", "je", "dan", "wat", "uit", "nog", "wel", "zo", "geen", "gehad", "hebben", "worden"],
  en: ["the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me"],
};

/**
 * Detect script or language family from raw unicode text
 */
export function detectLanguage(text: string): { code: string; confidence: number } {
  if (!text || !text.trim()) {
    return { code: "en", confidence: 0 };
  }

  // 1. Script-based immediate classification
  if (/[\u4E00-\u9FFF]/.test(text)) {
    // Check for Hiragana/Katakana to distinguish Japanese from Chinese
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
      return { code: "ja", confidence: 95 };
    }
    return { code: "zh", confidence: 95 };
  }
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    return { code: "ja", confidence: 95 };
  }
  if (/[\u0900-\u097F]/.test(text)) {
    return { code: "hi", confidence: 95 };
  }
  if (/[\u0600-\u06FF]/.test(text)) {
    return { code: "ar", confidence: 95 };
  }
  if (/[\u0400-\u04FF]/.test(text)) {
    return { code: "ru", confidence: 95 };
  }

  // 2. Character-specific unique diacritics check
  const lower = text.toLowerCase();
  if (/[¿¡ñ]/.test(lower)) {
    return { code: "es", confidence: 90 };
  }
  if (/[ßäöü]/.test(lower)) {
    return { code: "de", confidence: 90 };
  }
  if (/[œçêë]/.test(lower)) {
    return { code: "fr", confidence: 85 };
  }
  if (/[ãõ]/.test(lower)) {
    return { code: "pt", confidence: 85 };
  }

  // 2b. Exact lexicon vocabulary matching
  const trimmedLower = lower.trim();
  for (const entry of PHRASE_LEXICON) {
    for (const lang of ["fr", "es", "de", "it", "pt", "nl", "ru", "zh", "ja", "hi", "ar"]) {
      const val = (entry as Record<string, any>)[lang]?.toLowerCase();
      if (val === trimmedLower) {
        return { code: lang, confidence: 95 };
      }
    }
  }

  // 3. Stopword frequency scoring for Latin script languages
  const words = lower.match(/\b[a-zà-ÿ]+\b/g) || [];
  if (words.length === 0) {
    return { code: "en", confidence: 50 };
  }

  const scores: Record<string, number> = { en: 0, es: 0, fr: 0, de: 0, it: 0, pt: 0, nl: 0 };
  for (const word of words) {
    for (const [lang, stopList] of Object.entries(LANGUAGE_STOPWORDS)) {
      if (stopList.includes(word)) {
        scores[lang] = (scores[lang] ?? 0) + 1;
      }
    }
  }

  let bestLang = "en";
  let maxScore = 0;
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestLang = lang;
    }
  }

  const confidence = words.length > 0 ? Math.min(95, Math.round((maxScore / words.length) * 100) + 30) : 50;
  return { code: bestLang, confidence };
}

/**
 * Case transfer helper: matches case format of original word
 */
function transferCase(original: string, translated: string): string {
  if (!translated || !original) return translated;
  if (original === original.toUpperCase() && original.length > 1) {
    return translated.toUpperCase();
  }
  const firstChar = original.charAt(0);
  if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  }
  return translated;
}

/**
 * Clean token of attached punctuation
 */
function stripPunctuation(raw: string): { prefix: string; word: string; suffix: string } {
  const match = raw.match(/^([^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF]*)(.*?)([^a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF]*)$/);
  if (!match) {
    return { prefix: "", word: raw, suffix: "" };
  }
  return {
    prefix: match[1] ?? "",
    word: match[2] ?? "",
    suffix: match[3] ?? "",
  };
}

/**
 * Core In-Browser Translation Engine
 */
export function translateText(
  sourceText: string,
  sourceLang: string,
  targetLang: string
): TranslationResult {
  const cleanInput = sourceText || "";
  let effectiveSource = sourceLang;
  let detectedLang: string | undefined = undefined;

  if (sourceLang === "auto" || !sourceLang) {
    const detected = detectLanguage(cleanInput);
    effectiveSource = detected.code;
    detectedLang = detected.code;
  }

  // Same language passthrough
  if (effectiveSource === targetLang || !cleanInput.trim()) {
    const rawTokens = cleanInput.trim() ? cleanInput.split(/\s+/) : [];
    return {
      sourceText: cleanInput,
      translatedText: cleanInput,
      sourceLang: effectiveSource,
      targetLang,
      detectedLang,
      wordCount: rawTokens.length,
      charCount: cleanInput.length,
      matchedTokensCount: rawTokens.length,
      totalTokensCount: rawTokens.length,
      accuracyScore: 100,
      tokens: rawTokens.map((t) => ({ original: t, translated: t, isExactMatch: true })),
    };
  }

  const normalizedInput = cleanInput.trim().toLowerCase();

  // 1. Check exact full-phrase match in lexicon
  const fullPhraseMatch = PHRASE_LEXICON.find((entry) => {
    const sourceVal = (entry as Record<string, any>)[effectiveSource]?.toLowerCase();
    return sourceVal === normalizedInput;
  });

  if (fullPhraseMatch) {
    const translatedVal = (fullPhraseMatch as Record<string, any>)[targetLang] || cleanInput;
    const finalFormatted = transferCase(cleanInput, translatedVal);
    const phonetic =
      targetLang === "zh"
        ? fullPhraseMatch.pinyin
        : targetLang === "ja"
        ? fullPhraseMatch.romaji
        : undefined;

    return {
      sourceText: cleanInput,
      translatedText: finalFormatted,
      sourceLang: effectiveSource,
      targetLang,
      detectedLang,
      wordCount: cleanInput.split(/\s+/).length,
      charCount: cleanInput.length,
      matchedTokensCount: cleanInput.split(/\s+/).length,
      totalTokensCount: cleanInput.split(/\s+/).length,
      accuracyScore: 98,
      phoneticGuide: phonetic,
      tokens: [
        {
          original: cleanInput,
          translated: finalFormatted,
          isExactMatch: true,
        },
      ],
    };
  }

  // 2. Multi-word phrase greedy scanning & tokenized translation
  let remainingText = cleanInput;
  const translatedPhrases: Array<{ original: string; translated: string; isExactMatch: boolean }> = [];

  // Sort phrases by longest match first
  const sortedLexicon = [...PHRASE_LEXICON].sort((a, b) => {
    const lenA = ((a as Record<string, any>)[effectiveSource] || "").length;
    const lenB = ((b as Record<string, any>)[effectiveSource] || "").length;
    return lenB - lenA;
  });

  // Try subphrase replacements
  for (const entry of sortedLexicon) {
    const sourcePhrase = (entry as Record<string, any>)[effectiveSource]?.toLowerCase();
    const targetPhrase = (entry as Record<string, any>)[targetLang];
    if (sourcePhrase && targetPhrase && sourcePhrase.includes(" ")) {
      const regex = new RegExp(`\\b${sourcePhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      if (regex.test(remainingText)) {
        remainingText = remainingText.replace(regex, `__PHRASE_${targetPhrase}__`);
      }
    }
  }

  // Tokenize words
  const rawWords = remainingText.split(/(\s+)/);
  let matchedTokens = 0;
  let totalWordTokens = 0;

  const resultSegments: string[] = [];

  for (const segment of rawWords) {
    if (/^\s+$/.test(segment) || !segment) {
      resultSegments.push(segment);
      continue;
    }

    // Check if it's a replaced multi-word phrase marker
    const phraseMarker = segment.match(/__PHRASE_(.*?)__/);
    if (phraseMarker && phraseMarker[1]) {
      const phraseTranslation = phraseMarker[1];
      resultSegments.push(phraseTranslation);
      translatedPhrases.push({
        original: segment,
        translated: phraseTranslation,
        isExactMatch: true,
      });
      matchedTokens += 2;
      totalWordTokens += 2;
      continue;
    }

    totalWordTokens++;
    const { prefix, word, suffix } = stripPunctuation(segment);
    if (!word) {
      resultSegments.push(segment);
      continue;
    }

    const lowerWord = word.toLowerCase();
    const matchedEntry = PHRASE_LEXICON.find((entry) => {
      const val = (entry as Record<string, any>)[effectiveSource]?.toLowerCase();
      return val === lowerWord;
    });

    if (matchedEntry && (matchedEntry as Record<string, any>)[targetLang]) {
      const translatedWord = (matchedEntry as Record<string, any>)[targetLang];
      const withCase = transferCase(word, translatedWord);
      resultSegments.push(`${prefix}${withCase}${suffix}`);
      matchedTokens++;
      translatedPhrases.push({
        original: word,
        translated: withCase,
        isExactMatch: true,
      });
    } else {
      // Retain original token if unknown in local lexicon
      resultSegments.push(segment);
      translatedPhrases.push({
        original: word,
        translated: word,
        isExactMatch: false,
      });
    }
  }

  const finalOutput = resultSegments.join("");
  const total = Math.max(1, totalWordTokens);
  const accuracy = Math.min(100, Math.round((matchedTokens / total) * 100));

  return {
    sourceText: cleanInput,
    translatedText: finalOutput,
    sourceLang: effectiveSource,
    targetLang,
    detectedLang,
    wordCount: totalWordTokens,
    charCount: cleanInput.length,
    matchedTokensCount: matchedTokens,
    totalTokensCount: totalWordTokens,
    accuracyScore: accuracy,
    tokens: translatedPhrases,
  };
}

/**
 * Phonetic romanization converter helper
 */
export function getLanguageMetadata(code: string): SupportedLanguage | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}
