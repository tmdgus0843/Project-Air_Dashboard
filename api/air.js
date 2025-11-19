// Vercel Serverless Function (Node runtime)
// 요청 예: /api/air?station=종로구&rows=24
export default async function handler(req, res) {
  try {
    const { station = '', rows = '24' } = req.query;
    if(!station) return res.status(400).json({ error: 'station 쿼리 필요' });

    const key = process.env.SERVICE_KEY_AIRKOREA; // Vercel 환경변수
    if(!key) return res.status(500).json({ error: '서버 환경변수(SERVICE_KEY_AIRKOREA) 미설정' });

    const endpoint = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
    const url = `${endpoint}?serviceKey=${encodeURIComponent(key)}&stationName=${encodeURIComponent(station)}&dataTerm=DAILY&numOfRows=${encodeURIComponent(rows)}&pageNo=1&ver=1.3&returnType=json`;

    const r = await fetch(url);
    if(!r.ok) return res.status(r.status).json({ error: `Upstream HTTP ${r.status}` });
    const j = await r.json();

    // CORS 허용(원하면 도메인 제한 가능)
    res.setHeader('Access-Control-Allow-Origin', '*');
    // 필요한 부분만 정리해서 프론트로 전달
    const items = j?.response?.body?.items ?? [];
    return res.status(200).json({ items });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
