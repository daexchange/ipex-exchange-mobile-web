<template>
    <div class="main_background">
        <Form :label-width="65">
            <FormItem label="币种:">
                <Select v-model="coinType" style="width:200px" @on-change="getCurrentCoin">
                    <Option v-for="item in coinList" :value="item.coin.unit" :key="item.coin.unit">{{ item.coin.unit }}</Option>
                </Select>
            </FormItem>
            <FormItem label="转账账户:">
                <Input style="width: 200px" ref="address" v-model="withdrawAdress" filterable clearable @on-query-change="onAccountChange" :placeholder="$t('uc.finance.transfer.accounttip')"></Input>
            </FormItem>
            <div style="margin-left: 60px">
                <div>【{{$t('uc.finance.withdraw.avabalance')}}】：
                    <span class="label-pointer" id="valueAvailable">{{currentCoin.balance|toFloor}}</span>
                </div>
                <span v-if="currentCoin.enableAutoWithdraw == 0">【{{$t('common.tip')}}】：{{$t('uc.finance.withdraw.msg1')}} {{currentCoin.threshold}} {{$t('uc.finance.withdraw.msg2')}}</span>
                <span>
                      <a href="javascript:;" id="levelUp" style="display: none;">{{$t('uc.finance.withdraw.increase')}}</a>
                </span>
            </div>
            <FormItem label="数量:">
                <Poptip trigger="focus" :content="$t('uc.finance.withdraw.tip1')+currentCoin.balance" style="width: 100%;">
                    <InputNumber style="width: 200px" @on-change="computerAmount" v-model="withdrawAmount" :placeholder="$t('uc.finance.transfer.numtip1')" size="large" :min="0" :max="currentCoin.balance"></InputNumber>
                </Poptip>
            </FormItem>
            <FormItem label="手续费:">
                <Slider v-if="currentCoin.maxTxFee > currentCoin.minTxFee" v-model="withdrawFee" show-input :step="(currentCoin.maxTxFee - currentCoin.minTxFee)/10" :max="currentCoin.maxTxFee" :min="currentCoin.minTxFee"></Slider>
                <InputNumber style="width: 200px" readonly v-model="withdrawFee" :min="currentCoin.minTxFee" :max="currentCoin.maxTxFee" size="large"></InputNumber>
            </FormItem>
            <FormItem label="到账数量:">
                <InputNumber style="width: 200px" readonly v-model="withdrawOutAmount" :placeholder="$t('uc.finance.withdraw.arriamount')" size="large"></InputNumber>
            </FormItem>
            <FormItem>
                <Button id="withdrawSubmit" type="primary" style="width:200px;background-color: #f0ac19" @click="apply">{{$t('uc.finance.transfer.title')}}</Button>
            </FormItem>
        </Form>
        <div style="margin-top: 15px">
            <p style="font-size: 18px;font-weight: bold">{{$t('uc.finance.transfer.record')}}</p>
            <Table :columns="tableColumnsWithdraw" :data="tableWithdraw" :loading="loading"></Table>
            <div style="float: right;margin-top: 6px">
                <Page class="pages_a" :total="transaction.total" :current="transaction.page" :page="transaction.page" @on-change="changePage"></Page>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                user: {},
                codeIsSending: false,
                sendcodeValue: this.$t("uc.regist.sendcode"),
                countdown: 60,
                formInline: {
                    code: "",
                    fundpwd: ""
                },
                modal: false,
                fundpwd: "",
                currentCoin: {},
                transaction: {
                    page: 0,
                    pageSize: 10,
                    total: 0
                },
                loading: true,
                withdrawAdress: "",
                inputAddress: "", //用户输入的地址
                withdrawAmount: 0,
                withdrawFee: 0,
                withdrawOutAmount: 0,
                coinType: "",
                coinList: [],
                tableWithdraw: [],
                allTableWithdraw: []
            };
        },
        watch: {
            currentCoin: function() {
                this.withdrawFee = this.currentCoin.minerFee;
                // this.currentCoin.minTxFee +
                //  (this.currentCoin.maxTxFee - this.currentCoin.minTxFee) / 2;
            }
        },
        methods: {
            cancel() {
                this.modal = false;
                this.formInline.code = "";
                this.formInline.fundpwd = "";
            },
            sendCode() {
                this.$http.post(this.host + this.api.uc.emailexangetransfercode).then(response => {
                    var resp = response.body;
                    if (resp.code == 0) {
                        this.settime();
                        this.$Notice.success({
                            title: this.$t("common.tip"),
                            desc: resp.message
                        });
                    } else {
                        this.$Notice.error({
                            title: this.$t("common.tip"),
                            desc: resp.message
                        });
                    }
                });
            },
            settime() {
                this.sendcodeValue = this.countdown;
                this.codeIsSending = true;
                let timercode = setInterval(() => {
                    this.countdown--;
                    this.sendcodeValue = this.countdown;
                    if (this.countdown <= 0) {
                        clearInterval(timercode);
                        this.sendcodeValue = this.$t("uc.regist.sendcode");
                        this.countdown = 60;
                        this.codeIsSending = false;
                    }
                }, 1000);
            },
            changePage(index) {
                this.transaction.page = index;
                this.getList();
            },
            onAccountChange(data) {
                this.inputAddress = data;
            },
            clearValues() {
                if (this.$refs.address) {
                    // this.$refs.address.setQuery(" ");
                }
                this.withdrawAdress = "";
                this.inputAddress = "";
                this.withdrawAmount = 0;
                // this.withdrawFee= 0;
                this.withdrawOutAmount = 0;
            },
            getCurrentCoinRecharge() {
                if (this.coinType != "") {
                    var temp = [];
                    for (var i = 0; i < this.allTableWithdraw.length; i++) {
                        //   if (this.allTableWithdraw[i].symbol == this.coinType) {
                        if (this.allTableWithdraw[i].coin.unit == this.coinType) {
                            temp.push(this.allTableWithdraw[i]);
                        }
                    }
                    this.tableWithdraw = temp;
                } else {
                    this.tableWithdraw = this.allTableWithdraw;
                }
            },
            ok() {
                if (this.formInline.code == "") {
                    this.modal = true;
                    this.$Message.error("请填写验证码");
                    return;
                }
                if (this.formInline.fundpwd == "") {
                    this.modal = true;
                    this.$Message.error(this.$t("otc.chat.msg7tip"));
                    return;
                }
                let params = {};
                params["coinId"] = this.currentCoin.name;
                params["email"] = this.withdrawAdress;
                params["amount"] = this.withdrawAmount;
                params["fee"] = this.withdrawFee;
                params["jyPassword"] = this.formInline.fundpwd;
                params["code"] = this.formInline.code;
                this.$http
                    .post(this.host + this.api.uc.exangeassettransfer, params)
                    .then(response => {
                        this.fundpwd = "";
                        var resp = response.body;
                        if (resp.code == 0) {
                            this.modal = false;
                            this.formInline.code = "";
                            this.formInline.fundpwd = "";
                            this.transaction.page = 1;
                            this.getList();
                            this.getCoins();
                            this.clearValues();
                            this.$Message.success(this.$t("uc.finance.withdraw.status_5"));
                        }else if(resp.code == 1) {
                            this.$Message.error(resp.message);
                        } else if(resp.code == 500) {
                            this.$Message.error(resp.message);
                        } else {
                            this.$Message.error(resp.message);
                        }
                    });
            },
            getCurrentCoin() {
                //初始化页面上的值
                this.clearValues();
                //获取地址
                if (this.coinType) {
                    for (let i = 0; i < this.coinList.length; i++) {
                        if (this.coinType == this.coinList[i].coin.unit) {
                            this.currentCoin = this.coinList[i].coin;
                            this.currentCoin.balance = this.coinList[i].balance;
                            break;
                        }
                    }
                } else {
                    this.currentCoin = this.coinList[0].coin;
                    this.currentCoin.balance = this.coinList[0].balance;
                    this.coinType = this.currentCoin.unit;
                }
            },
            getCoins() {
                //初始化页面上的值
                this.clearValues();
                //获取地址
                this.$http
                    .post(this.host + this.api.uc.exangeassetwallet)
                    .then(response => {
                        var resp = response.body;
                        if (resp.code == 0 && resp.data.length > 0) {
                            this.coinList = resp.data;
                            if (this.coinType) {
                                for (let i = 0; i < this.coinList.length; i++) {
                                    if (this.coinType == this.coinList[i].coin.unit) {
                                        this.currentCoin = this.coinList[i].coin;
                                        this.currentCoin.balance = this.coinList[i].balance;
                                        break;
                                    }
                                }
                            } else {
                                this.currentCoin = this.coinList[0].coin;
                                this.currentCoin.balance = this.coinList[0].balance;
                                this.coinType = this.currentCoin.unit;
                            }
                        } else {
                            this.$Message.error(resp.message);
                        }
                    });
            },
            getList() {
                this.loading = true;
                //获取tableWithdraw
                let params = {};
                params["page"] = this.transaction.page;
                params["pageSize"] = this.transaction.pageSize;
                this.$http
                    .post(this.host + this.api.uc.transferotherrecordpage, params)
                    .then(response => {
                        var resp = response.body;
                        if (resp.code == 0) {
                            this.tableWithdraw = resp.data;
                            this.transaction.total = resp.totalElement;
                        } else {
                            this.$Message.error(resp.message);
                        }
                        this.loading = false;
                    });
            },
            accSub(arg1, arg2) {
                var r1, r2, m, n;
                try {
                    r1 = arg1.toString().split(".")[1].length;
                } catch (e) {
                    r1 = 0;
                }
                try {
                    r2 = arg2.toString().split(".")[1].length;
                } catch (e) {
                    r2 = 0;
                }
                m = Math.pow(10, Math.max(r1, r2));
                //last modify by deeka
                //动态控制精度长度
                n = r1 >= r2 ? r1 : r2;
                return ((arg1 * m - arg2 * m) / m).toFixed(n);
            },
            round(v, e) {
                var t = 1;
                for (; e > 0; t *= 10, e--);
                for (; e < 0; t /= 10, e++);
                return Math.round(v * t) / t;
            },
            computerAmount() {
                this.withdrawOutAmount = this.round(
                    this.accSub(this.withdrawAmount, this.withdrawFee),
                    this.currentCoin.withdrawScale
                );
            },
            computerAmount2() {
                this.withdrawAmount =
                    (this.withdrawAmount + "").replace(/([0-9]+\.[0-9]{6})[0-9]*/, "$1") -
                    0;
                this.withdrawOutAmount = this.round(
                    this.accSub(this.withdrawAmount, this.withdrawFee),
                    this.currentCoin.withdrawScale
                );
            },
            valid() {
                this.withdrawAdress = this.withdrawAdress || this.inputAddress;
                let reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
                if (this.coinType == "") {
                    this.$Message.error(this.$t("uc.finance.withdraw.symboltip"));
                    return false;
                } else if (this.withdrawAdress == "") {
                    this.$Message.error(this.$t("uc.finance.transfer.accounttip"));
                    return false;
                } else if (
                    this.withdrawAmount == "" || this.withdrawAmount == 0 || this.withdrawAmount > this.currentCoin.balance
                ) {
                    this.$Message.error(
                        this.$t("uc.finance.transfer.numtip2")
                    );
                    return false;
                } /**else if (this.withdrawAmount - 0 < this.withdrawFee) {
        this.$Message.error(this.$t("uc.finance.withdraw.numtip3"));
        return false;
	  } else if (
                 this.withdrawFee == "" ||
                 this.withdrawFee == 0 ||
                 this.withdrawFee - 0 > this.currentCoin.maxTxFee ||
                 this.withdrawFee - 0 < this.currentCoin.minTxFee
                 ) {
        this.$Message.error(
          this.$t("uc.finance.withdraw.feetip1") +
            this.currentCoin.minTxFee +
            " , " +
            this.$t("uc.finance.withdraw.feetip2") +
            this.currentCoin.maxTxFee
        );
        return false;
	  } */else if (!reg.test(this.withdrawAdress)) {
                    this.$Message.error(this.$t("uc.finance.transfer.accounterr"));
                    return false;
                } else if (this.withdrawAdress === this.member.email) {
                    this.$Message.error(this.$t("uc.finance.transfer.accountret"));
                    return false;
                } else {
                    return true;
                }
            },
            apply() {
                if (this.valid()) {
                    this.modal = true;
                    this.formInline.code="";
                    this.formInline.fundpwd="";

                    let timercode = setInterval(() => {
                        if (this.countdown <= 0) {
                            clearInterval(timercode);
                            this.sendcodeValue = this.$t("uc.regist.sendcode");
                            this.codeIsSending = false;
                        }
                    }, 10);
                }
            },
        },
        created() {
            this.$http.options.emulateJSON = false;
            this.coinType = this.$route.query.name || "";
            this.getCoins();
            this.transaction.page = 1;
            this.getList(0, 10, 1);
        },
        computed: {
            member: function() {
                console.log(this.$store.getters.member);
                return this.$store.getters.member;
            },
            tableColumnsWithdraw() {
                let columns = [],
                    filters = [];
                if (this.coinList.length > 0) {
                    this.coinList.forEach(v => {
                        filters.push({
                            label: v.coin.unit,
                            value: v.coin.unit
                        });
                    });
                }
                columns.push({
                    title: this.$t("uc.finance.transfer.time"),
                    width: 150,
                    key: "createTime",
                    align: "center",
                });
                columns.push({
                    title: this.$t("uc.finance.withdraw.symbol"),
                    key: "symbol",
                    align: "center",
                    width: 80,
                    filters,
                    filterMultiple: false,
                    filterMethod(value, row) {
                        return row.coin.unit === value;
                    },
                    render: function(h, params) {
                        return h("span", params.row.coin.unit);
                    }
                });
                columns.push({
                    title: this.$t("uc.finance.transfer.toaccount"),
                    key: "address",
                    align: "center",
                    width: 180,
                    render: function(h, params) {
                        return h("span", params.row.memberTo.email);
                    }
                });
                columns.push({
                    title: this.$t("uc.finance.withdraw.num"),
                    width: 130,
                    align: "center",
                    key: "totalAmount"
                });
                columns.push({
                    title: this.$t("uc.finance.withdraw.fee"),
                    key: "fee",
                    align: "center",
                    width: 90,
                });
                columns.push({
                    title: this.$t("uc.finance.withdraw.arriamount"),
                    key: "arrivedAmount",
                    align: "center",
                    width: 130,
                });
                columns.push({
                    title: this.$t("uc.finance.withdraw.status"),
                    key: "status",
                    align: "center",
                    width: 80,
                    render: (h, params) => {
                        let text = "";
                        if (params.row.status == 0) {
                            text = this.$t("uc.finance.withdraw.status_1");
                        } else if (params.row.status == 1) {
                            text = this.$t("uc.finance.withdraw.status_5");
                        } else if (params.row.status == 2) {
                            text = this.$t("uc.finance.withdraw.status_3");
                        } else if (params.row.status == 3) {
                            text = this.$t("uc.finance.withdraw.status_4");
                        }
                        return h("div", [h("p", text)]);
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
    .ivu-btn-primary {
        border-color: #f0ac19;
    }
</style>
