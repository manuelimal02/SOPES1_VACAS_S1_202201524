import ReactApexChart from 'react-apexcharts';

const ApexChartRAM = ({ title, labels, series, totalGB, porcentajeUso }) => {
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
            name: { show: true, fontSize: '16px', fontWeight: 600 },
            value: { show: true, fontSize: '16px', fontWeight: 500 },
            total: {
              showAlways: true,
              show: true,
              label: "Total (GB)",
              fontSize: '16px',
              fontWeight: 600,
              formatter: () => totalGB?.toFixed(3) || "0.000"
            }
          }
        }
      }
    },
    labels,
    fill: {
      type: 'solid',
      colors: ['#1E90FF', '#8e44ad'],
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
      fontSize: '16px',
      fontWeight: 500
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 250 },
          legend: { position: 'bottom' }
        }
      }
    ]
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <ReactApexChart options={options} series={series} type="donut" width={600} />
      <p style={{
        marginTop: '1rem',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333'
      }}>
        Uso: {porcentajeUso}%
      </p>
    </div>
  );
};

export default ApexChartRAM;
