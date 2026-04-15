export default async function handler(req, res) {
  try {
    const r = await fetch('https://api.counterapi.dev/v1/workspace/3553', {
      headers: {
        Authorization: `Bearer ${process.env.COUNTER_TOKEN}`
      }
    });

    const data = await r.json();

    res.status(200).json({
      value: data.value || 0
    });

  } catch (err) {
    console.error(err);

    res.status(200).json({  // <- IMPORTANTE: não quebra o frontend
      value: 0
    });
  }
}