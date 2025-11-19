const stationInput = document.getElementById('station');
const btn = document.getElementById('btn');
const tbody = document.querySelector('#tbl tbody');
const statusBox = document.getElementById('statusBox');
let timeChart;

btn.addEventListener('click', async () => {
  const station = stationInput.value.trim();
  if(!station){ alert('측정소 이름을 입력하세요.'); return; }
  setStatus('요청 중…'); tbody.innerHTML = ""; destroyChart();

  try{
    // Vercel 서버리스 프록시 호출 (환경부)
    const res = await fetch(`/api/air?station=${encodeURIComponent(station)}&rows=24`);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const { items } = await res.json();

    if(!items?.length){ setStatus('데이터 없음(측정소 이름을 확인)'); return; }

    // 표
    for(const it of items){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${it.dataTime ?? '-'}</td>
        <td>${it.pm10Value ?? '-'}</td>
        <td>${it.pm25Value ?? '-'}</td>
        <td>${it.o3Value ?? '-'}</td>
        <td>${it.no2Value ?? '-'}</td>
      `;
      tbody.appendChild(tr);
    }

    // 그래프
    const rows = items
      .filter(x => x.dataTime && isFinite(parseFloat(x.pm25Value)))
      .map(x => ({ t: toDateKST(x.dataTime), pm25: parseFloat(x.pm25Value) }))
      .sort((a,b)=> a.t - b.t);

    if(rows.length){ drawTimeChart(rows); }
    setStatus(`불러오기 완료: ${items.length}건`);
  }catch(e){
    console.error(e);
    setStatus('에러: ' + e.message);
  }
});

function toDateKST(s){ return new Date(s.replace(' ','T') + ':00+09:00'); }
function setStatus(m){ statusBox.textContent = m; }
function destroyChart(){ if(timeChart){ timeChart.destroy(); timeChart = null; } }
function fmt(d){ const p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:00`; }

function drawTimeChart(rows){
  const ctx = document.getElementById('timeChart').getContext('2d');
  destroyChart();
  timeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: rows.map(r=>fmt(r.t)),
      datasets: [{ label:'PM2.5 (μg/m³)', data: rows.map(r=>r.pm25), tension:.25, pointRadius:0 }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels:{ color:'#cfe1ff' } } },
      scales: {
        x: { ticks:{ color:'#a9b4d8' }, grid:{ color:'rgba(255,255,255,.06)' } },
        y: { ticks:{ color:'#a9b4d8' }, grid:{ color:'rgba(255,255,255,.06)' } }
      }
    }
  });
}
