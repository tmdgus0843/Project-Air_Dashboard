import fetch from 'node-fetch';

export default async function handler(req, res) {
  const API_KEY = process.env.DUST_API_KEY; 
  const { stationName = '종로구' } = req.query;

  // 1. API 키 누락 검사 (환경변수 설정 오류)
  if (!API_KEY || API_KEY === '여기에_발급받은_미세먼지_API키_입력') {
      console.error('ERROR: DUST_API_KEY is not configured.');
      return res.status(500).json({ error: 'Serverless Function Error: DUST_API_KEY가 설정되지 않았거나 기본값입니다. Vercel 환경변수를 확인하세요.' });
  }

  // Decoding Key와 측정소 이름을 URL 인코딩하여 안전하게 전달
  const encodedServiceKey = encodeURIComponent(API_KEY);
  const encodedStationName = encodeURIComponent(stationName);

  const url = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=${encodedServiceKey}&returnType=json&numOfRows=100&pageNo=1&stationName=${encodedStationName}&dataTerm=DAILY&ver=1.0`;
  
  console.log(`[Proxy] Requesting URL: ${url}`); // Vercel 로그에 요청 URL 기록

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
        // 공공데이터 API에서 오류 응답이 왔을 경우 처리 (예: 서비스 키 만료 등)
        const errorText = await response.text();
        console.error(`Public API Error Status: ${response.status}`, errorText);
        return res.status(response.status).json({ 
            error: 'Public API Call Failed', 
            details: `Status: ${response.status}. Check API Key validity and service status.` 
        });
    }

    const data = await response.json();
    
    // 성공적으로 데이터를 프론트엔드에 반환
    res.status(200).json(data);
  } catch (error) {
    console.error('General Fetch Error in Proxy:', error);
    res.status(500).json({ error: 'Failed to fetch dust data due to network issue.' });
  }
}