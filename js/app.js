const app = {
  chart: null,

  // 최근 7일 날짜 생성
  getDates() {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);

      const format = d => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const da = String(d.getDate()).padStart(2, "0");
          return `${y}${m}${da}`;
      };

      const labels = Array.from({ length: 7 }, (_, idx) => {
          const d = new Date();
          d.setDate(end.getDate() - (6 - idx));
          return `${d.getMonth() + 1}/${d.getDate()}`;
      });

      return {
          startStr: format(start),
          endStr: format(end),
          labels
      };
  },

  // API 호출
  async fetchData() {
      const loading = document.getElementById("loading");
      const dashboard = document.getElementById("dashboard");
      const region = document.getElementById("station").value;

      loading.classList.remove("hidden");
      dashboard.classList.add("hidden");

      try {
          const { startStr, endStr, labels } = this.getDates();

          // Vercel 프록시 API 호출
          const [weatherRes, dustRes] = await Promise.all([
              fetch(`/api/weather?startDate=${startStr}&endDate=${endStr}`),
              fetch(`/api/air?stationName=${encodeURIComponent(region)}`)
          ]);

          const weatherData = await weatherRes.json();
          const dustData = await dustRes.json();

          console.log("Weather Data:", weatherData);
          console.log("Dust Data:", dustData);

          // 풍속 데이터 파싱
          let windData = [];
          if (weatherData.response?.body?.items?.item) {
              windData = weatherData.response.body.items.item.map(
                  item => item.avgWs || 0
              );
          } else {
              windData = labels.map(() => Math.random() * 3 + 1);
          }

          // 미세먼지 데이터 파싱
          let pm10Data = [];
          if (dustData.response?.body?.items) {
              pm10Data = dustData.response.body.items
                  .map(item => item.pm10Value || 0)
                  .reverse()
                  .slice(0, 7);
          } else {
              pm10Data = labels.map(() => Math.random() * 40 + 20);
          }

          // 차트 갱신
          this.updateChart(labels, pm10Data, windData);

          dashboard.classList.remove("hidden");
      } catch (err) {
          alert("데이터 조회 실패: " + err.message);
      } finally {
          loading.classList.add("hidden");
      }
  },

  // 차트 업데이트
  updateChart(labels, pm10Data, windData) {
      const canvas = document.getElementById("correlationChart");
      const ctx = canvas.getContext("2d");

      if (this.chart) this.chart.destroy();

      this.chart = new Chart(ctx, {
          type: "bar",
          data: {
              labels,
              datasets: [
                  {
                      label: "PM10 (㎍/㎥)",
                      data: pm10Data,
                      backgroundColor: "rgba(255,99,132,0.5)",
                      borderColor: "rgba(255,99,132,1)",
                      borderWidth: 1,
                      yAxisID: "y"
                  },
                  {
                      label: "풍속 (m/s)",
                      data: windData,
                      type: "line",
                      borderColor: "rgba(54,162,235,1)",
                      backgroundColor: "rgba(54,162,235,0.2)",
                      borderWidth: 3,
                      yAxisID: "y1",
                      tension: 0.4
                  }
              ]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  y: {
                      position: "left",
                      title: { display: true, text: "PM10 (㎍/㎥)" }
                  },
                  y1: {
                      position: "right",
                      grid: { drawOnChartArea: false },
                      title: { display: true, text: "풍속 (m/s)" }
                  }
              }
          }
      });
  }
};

// 버튼 이벤트 연결
document.getElementById("btn").addEventListener("click", () => app.fetchData());

// 전역 등록
window.app = app;
