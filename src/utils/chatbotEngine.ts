import type { ChatbotConfig, ChatbotFAQ } from '../types/cms';

export interface ChatbotMatchResult {
  matched: boolean;
  faq?: ChatbotFAQ;
  response: string;
  confidence: number;
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'of', 'to', 'in',
  'for', 'with', 'about', 'can', 'you', 'tell', 'me', 'what', 'are', 'how',
  'do', 'i', 'please', 'details', 'info', 'information'
]);

export function tokenizeQuery(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export function scoreFaqMatch(query: string, faq: ChatbotFAQ): number {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return 0;

  // Exact or near-exact question match
  const normalizedQuestion = faq.question.toLowerCase();
  if (normalizedQuestion === normalizedQuery) return 100;
  if (normalizedQuestion.includes(normalizedQuery) && normalizedQuery.length >= 4) {
    return 85;
  }

  let score = 0;
  const queryTokens = tokenizeQuery(normalizedQuery);

  // Keyword hits (high weight)
  for (const kw of faq.keywords) {
    const cleanKw = kw.toLowerCase().trim();
    if (!cleanKw) continue;
    if (normalizedQuery.includes(cleanKw)) {
      score += cleanKw.includes(' ') ? 30 : 20;
    } else {
      for (const qt of queryTokens) {
        if (cleanKw.includes(qt) || qt.includes(cleanKw)) {
          score += 10;
        }
      }
    }
  }

  // Question token overlap
  const questionTokens = tokenizeQuery(normalizedQuestion);
  for (const qt of queryTokens) {
    if (questionTokens.includes(qt)) {
      score += 12;
    }
  }

  // Category overlap
  const categoryTokens = tokenizeQuery(faq.category);
  for (const qt of queryTokens) {
    if (categoryTokens.includes(qt)) {
      score += 8;
    }
  }

  return score;
}

export function resolveChatbotReply(
  query: string,
  config: ChatbotConfig,
  officialContact: { phone: string; email: string; address: string; workingHours: string }
): ChatbotMatchResult {
  const enabledFaqs = config.faqs.filter((f) => f.enabled);
  const trimmed = query.trim();

  if (!trimmed) {
    return {
      matched: false,
      confidence: 0,
      response: config.welcomeMessage,
    };
  }

  // Greeting check
  if (/^(hi|hello|hey|namaste|good morning|good afternoon|good evening)\b/i.test(trimmed)) {
    return {
      matched: true,
      confidence: 1,
      response: `${config.welcomeMessage} You can ask about B.Pharmacy admissions, eligibility, departments, campus facilities, or contact details.`,
    };
  }

  let bestFaq: ChatbotFAQ | undefined;
  let bestScore = 0;

  for (const faq of enabledFaqs) {
    const score = scoreFaqMatch(trimmed, faq);
    if (score > bestScore) {
      bestScore = score;
      bestFaq = faq;
    }
  }

  if (bestFaq && bestScore >= 16) {
    return {
      matched: true,
      faq: bestFaq,
      confidence: Math.min(1, bestScore / 100),
      response: bestFaq.answer,
    };
  }

  const fallback =
    config.fallbackMessage ||
    `I could not find a verified answer to that specific question in our institutional knowledge base. Please reach out to our college office directly for accurate assistance.`;

  return {
    matched: false,
    confidence: 0,
    response: `${fallback}\n\nOfficial Contact:\n• Phone: ${officialContact.phone}\n• Email: ${officialContact.email}\n• Hours: ${officialContact.workingHours}\n• Campus: ${officialContact.address}`,
  };
}
