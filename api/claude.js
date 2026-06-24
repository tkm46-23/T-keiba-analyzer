export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'web-search-2025-03-05',
  };

  try {
    // フロントからのリクエストにweb_searchツールを追加してAnthropicへ送信
    const body = {
      ...req.body,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    // web_searchのtool_useがあれば、tool_resultを送り返して最終回答を取得
    const hasToolUse = data.content && data.content.some(b => b.type === 'tool_use');
    if (hasToolUse) {
      // ツール呼び出し結果を組み立てて続きを取得
      const toolResults = data.content
        .filter(b => b.type === 'tool_use')
        .map(b => ({
          type: 'tool_result',
          tool_use_id: b.id,
          content: b.input && b.input.results
            ? JSON.stringify(b.input.results)
            : '検索結果なし',
        }));

      const followUp = {
        model: body.model,
        max_tokens: body.max_tokens || 1500,
        system: body.system,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [
          ...( body.messages || []),
          { role: 'assistant', content: data.content },
          { role: 'user', content: toolResults },
        ],
      };

      const r2 = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify(followUp),
      });
      const d2 = await r2.json();
      if (!r2.ok) return res.status(r2.status).json(d2);
      return res.status(200).json(d2);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
