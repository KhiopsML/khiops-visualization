
## Fork of Chart.js 3.9.1 to draw histograms with dynamic sizes

**Checkout the 3.9 branch !**

### For instance : 
![image](https://user-images.githubusercontent.com/13203455/196981598-a880ea66-9ef6-4064-8a2a-45e4b255ccef.png)

### Instead of :
![image](https://user-images.githubusercontent.com/13203455/196995554-8afad4b6-56c6-4257-a265-e1ca289eba8a.png)


## Example
(See example/index.html)

Just add a **setPercentage** array with percentages to the dataset to enable the dynamic width histogram

```js

  var data = {
    datasets: [{
      label: 'Dataset #1',
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 2,
      data: [65, 59, 20, 81, 56, 55, 40],
      setPercentage: [10, 2, 20, 40, 4, 6, 18], // Here is the magic !!
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
  
```
