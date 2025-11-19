import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Vercel 환경변수에서 API 키 가져오기
  const API_KEY = process.env.DUST_API_KEY;
  
  // 프론트엔드에서 보낸 파라미터 받기 (없으면 기본값)
  const { stationName = '종로구' } = req.query;

  // 공공데이터포털 요청 URL
  const url = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=${API_KEY}&returnType=json&numOfRows=100&pageNo=1&stationName=${encodeURIComponent(stationName)}&dataTerm=DAILY&ver=1.0`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // 성공적으로 데이터를 프론트엔드에 반환
    res.status(200).json(data);
  } catch (error) {
    console.error('Dust API Error:', error);
    res.status(500).json({ error: 'Failed to fetch dust data' });
  }
}