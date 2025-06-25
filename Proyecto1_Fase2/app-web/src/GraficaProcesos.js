import ReactApexChart from 'react-apexcharts';

const GraficaProcesos = ({ title, labels, series }) => {
  const state = {
    series: [{ data: series }],
    options: {
      chart: {
        type: 'bar',
        height: 380
      },
      plotOptions: {
        bar: {
          barHeight: '100%',
          distributed: true,
          horizontal: true,
          dataLabels: {
            position: 'bottom'
          },
        }
      },
      colors: ['#33b2df', '#13d8aa', '#d4526e', '#f48024', '#546E7A'],
      dataLabels: {
        enabled: true,
        textAnchor: 'start',
        style: {
          colors: ['#fff']
        },
        formatter: function (val, opt) {
          return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
        },
        offsetX: 0,
        dropShadow: {
          enabled: true
        }
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        categories: labels,
      },
      yaxis: {
        labels: {
          show: false
        }
      },
      title: {
        text: title,
        align: 'center',
        floating: true
      },
      subtitle: {
        text: 'Distribución de Procesos En El Sistema',
        align: 'center',
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: false
        },
        y: {
          title: {
            formatter: () => ''
          }
        }
      }
    }
  };

  return (
    <div>
      <ReactApexChart options={state.options} series={state.series} type="bar" height={380} />
    </div>
  );
};

export default GraficaProcesos;
