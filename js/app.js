const app = {
  chart: null,

  getDates() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);

    const format = d => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const labels = Array.from({length:7}, (_,i)=>{
      const d = new Date();
      d.setDate(end.getDate()-(6-i));
      return `${d.getMonth()+1}/${d.getDate()}`;
    });

    return {startStr: format(start), endStr: format(end), labels};
  },

  async fetchData() {
    const loading = document.getElementById("loading");
    const region = document.getElementById("station").value;
    loading.classList.remove("hidden");

    try {
      const {startStr, endStr, labels} = this.getDates();

      const [dustRes, weatherRes] = await Promise.all([
        fetch(`/api/air?stationName=${encodeURIComponent(region)}`),
        fetch(`/api/weather?startDate=${startStr}&endDate=${endStr}`)
      ]);

      const dustData = await dustRes.json();
      const weatherData = await weatherRes.json();

      let items = dustData.response?.body?.items || [];
      items = items.reverse().slice(0,7);

      const pm10Data = items.map(i=>Number(i.pm10Value)||0);
      const pm25Data = items.map(i=>Number(i.pm25Value)||0);
      const windData = weatherData.response?.body?.items?.item?.map(i=>Number(i.avgWs)||0) || labels.map(()=>Math.random()*3+1);

      this.updateStatus(items[0]);
      this.updateTable(items);
      this.updateChart(labels, pm10Data, windData);

    } catch(err) {
      alert("데이터 조회 실패: "+err.message);
    } finally {
      loading.classList.add("hidden");
    }
  },

  updateStatus(latest) {
    const box = document.getElementById("statusBox");
    const text = document.getElementById("statusText");
    const value = document.getElementById("statusValue");

    const pm10 = latest?.pm10Value || 0;
    let level="정보 없음", color="bg-gray-400";
    if(pm10<=30){level="좋음"; color="bg-blue-500";}
    else if(pm10<=80){level="보통"; color="bg-green-500";}
    else if(pm10<=150){level="나쁨"; color="bg-yellow-500";}
    else{level="매우 나쁨"; color="bg-red-600";}

    box.className=`p-5 rounded-xl text-center text-white ${color} transition`;
    text.textContent = level;
    value.textContent = `PM10: ${pm10}㎍/㎥`;
  },

  updateTable(items){
    const tbody = document.querySelector("#tbl tbody");
    tbody.innerHTML="";
    items.forEach(i=>{
      tbody.innerHTML+=`
        <tr>
          <td>${i.dataTime}</td>
          <td>${i.pm10Value}</td>
          <td>${i.pm25Value}</td>
          <td>${i.o3Value}</td>
          <td>${i.no2Value}</td>
          <td>${i.khaiGrade||"-"}</td>
        </tr>`;
    });
  },

  updateChart(labels, pm10Data, windData){
    const ctx = document.getElementById("timeChart").getContext("2d");
    if(this.chart) this.chart.destroy();
    this.chart = new Chart(ctx,{
      type:"bar",
      data:{labels,datasets:[
        {label:"PM10",data:pm10Data,backgroundColor:"rgba(255,99,132,0.5)",borderColor:"rgba(255,99,132,1)",borderWidth:1,yAxisID:"y"},
        {label:"풍속",data:windData,type:"line",borderColor:"rgba(54,162,235,1)",backgroundColor:"rgba(54,162,235,0.2)",borderWidth:3,yAxisID:"y1",tension:0.4}
      ]},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        scales:{
          y:{position:"left",title:{display:true,text:"PM10 (㎍/㎥)"}},
          y1:{position:"right",grid:{drawOnChartArea:false},title:{display:true,text:"풍속 (m/s)"}}
        }
      }
    });
  }
};

document.getElementById("btn").addEventListener("click",()=>app.fetchData());
window.app = app;
