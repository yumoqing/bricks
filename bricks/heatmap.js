var bricks = window.bricks || {};

bricks.ChartHeatmap = class extends bricks.EchartsExt {
    /*
    数据格式:
    [
        { x: '周一', y: '上午', value: 120 },
        { x: '周二', y: '下午', value: 90 }, ...
    ]

    参数:
    {
        data_url,
        xField: 'x',       // X 轴字段
        yField: 'y',       // Y 轴字段
        valueField: 'value'
    }
    */
    setup_options(data) {
        const xField = this.xField || 'x';
        const yField = this.yField || 'y';
        const valueField = this.valueField || 'value';

        const xs = [...new Set(data.map(d => d[xField]))];
        const ys = [...new Set(data.map(d => d[yField]))];

        const map = {};
        ys.forEach(y => map[y] = {});
        data.forEach(d => {
            map[d[yField]][d[xField]] = d[valueField];
        });

        const heatmapData = [];
        for (let j = 0; j < ys.length; j++) {
            const y = ys[j];
            for (let i = 0; i < xs.length; i++) {
                const x = xs[i];
                heatmapData.push([i, j, map[y][x] || 0]);
            }
        }

        return {
            tooltip: { position: 'top' },
            grid: { height: '80%', top: '10%' },
            xAxis: {
                type: 'category',
                data: xs,
                splitArea: { show: true }
            },
            yAxis: {
                type: 'category',
                data: ys,
                splitArea: { show: true }
            },
            visualMap: {
                min: 0,
                max: Math.max(...data.map(d => d[valueField])),
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '5%'
            },
            series: [{
                type: 'heatmap',
                data: heatmapData,
                label: { show: false },
                emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
            }]
        };
    }
};

bricks.Factory.register('ChartHeatmap', bricks.ChartHeatmap);
