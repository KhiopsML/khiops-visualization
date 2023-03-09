var data = {
  datasets: [{
    label: 'Dataset #1',
    backgroundColor: 'rgba(255,99,132,0.2)',
    borderColor: 'rgba(255,99,132,1)',
    borderWidth: 2,
    hoverBackgroundColor: 'rgba(255,99,132,0.4)',
    hoverBorderColor: 'rgba(255,99,132,1)',
    data: [65, 59, 20, 81, 56, 55, 40],
    setPercentage: [10, 2, 20, 40, 4, 6, 18],
  }],
};

var options = {
  maintainAspectRatio: false,
  scales: {
    y: {
      stacked: true,
      grid: {
        display: true,
        color: 'rgba(255,99,132,0.2)',
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        callback: function (value, index, e) {
          if (!data.datasets[0].setPercentage) {
            // Default chartjs
            return index % 2 === 0 ? this.getLabelForValue(value) : '';
          } else {
            // Here you can customize x labels
          }
        }
      }
    }
  }
};

window.addEventListener('load', function () {
  new Chart('chart', {
    type: 'bar',
    options: options,
    data: data,
  });
}, false);
