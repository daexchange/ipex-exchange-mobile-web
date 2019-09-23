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
        <div class="table_tab">
            <van-tabs v-model="active" background="#2a2c39" color="#fff" title-active-color="#fff">
                <van-tab title="盘口">
                    <Table size="small" :columns="plate.columnsBuy" :data="plate.askRows" style="float: left"></Table>
                    <Table size="small" :columns="plate.columnsSell" :data="plate.bidRows" style="float: right"></Table>
                </van-tab>
                <van-tab title="实时成交">
                </van-tab>
            </van-tabs>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
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
                    askRows: [],
                    bidRows: [],
                }
            }
        },
        created: function() {
            this.init();
        },
        methods: {
            init() {
                this.getPlate();
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
                                ask.amount = ask.amount.toFixed(2);
                                ask.price = ask.price.toFixed(3);
                                ask.position = i;
                                this.plate.askRows.push(ask);
                            }
                        } else {
                            for (let i = askLength; i > askLength-askMaxPostion; i--) {
                                let ask = resp.ask.items[i - 1];
                                ask.direction = "SELL";
                                ask.amount = ask.amount.toFixed(2);
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
                                bid.amount = bid.amount.toFixed(2);
                                bid.price = bid.price.toFixed(3);
                                bid.position = i + 1;
                                this.plate.bidRows.push(bid);
                            }
                        } else {
                            for (let i = bidLength - askMaxPostion; i<bidLength; i++) {
                                let bid = resp.bid.items[i];
                                bid.direction = "BUY";
                                bid.amount = bid.amount.toFixed(2);
                                bid.price = bid.price.toFixed(3);
                                bid.position = i + 1;
                                this.plate.bidRows.push(bid);
                            }
                        }
                    }
                })
            }
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
