import fetch from "node-fetch";

export default async function handler(req, res) {
  const API_KEY = process.env.WEATHER_API_KEY;
  const { startDate, endDate } = req.query;

  if (!API_KEY) {
    return res.status(500).json({ error: "WEATHER_API_KEY 미설정" });
  }

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate와 endDate 필요 (YYYYMMDD 형식)" });
  }

  const url = `https://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList?serviceKey=${API_KEY}&pageNo=1&numOfRows=100&dataType=JSON&dataCd=ASOS&dateCd=DAY&startDt=${startDate}&endDt=${endDate}&stnIds=108`;

  console.log(`[Proxy] Weather API URL: ${url}`);

  try {
    const response = await fetch(url);
    const text = await response.text();

    // JSON인지 체크
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Weather API returned non-JSON response:", text);
      return res.status(500).json({ error: "Weather API가 JSON을 반환하지 않음", body: text });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Weather API fetch error:", err);
    res.status(500).json({ error: "Weather API 호출 실패", message: err.message });
  }
}
