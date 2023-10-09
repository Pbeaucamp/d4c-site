(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js')) :
	typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
	(global.PluginLogo = factory(global.Chart));
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
   * is the title shown
   * @member {Number} height
   * @default 50
   */
  height: 50,

  /**
   * Font size
   * Expects either a string with `pt` or `px`, or a number of px
   * @member {Number} width
   * @default 50
   */
  width: 50,

  /**
   * Padding between the title and the subtitle
   * @member {Number} margin
   * @default 10
   */
  margin: 10,

  /**
   * Position of the logo
   * @member {String} position
   * @enum 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight'
   */
  position : 'topLeft',

  file : 'https://www.chartjs.org/img/chartjs-logo.svg'
};

var LogoPlugin = {
  id: 'chartJsPluginLogo',


  /**
   * Draw the logo on the top left position
   * @param {Chart} chart
   * @param {Object} options
   */
  drawTopLeft: function drawTopLeft(chart, options) {
    var ctx = chart.ctx;
    
    var posX = options.margin;
    var posY = options.margin;

    var img = new Image();
    img.crossOrigin = '*';

    img.onload = function () {
        ctx.drawImage(img,posX,posY,options.height,options.width);
        ctx.save();
    }
    img.src = options.file;
  },


    /**
   * Draw the logo on the top center position
   * @param {Chart} chart
   * @param {Object} options
   */
    drawTopCenter: function drawTopCenter(chart, options) {
        var ctx = chart.ctx;
        var chartWidth = chart.width;
        
        var posX = chartWidth/2 - options.width/2;
        var posY = options.margin;
    
        var img = new Image();
        img.crossOrigin = '*';

        img.onload = function () {
            ctx.drawImage(img,posX,posY,options.height,options.width);
        }
        img.src = options.file;
    },

    /**
   * Draw the logo on the top right position
   * @param {Chart} chart
   * @param {Object} options
   */
    drawTopRight: function drawTopRight(chart, options) {
        var ctx = chart.ctx;
        var chartWidth = chart.width;
        
        var posX = chartWidth - options.margin - options.width;
        var posY = options.margin;
    
        var img = new Image();
        img.crossOrigin = '*';
    
        img.onload = function () {
            ctx.drawImage(img,posX,posY,options.height,options.width);
        }
        img.src = options.file;
    },



  /**
   * Draw the logo on the bottom left position
   * @param {Chart} chart
   * @param {Object} options
   */
  drawBottomLeft: function drawBottomLeft(chart, options) {
    var ctx = chart.ctx;
    var chartHeight = chart.height;
    
    var posX = options.margin;
    var posY = chartHeight - options.margin - options.height;

    var img = new Image();
    img.crossOrigin = '*';
    
    img.onload = function () {
        ctx.drawImage(img,posX,posY,options.height,options.width);
    }
    img.src = options.file;
  },


      /**
   * Draw the logo on the bottom center position
   * @param {Chart} chart
   * @param {Object} options
   */
    drawBottomCenter: function drawBottomCenter(chart, options) {  
        var ctx = chart.ctx;
        var chartWidth = chart.width;
        var chartHeight = chart.height;
        
        var posX = chartWidth/2 - options.width/2;
        var posY = chartHeight - options.margin - options.height;
    
        var img = new Image();
        img.crossOrigin = '*';

        img.onload = function () {
            ctx.drawImage(img,posX,posY,options.height,options.width);
        }
        img.src = options.file;
    },


    /**
   * Draw the logo on the bottom right position
   * @param {Chart} chart
   * @param {Object} options
   */
    drawBottomRight: function drawBottomRight(chart, options) {
        var ctx = chart.ctx;
        var chartWidth = chart.width;
        var chartHeight = chart.height;
        
        var posX = chartWidth - options.margin - options.width;
        var posY = chartHeight - options.margin - options.height;
    
        var img = new Image();
        img.crossOrigin = '*';
    
        img.onload = function () {
            ctx.drawImage(img,posX,posY,options.height,options.width);
        }
        img.src = options.file;
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
      switch(options.position){
        case 'topCenter':
            this.drawTopCenter(chart.chart,options);
            break;
        case 'topRight':
            this.drawTopRight(chart.chart,options);
            break;
        case 'bottomLeft':
            this.drawBottomLeft(chart.chart,options);
            break;
        case 'bottomCenter':
            this.drawBottomCenter(chart.chart,options);
            break;
        case 'bottomRight':
            this.drawBottomRight(chart.chart,options);
            break;
        default:
            this.drawTopLeft(chart.chart,options);
            break;
      }

    }
  }
};

Chart.pluginService.register(LogoPlugin);

return LogoPlugin;

})));
