<template>
    <div class="main_background">
        <div style="padding: 10px">
            <div style="float: left">
                <span style="font-size: 18px">{{ currentCoin.symbol }}</span>
                <!--<div style="font-size: 18px">0.020988</div>
                <div>≈ ¥ 1473.41</div>-->
                <div style="font-size: 24px; font-weight: bold">
                    <span :class="{buy:currentSymbol.change>0, sell:currentSymbol.change<0}">{{currentSymbol.close}}</span>
                    <span v-if="currentSymbol.change>0" class="buy">
                        <Icon type="md-arrow-up" size="28"/>
                    </span>
                    <span v-else-if="currentSymbol.change<0" class="sell">
                        <Icon type="md-arrow-down" size="28"/>
                    </span>
                </div>
                <div class="price-cny">
                    ≈ {{currentSymbol.close * CNYPrice | toFixed(2)}} CNY &nbsp;&nbsp;
                    <span :class="{buy:currentSymbol.change>0, sell:currentSymbol.change<0}">{{ currentSymbol.rose }}</span>
                </div>
            </div>
            <div style="float: right;font-size: 16px;text-align: right">
                <div>
                    24h量 {{ currentSymbol.volume }}</div>
                <div>
                    最高价 {{ currentSymbol.high }}
                </div>
                <div>
                    最低价 {{ currentSymbol.low }}
                </div>
            </div>
        </div>
        <hr style="margin-top: 80px">
        <div>
            <div id="kline_container" :class="{hidden:currentImgTable==='s'}" style="height: 350px"></div>
        </div>
        <div>
            <van-tabs background="#2a2c39" color="#fff" title-active-color="#fff">
                <van-tab title="盘口" class="table_tab1">
                    <Table size="small" :columns="plate.columnsBuy" :data="plate.askRows" style="float: left"></Table>
                    <Table size="small" :columns="plate.columnsSell" :data="plate.bidRows" style="float: right"></Table>
                </van-tab>
                <van-tab title="实时成交" class="table_tab2">
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
                currentSymbol: {},
                currentImgTable: "k",
                baseCoinScale: 2,
                currentCoin: {
                    base: "",
                    coin: "",
                    symbol: ""
                },
                plate: {
                    maxPostion: 20,
                    columnsBuy: [
                        {
                            title: '买入',
                            type: 'index',
                            width: 29,
                            align: 'center'
                        },
                        {
                            title: '数量',
                            key: 'amount',
                            align: 'center',
                            width: 78,
                        },
                        {
                            title: '价格',
                            key: 'price',
                            align: 'center',
                            width: 78,
                        },
                    ],
                    columnsSell: [
                        {
                            title: '价格',
                            key: 'price',
                            align: 'center',
                            width: 78,
                        },
                        {
                            title: '数量',
                            key: 'amount',
                            align: 'center',
                            width: 78,
                        },
                        {
                            title: '卖出',
                            type: 'index',
                            width: 29,
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
                CNYPrice: null,
            }
        },
        created: function() {
            this.init();
        },
        methods: {
            init() {
                let params = this.$route.params[0];
                if (params == undefined) {
                    // this.$router.push("/exchange/" + this.defaultPath);
                    params = this.defaultPath;
                }
                let splitSymbol = params.split("_");
                this.currentCoin.coin = splitSymbol[0].toUpperCase();
                this.currentCoin.base = splitSymbol[1].toUpperCase();
                this.currentCoin.symbol = splitSymbol[0].toUpperCase()+"/"+splitSymbol[1].toUpperCase();
                this.startWebsock();
                this.getSymbolScale();//精度
                this.getPlate();
                this.getTrade();
                this.getCNYRate();
                this.getSymbol();
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
            getSymbolScale() {
                //获取精度
                this.$http
                    .post(this.host + this.api.market.symbolInfo, {
                        symbol: this.currentCoin.symbol
                    })
                    .then(response => {
                        var resp = response.body;
                        if (resp != null) {
                            this.currentCoin.coinScale = resp.coinScale;
                            this.currentCoin.baseCoinScale = resp.baseCoinScale;
                            this.showCoinScale = resp.baseCoinScale;
                            this.currentCoinScale = resp.baseCoinScale;
                            this.baseCoinScale = resp.baseCoinScale;
                            this.coinScale = resp.coinScale;
                            this.symbolFee = resp.fee;
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
                                ask.amount = ask.amount.toFixed(6);
                                ask.price = ask.price.toFixed(6);
                                ask.position = i;
                                this.plate.askRows.push(ask);
                            }
                        } else {
                            for (let i = askLength; i > askLength-askMaxPostion; i--) {
                                let ask = resp.ask.items[i - 1];
                                ask.direction = "SELL";
                                ask.amount = ask.amount.toFixed(6);
                                ask.price = ask.price.toFixed(6);
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
                                bid.amount = bid.amount.toFixed(6);
                                bid.price = bid.price.toFixed(6);
                                bid.position = i + 1;
                                this.plate.bidRows.push(bid);
                            }
                        } else {
                            for (let i = bidLength - askMaxPostion; i<bidLength; i++) {
                                let bid = resp.bid.items[i];
                                bid.direction = "BUY";
                                bid.amount = bid.amount.toFixed(6);
                                bid.price = bid.price.toFixed(6);
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
            /**
             * 实时交易对兑换比率
             */
            getSymbol() {
                //this.startWebsock();
                let params = {
                    //coinSymbol: this.form.coinSymbol,
                    //basecion: this.currentCoin.base
                };
                //debugger
                this.$http.post(this.host + this.api.market.thumb, params).then(response => {
                    /*let resp = response.body;
                    //先清空已有数据
                    for (let i = 0; i < resp.length; i++) {
                        let coin = resp[i];
                        coin.base = resp[i].symbol.split("/")[1];
                        this.coins[coin.base] = [];
                        this.coins._map = [];
                        this.coins.favor = [];
                    }
                    this.coins['tableData'] = [];
                    for (let i = 0; i < resp.length; i++) {
                        let coin = resp[i];
                        coin.price = resp[i].close = resp[i].close.toFixed(
                            this.baseCoinScale
                        );
                        coin.rose =
                            resp[i].chg > 0
                                ? "+" + (resp[i].chg * 100).toFixed(2) + "%"
                                : (resp[i].chg * 100).toFixed(2) + "%";
                        coin.coin = resp[i].symbol.split("/")[0];
                        coin.base = resp[i].symbol.split("/")[1];
                        coin.href = (coin.coin + "_" + coin.base).toLowerCase();
                        coin.isFavor = false;
                        this.coins._map[coin.symbol] = coin;
                        // this.coins[coin.base].push(coin);
                        this.coins['tableData'].push(coin);
                        if (coin.symbol == this.currentCoin.symbol) {
                            this.currentCoin = coin;
                            this.form.buy.limitPrice = this.form.sell.limitPrice = coin.price;
                        }
                    }
                    if (this.basecion == 'favor' && this.isLogin) {
                        this.getFavor();
                    }
                    require(["../../assets/js/exchange.js"], function (e) {
                        e.clickScTab();
                    });*/
                    let resp = response.body;
                    for (let i=0; i<resp.length; i++) {
                        if (resp[i].symbol==this.currentCoin.symbol) {
                            resp[i].rose = resp[i].chg > 0 ? "+" + (resp[i].chg * 100).toFixed(2) + "%" : (resp[i].chg * 100).toFixed(2) + "%";
                            this.currentSymbol = resp[i];
                        }
                    }
                });
            },
            /**
             * 获取人民币价格
             */
            getCNYRate() {
                this.$http.get(this.host + "/uc/coin/cny-rate/"+
                    this.currentCoin.base).then(response => {
                    var resp = response.body;
                    this.CNYPrice = resp.data||1;
                })
                // this.CNYPrice = this.getCoinCNYRate(this.basecion.toUpperCase());
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
        /*height: 600px;*/
        /*padding: 10px;*/
        color: #fff;
    }
    .table_tab1 /deep/ .ivu-table th {
        border-bottom: 0px;
        background-color: #0a152d;
    }
    .table_tab1 /deep/ .ivu-table td {
        border-bottom: 0px;
        background-color: #0a152d;
    }
    .table_tab1 /deep/ .ivu-table-cell {
        padding-left: 0px;
        padding-right: 0px;
    }
    .table_tab2 /deep/ .ivu-table th {
        border-bottom: 0px;
        background-color: #0a152d;
    }
    .table_tab2 /deep/ .ivu-table td {
        border-bottom: 0px;
        background-color: #0a152d;
    }
    .buy {
        color: #00b275;
    }
    .sell {
        color: #f15057;
    }
</style>
