export default async function handler(req, res) {
  const API_KEY = process.env.DUST_API_KEY;
  const { stationName = "종로구" } = req.query;

  if (!API_KEY) return res.status(500).json({ error: "DUST_API_KEY 미설정" });

  const encodedStationName = encodeURIComponent(stationName);
  const url = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=${API_KEY}&returnType=json&numOfRows=100&pageNo=1&stationName=${encodedStationName}&dataTerm=DAILY&ver=1.0`;

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).json({ error: await response.text() });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
