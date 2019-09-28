<template>
    <div class="symbol_main">
        <Tabs v-model="baseCoin" @on-click="changeTab" size="small" :animated="false">
            <TabPane v-for="(item, index) in baseSymbols" :key="index" :name="item.name" :label="item.label"></TabPane>
        </Tabs>
        <Table size="small" @on-current-change="gohref" highlight-row :columns="symbolList.columns" :data="symbolList.tableData"></Table>
    </div>
</template>

<script>
    export default {
        name: "SymbolList",
        data() {
            return {
                pane: '',
                baseSymbols: [],
                baseCoin: 'USDT',
                symbolList: {
                    columns: [
                        {
                            title: this.$t("exchange.coin"),
                            key: "coin",
                            width: 70,
                            align: 'center'
                        },
                        {
                            title: this.$t("exchange.lastprice"),
                            key: "close",
                            align: 'center'
                        },
                        {
                            title: this.$t("exchange.daychange"),
                            key: "rose",
                            //align: 'center',
                            sortable: true,
                            sortMethod: function (a, b, type) {
                                let a1 = a.replace(/[^\d|.|-]/g, "") - 0;
                                let b1 = b.replace(/[^\d|.|-]/g, "") - 0;
                                if (type == "asc") {
                                    return a1 - b1;
                                } else {
                                    return b1 - a1;
                                }
                            },
                            render: (h, params) => {
                                const row = params.row;
                                const className = parseFloat(row.rose) < 0 ? "sell" : "buy";
                                return h(
                                    "span",
                                    {
                                        attrs: {
                                            class: className
                                        }
                                    },
                                    row.rose
                                );
                            }
                        }
                    ],
                    tableData: [],
                },
            }
        },
        computed: {
            isLogin: function () {
                return this.$store.getters.isLogin;
            },
        },
        created: function() {
            this.init();
        },
        methods: {
            init() {
                this.loadBaseSymbol();
                this.getSearchSymbol();
            },
            gohref(currentRow, oldCurrentRow) {
                // location.href = "/#exchange/" + currentRow.href;
                // location.reload();
                const path = "/exchange/" + currentRow.href;
                this.$router.push({
                    path
                });
            },
            changeTab() {
                this.getSearchSymbol();
            },
            loadBaseSymbol() {
                let params = {};
                this.$http.post(this.host + this.api.market.baseSymbols, params).then(response => {
                    let resp = response.body;
                    //先清空已有数据
                    this.baseSymbols = [];
                    for (let i = 0; i < resp.length; i++) {
                        let baseSymbol = resp[i];
                        this.baseSymbols.push({
                            label: baseSymbol,
                            name: baseSymbol.toLowerCase()
                        });
                    }
                    if (this.isLogin == true) {
                        this.baseSymbols.push({
                            label: this.$t("service.CUSTOM"),
                            name: 'favor'
                        });
                    }
                });
            },
            getSearchSymbol() {
                if (this.baseCoin == 'favor' && this.isLogin) {
                    this.getFavor();
                    return;
                }
                let params = {
                    coinSymbol: null,
                    basecion: this.baseCoin
                };
                this.$http.post(this.host + this.api.market.thumb, params).then(response => {
                    //先清空已有数据
                    //this.coins._map = [];
                    // this.coins.favor = [];
                    this.symbolList['tableData'] = [];

                    let resp = response.body;

                    for (let i = 0; i < resp.length; i++) {
                        let coin = resp[i];

                        coin.price = resp[i].close;
                        coin.rose = resp[i].chg > 0
                            ? "+" + (resp[i].chg * 100).toFixed(2) + "%"
                            : (resp[i].chg * 100).toFixed(2) + "%";
                        coin.coin = resp[i].symbol.split("/")[0];
                        coin.base = resp[i].symbol.split("/")[1];
                        coin.href = (coin.coin + "_" + coin.base).toLowerCase();
                        /*for (let i=0; i<this.coins.favor.length; i++) {
                            if (coin.coin == this.coins.favor[i].coin && coin.base == this.coins.favor[i].base) {
                                coin.isFavor = true;
                            }
                        }
                        this.coins._map[coin.symbol] = coin;*/
                        //this.symbolList['tableData'].push(coin);
                        this.symbolList.tableData.push(coin);

                        /*if (coin.symbol == this.currentCoin.symbol) {
                            this.currentCoin = coin;
                            this.form.buy.limitPrice = this.form.sell.limitPrice = coin.price;
                        }*/
                        //console.log(coin);
                    }
                });
            },
        }
    }
</script>

<style scoped>
    /*.symbol_main {
        background-color: #0a152d;
    }*/
    .symbol_main /deep/ .ivu-tabs-mini .ivu-tabs-tab {
        font-size: 16px;
    }
    .symbol_main /deep/ .ivu-tabs-bar {
        margin-bottom: 10px;
        border-bottom: 1px solid #5e5e5e;
    }
    .symbol_main /deep/ .ivu-tabs-ink-bar {
        height: 3px;
    }
    .symbol_main /deep/ .ivu-table {
        color: #969799;
    }
    .symbol_main /deep/ .ivu-table:before {
        background-color: #0a152d;
    }
    .symbol_main /deep/ .ivu-table th {
        border-bottom: 0px;
        background-color: #0a152d;
    }
    .symbol_main /deep/ .ivu-table td {
        border-bottom: 0px;
        background-color: #0a152d;
    }
    .symbol_main /deep/ .ivu-table-wrapper {
        border: 0px;
    }

    .buy {
        color: #00b275;
    }

    .sell {
        color: #f15057;
    }
</style>
