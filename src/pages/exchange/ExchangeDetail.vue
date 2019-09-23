<template>
    <div class="main_background">
        <div>
            <div style="float: left">
                <span style="font-size: 18px">ETH/BTC</span>
                <div style="font-size: 18px">0.020988</div>
                <div>≈ ¥ 1473.41</div>
            </div>
            <div style="float: right;font-size: 16px">
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
            <van-tabs v-model="active" background="#2a2c39" color="#fff" title-active-color="#fff">
                <van-tab title="盘口">
                    <Table :columns="columnsBuy" style="float: left"></Table>
                    <Table :columns="columnsSell" style="float: right"></Table>
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
                    columnsBuy: [
                        {
                            title: '买入',
                            key: 'buy',
                            width: 30,
                        },
                        {
                            title: '数量',
                            key: 'num',
                            width: 60,
                        },
                        {
                            title: '价格',
                            key: 'price',
                            width: 60,
                        },
                    ],
                    columnsSell: [
                        {
                            title: '买入',
                            key: 'buy',
                            width: 30,
                        },
                        {
                            title: '数量',
                            key: 'num',
                            width: 60,
                        },
                        {
                            title: '价格',
                            key: 'price',
                            width: 60,
                        },
                    ],
                    askRows: [],
                    bidRows: [],
                }
            }
        },
        methods: {
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
        padding: 10px;
        color: #fff;
    }
</style>
