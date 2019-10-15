<template>
    <div style="background-color: #192330">
        <div>
            <ButtonGroup style="margin: 20px 84px 10px 84px">
                <Button type="primary" @click="buyIn" style="width: 104px">
                    购买
                </Button>
                <Button type="primary" @click="sellOut" style="width: 104px">
                    出售
                </Button>
            </ButtonGroup>
        </div>
        <div class="main_top">
            <Tabs v-model="pane" :animated="false" @on-click="tabSelected">
                <!--<TabPane name="USDT" label="USDT"></TabPane>
                <TabPane name="BTC" label="BTC"></TabPane>
                <TabPane name="ETH" label="ETH"></TabPane>-->
                <TabPane  v-for="(coin, index) in coins" :key="index" :name="coin.unit" :label="coin.unit"></TabPane>
            </Tabs>
        </div>
        <div class="text-price">
            <div class="text-price-coin"><h2>{{ pane }}</h2></div>
            <div class="text-price-price">
                <div style="display: inline-block">{{ price }} CNY</div>
                <div :class="updownPr" style="font-size: 14px; display: inline-block">{{ updown }}%</div>
            </div>
            <div class="text-price-average">最新成交均价 {{ average }} CNY</div>
        </div><hr>
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: "OTCHome",
        data() {
            return {
                pane: 'USDT',
                price: '7.00',
                range: 0.01,
                updown: '',
                updownPr: '',
                average: 6.93,
                coins: [],
            }
        },
        created: function () {
            this.initPr();
            this.initCoin();
        },
        computed: {
            isLogin: function() {
                return this.$store.getters.isLogin;
            }
        },
        methods: {
            initPr () {
                if (this.range>0) {
                    this.updown = '+' + this.range;
                    this.updownPr = 'text-price-up';
                } else if (this.range<0) {
                    this.updown = this.range;
                    this.updownPr = 'text-price-down';
                } else {
                    this.updown = '0.00';
                }
            },
            initCoin () {
                //this.$store.commit("navigate", "nav-otc");
                this.$http.post(this.host + this.api.otc.coin).then(response => {
                    if (response.body.code == 0) {
                        this.coins = response.body.data;
                        /*this.$nextTick(function() {
                            this.$refs.navMenu.updateActiveName();
                        });*/
                    }
                });
            },
            buyIn () {
                this.$store.commit("buyInSel", true);
            },
            sellOut () {
                this.$store.commit("buyInSel", false);
            },
            tabSelected () {
                this.$router.push("/otc/trade/" + this.pane);
            },
            publishAdver () {
                if (this.isLogin) {
                    this.$router.push({
                        path: "/uc/ad/create"
                    });
                } else {
                    this.$Message.warning("请先登录");
                }
            },
            goBusiness() {
                if (this.isLogin) {
                    this.$router.push({
                        path: "/identbusiness"
                    });
                } else {
                    this.$Message.warning("请先登录");
                }
            },
        }
    }
</script>

<style scoped>
    .main_top /deep/ .ivu-tabs-bar {
        margin-bottom: 0px;
    }

    .main_top /deep/ .ivu-tabs-nav .ivu-tabs-tab {
        font-size: 16px;
    }

    .ivu-menu-vertical /deep/ .ivu-menu-item-group-title {
        font-size: 16px;
    }

    .ivu-menu-dark {
        background: #192330;
    }

    .ivu-menu-dark.ivu-menu-vertical
    .ivu-menu-item-active:not(.ivu-menu-submenu),
    .ivu-menu-dark.ivu-menu-vertical
    .ivu-menu-submenu-title-active:not(.ivu-menu-submenu) {
        color: #f0ac19;
    }

    /*.ivu-menu-vertical .ivu-menu-item, .ivu-menu-vertical .ivu-menu-submenu-title {
        padding: 14px 28px;
    }*/

    .ivu-menu-dark.ivu-menu-vertical .ivu-menu-item, .ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu-title {
        font-size: 16px;
    }

    .text-price {
        width: 100%;
        height: 110px;
        background: #192330;
    }

    .text-price-coin {
        padding-top: 10px;
        padding-left: 18px;
    }

    .text-price-price {
        padding-left: 18px;
        font-size: 24px;
    }

    .text-price-up {
        color: limegreen;
    }

    .text-price-down {
        color: #ff173e;
    }

    .text-price-average {
        padding-left: 18px;
        font-size: 14px;
        color: #828ea1;
    }

    hr {
        border-color: #4c5151;
    }

    .ivu-table td {
        background-color: #192330;
    }


</style>
