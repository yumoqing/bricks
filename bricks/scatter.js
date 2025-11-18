var bricks = window.bricks || {};

bricks.ChartScatter = class extends bricks.EchartsExt {
  /*
   * opts:
   * {
   *   data_url,
   *   data_params,
   *   method,
   *   user_data,
   *   nameField: 可选，用于标签
   *   xField:     X坐标字段
   *   yField:     Y坐标字段
   *   sizeField?: 气泡大小字段（可选）
   *   categoryField?: 分组字段（用于不同颜色）
   * }
   */

  setup_options(data) {
    let seriesMap = {};

    if (this.categoryField) {
      // 按 categoryField 分组
      data.forEach(item => {
        const cat = item[this.categoryField] || 'default';
        if (!seriesMap[cat]) {
          seriesMap[cat] = {
            name: cat,
            type: 'scatter',
            data: []
          };
        }
        seriesMap[cat].data.push([
          item[this.xField],
          item[this.yField],
          item[this.nameField] || null,
          item[this.sizeField] || 1
        ]);
      });
    } else {
      // 单一系列
      const seriesData = data.map(item => [
        item[this.xField],
        item[this.yField],
        item[this.nameField] || null,
        item[this.sizeField] || 1
      ]);

      seriesMap['scatter'] = {
        type: 'scatter',
        data: seriesData
      };
    }

    const series = Object.values(seriesMap);
    const xAxisName = this.xField;
    const yAxisName = this.yField;

    return {
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const p = params[0];
          return `${p.seriesName}<br/>${xAxisName}: ${p.value[0]}<br/>${yAxisName}: ${p.value[1]}`;
        }
      },
      legend: {
        data: Object.keys(seriesMap)
      },
      xAxis: {
        type: 'value',
        name: xAxisName
      },
      yAxis: {
        type: 'value',
        name: yAxisName
      },
      series: series
    };
  }
};

// 注册工厂
bricks.Factory.register('ChartScatter', bricks.ChartScatter);

/*
new bricks.ChartScatter({
  user_data: [
    { x: 10, y: 20, size: 30, group: 'Group A', label: 'Point 1' },
    { x: 15, y: 25, size: 40, group: 'Group B', label: 'Point 2' }
  ],
  xField: 'x',
  yField: 'y',
  sizeField: 'size',
  categoryField: 'group',
  nameField: 'label'
});
*/
