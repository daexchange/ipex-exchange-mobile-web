<template>
    <div class="main_background">
        <Table :columns="tableColumnsMoney" :data="tableMoney" :loading="loading" :disabled-hover="true"></Table>
        <Modal v-model="modal" :title="$t('uc.finance.money.match')" @on-ok="matchGCC">
            <P style="font-weight: bold;padding: 10px 0;">{{$t('uc.finance.money.matchtip1')}}：{{GCCMatchAmount}}</p>
            <p>
                <span>{{$t('uc.finance.money.matchtip2')}}：</span>
                <InputNumber style="width: 150px;" type="text" v-model="matchAmount" :placeholder="$t('uc.finance.money.matchtip2')"></InputNumber>
            </p>
        </Modal>
        <Modal v-model="modal_msg" :title="$t('uc.finance.money.match')">
            <p>{{match_msg}}</p>
        </Modal>
    </div>
</template>

<script>
    export default {
        components: {},
        data() {
            return {
                GCCMatchAmount: 0,
                matchAmount: 0,
                modal: false,
                loginmsg: this.$t("common.logintip"),
                loading: true,
                ordKeyword: "",
                tableMoney: [],
                canMatch: true,
                modal_msg: false,
                match_msg: ""
            };
        },
        methods: {
            getMoney() {
                //获取
                this.$http.post(this.host + "/uc/asset/wallet").then(response => {
                    var resp = response.body;
                    if (resp.code == 0) {
                        this.tableMoney = resp.data;
                        for (let i = 0; i < this.tableMoney.length; i++) {
                            this.tableMoney[i]["coinType"] = this.tableMoney[i].coin.unit;
                        }
                        this.loading = false;
                    } else {
                        // this.$Message.error(resp.message);
                        //  this.$Message.info(this.$t('common.logintip'));
                        this.$Message.error(this.loginmsg);
                    }
                });
            },
            getGCCMatchAmount() {
                //获取
                this.$http
                    .post(this.host + "/uc/asset/wallet/match-check")
                    .then(response => {
                        var resp = response.body;
                        if (resp.code == 0) {
                            this.canMatch = true;
                            this.GCCMatchAmount = resp.data;
                        } else {
                            this.canMatch = false;
                            this.match_msg = resp.message;
                            // this.$Message.error(this.loginmsg);
                        }
                        this.showMatchDailog();
                    });
            },
            showMatchDailog() {
                if (this.canMatch) this.modal = true;
                else this.modal_msg = true;
            },
            matchGCC() {
                if (this.matchAmount <= 0) {
                    this.$Message.warning(this.$t("uc.finance.money.matcherr1"));
                } else if (this.matchAmount > this.GCCMatchAmount) {
                    this.$Message.warning(this.$t("uc.finance.money.matcherr2"));
                } else {
                    //配对
                    let params = {};
                    params["amount"] = this.matchAmount;
                    this.$http
                        .post(this.host + "/uc/asset/wallet/match", params)
                        .then(response => {
                            var resp = response.body;
                            if (resp.code == 0) {
                                this.$Message.success(this.$t("uc.finance.money.matchsuccess"));
                                this.GCCMatchAmount = this.GCCMatchAmount - this.matchAmount;
                            } else {
                                this.$Message.error(resp.message);
                            }
                        });
                }
            },
            resetAddress(unit) {
                let params = {};
                params["unit"] = unit;
                this.$http
                    .post(this.host + "/uc/asset/wallet/reset-address", params)
                    .then(response => {
                        var resp = response.body;
                        if (resp.code == 0) {
                            this.$Message.success(this.$t("uc.finance.money.resetsuccess"));
                            setTimeout(function() {
                                window.location.reload();
                            }, 3000);
                        } else {
                            this.$Message.error(resp.message);
                        }
                    });
            }
        },
        created() {
            this.getMoney();
            //this.getGCCMatchAmount();
        },
        computed: {
            tableColumnsMoney() {
                let self = this;
                let columns = [];
                columns.push({
                    title: this.$t("uc.finance.money.cointype"),
                    key: "coinType",
                    width: 90,
                    align: "center"
                });
                columns.push({
                    title: this.$t("uc.finance.money.balance"),
                    key: "balance",
                    width: 180,
                    align: "center",
                    render(h, params) {
                        return h(
                            "span",
                            {
                                attrs: {
                                    title: params.row.balance
                                }
                            },
                            self.toFloor(params.row.balance || "0")
                        );
                    }
                });
                columns.push({
                    title: this.$t("uc.finance.money.frozen"),
                    key: "frozenBalance",
                    width: 180,
                    align: "center",
                    render(h, params) {
                        return h(
                            "span",
                            {
                                attrs: {
                                    title: params.row.frozenBalance
                                }
                            },
                            self.toFloor(params.row.frozenBalance || "0")
                        );
                    }
                });
                columns.push({
                    title: this.$t("uc.finance.money.needreleased"),
                    width: 180,
                    align: "center",
                    render(h, params) {
                        return h(
                            "span",
                            {
                                attrs: {
                                    title: params.row.toReleased
                                }
                            },
                            self.toFloor(params.row.toReleased || "0")
                        );
                    }
                });
                columns.push({
                    title: this.$t("uc.finance.money.operate"),
                    key: "price1",
                    width: 297,
                    align: "center",
                    render: function(h, params) {
                        var actions = [];
                        if (params.row.coin.canRecharge == 1) {
                            if (params.row.address != null && params.row.address != "") {
                                //   console.log(self.$t('uc.finance.money.charge'));
                                // 充币
                                actions.push(
                                    h(
                                        "Button",
                                        {
                                            // 充币;
                                            props: {
                                                type: "primary",
                                                size: "small"
                                            },
                                            on: {
                                                click: function() {
                                                    self.$router.push(
                                                        "/uc/recharge?name=" + params.row.coin.unit
                                                    );
                                                }
                                            },
                                            style: {
                                                marginRight: "8px"
                                            }
                                        },
                                        self.$t("uc.finance.money.charge")
                                    )
                                );
                            } else {
                                //   获取地址按钮;
                                actions.push(
                                    h(
                                        "Button",
                                        {
                                            props: {
                                                type: "info",
                                                size: "small"
                                            },
                                            on: {
                                                click: function() {
                                                    self.resetAddress(params.row.coin.unit);
                                                }
                                            },
                                            style: {
                                                marginRight: "8px"
                                            }
                                        },
                                        self.$t("uc.finance.money.getaddress")
                                    )
                                );
                            }
                        }
                        if (params.row.coin.canWithdraw == 1) {
                            // console.log(self.$t('uc.finance.money.pickup'));
                            // 提币;
                            actions.push(
                                h(
                                    "Button",
                                    {
                                        props: {
                                            type: "error",
                                            size: "small"
                                        },
                                        on: {
                                            click: function() {
                                                self.$router.push(
                                                    "/uc/withdraw?name=" + params.row.coin.unit
                                                );
                                            }
                                        },
                                        style: {
                                            marginRight: "8px"
                                        }
                                    },
                                    self.$t("uc.finance.money.pickup")
                                )
                            );
                            // 转账
                            actions.push(
                                h(
                                    "Button",
                                    {
                                        props: {
                                            type: "info",
                                            size: "small"
                                        },
                                        on: {
                                            click: function() {
                                                self.$router.push(
                                                    "/uc/transfer?name=" + params.row.coin.unit
                                                );
                                            }
                                        },
                                        style: {
                                            marginRight: "8px"
                                        }
                                    },
                                    self.$t("uc.finance.money.transfer")
                                )
                            );
                        }
                        if (params.row.coin.unit.toUpperCase() == "GCC") {
                            // 配对;
                            actions.push(
                                h(
                                    "Button",
                                    {
                                        props: {
                                            type: "success",
                                            size: "small"
                                        },
                                        on: {
                                            click: function() {
                                                // self.showMatchDailog(params.row);
                                                self.getGCCMatchAmount();
                                                // self.$router.push('/finance/recharge?name=' + params.row.coin.unit);
                                            }
                                        },
                                        style: {
                                            marginRight: "8px"
                                        }
                                    },
                                    self.$t("uc.finance.money.match")
                                )
                            );
                        }
                        return h("p", actions);
                    }
                });
                return columns;
            }
        }
    };
</script>

<style scoped>
    .main_background {
        background-color: #192330;
        padding: 25px;
        color: #fff;
    }
</style>
