import ReactApexChart from 'react-apexcharts';

const ApexChartCPU = ({ title, labels, series }) => {
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
            total: {
              showAlways: true,
              show: true
            }
          }
        }
      }
    },
    labels: labels,
    fill: {
      type: 'pattern',
      opacity: 1,
      pattern: {
        enabled: true,
        style: ['verticalLines', 'squares']
      },
    },
    theme: {
      palette: 'palette2'
    },
    title: {
      text: title
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div>
      <ReactApexChart options={options} series={series} type="donut" width={600} />
    </div>
  );
};

export default ApexChartCPU;