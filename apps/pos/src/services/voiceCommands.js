/**
 * VoiceCommandParser — Hindi voice command parser for Ritam POS
 *
 * Parses spoken Hindi (or Hinglish) utterances into structured POS actions:
 * adding items, setting quantities, applying modifiers, and triggering
 * actions like bill, payment, print, clear, etc.
 *
 * Features:
 *  - Quantity extraction (एक, दो, तीन, etc.)
 *  - Product matching by Hindi name, English name, and transliterations
 *  - Fuzzy string matching (Levenshtein distance) for pronunciation variations
 *  - Modifier detection (एक्स्ट्रा चीज़, बटर, etc.)
 *  - Action command detection (बिल, पेमेंट, प्रिंट, etc.)
 *
 * @author Ritam OS
 */

// ─── Hindi → English action keywords ─────────────────────────────────────
const ACTION_KEYWORDS = [
  // Bill / Payment
  { keywords: ['बिल', 'बिल्ल'], action: 'bill' },
  { keywords: ['पेमेंट', 'पैसे', 'पे'], action: 'payment' },
  { keywords: ['कैश', 'नकद'], action: 'cash' },
  { keywords: ['यूपीआई', 'upi', 'फोनपे', 'गूगलपे', 'पेटीएम'], action: 'upi' },
  { keywords: ['कार्ड', 'कार्ड'], action: 'card' },

  // Print / KOT
  { keywords: ['प्रिंट', 'प्रिन्ट', 'प्रींट'], action: 'print' },
  { keywords: ['कोट', 'kot'], action: 'print' },

  // Clear / Remove
  { keywords: ['क्लियर', 'साफ', 'हटाओ', 'हटा दो', 'खाली'], action: 'clear' },

  // Stop listening
  { keywords: ['रोक', 'बंद', 'ठहरो', 'रुको'], action: 'stop' },
];

// ─── Quantity word mapping ───────────────────────────────────────────────
const QTY_MAP = {
  'एक': 1, 'एक्क': 1,
  'दो': 2,
  'तीन': 3, 'तीन': 3,
  'चार': 4,
  'पाँच': 5, 'पांच': 5, 'पाच': 5,
  'छह': 6, 'छ': 6,
  'सात': 7,
  'आठ': 8,
  'नौ': 9,
  'दस': 10,
};

// ─── Modifier Hindi → English mapping ────────────────────────────────────
const MODIFIER_KEYWORDS = [
  { hi: 'एक्स्ट्रा', en: 'Extra' },
  { hi: 'अतिरिक्त', en: 'Extra' },
  { hi: 'मसाला', en: 'Spicy' },
  { hi: 'तेज', en: 'Spicy' },
  { hi: 'कम', en: 'Less' },
  { hi: 'बटर', en: 'Butter' },
  { hi: 'चीज़', en: 'Cheese' },
  { hi: 'पनीर', en: 'Paneer' },
  { hi: 'ग्रेवी', en: 'Gravy' },
  { hi: 'ऑयल', en: 'Oil' },
];

// Known modifier name lookups: what a user says → actual modifier name
const MODIFIER_NAME_MAP = {
  'Extra': 'Extra',
  'Spicy': 'Extra Spicy',
  'Less': 'Less Oil',
  'Butter': 'Extra Butter',
  'Cheese': 'Extra Cheese',
  'Paneer': 'Extra Paneer',
  'Gravy': 'Extra Gravy',
  'Oil': 'Less Oil',
};

// ─── Hindi-to-English transliteration map for product name matching ──────
const TRANSLITERATION_MAP = {
  'पनीर': 'paneer', 'टिक्का': 'tikka', 'चिकन': 'chicken',
  'बटर': 'butter', 'दाल': 'dal', 'मखनी': 'makhani',
  'नान': 'naan', 'रोटी': 'roti', 'बिरयानी': 'biryani',
  'गार्लिक': 'garlic', 'समोसे': 'samosa', 'समोसा': 'samosa',
  'गुलाब': 'gulab', 'जामुन': 'jamun',
  'लस्सी': 'lassi', 'चाय': 'chai',
  'स्टार्टर': 'starter', 'मेन': 'main', 'कोर्स': 'course',
  'पालक': 'palak', 'करी': 'curry', 'तंदूरी': 'tandoori',
  'स्प्रिंग': 'spring', 'रोल्स': 'rolls', 'राइस': 'rice',
  'चावल': 'rice', 'जीरा': 'jeera', 'मिक्स': 'mix',
  'वेज': 'veg', 'चना': 'chana', 'मसाला': 'masala',
  'आइसक्रीम': 'icecream', 'खीर': 'kheer',
  'कोल्ड': 'cold', 'ड्रिंक': 'drink', 'नींबू': 'lime',
  'सोडा': 'soda', 'फ्रेश': 'fresh',
  'टुकड़े': 'pieces', 'सादा': 'plain', 'भुना': 'roasted',
};

// ─── Utility: Levenshtein distance ───────────────────────────────────────
function levenshteinDistance(a, b) {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = new Array(bn + 1);
  for (let i = 0; i <= bn; i++) {
    matrix[i] = new Array(an + 1);
    matrix[i][0] = i;
  }
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[bn][an];
}

/**
 * Compute string similarity as a value between 0 and 1.
 * 1 = identical, 0 = completely different.
 */
function stringSimilarity(a, b) {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(a, b);
  return 1 - dist / maxLen;
}

/**
 * Normalize a Hindi/English string for comparison:
 *  - Lowercase for English text
 *  - Remove extra whitespace
 *  - Strip common punctuation
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()\-\[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a spoken text "contains" a target product term, using:
 *  1. Exact substring match (fast path)
 *  2. Word-level fuzzy matching with configurable sensitivity
 */
function fuzzyContains(text, target, sensitivity = 0.7) {
  const nText = normalize(text);
  const nTarget = normalize(target);

  if (nTarget.length === 0) return false;

  // Fast path — exact substring match
  if (nText.includes(nTarget)) return true;

  // Word-level fuzzy match
  const textWords = nText.split(/\s+/);
  const targetWords = nTarget.split(/\s+/);

  // Each target word must match at least one text word
  for (const tw of targetWords) {
    if (tw.length < 2) continue; // skip very short words

    let found = false;
    for (const tw2 of textWords) {
      if (tw2.length < 2) continue;

      // Check if either word contains the other
      if (tw2.includes(tw) || tw.includes(tw2)) {
        found = true;
        break;
      }

      // Levenshtein similarity
      const sim = stringSimilarity(tw, tw2);
      if (sim >= sensitivity) {
        found = true;
        break;
      }
    }

    if (!found) return false;
  }

  return true;
}

// ─── VoiceCommandParser ──────────────────────────────────────────────────

export class VoiceCommandParser {
  /**
   * @param {Array} products — array of product objects with { id, name, nameHi, price, categoryId }
   * @param {Array} modifiersList — array of modifier objects with { id, name, price }
   * @param {number} sensitivity — fuzzy matching threshold (0–1), default 0.7
   */
  constructor(products = [], modifiersList = [], sensitivity = 0.7) {
    this.products = products;
    this.modifiersList = modifiersList;
    this.sensitivity = sensitivity;
    this.buildProductIndex();
  }

  /**
   * Build a searchable index of product names including:
   *  - English name
   *  - Hindi name (nameHi)
   *  - Transliterated versions (Hindi → English script)
   *  - Individual words from all of the above
   */
  buildProductIndex() {
    this.productIndex = this.products.map((p) => {
      const searchTerms = new Set();

      // English name
      if (p.name) {
        searchTerms.add(p.name.toLowerCase());
        p.name.toLowerCase().split(/\s+/).forEach((w) => {
          if (w.length > 1) searchTerms.add(w);
        });
      }

      // Hindi name
      if (p.nameHi) {
        searchTerms.add(p.nameHi.toLowerCase());
        p.nameHi.toLowerCase().split(/\s+/).forEach((w) => {
          if (w.length > 1) searchTerms.add(w);
        });
      }

      // Transliterations (Hindi word → English approximation)
      const transliterations = this.transliterate(p.nameHi);
      transliterations.forEach((t) => {
        searchTerms.add(t.toLowerCase());
        t.toLowerCase().split(/\s+/).forEach((w) => {
          if (w.length > 1) searchTerms.add(w);
        });
      });

      return {
        ...p,
        searchTerms: [...searchTerms].filter(Boolean),
      };
    });
  }

  /**
   * Transliterate a Hindi string into approximate English.
   * Uses known word mappings and falls back to character-level mapping.
   */
  transliterate(text) {
    if (!text) return [];
    const results = [];

    // Try the full transliteration map first
    const mapped = Object.entries(TRANSLITERATION_MAP)
      .filter(([hi]) => text.toLowerCase().includes(hi))
      .map(([, en]) => en);

    if (mapped.length > 0) {
      results.push(mapped.join(' '));
    }

    // Also generate the "raw" text as-is (for Devanagari matching)
    results.push(text);

    return [...new Set(results)];
  }

  /**
   * Set sensitivity after construction.
   */
  setSensitivity(value) {
    this.sensitivity = Math.max(0.3, Math.min(1, value));
  }

  /**
   * Parse a transcript string and return structured command data.
   *
   * @param {string} transcript — The spoken text from speech recognition
   * @returns {{ action: string|null, items: Array, quantity: number, modifiers: Array, modifierObjects: Array, isCommand: boolean, raw: string }}
   */
  parse(transcript) {
    const lower = transcript.toLowerCase().trim();
    const result = {
      action: null,
      items: [],
      quantity: 1,
      modifiers: [],
      modifierObjects: [],
      isCommand: false,
      raw: transcript,
    };

    if (!lower) return result;

    // ── Step 1: Extract quantity prefix ──
    let remaining = lower;
    const qtyPattern = new RegExp(
      '^(एक्क?|दो|तीन|चार|पाँच|पांच|पाच|छह|छ|सात|आठ|नौ|दस)\\s+'
    );
    const qtyMatch = remaining.match(qtyPattern);
    if (qtyMatch) {
      const qtyWord = qtyMatch[1];
      result.quantity = QTY_MAP[qtyWord] || 1;
      remaining = remaining.slice(qtyMatch[0].length).trim();
    }

    // Also check for "दो की" (two of)
    const doKiMatch = remaining.match(/^दो की\s+/);
    if (doKiMatch) {
      result.quantity = 2;
      remaining = remaining.slice(doKiMatch[0].length).trim();
    }

    // ── Step 2: Check action commands first (fast path) ──
    for (const { keywords, action } of ACTION_KEYWORDS) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          result.action = action;
          break;
        }
      }
      if (result.action) break;
    }

    // ── Step 3: Match products using fuzzy search ──
    const matchedProducts = new Set(); // avoid duplicates
    for (const product of this.productIndex) {
      for (const term of product.searchTerms) {
        if (fuzzyContains(remaining, term, this.sensitivity)) {
          matchedProducts.add(product.id);
          result.items.push(product);
          break;
        }
      }
    }

    // ── Step 4: Detect modifiers ──
    // Map Hindi modifier keywords to English modifier names
    const detectedModifierNames = new Set();
    for (const { hi, en } of MODIFIER_KEYWORDS) {
      if (remaining.includes(hi)) {
        const mappedName = MODIFIER_NAME_MAP[en] || en;
        detectedModifierNames.add(mappedName);
      }
    }

    result.modifiers = [...detectedModifierNames];

    // Map modifier names to actual modifier objects from the provided list
    if (result.modifiers.length > 0 && this.modifiersList.length > 0) {
      result.modifierObjects = result.modifiers
        .map((name) =>
          this.modifiersList.find(
            (m) => m.name.toLowerCase() === name.toLowerCase()
          )
        )
        .filter(Boolean);
    }

    // ── Step 5: Determine if this is a valid command ──
    result.isCommand = result.items.length > 0 || result.action !== null;

    return result;
  }
}
