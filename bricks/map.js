var bricks = window.bricks || {};

bricks.ChartMap = class extends bricks.EchartsExt {
    /*
    数据格式:
    [
        { name: '北京', value: 120 },
        { name: '上海', value: 90 }, ...
    ]

    参数:
    {
        data_url,
        nameField: 'name',
        valueField: 'value',
        map_name: 'china',     // 对应 echarts.registerMap 注册的地图名
        map_options: {}        // 可选自定义样式
    }
    */
    async setup_options(data) {
        const { nameField, valueField = 'value', map_name = 'china', map_options } = this;

        const mapData = data.map(d => ({
            name: d[nameField],
            value: d[valueField]
        }));

        return {
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c}'
            },
            visualMap: {
                min: 0,
                max: Math.max(...mapData.map(d => d.value)),
                left: 'left',
                top: 'bottom',
                text: ['高', '低'],
                calculable: true
            },
            series: [{
                name: '数据',
                type: 'map',
                map: map_name,
                roam: false,
                label: { show: true, color: '#fff' },
                itemStyle: {
                    areaColor: '#eee',
                    borderColor: '#444'
                },
                emphasis: {
                    label: { color: '#fff' },
                    itemStyle: { areaColor: '#e09191' }
                },
                data: mapData
            }],
            ...(map_options || {})
        };
    }
};

bricks.Factory.register('ChartMap', bricks.ChartMap);
/*
💡 使用前需通过 `echarts.registerMap('china', geoJson)` 注册地图数据。
*/
