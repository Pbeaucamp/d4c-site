(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js')) :
	typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
	(global.PluginBackground = factory(global.Chart));
}(this, (function (Chart) { 'use strict';

Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;

var BackgroundPlugin = {
  id: 'chartJsPluginBackground',

  /**
   * Plugin hook to draw the background
   * @param chart chartjs instance
   * @param options plugin options
   */
  beforeDraw: (chart, args, options) => {
    const {ctx} = chart;
    ctx.canvas.height = chart.height + 40;
    ctx.canvas.width = chart.width
    if (options.color) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = options.color;
      ctx.fillRect(0, 0, chart.width, chart.height + 100);
      ctx.restore();
    }
  }
};

Chart.pluginService.register(BackgroundPlugin);

return BackgroundPlugin;

})));
