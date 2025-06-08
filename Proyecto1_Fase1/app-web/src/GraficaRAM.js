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
            name: { show: true },
            value: { show: true },
            total: {
              showAlways: true,
              show: true,
              label: "Total (GB)",
              formatter: () => totalGB?.toFixed(3) || "0.000"
            }
          }
        }
      }
    },
    labels,
    fill: {
      type: 'pattern',
      opacity: 1,
      pattern: {
        enabled: true,
        style: ['verticalLines', 'squares']
      },
    },
    theme: { palette: 'palette2' },
    title: { text: title },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' }
      }
    }]
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <ReactApexChart options={options} series={series} type="donut" width={600} />
      <p style={{ marginTop: '0.5rem', fontWeight: 'bold'}}>Uso: {porcentajeUso}%</p>
    </div>
  );
};

export default ApexChartRAM;
