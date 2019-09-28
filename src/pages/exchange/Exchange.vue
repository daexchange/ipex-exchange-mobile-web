<template>
    <div style="background: #1d293a;">
        <div style="width: 100%">
            <div style="padding: 10px; height: 40px; color: #c6e9f8">
                <router-link to="/symbol">
                    <div style="float: left; font-size: 18px">
                        {{ currentCoin.symbol }} <Icon type="md-arrow-round-forward" />
                    </div>
                </router-link>
                <div style="float: right; font-size: 18px">
                    <Icon type="ios-stats" />
                    <router-link :to=" '/detail/'+ link ">查看行情</router-link>
                </div>
            </div>
            <div style="height: 450px">
                <div class="tabPage1" style="float: left; width: 50%">
                    <van-tabs background="#2a2c39" color="#fff" title-active-color="#fff">
                        <van-tab :title=" '买入(' +  currentCoin.coin  + ')' ">
                            <ButtonGroup style="margin: 10px 10px 0px 10px">
                                <Button v-model="priceDeal" type="primary" style="width: 84px"
                                        @click="changeTransType(true)">
                                    限价
                                </Button>
                                <Button v-model="priceDeal" type="primary" style="width: 84px"
                                        @click="changeTransType(false)">
                                    市价
                                </Button>
                            </ButtonGroup>
                            <div class="input_button" style="width: 190px; margin: 20px 10px">
                                <Input id="buyingRate" v-model="buyingRate" size="large" placeholder="买入价"
                                       style="width: 170px;"/>
                                <Input id="purchases" v-model="purchases" size="large" placeholder="买入量"
                                       style="width: 170px; margin-top: 20px"/>
                                <ButtonGroup size="small" style="margin-top: 20px">
                                    <Button disabled style="width: 43px">25%</Button>
                                    <Button disabled style="width: 43px">50%</Button>
                                    <Button disabled style="width: 43px">75%</Button>
                                    <Button disabled style="width: 43px">100%</Button>
                                </ButtonGroup>
                                <div style="font-size: 14px; color: #d5e8fc; margin: 20px">
                                    交易额：<br>{{buyingRate * purchases }} ETH
                                </div>
                                <div style="font-size: 14px; color: #d5e8fc; margin: 20px">
                                    可用：<br v-model="wallet.base">{{this.wallet.base ? this.wallet.base : 0.00}} ETH
                                </div>
                                <Button type="primary" style="width: 170px" @click="buy">买入</Button>
                            </div>
                        </van-tab>
                        <van-tab :title=" '卖出(' +  currentCoin.coin  + ')' ">
                            <ButtonGroup style="margin: 10px 10px 0px 10px">
                                <Button v-model="priceDeal" type="primary" style="width: 84px"
                                        @click="changeTransType(true)">
                                    限价
                                </Button>
                                <Button v-model="priceDeal" type="primary" style="width: 84px"
                                        @click="changeTransType(false)">
                                    市价
                                </Button>
                            </ButtonGroup>
                            <div class="input_button" style="width: 190px; margin: 20px 10px">
                                <Input id="sellingPrice" v-model="sellingPrice" size="large" placeholder="卖出价"
                                       style="width: 170px;"/>
                                <Input id="sellingPurchases" v-model="sellingPurchases" size="large" placeholder="卖出量"
                                       style="width: 170px; margin-top: 20px"/>
                                <ButtonGroup size="small" style="margin-top: 20px;">
                                    <Button disabled style="width: 43px">25%</Button>
                                    <Button disabled style="width: 43px">50%</Button>
                                    <Button disabled style="width: 43px">75%</Button>
                                    <Button disabled style="width: 43px">100%</Button>
                                </ButtonGroup>
                                <div style="font-size: 14px; color: #d5e8fc; margin: 20px">
                                    交易额：<br>{{sellingPrice * sellingPurchases}} ETH
                                </div>
                                <div style="font-size: 14px; color: #d5e8fc; margin: 20px">
                                    可用：<br v-model="wallet.base"> {{this.wallet.base ? this.wallet.base : 0.00}} ETH
                                </div>
                                <Button type="primary" @click="sell" style="width: 170px">卖出</Button>
                            </div>
                        </van-tab>
                    </van-tabs>
                </div>
                <div class="table_wap" style="float: right; width: 50%">
                    <Table class="data_table" size="small" :columns="plate.columnsSell" :data="plate.askRows"></Table>
                    <div class="plate-nowprice">
                        <span class="price" :class="{buy:currentSymbol.change>0,sell:currentSymbol.change<0}">{{currentSymbol.close}}</span>
                        <span v-if="currentSymbol.change>0" class="buy">↑</span>
                        <span v-else-if="currentSymbol.change<0" class="sell">↓</span>
                        <span class="price-cny"> ≈ {{currentSymbol.close * CNYPrice | toFixed(2)}} CNY</span>
                    </div>
                    <Table class="data_table" :show-header="showHeader" size="small" :columns="plate.columnsBuy"
                           :data="plate.bidRows"></Table>
                </div>
            </div>
        </div>
        <hr>
        <div class="bottom_page" style="width: 100%">
            <Tabs value="name1" :animated="false">
                <TabPane label="当前委托" name="name1">
                    <Table size="small" :columns="currentOrder.columns" :data="currentOrder.rows"></Table>
                </TabPane>
                <TabPane label="历史委托" name="name2">
                    <Table size="small" :columns="historyOrder.columns" :data="historyOrder.rows"></Table>
                </TabPane>
            </Tabs>
        </div>
    </div>
</template>

<script>
    import expandRow from "@components/exchange/expand.vue";
    import Datafeeds from "@js/charting_library/datafeed/bitrade.js";

    var Stomp = require("stompjs");
    var SockJS = require("sockjs-client");
    var moment = require("moment");
    import DepthGraph from "@components/exchange/DepthGraph.vue";
    import $ from "@js/jquery.min.js";
    //import {loadBaseSymbol} from '@/config/exchange'

    export default {
        components: {expandRow, DepthGraph},
        data() {
            let self = this;
            return {
                link: '',
                CNYPrice: null,
                showHeader: false,
                priceDeal: true,// 定义一个变量表示买入限价交易或者市价交易
                buyingRate: 0.0,// 买入价
                purchases: 0.0, // 买入量
                sellingPrice: 0.0,// 卖出价
                sellingPurchases: 0.0, // 卖出量
                turnover: 0.0,// 交易额
                defaultPath: "TLM_ETH",
                isUseBHB: false, //是否试用BHB抵扣手续费
                // 当前币对的信息
                currentCoin: {
                    base: "ETH", // 基础币
                    coin: "TLM",// 代币
                    symbol: "TLM/ETH" // 交易币对
                },
                currentSymbol: {},
                // 钱包
                wallet: {
                    base: 0.0, // 基础币的数量
                    coin: 0.0  // 代币的数量
                },
                plate: {
                    maxPostion: 6,
                    columnsBuy: [
                        {
                            title: '价格',
                            key: 'price',
                            align: 'center',
                            //width: 105,
                        },
                        {
                            title: '数量',
                            key: 'amount',
                            align: 'center',
                            //width: 62,
                        },
                    ],
                    columnsSell: [
                        {
                            title: '价格',
                            key: 'price',
                            align: 'center',
                            //width: 105,
                        },
                        {
                            title: '数量',
                            key: 'amount',
                            align: 'center',
                            //width: 62,
                        },
                    ],
                    askRows: [],
                    bidRows: [],
                },
                currentOrder: {
                    columns: [
                        {
                            title: "交易对",
                            key: "symbol"
                        },
                        {
                            title: self.$t("exchange.direction"),
                            key: "direction",
                            render: (h, params) => {
                                const row = params.row;
                                const className = row.direction.toLowerCase();
                                return h(
                                    "span",
                                    {
                                        attrs: {
                                            class: className
                                        }
                                    },
                                    row.direction == "BUY"
                                        ? self.$t("exchange.buyin")
                                        : self.$t("exchange.sellout")
                                );
                            }
                        },
                        {
                            title: self.$t("exchange.price"),
                            key: "price",
                            render(h, params) {
                                return h("span", self.toFloor(params.row.price));
                            }
                        },
                        {
                            title: self.$t("exchange.num"),
                            key: "amount",
                            render(h, params) {
                                return h("span", self.toFloor(params.row.amount));
                            }
                        },
                    ],
                    rows: []
                },
                historyOrder: {
                    columns: [
                        {
                            title: "交易对",
                            key: "symbol"
                        },
                        {
                            title: self.$t("exchange.direction"),
                            key: "direction",
                            render: (h, params) => {
                                const row = params.row;
                                const className = row.direction.toLowerCase();
                                return h(
                                    "span",
                                    {
                                        attrs: {
                                            class: className
                                        }
                                    },
                                    row.direction == "BUY"
                                        ? self.$t("exchange.buyin")
                                        : self.$t("exchange.sellout")
                                );
                            }
                        },
                        {
                            title: self.$t("exchange.price"),
                            key: "price",
                            render(h, params) {
                                return h("span", self.toFloor(params.row.price));
                            }
                        },
                        {
                            title: self.$t("exchange.num"),
                            key: "amount",
                            render(h, params) {
                                return h("span", self.toFloor(params.row.amount));
                            }
                        },
                    ],
                    rows: []
                },
            }
        },
        computed: {
            isLogin: function () {
                return this.$store.getters.isLogin;
            },
            member: function () {
                return this.$store.getters.member;
            },
        },
        created: function () {
            this.init();
        },
        methods: {
            showPopup() {
              this.show = true;
              console.log(this.show);
            },
            init() {
                this.link = this.$route.params[0];
                if (this.$route.params[0] == undefined) {
                    // this.$router.push("/exchange/" + this.defaultPath);
                    this.$route.params[0] = this.defaultPath;
                }
                let splitSymbol = this.link.split("_");
                this.currentCoin.coin = splitSymbol[0].toUpperCase();
                this.currentCoin.base = splitSymbol[1].toUpperCase();
                this.currentCoin.symbol = splitSymbol[0].toUpperCase()+"/"+splitSymbol[1].toUpperCase();
                this.getPlate();
                this.getCNYRate();
                this.getSymbol();
                if (this.isLogin && this.member.realName) {
                    this.getWallet(); //账户资产信息
                }
            },
            /**
             * 获取买卖盘信息
             */
            getPlate() {
                let params = {};
                params["symbol"] = this.currentCoin.symbol;
                this.$http.post(this.host + this.api.market.platemini, params).then(response => {
                    this.plate.askRows = [];
                    this.plate.bidRows = [];
                    let resp = response.body;
                    if (resp.ask && resp.ask.items) {
                        for (let i = 0; i < resp.ask.items.length; i++) {
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
                                ask.amount = ask.amount.toFixed(5);
                                ask.price = ask.price.toFixed(5);
                                ask.position = i;
                                this.plate.askRows.push(ask);
                            }
                        } else {
                            for (let i = askLength; i > askLength - askMaxPostion; i--) {
                                let ask = resp.ask.items[i - 1];
                                ask.direction = "SELL";
                                ask.amount = ask.amount.toFixed(5);
                                ask.price = ask.price.toFixed(5);
                                ask.position = i;
                                this.plate.askRows.push(ask);
                            }
                        }
                    }
                    if (resp.bid && resp.bid.items) {
                        for (let i = 0; i < resp.bid.items.length; i++) {
                            if (i == 0) {
                                resp.bid.items[i].totalAmount = resp.bid.items[i].amount;
                            } else {
                                resp.bid.items[i].totalAmount = resp.bid.items[i - 1].totalAmount + resp.bid.items[i].amount;
                            }
                        }
                        let askMaxPostion = this.plate.maxPostion;
                        let bidLength = resp.bid.items.length;
                        if (askMaxPostion >= bidLength) {
                            for (let i = 0; i < bidLength; i++) {
                                let bid = resp.bid.items[i];
                                bid.direction = "BUY";
                                bid.amount = bid.amount.toFixed(5);
                                bid.price = bid.price.toFixed(5);
                                bid.position = i + 1;
                                this.plate.bidRows.push(bid);
                            }
                        } else {
                            for (let i = bidLength - askMaxPostion; i < bidLength; i++) {
                                let bid = resp.bid.items[i];
                                bid.direction = "BUY";
                                bid.amount = bid.amount.toFixed(5);
                                bid.price = bid.price.toFixed(5);
                                bid.position = i + 1;
                                this.plate.bidRows.push(bid);
                            }
                        }
                    }
                })
            },
            /**
             * 建立websocket连接
             */
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
                    //that.getKline();

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
            /**
             * 切换市价交易和限价交易类型
             * @param flag
             */
            changeTransType(flag) {
                this.priceDeal = flag;
                //console.log('priceDeal: ', this.priceDeal);
            },
            /**
             * 买入
             */
            buy() {
                if (this.priceDeal) {
                    console.log('this is buy price deal');
                    this.buyPriceDeal();
                } else {
                    console.log('this is buy market deal');
                    this.buyMarketPrice();
                }
            },
            /**
             * 买入限价交易
             */
            buyPriceDeal() {
                if (this.purchases == '' || this.buyingRate == '') {
                    this.$Notice.error({
                        title: this.$t("exchange.tip"),
                        desc: this.$t("exchange.buyamounttip")
                    });
                    return;
                }
                let maxPurchase = this.wallet.base / this.buyingRate;
                if (this.purchases > maxPurchase) {
                    this.$Notice.error({
                        title: this.$t("exchange.tip"),
                        desc:
                            this.$t("exchange.buyamounttipwarning") + this.toFloor(maxPurchase)
                    });
                    return;
                }
                let that = this;
                let params = {};
                params["symbol"] = this.currentCoin.symbol;
                params["price"] = this.buyingRate;
                params["amount"] = this.purchases;
                params["direction"] = "BUY";
                params["type"] = "LIMIT_PRICE";
                params["useDiscount"] = this.isUseBHB ? "1" : "0"; //是否试用手续费抵扣,0 不使用 1使用
                this.$http
                    .post(this.host + this.api.exchange.orderAdd, params)
                    .then(response => {
                        let resp = response.body;
                        if (resp.code == 0) {
                            this.$Notice.success({
                                title: that.$t("exchange.tip"),
                                desc: that.$t("exchange.success")
                            });
                            this.getWallet();
                            this.getCurrentOrder();
                            this.getHistoryOrder();
                            this.form.buy.limitAmount = 0;
                        } else {
                            this.$Notice.error({
                                title: that.$t("exchange.tip"),
                                desc: resp.message
                            });
                        }
                    });

            },
            /**
             * 买入市价交易
             */
            buyMarketPrice() {
                if (this.purchases == "") {
                    this.$Notice.error({
                        title: this.$t("exchange.tip"),
                        desc: this.$t("exchange.pricetip")
                    });
                    return;
                }
                if (this.purchases > parseFloat(this.wallet.base)) {
                    this.$Notice.error({
                        title: this.$t("exchange.tip"),
                        desc: this.$t("exchange.pricetipwarning") + this.wallet.base
                    });
                    return;
                }
                let params = {};
                params["symbol"] = this.currentCoin.symbol;
                params["price"] = 0;
                params["amount"] = this.purchases;
                params["direction"] = "BUY";
                params["type"] = "MARKET_PRICE";
                params["useDiscount"] = this.isUseBHB ? "1" : "0"; //是否试用手续费抵扣,0 不使用 1使用
                let that = this;
                this.$http
                    .post(this.host + this.api.exchange.orderAdd, params)
                    .then(response => {
                        let resp = response.body;
                        if (resp.code == 0) {
                            this.$Notice.success({
                                title: that.$t("exchange.tip"),
                                desc: that.$t("exchange.success")
                            });
                            this.refreshAccount();
                        } else {
                            this.$Notice.error({
                                title: that.$t("exchange.tip"),
                                desc: resp.message
                            });
                        }
                    });
            },
            /**
             * 获取钱包信息
             */
            getWallet() {
                // 查询基础币的余额
                this.$http
                    .post(this.host + this.api.uc.wallet + this.currentCoin.base, {})
                    .then(response => {
                        let resp = response.body;
                        this.wallet.base = resp.data.balance || "";
                        console.log('this.wallet.base', this.wallet.base);
                    });
                // 查询代币的余额
                this.$http
                    .post(this.host + this.api.uc.wallet + this.currentCoin.coin, {})
                    .then(response => {
                        let resp = response.body;
                        this.wallet.coin = resp.data.balance;
                        console.log('this.wallet.coin', this.wallet.coin);
                    });
            },
            /**
             * 查询当前委托单的数据
             */
            getCurrentOrder() {
                //查询当前委托
                let params = {};
                params["pageNo"] = 0;
                params["pageSize"] = 100;
                params["symbol"] = this.defaultPath;
                this.currentOrder.rows = [];
                let that = this;
                this.$http.post(this.host + this.api.exchange.current, params).then(response => {
                    let resp = response.body;
                    if (resp.content.length > 0) {
                        this.currentOrder.rows = resp.content.slice(0, 3);
                        this.currentOrder.rows.forEach((row, index) => {
                            row.skin = that.skin;
                            row.price =
                                row.type == "MARKET_PRICE"
                                    ? that.$t("exchange.marketprice")
                                    : row.price;
                        });
                    }
                });
            },
            /**
             * 查询历史委托单的数据
             */
            getHistoryOrder(pageNo) {
                //查询历史委托
                if (pageNo == undefined) {
                    pageNo = this.historyOrder.page;
                } else {
                    pageNo = pageNo - 1;
                }
                this.historyOrder.rows = []; //清空数据
                let params = {};
                params["pageNo"] = pageNo;
                params["pageSize"] = this.historyOrder.pageSize;
                params["symbol"] = this.currentCoin.symbol;
                let that = this;
                this.$http
                    .post(this.host + this.api.exchange.history, params)
                    .then(response => {
                        let resp = response.body;
                        let rows = [];
                        if (resp.content.length > 0) {
                            this.historyOrder.total = resp.totalElements;
                            this.historyOrder.page = resp.number;
                            for (let i = 0; i < 3; i++) {
                                let row = resp.content[i];
                                if (row) {
                                    row.skin = that.skin;
                                    row.price =
                                        row.type == "MARKET_PRICE"
                                            ? that.$t("exchange.marketprice")
                                            : row.price;
                                    // this.historyOrder.rows.push(row);
                                    rows.push(row);
                                }
                            }
                            this.historyOrder.rows = rows;
                        }
                    });
            },
            /**
             * 刷新账户信息
             */
            refreshAccount: function () {
                this.getCurrentOrder();
                this.getHistoryOrder();
                this.getWallet();
            },

            /**
             * 卖出
             */
            sell() {
                if (this.priceDeal) {
                    console.log('this is sell price deal');
                    this.sellPriceDeal();
                } else {
                    console.log('this is sell market deal');
                    this.sellMarketPrice();
                }
            },

            /**
             * 卖出限价交易
             */
            sellPriceDeal() {
                if (this.sellingPurchases == '') {
                    this.$Notice.error({
                        title: this.$t("exchange.tip"),
                        desc: this.$t("exchange.sellamounttip")
                    });
                    return;
                }
                if (this.sellingPrice == '') {
                    this.$Notice.error({
                        title: this.$t("exchange.tip"),
                        desc: this.$t("exchange.sellpricetip")
                    });
                    return;
                }
                if (this.sellingPurchases > parseFloat(this.wallet.coin)) {
                    this.$Notice.error({
                        title: this.$t("exchange.tip"),
                        desc: "最多能卖" + this.wallet.coin + "个"
                    });
                    return;
                }
                let params = {};
                params["symbol"] = this.currentCoin.symbol;
                params["price"] = this.sellingPrice;
                params["amount"] = this.sellingPurchases;
                params["direction"] = "SELL";
                params["type"] = "LIMIT_PRICE";
                params["useDiscount"] = this.isUseBHB ? "1" : "0"; //是否试用手续费抵扣,0 不使用 1使用
                let that = this;
                this.$http
                    .post(this.host + this.api.exchange.orderAdd, params)
                    .then(response => {
                        let resp = response.body;

                        if (resp.code == 0) {
                            this.$Notice.success({
                                title: that.$t("exchange.tip"),
                                desc: that.$t("exchange.success")
                            });
                            this.refreshAccount();
                            this.sellingPurchases = 0;
                        } else {
                            this.$Notice.error({
                                title: that.$t("exchange.tip"),
                                desc: resp.message
                            });
                        }
                    });
            },

            /**
             * 卖出市价交易
             */
            sellMarketPrice() {
                console.log('this.sellingPurchases', this.sellingPurchases)
                if (this.sellingPurchases == '') {
                    this.$Notice.error({
                        title: this.$t("exchange.tip"),
                        desc: this.$t("exchange.sellamounttip")
                    });
                    return;
                }
                if (this.sellingPurchases > parseFloat(this.wallet.coin)) {
                    this.$Notice.error({
                        title: this.$t("exchange.tip"),
                        desc: "最多能卖" + this.wallet.coin + "个"
                    });
                    return;
                }

                let params = {};
                params["symbol"] = this.currentCoin.symbol;
                params["price"] = 0;
                params["amount"] = this.sellingPurchases;
                params["direction"] = "SELL";
                params["type"] = "MARKET_PRICE";
                params["useDiscount"] = this.isUseBHB ? "1" : "0"; //是否试用手续费抵扣,0 不使用 1使用
                let that = this;
                this.$http
                    .post(this.host + this.api.exchange.orderAdd, params)
                    .then(response => {
                        let resp = response.body;
                        if (resp.code == 0) {
                            this.$Notice.success({
                                title: that.$t("exchange.tip"),
                                desc: that.$t("exchange.success")
                            });
                            this.refreshAccount();
                        } else {
                            this.$Notice.error({
                                title: that.$t("exchange.tip"),
                                desc: resp.message
                            });
                        }
                    });
            },

            /**
             * 获取精度
             */
            getSymbolScale() {
                //获取精度
                this.$http
                    .post(this.host + this.api.market.symbolInfo, {
                        symbol: this.currentCoin.symbol
                    })
                    .then(response => {
                        let resp = response.body;
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
                            this.currentSymbol = resp[i];
                        }
                    }
                });
            },
            /**
             * 获取人民币价格
             */
            getCNYRate() {
                this.$http.get(this.host + this.api.uc.cnyrate +
                    this.currentCoin.base).then(response => {
                    var resp = response.body;
                    this.CNYPrice = resp.data||1;
                })
                // this.CNYPrice = this.getCoinCNYRate(this.basecion.toUpperCase());
            },
        }
    }
</script>

<style scoped>
    .tabPage1 /deep/ .ivu-tabs-bar {
        border-width: 0px;
        margin-bottom: 0px;
    }

    .tabPage1 /deep/ .ivu-tabs-mini .ivu-tabs-tab {
        font-size: 14px;
    }

    .table_wap /deep/ .ivu-table th {
        /*background-color: #0D214D;*/
        background-color: #1d293a;
    }

    .table_wap /deep/ .ivu-table td {
        /*background-color: #0D214D;*/
        background-color: #1d293a;
    }

    .table_wap /deep/ .ivu-table-small td {
        height: 30px;
    }

    .table_wap /deep/ .ivu-table-wrapper {
        border: 1px solid #2c3b59;
    }

    .table_wap /deep/ .ivu-table td, .ivu-table th {
        border-bottom: 0px solid #2c3b59;
    }

    .plate-nowprice {
        background-color: #27313e;
        height: 30px;
        line-height: 30px;
        padding: 0px 15px;
    }

    span {
        margin-right: 6px;
        display: inline-block;
        font-size: 12px;
        color: #ccc;
    }

    .bottom_page /deep/ .ivu-tabs {
        margin-top: 7px;
    }

    .bottom_page /deep/ .ivu-tabs-bar {
        border-bottom: 0px solid #dcdee2;
        margin-bottom: 0px;
    }

    .bottom_page /deep/ .ivu-table th {
        background-color: #2a2c39;
    }

    .bottom_page /deep/ .ivu-table td {
        background-color: #2a2c39;
    }

    .bottom_page /deep/ .ivu-table-wrapper {
        border: 1px solid #2a2c39;
    }

    .bottom_page /deep/ .ivu-table td, .ivu-table th {
        border-bottom: 0px solid #2a2c39;
    }
    .buy {
        color: #00b275;
    }
    .sell {
        color: #f15057;
    }
</style>
