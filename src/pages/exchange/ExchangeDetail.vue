<template>
    <div class="main_background">
        <div style="padding: 10px">
            <div style="float: left">
                <span style="font-size: 18px">ETH/BTC</span>
                <div style="font-size: 18px">0.020988</div>
                <div>≈ ¥ 1473.41</div>
            </div>
            <div style="float: right;font-size: 16px;text-align: right">
                <div>24h量 42029.2096</div>
                <div>最高价</div>
                <div>最低价</div>
            </div>
        </div>
        <hr style="margin-top: 80px">
        <div>
            <div id="kline_container" :class="{hidden:currentImgTable==='s'}"></div>
        </div>
        <div>
            <van-tabs background="#2a2c39" color="#fff" title-active-color="#fff">
                <van-tab title="盘口" class="table_tab">
                    <Table size="small" :columns="plate.columnsBuy" :data="plate.askRows" style="float: left"></Table>
                    <Table size="small" :columns="plate.columnsSell" :data="plate.bidRows" style="float: right"></Table>
                </van-tab>
                <van-tab title="实时成交">
                    <Table size="small" :columns="plate.columnsTrade" :data="plate.tradeRows"></Table>
                </van-tab>
            </van-tabs>
        </div>
    </div>
</template>

<script>
    import Datafeeds from "@js/charting_library/datafeed/bitrade.js";
    import $ from "@js/jquery.min.js";
    var Stomp = require("stompjs");
    var SockJS = require("sockjs-client");
    var moment = require("moment");

    export default {
        data() {
            return {
                currentImgTable: "k",
                currentCoin: {
                    base: "",
                    coin: "",
                    symbol: "TLM/ETH"
                },
                plate: {
                    maxPostion: 20,
                    columnsBuy: [
                        {
                            title: '买入',
                            type: 'index',
                            width: 60,
                            align: 'center'
                        },
                        {
                            title: '数量',
                            key: 'amount',
                            align: 'center',
                            width: 62,
                        },
                        {
                            title: '价格',
                            key: 'price',
                            align: 'center',
                            width: 63,
                        },
                    ],
                    columnsSell: [
                        {
                            title: '价格',
                            key: 'price',
                            align: 'center',
                            width: 63,
                        },
                        {
                            title: '数量',
                            key: 'amount',
                            align: 'center',
                            width: 62,
                        },
                        {
                            title: '卖出',
                            type: 'index',
                            width: 60,
                            align: 'center'
                        },
                    ],
                    columnsTrade: [
                        {
                            title: '价格',
                            key: "price",
                            align: 'center',
                            /*render: (h, params) => {
                                const row = params.row;
                                const className = row.direction == "BUY" ? "buy" : "sell";
                                let CNYPrice = "";
                                const classHover = 'hover_hide_' + className;
                                return [h(
                                    "span",
                                    {
                                        attrs: {
                                            class: className
                                        }
                                    },
                                    params.row.price.toFixed(this.baseCoinScale)
                                ), h(
                                    "span",
                                    {
                                        attrs: {
                                            class: classHover
                                        }
                                    },
                                    CNYPrice
                                )];
                            },
                            renderHeader: (h, params) => {
                                const title =
                                    self.$t("exchange.price") + "(" + self.currentCoin.base + ")";
                                return h("span", {}, title);
                            }*/
                        },
                        {
                            title: '数量',
                            key: "amount",
                            align: 'center',
                            /*render: (h, params) => {
                                return h("span", {}, params.row.amount.toFixed(this.coinScale));
                            },
                            renderHeader: (h, params) => {
                                const title =
                                    self.$t("exchange.num") + "(" + self.currentCoin.coin + ")";
                                return h("span", {}, title);
                            }*/
                        },
                        {
                            title: '时间',
                            key: "time",
                            align: 'center',
                            render: (h, params) => {
                                return h("span", {}, this.timeFormat(params.column.time));
                            }
                        }
                    ],
                    askRows: [],
                    bidRows: [],
                    tradeRows: [],
                },
            }
        },
        created: function() {
            this.init();
        },
        methods: {
            init() {
                this.startWebsock();
                this.getPlate();
                this.getTrade();
            },
            startWebsock() {
                var that = this;
                if (this.stompClient) {
                    this.stompClient.ws.close();
                    console.log('关闭旧通道');
                }
                var stompClient = null;

                // 建立连接对象（还未发起连接）
                // 不同的浏览器对websocket的支持不同 跟参数币种
                var socket = new SockJS(that.host + that.api.market.ws); //连接SockJS的endpoint节点"/market-ws"

                //使用STOMP自协议的WebSocket客户端
                // 获取 STOMP 子协议的客户端对象
                stompClient = Stomp.over(socket);

                this.stompClient = stompClient;
                stompClient.debug = false;

                // 向服务器发起websocket连接并发送CONNECT帧
                stompClient.connect({}, function (frame) { //连接WebSocket服务端
                    // 连接成功时（服务器响应 CONNECTED 帧）的回调方法
                    console.log('链接成功!');
                    that.datafeed = new Datafeeds.WebsockFeed(
                        that.host + "/market",
                        that.currentCoin,
                        stompClient,
                        that.baseCoinScale
                    );
                    that.getKline();

                    //订阅价格变化消息
                    //that.subscribeThumb();

                    //订阅实时成交信息
                    //that.subscribeTrade();

                    /*if (that.isLogin) {
                        that.subscribeOrder();
                    }*/
                    //订阅盘口消息
                    //that.subscribeTradePlate();
                },(error) => {
                    console.log('链接失败:' + error);
                });
            },
            getKline() {
                var that = this;
                let config = {
                    autosize: true,
                    fullscreen: true,
                    symbol: that.symbol,
                    interval: "1",
                    timezone: "Asia/Shanghai",//时区//timezone: "UTC",
                    volume_precision: 8,
                    toolbar_bg: "#18202a",
                    container_id: "kline_container",
                    datafeed: that.datafeed,
                    library_path:
                        process.env.NODE_ENV === "production"
                            ? "/assets/chart_main/"
                            : "src/assets/chart_main/",
                    locale: that.$t("exchange.chartingLibraryLocale"),
                    debug: false,
                    drawings_access: {
                        type: "black",
                        tools: [{name: "Regression Trend"}]
                    },
                    disabled_features: [
                        "header_resolutions",
                        "timeframes_toolbar",
                        "header_symbol_search",
                        "header_chart_type",
                        "header_compare",
                        "header_undo_redo",
                        "header_screenshot",
                        "header_saveload",
                        "use_localstorage_for_settings",
                        "left_toolbar",
                        "volume_force_overlay" // 成交量(柱状图)与k线分离
                    ],
                    enabled_features: [
                        "hide_last_na_study_output",
                        "move_logo_to_main_pane"
                    ],
                    //  custom_css_url: "chart.css",
                    supported_resolutions: ["1", "5", "15", "30", "60", "1D", "1W", "1M"],
                    //charts_storage_url: "http://saveload.tradingview.com",
                    charts_storage_api_version: "1.1",
                    client_id: "tradingview.com",
                    user_id: "public_user_id",
                    loading_screen:{ backgroundColor: "#000000",foregroundColor: "#000000", },
                    overrides: {
                        "volumePaneSize": 'small', //成交量高度设置，可选值 large, medium, small, tiny
                        "paneProperties.background": "#1B1E2E",
                        "paneProperties.vertGridProperties.color": "rgba(0,0,0,.1)",
                        "paneProperties.horzGridProperties.color": "rgba(0,0,0,.1)",
                        //"scalesProperties.textColor" : "#AAA",
                        "scalesProperties.textColor": "#61688A",
                        "mainSeriesProperties.candleStyle.upColor": "#589065",
                        "mainSeriesProperties.candleStyle.downColor": "#AE4E54",
                        "mainSeriesProperties.candleStyle.drawBorder": false,
                        "mainSeriesProperties.candleStyle.wickUpColor": "#589065",
                        "mainSeriesProperties.candleStyle.wickDownColor": "#AE4E54",
                        "paneProperties.legendProperties.showLegend": false,// 隐藏左上角标题
                        "mainSeriesProperties.areaStyle.color1": "rgba(71, 78, 112, 0.5)",
                        "mainSeriesProperties.areaStyle.color2": "rgba(71, 78, 112, 0.5)",
                        "mainSeriesProperties.areaStyle.linecolor": "#9194a4"
                    },
                    time_frames: []
                };

                if (that.skin === "day") {
                    config.toolbar_bg = "#fff";
                    config.custom_css_url = "bundles/common_day.css";
                    config.overrides["paneProperties.background"] = "#fff";
                    config.overrides["mainSeriesProperties.candleStyle.upColor"] ="#a6d3a5";
                    config.overrides["mainSeriesProperties.candleStyle.downColor"] = "#ffa5a6";
                }

                var widget = (window.tvWidget = new TradingView.widget(config));


                widget.onChartReady(function () {
                    document.getElementById('kline_container').childNodes[0].setAttribute('style', 'display:block;width:100%;height:100%;');
                    widget.chart().executeActionById("drawingToolbarAction");
                    //移动平均线
                    widget.chart().createStudy("Moving Average", false, false, [5], null, {"plot.color": "#965FC4"});
                    widget.chart().createStudy("Moving Average", false, false, [10], null, {"plot.color": "#84AAD5"});

                    var buttons = [
                        {title:'exchange.realtime',resolution:'1',chartType:3},
                        {title:'exchange.M1',resolution:'1',chartType:1},
                        {title:'exchange.M5',resolution:'5',chartType:1},
                        {title:'exchange.M15',resolution:'15',chartType:1},
                        {title:'exchange.M30',resolution:'30',chartType:1},
                        {title:'exchange.M60',resolution:'60',chartType:1},
                        {title:'exchange.D1',resolution:'1D',chartType:1},
                        {title:'exchange.W1',resolution:'1W',chartType:1},
                        {title:'exchange.Mon1',resolution:'1M',chartType:1},
                    ];
                    for(var i = 0; i < buttons.length; i++){
                        let title = that.$t(buttons[i].title);
                        let symbol = buttons[i].resolution;
                        if (i==0) {
                            widget.createButton().attr("title", title)
                                .on("click", function () {
                                    if ($(this).hasClass("selected")) return;
                                    $(this).addClass("selected").parent(".group").siblings(".group").find(".button.selected").removeClass("selected");
                                    widget.chart().setChartType(3);
                                    widget.setSymbol("", symbol);
                                }).append("<span>").append(title).append("</span>").addClass("selected");
                        } else {
                            widget.createButton().attr("title", title)
                                .on("click", function () {
                                    if ($(this).hasClass("selected")) return;
                                    $(this).addClass("selected").parent(".group").siblings(".group").find(".button.selected").removeClass("selected");
                                    widget.chart().setChartType(1);
                                    widget.setSymbol("", symbol);
                                }).append("<span>").append(title).append("</span>");
                        }
                    }
                });
            },
            //获取买卖盘信息
            getPlate() {
                let params = {};
                params["symbol"] = this.currentCoin.symbol;
                this.$http.post(this.host + this.api.market.platemini, params).then(response => {
                    this.plate.askRows = [];
                    this.plate.bidRows = [];
                    let resp = response.body;
                    if (resp.ask && resp.ask.items) {
                        for (let i=0; i<resp.ask.items.length; i++) {
                            if (i == 0) {
                                resp.ask.items[i].totalAmount = resp.ask.items[i].amount;
                            } else {
                                resp.ask.items[i].totalAmount = resp.ask.items[i - 1].totalAmount + resp.ask.items[i].amount;
                            }
                        }
                        let askMaxPostion = this.plate.maxPostion;
                        let askLength = resp.ask.items.length;
                        if (askMaxPostion > askLength) {
                            for (let i = askLength; i > 0; i--) {
                                let ask = resp.ask.items[i - 1];
                                ask.direction = "SELL";
                                ask.amount = ask.amount.toFixed(3);
                                ask.price = ask.price.toFixed(3);
                                ask.position = i;
                                this.plate.askRows.push(ask);
                            }
                        } else {
                            for (let i = askLength; i > askLength-askMaxPostion; i--) {
                                let ask = resp.ask.items[i - 1];
                                ask.direction = "SELL";
                                ask.amount = ask.amount.toFixed(3);
                                ask.price = ask.price.toFixed(3);
                                ask.position = i;
                                this.plate.askRows.push(ask);
                            }
                        }
                    }
                    if (resp.bid && resp.bid.items) {
                        for (let i=0; i<resp.bid.items.length; i++) {
                            if (i==0) {
                                resp.bid.items[i].totalAmount = resp.bid.items[i].amount;
                            } else {
                                resp.bid.items[i].totalAmount = resp.bid.items[i - 1].totalAmount + resp.bid.items[i].amount;
                            }
                        }
                        let askMaxPostion = this.plate.maxPostion;
                        let bidLength = resp.bid.items.length;
                        if (askMaxPostion >= bidLength) {
                            for (let i=0; i<bidLength; i++) {
                                let bid = resp.bid.items[i];
                                bid.direction = "BUY";
                                bid.amount = bid.amount.toFixed(3);
                                bid.price = bid.price.toFixed(3);
                                bid.position = i + 1;
                                this.plate.bidRows.push(bid);
                            }
                        } else {
                            for (let i = bidLength - askMaxPostion; i<bidLength; i++) {
                                let bid = resp.bid.items[i];
                                bid.direction = "BUY";
                                bid.amount = bid.amount.toFixed(3);
                                bid.price = bid.price.toFixed(3);
                                bid.position = i + 1;
                                this.plate.bidRows.push(bid);
                            }
                        }
                    }
                })
            },
            getTrade() {
                let params = {};
                params["symbol"] = this.currentCoin.symbol;
                params["size"] = 20;
                this.$http.post(this.host + this.api.market.trade, params).then(response => {
                        this.plate.tradeRows = [];
                        let resp = response.body;
                        for (let i = 0; i < resp.length; i++) {
                            this.plate.tradeRows.push(resp[i]);
                        }
                    });
            },
            timeFormat: function (tick) {
                return moment(tick).format("HH:mm:ss");
            },
            dateFormat: function (tick) {
                return moment(tick).format("YYYY-MM-DD HH:mm:ss");
            },
        }
    }
</script>

<style scoped>
    .main_background {
        background-color: #192330;
        height: 600px;
        /*padding: 10px;*/
        color: #fff;
    }
    .table_tab /deep/ .ivu-table-cell {
        padding-left: 0px;
        padding-right: 0px;
    }
</style>
