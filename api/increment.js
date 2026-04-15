export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const r = await fetch('https://api.counterapi.dev/v1/workspace/3553/increment', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ut_5u62Rp5GB4XBCQzXSha3T9SYihOk2phO4imEK9EA'
      }
    });

    const data = await r.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'fail' });
  }
}