import ReactApexChart from 'react-apexcharts';

const ApexChartCPU = ({ title, labels, series }) => {
  const totalPorcentaje = series.reduce((acc, val) => acc + val, 0);

  const options = {
    chart: {
      width: 380,
      type: 'donut',
      dropShadow: {
        enabled: true,
        color: '#111',
        top: -1,
        left: 3,
        blur: 3,
        opacity: 0.5
      }
    },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 500
            },
            total: {
              showAlways: true,
              show: true,
              label: "Total (%)",
              fontSize: '18px',
              fontWeight: 600,
              formatter: () => `${totalPorcentaje}`
            }
          }
        }
      }
    },
    labels: labels,
    fill: {
      type: 'solid',
      colors: ['#e67e22', '#FFD700']
    },
    theme: {
      palette: 'palette2'
    },
    title: {
      text: title,
      align: 'center',
      style: {
        fontSize: '22px',
        fontWeight: 'bold'
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '16px'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 250 },
        legend: { position: 'bottom' }
      }
    }]
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <ReactApexChart options={options} series={series} type="donut" width={600} />
    </div>
  );
};

export default ApexChartCPU;