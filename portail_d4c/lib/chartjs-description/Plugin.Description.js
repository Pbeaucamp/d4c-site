(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js')) :
	typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
	(global.PluginDescription = factory(global.Chart));
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
  fontSize: 14,

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
   * @default 4
   */
  paddingTop: 15,

  /**
   * Padding between the title and the subtitle
   * @member {Number}
   * @default 10
   */
  margin: 10,

  /**
   * Subtitle text to display
   * @member {String}
   * @default ''
   */
  text: '',

};

var DesriptionPlugin = {
  id: 'chartJsPluginDescription',

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
   * Split text into lines
   * @param {String} text
   * @param maxWidth
   */
  splitText : function splitText(text,maxWidth) {
    var lines = [];
    var words = text.split(" ");
    var i = 0;
    while(i < words.length){
      var line = "";
      if(words[i].length > maxWidth){
        line = line.concat(words[i]);
        line = line.concat(" ");
        i++;
      }
      else{
        while((i < words.length) && (line.length + words[i].length < maxWidth)){
          line = line.concat(words[i]);
          line = line.concat(" ");
          i++;
        }
      }
      lines.push(line);
    }
    return lines;
  },


  /**
   * Draw the subtitle on the bottom position
   * @param {Chart} chart
   * @param {Object} options
   */
  drawBottom: function drawBottom(chart, options) {
    var text = options.text;
    var ctx = chart.ctx,
        height = chart.height
    
    var textX = 0;
    var textY = height - chart.options.layout.padding.bottom - chart.options.title.padding * 2 + (options.paddingTop + 11);
    var splittedText = this.splitText(text,200);
    for(var i=0;i<splittedText.length;i++){
      ctx.fillText(splittedText[i],textX + options.margin,textY + options.margin + options.paddingTop*i,chart.width - options.margin - 5);
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
      this.drawBottom(chart.chart,options);
    }
  }
};

Chart.pluginService.register(DesriptionPlugin);

return DesriptionPlugin;

})));
