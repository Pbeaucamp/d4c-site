(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('chart.js')) :
	typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
	(global.PluginBorder = factory(global.Chart));
}(this, (function (Chart) { 'use strict';

Chart = Chart && Chart.hasOwnProperty('default') ? Chart['default'] : Chart;

var BorderPlugin = {
  id: 'chartJsPluginBorder',

  /**
   * Plugin hook to draw the background
   * @param chart chartjs instance
   * @param options plugin options
   */
  beforeDraw(chart, args, options) {
    const {ctx, chartArea: {left, top, right, bottom}} = chart;
    ctx.save();
    ctx.strokeStyle = options.display ? options.borderColor : 'rgba(0,0,0,0)';
    ctx.lineWidth = 1;
    ctx.setLineDash(options.borderDash || []);
    ctx.lineDashOffset = options.borderDashOffset;

    // Calculate width
    const width = right - left;
    const height = bottom - top;

    ctx.strokeRect(left, top, width, height);
    ctx.restore();
  }
};

Chart.pluginService.register(BorderPlugin);

return BorderPlugin;

})));
