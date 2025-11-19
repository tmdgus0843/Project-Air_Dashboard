export default async function handler(req, res) {
  const API_KEY = process.env.WEATHER_API_KEY;
  const { startDate, endDate } = req.query;

  if (!API_KEY) return res.status(500).json({ error: "WEATHER_API_KEY 미설정" });
  if (!startDate || !endDate) return res.status(400).json({ error: "startDate와 endDate 필요" });

  const url = `https://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList?serviceKey=${API_KEY}&pageNo=1&numOfRows=100&dataType=JSON&dataCd=ASOS&dateCd=DAY&startDt=${startDate}&endDt=${endDate}&stnIds=108`;

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).json({ error: await response.text() });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
