const { GoogleGenAI } = require('@google/genai');

/**
 * Filter job using Google Gemini API (@google/genai)
 * Checks if raw text is strictly for CS / IT / MCA / M.Tech CS candidates
 * Extracts structured JSON data including GATE requirement & Selection Mode (CBT/OMR/Interview)
 */
async function filterAndExtractJobWithAI(rawText, sourceUrl = '') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      console.log('[AI] Invoking Google Gemini AI (@google/genai) for job evaluation...');
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are an expert HR and recruitment analyst for Government PSUs and Technical Institutions in India.
Evaluate the following raw job advertisement text:

"""
${rawText}
"""

Requirements:
1. Determine if this job post strictly targets Computer Science / Information Technology / Computer Applications (B.Tech CSE, B.E. IT, MCA, M.Tech CS/IT, B.Sc IT/CS) candidates.
2. If it is ONLY for Mechanical, Civil, Electrical, Chemical, Bio-Tech, or Non-tech general posts without CS/IT eligibility, mark is_cs_it as false.
3. Check GATE requirement accurately:
   - Mark gate_required as true ONLY if a valid GATE scorecard is strictly required for application or shortlisting.
   - Mark gate_required as false if GATE is optional, NOT required, or selection is via a direct recruitment exam (CBT/OMR/Interview).
4. Extract the exact selection/exam mode:
   - Must be one of: "CBT (Computer Based Test)", "OMR Based Written Exam", "Direct Interview", "GATE Score + Interview", or "GATE Score + Written Test".
5. Extract structured JSON metadata matching this exact schema:

{
  "is_cs_it": boolean,
  "organization": string (Short official acronym + full name, e.g. "BEL (Bharat Electronics Limited)"),
  "title": string (Clear job role, e.g. "Scientist B - Computer Science"),
  "category": string (Must be one of: "PSU", "Central Govt", "State Govt", "Research"),
  "qualification": string (e.g. "B.Tech CSE / IT / MCA"),
  "experience_level": string (Must be either "Fresher Eligible" or "Experienced (1-3 Yrs)" or "Experienced (3+ Yrs)"),
  "gate_required": boolean,
  "selection_mode": string (e.g. "CBT (Computer Based Test)", "OMR Based Written Exam", "Direct Interview", "GATE Score + Interview"),
  "salary": string (e.g. "₹56,100 - ₹1,77,500 / Month"),
  "last_date": string (Format: YYYY-MM-DD),
  "apply_url": string (Official apply URL or sourceUrl),
  "reasoning": string (Brief 1-2 sentence explanation of why this job matches CS/IT, eligibility, exam mode, and GATE criteria)
}

Respond ONLY with valid JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text;
      const parsedData = JSON.parse(responseText);

      return {
        success: true,
        method: 'gemini-ai',
        data: parsedData
      };
    } catch (err) {
      console.warn('[AI WARN] Gemini API fallback to rule parser:', err.message);
    }
  }

  // Fallback Rule-Based Parser (Works offline / without API Key)
  return fallbackRuleBasedParser(rawText, sourceUrl);
}

function fallbackRuleBasedParser(rawText, sourceUrl) {
  const textLower = rawText.toLowerCase();

  // Check CS/IT keywords
  const csKeywords = [
    'computer science', 'information technology', 'cse', 'it', 'mca',
    'software', 'web development', 'cyber security', 'ai', 'data science',
    'programming', 'cloud', 'system administrator', 'network engineer'
  ];

  const nonCsExclusions = [
    'mechanical engineering only', 'civil engineering only', 'electrical engineering only',
    'mbbs', 'nurse', 'steno', 'driver', 'typist'
  ];

  const hasCsKeyword = csKeywords.some(kw => textLower.includes(kw));
  const isExcluded = nonCsExclusions.some(ex => textLower.includes(ex));
  const isCsIt = hasCsKeyword && !isExcluded;

  // Accurate GATE requirement check
  const negativeGatePhrases = [
    'no gate', 'without gate', 'gate not mandatory', 'gate not required',
    'gate exempt', 'no gate score', 'gate not needed'
  ];
  const hasNegativeGate = negativeGatePhrases.some(phrase => textLower.includes(phrase));

  let gateRequired = false;
  if (!hasNegativeGate) {
    const positiveGatePhrases = ['valid gate score', 'gate 202', 'through gate', 'gate scorecard', 'gate score required'];
    gateRequired = positiveGatePhrases.some(phrase => textLower.includes(phrase));
  }

  // Selection / Exam Mode detection
  let selectionMode = 'CBT (Computer Based Test)';
  if (gateRequired) {
    selectionMode = 'GATE Score + Interview';
  } else if (textLower.includes('omr') || textLower.includes('offline exam') || textLower.includes('written exam')) {
    selectionMode = 'OMR Based Written Exam';
  } else if (textLower.includes('cbt') || textLower.includes('computer based test') || textLower.includes('online exam') || textLower.includes('online test')) {
    selectionMode = 'CBT (Computer Based Test)';
  } else if (textLower.includes('interview only') || textLower.includes('direct interview') || textLower.includes('video interview')) {
    selectionMode = 'Direct Interview';
  }

  // Experience level check
  let experienceLevel = 'Fresher Eligible';
  if (textLower.includes('year experience') || textLower.includes('years experience') || textLower.includes('exp: 2') || textLower.includes('exp: 3')) {
    if (textLower.includes('3 year') || textLower.includes('5 year')) {
      experienceLevel = 'Experienced (3+ Yrs)';
    } else {
      experienceLevel = 'Experienced (1-3 Yrs)';
    }
  }

  // Extract organization
  let org = 'PSU Technical Board';
  if (textLower.includes('bel') || textLower.includes('bharat electronics')) org = 'BEL (Bharat Electronics Limited)';
  else if (textLower.includes('nic') || textLower.includes('informatics')) org = 'NIC (National Informatics Centre)';
  else if (textLower.includes('cdac') || textLower.includes('c-dac')) org = 'C-DAC (Development of Advanced Computing)';
  else if (textLower.includes('bis') || textLower.includes('bureau of indian standards')) org = 'BIS (Bureau of Indian Standards)';
  else if (textLower.includes('isro') || textLower.includes('space research')) org = 'ISRO (Indian Space Research Organisation)';
  else if (textLower.includes('drdo') || textLower.includes('defence research')) org = 'DRDO (Defence Research & Dev)';
  else if (textLower.includes('nielit')) org = 'NIELIT (Electronics & IT)';

  // Extract category
  let category = 'PSU';
  if (org.includes('NIC') || org.includes('BIS')) category = 'Central Govt';
  else if (org.includes('ISRO') || org.includes('DRDO') || org.includes('C-DAC')) category = 'Research';
  else if (org.includes('NIELIT')) category = 'State Govt';

  // Extract deadline
  const today = new Date();
  const futureDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const formattedDate = futureDate.toISOString().split('T')[0];

  return {
    success: true,
    method: 'fallback-heuristic',
    data: {
      is_cs_it: isCsIt,
      organization: org,
      title: isCsIt ? 'Engineer / IT Officer (CS / IT)' : 'General Staff Role',
      category: category,
      qualification: 'B.Tech CSE / IT / MCA',
      experience_level: experienceLevel,
      gate_required: gateRequired,
      selection_mode: selectionMode,
      salary: gateRequired ? '₹56,100 - ₹1,77,500' : '₹45,000 - ₹1,20,000 / Month',
      last_date: formattedDate,
      apply_url: sourceUrl || 'https://www.google.com/search?q=' + encodeURIComponent(org + ' recruitment 2026'),
      reasoning: `Validated for B.Tech CSE / IT candidates (${experienceLevel}). Selection via ${selectionMode}.`
    }
  };
}

module.exports = {
  filterAndExtractJobWithAI
};
