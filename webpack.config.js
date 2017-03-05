const path = require('path')

module.exports = {
  entry: './assets/js/client.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'assets/js')
  },
  devtool: 'cheap-eval-source-map'
}
