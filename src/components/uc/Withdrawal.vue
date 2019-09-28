<template>
    <div class="main_background">
        <Form :label-width="65">
            <FormItem>
                <Button type="warning" ghost @click="goManager">提币地址管理</Button>
            </FormItem>
            <FormItem label="币种:">
                <Select v-model="coinType" style="width:200px;" @on-change="getAddrList">
                    <Option v-for="item in coinList" :value="item.unit" :key="item.unit">{{ item.unit }}</Option>
                </Select>
            </FormItem>
            <FormItem label="提币地址:">
                <Select ref="address" v-model="withdrawAdress" filterable clearable @on-query-change="onAddressChange" style="width:200px;">
                    <Option v-for="item in currentCoin.addresses" :value="item.address" :key="item.address">{{ item.remark +'('+ item.address+')' }}</Option>
                </Select>
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
                <Poptip trigger="focus" :content="$t('uc.finance.withdraw.tip1')+currentCoin.withdrawScale+$t('uc.finance.withdraw.tip11')+currentCoin.minAmount+' ,'+$t('uc.finance.withdraw.tip2')+currentCoin.maxAmount">
                    <InputNumber style="width:200px;" @on-change="computerAmount" v-model="withdrawAmount" :placeholder="$t('uc.finance.withdraw.numtip1')" size="large" :min="currentCoin.minAmount" :max="currentCoin.maxAmount"></InputNumber>
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
                <Button id="withdrawSubmit" type="primary" style="width:200px;background-color: #f0ac19" @click="apply">{{$t('uc.finance.withdraw.pickup')}}</Button>
            </FormItem>
        </Form>
        <div class="action-body">
            <p style="font-size: 18px;font-weight: bold">{{$t('common.tip')}}</p>
            <p>• {{$t('uc.finance.withdraw.msg3')}}：{{currentCoin.minAmount}}{{$t('uc.finance.withdraw.msg4')}}。</p>
            <p>• {{$t('uc.finance.withdraw.msg5')}}</p>
            <p>• {{$t('uc.finance.withdraw.msg6')}}</p>
        </div>
        <div style="margin-top: 15px">
            <p style="font-size: 18px;font-weight: bold">{{$t('uc.finance.withdraw.record')}}</p>
            <Table :columns="tableColumnsWithdraw" :data="tableWithdraw" :loading="loading" style="margin-top: 5px"></Table>
            <div style="float: right;margin-top: 6px">
                <Page :total="transaction.total" :current="transaction.page + 1" @on-change="changePage"></Page>
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
                this.withdrawFee =
                    this.currentCoin.minTxFee +
                    (this.currentCoin.maxTxFee - this.currentCoin.minTxFee) / 2;
            }
        },
        methods: {
            goManager() {
                this.$router.push("//uc/withdraw/address");
            },
            cancel() {
                this.modal = false;
                this.formInline.code = "";
                this.formInline.fundpwd = "";
            },
            sendCode() {
                this.settime();
                this.$http.post(this.host + this.api.uc.emailwithdrawcode).then(response => {
                    var resp = response.body;
                    if (resp.code == 0) {
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
                this.transaction.page = index - 1;
                this.getList();
            },
            onAddressChange(data) {
                this.inputAddress = data;
            },
            clearValues() {
                if (this.$refs.address) {
                    this.$refs.address.setQuery(" ");
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
                params["unit"] = this.currentCoin.unit;
                params["address"] = this.withdrawAdress;
                params["amount"] = this.withdrawAmount;
                params["fee"] = this.withdrawFee;
                params["jyPassword"] = this.formInline.fundpwd;
                params["code"] = this.formInline.code;
                this.$http
                    .post(this.host + this.api.uc.withdrawapplycode, params)
                    .then(response => {
                        this.fundpwd = "";
                        var resp = response.body;
                        if (resp.code == 0) {
                            this.modal = false;
                            this.formInline.code = "";
                            this.formInline.fundpwd = "";
                            this.transaction.page = 0;
                            this.getList();
                            this.clearValues();
                            this.$Message.success(resp.message);
                        } else {
                            this.$Message.error(resp.message);
                        }
                    });
            },
            getAddrList() {
                //初始化页面上的值
                this.clearValues();
                //获取地址
                this.$http
                    .post(this.host + this.api.uc.coininfo)
                    .then(response => {
                        var resp = response.body;
                        if (resp.code == 0 && resp.data.length > 0) {
                            this.coinList = resp.data;
                            if (this.coinType) {
                                for (let i = 0; i < resp.data.length; i++) {
                                    if (this.coinType == resp.data[i].unit) {
                                        this.currentCoin = resp.data[i];
                                        break;
                                    }
                                }
                            } else {
                                this.currentCoin = this.coinList[0];
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
                    .post(this.host + this.api.uc.withdrawrecord, params)
                    .then(response => {
                        var resp = response.body;
                        if (resp.code == 0) {
                            this.tableWithdraw = resp.data.content;
                            this.transaction.total = resp.data.totalElements;
                            this.transaction.page = resp.data.number;
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
                if (this.coinType == "") {
                    this.$Message.error(this.$t("uc.finance.withdraw.symboltip"));
                    return false;
                } else if (this.withdrawAdress == "") {
                    this.$Message.error(this.$t("uc.finance.withdraw.addresstip"));
                    return false;
                } else if (
                    this.withdrawAmount == "" ||
                    this.withdrawAmount == 0 ||
                    this.withdrawAmount - 0 < this.currentCoin.minAmount
                ) {
                    this.$Message.error(
                        this.$t("uc.finance.withdraw.numtip2") + this.currentCoin.minAmount
                    );
                    return false;
                } else if (this.withdrawAmount - 0 < this.withdrawFee) {
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
                } else {
                    return true;
                }
            },
            apply() {
                if (this.valid()) {
                    this.formInline.code = "";
                    this.formInline.fundpwd = "";
                    this.modal = true;
                    let timercode = setInterval(() => {
                        if (this.countdown <= 0) {
                            clearInterval(timercode);
                            this.sendcodeValue = this.$t("uc.regist.sendcode");
                            this.codeIsSending = false;
                        }
                    }, 1000);
                }
            },
            getMember() {
                //获取个人安全信息
                this.$http
                    .post(this.host + this.api.uc.securitySetting)
                    .then(response => {
                        var resp = response.body;
                        if (resp.code == 0) {
                            this.user = resp.data;
                        } else {
                            this.$Message.error(this.loginmsg);
                        }
                    });
            }
        },
        created() {
            // this.getMember();
            this.$http.options.emulateJSON = false;
            this.coinType = this.$route.query.name || "";
            this.getAddrList();
            this.getList(0, 10, 1);
            console.log(this.$store.getters.member);
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
                            label: v.unit,
                            value: v.unit
                        });
                    });
                }
                columns.push({
                    title: this.$t("uc.finance.withdraw.time"),
                    width: 150,
                    align: "center",
                    key: "createTime"
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
                    title: this.$t("uc.finance.withdraw.address"),
                    width: 400,
                    align: "center",
                    key: "address"
                });
                columns.push({
                    title: this.$t("uc.finance.withdraw.num"),
                    width: 130,
                    align: "center",
                    key: "totalAmount"
                });
                columns.push({
                    title: this.$t("uc.finance.withdraw.fee"),
                    width: 90,
                    align: "center",
                    key: "fee"
                });
                columns.push({
                    title: this.$t("uc.finance.withdraw.status"),
                    width: 80,
                    align: "center",
                    key: "status",
                    render: (h, params) => {
                        let text = "";
                        if (params.row.status == 0) {
                            text = this.$t("uc.finance.withdraw.status_1");
                        } else if (params.row.status == 1) {
                            text = this.$t("uc.finance.withdraw.status_2");
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
