var bricks = window.bricks || {};

bricks.ChartRadar = class extends bricks.EchartsExt {
    /*
    数据格式示例:
    [
        { name: '张三', indicator1: 80, indicator2: 60, ... },
        { name: '李四', indicator1: 70, indicator2: 90, ... }
    ]

    参数:
    {
        data_url,
        data_params,
        nameField: 'name',
        valueFields: ['indicator1', 'indicator2', ...],
        radar_options: { // 自定义雷达配置
            indicator: [
                { name: '销售', max: 100 },
                { name: '管理', max: 100 }, ...
            ]
        }
    }
    */
    setup_options(data) {
        const { nameField, valueFields } = this;
        const series = [];
        const indicator = this.radar_options?.indicator || valueFields.map(f => ({ name: f, max: 100 }));

        data.forEach(item => {
            series.push({
                name: item[nameField],
                type: 'radar',
                data: [
                    {
                        value: valueFields.map(f => item[f]),
                        name: item[nameField]
                    }
                ]
            });
        });

        return {
            tooltip: { trigger: 'item' },
            legend: { data: data.map(d => d[nameField]) },
            radar: { indicator },
            series
        };
    }
};

bricks.Factory.register('ChartRadar', bricks.ChartRadar);
/*
*/
