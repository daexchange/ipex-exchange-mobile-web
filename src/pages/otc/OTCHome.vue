<template>
    <div class="otc-content">
        <div class="menu">
            <div class="menu-title">
                <h3>法币交易</h3>
            </div>
            <div class="menu-content">
                <Menu active-name="buyIn" width="200px" theme="dark">
                    <MenuGroup title="普通交易">
                        <MenuItem class="menuItem-trade" @click.native="buyIn" name="buyIn">购买</MenuItem>
                        <MenuItem class="menuItem-trade" @click.native="sellOut" name="sellOut">出售</MenuItem>
                    </MenuGroup>
                    <!--<MenuGroup title="大宗交易">
                        <MenuItem class="menuItem-trade" name="buyInBlock">购买</MenuItem>
                        <MenuItem class="menuItem-trade" name="sellOutBlock">出售</MenuItem>
                    </MenuGroup>-->
                    <MenuItem class="menuItem-adver" name="publishAdver" @click.native="publishAdver">发布广告</MenuItem>
                    <MenuItem class="menuItem-adver" name="goBusiness" @click.native="goBusiness">成为商家</MenuItem>
                </Menu>
            </div>
        </div>
        <div class="main">
            <div class="main-nav">
                <Tabs v-model="pane" :animated="false" @on-click="tabSelected">
                    <!--<TabPane name="USDT" label="USDT"></TabPane>
                    <TabPane name="BTC" label="BTC"></TabPane>
                    <TabPane name="ETH" label="ETH"></TabPane>-->
                    <TabPane  v-for="(coin, index) in coins" :key="index" :name="coin.unit" :label="coin.unit"></TabPane>
                </Tabs>
            </div>
            <div class="text-price">
                <div class="text-price-coin"><h3>{{ pane }}</h3></div>
                <div class="text-price-price">
                    <div style="display: inline-block">{{ price }} CNY</div>
                    <div :class="updownPr" style="font-size: 14px; display: inline-block">{{ updown }}%</div>
                </div>
                <div class="text-price-average">最新成交均价 {{ average }} CNY</div>
            </div><hr>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
    export default {
        name: "OTCHome",
        data() {
            return {
                pane: '',
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
    .otc-content {
        width: 1200px;
        height: 1200px;
        margin: 30px auto 50px auto;
        /*background: #192330;*/
    }

    .menu {
        float: left;
        width: 200px;
        height: 100%;
        background: #192330;
    }

    .menu-title {
        width: 100%;
        height: 65px;
        padding-top: 20px;
        padding-left: 28px;
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

    .menu-content /deep/ .menuItem-trade {
        text-align: left;
        padding-left: 60px !important;
    }

    /*.ivu-menu-vertical .ivu-menu-item, .ivu-menu-vertical .ivu-menu-submenu-title {
        padding: 14px 28px;
    }*/

    .ivu-menu-dark.ivu-menu-vertical .ivu-menu-item, .ivu-menu-dark.ivu-menu-vertical .ivu-menu-submenu-title {
        font-size: 16px;
    }

    .menuItem-adver {
        text-align: left;
        padding-left: 28px !important;
        /*font-size: 16px;*/
    }

    .main {
        float: right;
        width: 990px;
        height: 100%;
        background: #192330;
    }

    .main-nav /deep/ .ivu-tabs-nav .ivu-tabs-tab {
        font-size: 16px;
        padding: 18px 16px;
    }

    .main-nav /deep/ .ivu-tabs-bar {
        /*border-color: #4c5151;*/
        /*border-color: #0B0D1B;*/
        border-color: #515a6e;
        border-width: 1px;
    }

    .main-nav /deep/ .ivu-tabs-nav .ivu-tabs-tab-active {
        color: seashell;
    }

    .text-price {
        width: 100%;
        height: 145px;
        background: #192330;
    }

    .text-price-coin {
        padding-top: 25px;
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


</style>
