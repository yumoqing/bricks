var bricks = window.bricks || {};

bricks.ChartKLine = class extends bricks.EchartsExt {
    /*
    数据格式:
    [
        { name: '2025-04-01', open: 2100, close: 2150, low: 2080, high: 2160 },
        ...
    ]

    参数:
    {
        data_url,
        nameField: 'name',         // 时间轴字段
        valueFields: ['open','close','low','high']
    }
    */
    setup_options(data) {
        const { nameField } = this;
        const categories = data.map(d => d[nameField]);
        const kData = data.map(d => [d.open, d.close, d.low, d.high]);

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' }
            },
            xAxis: {
                type: 'category',
                data: categories,
                scale: true
            },
            yAxis: {
                type: 'value',
                scale: true
            },
            series: [{
                type: 'candlestick',
                data: kData
            }],
            dataZoom: [
                { type: 'inside' },
                { type: 'slider' }
            ]
        };
    }
};

bricks.Factory.register('ChartKLine', bricks.ChartKLine);
