const ADMIN_PW = 'takumasou0623';
const NEWS_KEY = 'news_items';

// CORS設定
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  // OPTIONSリクエスト（プリフライト）への対応
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // GET: お知らせ一覧取得
  if (request.method === 'GET') {
    try {
      const raw = await env.KEIBA_NEWS.get(NEWS_KEY);
      const items = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify(items), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }
  }

  // POST: お知らせの追加・更新・削除
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { action, password, item, index } = body;

      // パスワード検証
      if (password !== ADMIN_PW) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
      }

      const raw = await env.KEIBA_NEWS.get(NEWS_KEY);
      let items = raw ? JSON.parse(raw) : [];

      if (action === 'add') {
        // 先頭に追加
        items.unshift({
          date: item.date,
          text: item.text,
          url: item.url || '',
          hidden: false,
        });
      } else if (action === 'delete') {
        items.splice(index, 1);
      } else if (action === 'toggle') {
        if (items[index]) items[index].hidden = !items[index].hidden;
      }

      await env.KEIBA_NEWS.put(NEWS_KEY, JSON.stringify(items));
      return new Response(JSON.stringify({ ok: true, items }), {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
