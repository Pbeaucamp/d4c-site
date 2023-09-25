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
  fontStyle: 'italic',

  /**
   * Padding between the title and the subtitle
   * @member {Number}
   * @default 4
   */
  paddingTop: 15,

  /**
   * Subtitle text to display
   * @member {String}
   * @default ''
   */
  text: '',

  /**
   * Description position
   * @member position
   * @enum 'top' | 'left' | 'right' | 'bottom'
   * @default 'bottom'
   */
  position: 'bottom'
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
   * Draw the subtitle on the top position
   * @param {Chart} chart
   * @param {Object} options
   */
  drawTop: function drawTop(chart, options) {
    var text = options.text;
    var align = options.align;
    var ctx = chart.ctx,
        width = chart.width;

    // this value accounts for multiple lines in title

    var titleOffset = chart.titleBlock.height - chart.options.title.padding;

    var textX = 0;
    var textY = titleOffset + options.paddingTop + 3;
    ctx.fillText(text, textX, textY);
  },


  /**
   * Draw the subtitle on the left position
   * @param {Chart} chart
   * @param {Object} options
   */
  drawLeft: function drawLeft(chart, options) {
    var text = options.text;
    var ctx = chart.ctx,
        height = chart.height;

    // this value accounts for multiple lines in title

    var titleOffset = chart.titleBlock.width - chart.options.title.padding;

    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(-Math.PI / 2);

    var textX = height;
    var textY = titleOffset + options.paddingTop + 3;

    ctx.fillText(text, -textX, textY);
    ctx.restore();
  },


  /**
   * Draw the subtitle on the right position
   * @param {Chart} chart
   * @param {Object} options
   */
  drawRight: function drawRight(chart, options) {
    var text = options.text;
    var ctx = chart.ctx,
        height = chart.height,
        width = chart.width;

    // this value accounts for multiple lines in title

    var titleOffset = chart.titleBlock.width - chart.options.title.padding;

    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(Math.PI / 2);

    var textX = height;
    var textY = titleOffset + options.paddingTop - width;

    ctx.fillText(text, textX, textY);
    ctx.restore();
  },

  /**
   * Draw the subtitle on the bottom position
   * @param {Chart} chart
   * @param {Object} options
   */
  drawBottom: function drawBottom(chart, options) {
    var text = options.text;
    var align = options.align;
    var ctx = chart.ctx,
        height = chart.height
    
    var textX = 0;
    var textY = height - chart.options.title.padding * 2 + (options.paddingTop + 11);
    var splittedText = this.splitText(text,250);
    
    for(var i=0;i<splittedText.length;i++){
      ctx.fillText(splittedText[i],textX,textY + options.paddingTop*i,chart.width);
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
      switch(options.position){
        case 'top':
          this.drawTop(chart.chart,options);
          break;
        case 'left':
          this.drawLeft(chart.chart,options);
          break;
        case 'right':
          this.drawRight(chart.chart,options);
          break;
        default:
          this.drawBottom(chart.chart,options);
          break;
      }
    }
  }
};

Chart.pluginService.register(DesriptionPlugin);

return DesriptionPlugin;

})));
