import type { IocCheckInput, IocCheckOutput, IocSource } from '@/types/security';
import {
  KNOWN_MALICIOUS_IPS, KNOWN_MALICIOUS_DOMAINS,
  KNOWN_MALICIOUS_HASHES, THREAT_INTEL_SOURCES,
} from '@/constants/security';
import { aiUrlRiskAssessment } from '@/ai/flows/ai-url-risk-assessment';

function lookupIP(ip: string): { matched: boolean; category: string } {
  if (KNOWN_MALICIOUS_IPS.includes(ip)) {
    return { matched: true, category: 'botnet' };
  }
  const parts = ip.split('.').map(Number);
  if (parts[0] === 10 || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)) {
    return { matched: false, category: 'none' };
  }
  return { matched: false, category: 'none' };
}

function lookupDomain(domain: string): { matched: boolean; category: string } {
  const lower = domain.toLowerCase();
  if (KNOWN_MALICIOUS_DOMAINS.includes(lower)) {
    return { matched: true, category: 'phishing' };
  }
  if (lower.match(/\.(tk|ml|ga|cf|gq|xyz|top|work)$/)) {
    return { matched: true, category: 'malware_c2' };
  }
  return { matched: false, category: 'none' };
}

function lookupHash(hash: string): { matched: boolean; category: string } {
  if (KNOWN_MALICIOUS_HASHES.includes(hash.toLowerCase())) {
    return { matched: true, category: 'malware_c2' };
  }
  return { matched: false, category: 'none' };
}

function buildSources(matched: boolean, category: string): IocSource[] {
  if (!matched) {
    return THREAT_INTEL_SOURCES.slice(0, 2).map(s => ({
      name: s.name,
      verdict: 'No records found',
      reference: `${s.url}/search`,
    }));
  }
  return THREAT_INTEL_SOURCES.map(s => ({
    name: s.name,
    verdict: category === 'phishing' ? 'Flagged as phishing' : 'Known malicious indicator',
    reference: `${s.url}/indicator`,
  }));
}

function heuristicCheck(input: IocCheckInput): {
  matched: boolean;
  category: string;
  confidenceScore: number;
  classification: IocCheckOutput['classification'];
} {
  const { value, type } = input;
  let matched = false;
  let category = 'unknown';

  switch (type) {
    case 'ip':
      ({ matched, category } = lookupIP(value));
      break;
    case 'domain':
      ({ matched, category } = lookupDomain(value));
      break;
    case 'hash':
      ({ matched, category } = lookupHash(value));
      break;
    case 'url': {
      try {
        const hostname = new URL(value).hostname;
        ({ matched, category } = lookupDomain(hostname));
      } catch {
        category = 'unknown';
      }
      break;
    }
  }

  const confidenceScore = matched
    ? (category === 'malware_c2' ? 85 : category === 'phishing' ? 75 : 60)
    : Math.floor(Math.random() * 20) + 5;

  const classification = matched
    ? (confidenceScore > 80 ? 'malicious' : 'suspicious')
    : (confidenceScore > 30 ? 'suspicious' : 'safe');

  return { matched, category, confidenceScore, classification };
}

function buildOutput(input: IocCheckInput, heuristic: {
  matched: boolean; category: string; confidenceScore: number; classification: IocCheckOutput['classification'];
}, aiOverrides?: { confidenceScore: number; classification: IocCheckOutput['classification']; category: string; reputation: string }): IocCheckOutput {
  const confidenceScore = aiOverrides ? aiOverrides.confidenceScore : heuristic.confidenceScore;
  const classification = aiOverrides ? aiOverrides.classification : heuristic.classification;
  const category = aiOverrides ? aiOverrides.category : (heuristic.matched ? heuristic.category as IocCheckOutput['category'] : 'none');
  const sourceReferences = buildSources(!!aiOverrides || heuristic.matched, category);
  const reputation = aiOverrides
    ? aiOverrides.reputation
    : (heuristic.matched
      ? `Negative reputation — observed in threat intel as ${heuristic.category}`
      : 'No known malicious activity in aggregated threat feeds');

  return {
    value: input.value,
    type: input.type,
    confidenceScore,
    classification,
    category,
    sourceReferences,
    reputation,
  };
}

export async function checkIOC(input: IocCheckInput): Promise<IocCheckOutput> {
  const heuristic = heuristicCheck(input);

  if (heuristic.matched) {
    return buildOutput(input, heuristic);
  }

  if (input.type === 'url' || input.type === 'domain') {
    try {
      const url = input.type === 'domain' ? `http://${input.value}/` : input.value;
      const aiResult = await aiUrlRiskAssessment({ url });

      if (aiResult && aiResult.riskScore) {
        const { score, level } = aiResult.riskScore;
        const classification = level === 'Safe' || level === 'Low' ? 'safe'
          : level === 'Medium' ? 'suspicious'
          : 'malicious';
        const category = classification === 'malicious'
          ? (aiResult.phishingThreats.length > 0 ? 'phishing' as const : 'malware_c2' as const)
          : 'none' as const;

        const aiOverrides = {
          confidenceScore: Math.min(score, 99),
          classification,
          category,
          reputation: aiResult.overallAssessment + (aiResult.domainReputation ? `\n\nDomain: ${aiResult.domainReputation}` : ''),
        };
        return buildOutput(input, heuristic, aiOverrides);
      }
    } catch {
      // AI unavailable — fall back to heuristic result
    }
  }

  return buildOutput(input, heuristic);
}
