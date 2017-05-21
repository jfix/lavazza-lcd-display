// import Chart from 'chart.js'

const drawHistogram = function (data) {
  const ctx = document.getElementById('ten-day-chart')
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(function (item) { return item.weekday.substring(0, 3) }),
      datasets: [
        {
          label: 'coffees',
          backgroundColor: '#ffff00',
          borderColor: '#ffff00',
          data: data.map(function (item) { return item.count })
        }
      ]
    },
    options: {
      animation: {
        duration: 1,
        onComplete: function () {
          this.chart.controller.draw()
          drawValue(this, 1)
        },
        hover: {
          animationDuration: 0
        },
        onProgress: function (state) {
          var animation = state.animationObject
          drawValue(this, animation.currentStep / animation.numSteps)
        }
      },
      responsive: true,
      defaultFontColor: '#00ff00',
      title: {
        display: true,
        text: 'The last 10 days of coffee',
        fontColor: '#ffff00',
        fontSize: 18
      },
      legend: {
        display: false
      },
      scales: {
        xAxes: [
          {
            display: true,
            gridLines: {
              display: false
            },
            ticks: {
              display: true,
              fontColor: '#ffff00',
              fontStyle: 'bold'
            }
          }
        ],
        yAxes: [
          {
            display: false
          }
        ]
      }
    }
  })
  const insideFontColor = '0,0,0'
  const outsideFontColor = '255,255,0'
  const topThreshold = 20
  const modifyCtx = function (ctx) {
    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize + 5, 'bold', Chart.defaults.global.defaultFontFamily)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    return ctx
  }
  const fadeIn = function (ctxt, obj, x, y, black, step) {
    ctxt = modifyCtx(ctxt)
    ctxt.fillStyle = black ? 'rgba(' + outsideFontColor + ',' + step + ')' : 'rgba(' + insideFontColor + ',' + step + ')'
    ctxt.fillText(obj, x, y)
  }
  var drawValue = function (context, step) {
    const ctx = context.chart.ctx
    context.data.datasets.forEach(function (dataset) {
      for (var i = 0; i < dataset.data.length; i++) {
        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model
        var textY = (model.y > topThreshold) ? model.y - 3 : model.y + 20
        fadeIn(ctx, dataset.data[i], model.x, textY, model.y > topThreshold, step)
      }
    })
  }
}
module.exports = drawHistogram
