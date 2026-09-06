/**
 * OpenRouter API integration for research, structured text extraction, and executive commentary.
 */

export function getOpenRouterKey() {
  return sessionStorage.getItem('openrouter_api_key') || '';
}

export function setOpenRouterKey(key) {
  if (key) sessionStorage.setItem('openrouter_api_key', key.trim());
  else sessionStorage.removeItem('openrouter_api_key');
}

export async function fetchTextResearch(ticker, companyName) {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new Error('OpenRouter API key required for neural text research.');
  }

  const prompt = `Perform recent material earnings and news research for ${companyName} (${ticker}). Summarize recent earnings results, revenue growth, operating margins, supply chain developments, and material management commentary. Return factual findings with source titles, URLs and dates.`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'GenAI Finance Terminal'
    },
    body: JSON.stringify({
      model: 'perplexity/sonar',
      messages: [
        { role: 'system', content: 'You are an institutional financial research assistant providing factual, source-grounded earnings intelligence.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter research API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  return content;
}

export async function extractStructuredSentiment(researchText, ticker) {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new Error('OpenRouter API key required for structured extraction.');
  }

  const schema = {
    type: 'object',
    properties: {
      ticker: { type: 'string' },
      positive_phrases: {
        type: 'array',
        items: { type: 'string' }
      },
      negative_phrases: {
        type: 'array',
        items: { type: 'string' }
      },
      evidence_summary: { type: 'string' },
      sources: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            url: { type: 'string' },
            date: { type: 'string' }
          },
          required: ['title', 'url', 'date'],
          additionalProperties: false
        }
      }
    },
    required: ['ticker', 'positive_phrases', 'negative_phrases', 'evidence_summary', 'sources'],
    additionalProperties: false
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'GenAI Finance Terminal'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-5',
      messages: [
        {
          role: 'system',
          content: 'Extract structured sentiment phrases and sources from the supplied research text. Adhere strictly to the requested JSON schema.'
        },
        {
          role: 'user',
          content: `Ticker: ${ticker}\nResearch Text:\n${researchText}`
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'sentiment_extraction',
          strict: true,
          schema: schema
        }
      },
      temperature: 0.0
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter extraction error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const rawJson = data.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(rawJson);
  return parsed;
}

export async function generateExecutiveCommentary(reviewSurface) {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new Error('OpenRouter API key required for executive commentary generation.');
  }

  const schema = {
    type: 'object',
    properties: {
      executive_overview: { type: 'string' },
      main_supporting_signals: {
        type: 'array',
        items: { type: 'string' }
      },
      main_portfolio_risks: {
        type: 'array',
        items: { type: 'string' }
      },
      concentration_risks: { type: 'string' },
      data_limitations: { type: 'string' },
      rebalancing_considerations: { type: 'string' },
      challenge_questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            response: { type: 'string' }
          },
          required: ['question', 'response'],
          additionalProperties: false
        }
      }
    },
    required: [
      'executive_overview',
      'main_supporting_signals',
      'main_portfolio_risks',
      'concentration_risks',
      'data_limitations',
      'rebalancing_considerations',
      'challenge_questions'
    ],
    additionalProperties: false
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'GenAI Finance Terminal'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-5',
      messages: [
        {
          role: 'system',
          content: 'You are a senior investment committee strategist reviewing portfolio quantitative evidence. Generate professional executive commentary adhering strictly to the JSON schema.'
        },
        {
          role: 'user',
          content: `Review Surface Data:\n${JSON.stringify(reviewSurface, null, 2)}`
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'executive_commentary',
          strict: true,
          schema: schema
        }
      },
      temperature: 0.1
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter commentary error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content || '{}');
}
