const path = require('path')

module.exports = {
  entry: {
    client: './assets/js/client.js',
    phrase: './assets/js/form.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'assets/js')
  },
  devtool: 'cheap-module-source-map'
}
