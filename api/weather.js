// 예시: /api/weather?stn=108&from=20251101&to=20251106
// 실제 사용하는 API 스펙에 맞게 엔드포인트/파라미터를 조정하세요.
export default async function handler(req, res) {
  try {
    const { stn = '108', from = '', to = '' } = req.query;
    const key = process.env.SERVICE_KEY_KMA;
    if(!key) return res.status(500).json({ error: '서버 환경변수(SERVICE_KEY_KMA) 미설정' });

    // 실제 사용 중인 기상청 OpenAPI 엔드포인트로 교체하세요.
    const endpoint = 'https://apihub.kma.go.kr/api/typ01/url/fctyHourly';
    const url = `${endpoint}?stnIds=${encodeURIComponent(stn)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&dataType=JSON&serviceKey=${encodeURIComponent(key)}`;

    const r = await fetch(url);
    if(!r.ok) return res.status(r.status).json({ error:`Upstream HTTP ${r.status}` });
    const j = await r.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(j);
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
