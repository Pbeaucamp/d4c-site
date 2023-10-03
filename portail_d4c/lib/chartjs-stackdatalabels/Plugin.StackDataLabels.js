(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js')) :
	typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
	(global.PluginStackDataLabels = factory(global.Chart));
}(this, (function (Chart) { 'use strict';

Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;

var defaultOptions = {
  /**
   * is the title shown
   * @member {boolean} display
   * @default false
   */
  display: false,

  /**
   * Font size
   * Expects either a string with `pt` or `px`, or a number of px
   * @member {Number}
   * @default 12
   */
  fontSize: 12,

  /**
   * Font family for the title text.
   * @member {String} fontFamily
   * @default "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
   */
  fontFamily: "Arial",

  /**
   * Font color
   * @member {String} fontColor
   * @default '#888'
   */
  fontColor: '#888',

  /**
   * Font style
   * @member {String} fontStyle
   * @enum 'normal' | 'bold' | 'italic' | 'italic bold'
   * @default 'normal'
   */
  fontStyle: 'normal',

  /**
   * Padding between the title and the subtitle
   * @member {Number}
   * @default 10
   */
  margin: 10,

};

var StackDataLabelsPlugin = {
  id: 'chartJsPluginStackDataLabels',

  resolveStyle: function resolveStyle(options) {
    if (!(typeof options.fontStyle === 'string' || options.fontStyle instanceof String)) {
      return '';
    }
    switch (options.fontStyle.toLowerCase()) {
      case 'normal':
        return '';
      default:
        // allow any string
        return options.fontStyle;
    }
  },
  resolveSize: function resolveSize(options) {
    var fontSize = options.fontSize;

    if (typeof fontSize === 'string' || fontSize instanceof String) {
      return fontSize;
    }
    if (typeof fontSize === 'number') {
      return fontSize + 'px';
    }
    return '12px';
  },
  resolveFont: function resolveFont(options) {
    return this.resolveStyle(options) + ' ' + this.resolveSize(options) + ' ' + options.fontFamily;
  },


  /**
   * Get cumulative datas for stacked values
   * @param datasets 
   */
  getCumulativeDatas: function getCumulativeDatas(datasets){
    var cumulativeDatas = []; 
    for(var i=0;i<datasets.length;i++){
      var datas = datasets[i].data;
      for(var j=0;j<datas.length;j++){
        var data = 0;
        if(datas[j]){
          data = datas[j];
        }

        if(i <= 0){
          cumulativeDatas.push(data);
        }
        else{
          cumulativeDatas[j] += data; 
        }
      }
    }
    return cumulativeDatas;
  },


  /**
   * Draw the subtitle on the bottom position
   * @param {Chart} chart
   * @param {Object} options
   */
  drawData: function drawData(chart, options,data,index,barCount) {
    data = Math.round(data);
    var text = data.toString();
    var ctx = chart.ctx;
    var height = chart.height - chart.options.layout.padding.bottom;
    var width = chart.width;
    var offsetXChart = chart.chartArea.left;
    var offsetYChart = chart.chartArea.top;
    
    var textPadding = 0;
    var textX = 0;
    var textY = 0;

    switch(chart.config.type){
      case 'bar':
        textPadding = (width - offsetXChart) / barCount; 
        textX = offsetXChart + textPadding/2 + Math.round(index*textPadding - ctx.measureText(text).width/2);
        textY = offsetYChart + 10;
        ctx.fillText(text,textX,textY);
        break;
      case 'horizontalBar':
        textPadding = (height - offsetYChart) / barCount;
        textX = width - 25 -  ctx.measureText(text).width;
        textY = offsetYChart + textPadding/2 + Math.round(index*(textPadding-options.fontSize) - options.fontSize/2);
        ctx.fillText(text,textX,textY);
        break;
    }
  },


  /**
   * Plugin hook to draw the sub title
   * @param chart chartjs instance
   * @param easingValue animation function
   * @param options plugin options
   */
  beforeDraw: function beforeDraw(chart, easingValue, rawOptions) {
    var options = Object.assign({}, defaultOptions, rawOptions);
    if (options.display) {
      var ctx = chart.chart.ctx;
      ctx.restore();
      ctx.font = this.resolveFont(options);
      ctx.textBaseline = 'middle';
      ctx.fillStyle = options.fontColor;
      var datasets = chart.chart.data.datasets;
      var cumulativeDatas = this.getCumulativeDatas(datasets);
      for(var i = 0;i<cumulativeDatas.length;i++){
        this.drawData(chart.chart,options,cumulativeDatas[i],i,cumulativeDatas.length);
      }
    }
  }
};

Chart.pluginService.register(StackDataLabelsPlugin);

return StackDataLabelsPlugin;

})));
