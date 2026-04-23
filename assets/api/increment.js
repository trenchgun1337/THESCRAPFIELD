export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const r = await fetch('https://api.counterapi.dev/v1/workspace/3553/increment', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.COUNTER_TOKEN}`
      }
    });

    // 🔥 garante que a resposta é válida
    if (!r.ok) {
      const text = await r.text();
      console.error('Counter API error:', text);

      return res.status(500).json({ value: null });
    }

    const data = await r.json();

    res.status(200).json({
      value: data.value ?? null
    });

  } catch (err) {
    console.error(err);

    // 🔥 nunca quebra o frontend
    res.status(200).json({
      value: null
    });
  }
}