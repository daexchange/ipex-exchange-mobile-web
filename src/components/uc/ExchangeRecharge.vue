<template>
    <div class="main_background">
        <Form :label-width="65">
            <FormItem label="币种:">
                <Select v-model="coinType" style="width:180px;" @on-change="changeCoin">
                    <Option v-for="item in coinList" :value="item.coin.unit" :key="item.coin.unit">{{ item.coin.unit }}</Option>
                </Select>
            </FormItem>
            <FormItem label="充币地址:">
                <Input v-model="qrcode.value" readonly style="width: 180px;"></Input>
            </FormItem>
            <FormItem v-show="coinType=='EOS'" label="Memo:">
                <Input :value="'U'+memberId" readonly style="width: 180px;"></Input>
            </FormItem>
            <FormItem>
                <a v-clipboard:copy="qrcode.value" v-clipboard:success="onCopy" v-clipboard:error="onError" href="javascript:;" id="copyBtn" class="link-copy">{{$t('uc.finance.recharge.copy')}}</a>
                <a id="showQRcode" class="link-qrcode" href="javascript:;" @click="showEwm"> {{$t('uc.finance.recharge.qrcode')}}
                    <Modal v-model="isShowEwm">
                        <!--<div v-show="isShowEwm" class="show-qrcode">-->
                        <p slot="header" style="text-align: center;">充币地址二维码</p>
                        <div class="show-qrcode" style="text-align: center;">
                            <!--<qriously :value="qrcode.coinName+':'+qrcode.value" :size="qrcode.size" />-->
                            <qriously :value="qrcode.value" :size="qrcode.size" foreground="#fff" />
                        </div>
                        <div slot="footer"></div>
                    </Modal>
                </a>
            </FormItem>
        </Form>
        <div>
            <p class="acb-p1">{{$t('common.tip')}}</p>
            <p>• {{$t('uc.finance.recharge.msg1')}}</p>
            <p>• {{$t('uc.finance.recharge.msg2')}}</p>
            <p>• {{$t('uc.finance.recharge.msg3')}}</p>
            <p>• {{$t('uc.finance.recharge.msg4')}}</p>
            <p>• {{$t('uc.finance.recharge.msg5')}}</p>
            <p>• {{$t('uc.finance.recharge.msg6')}}</p>
        </div>
        <div style="margin-top: 20px">
            <Table :columns="tableColumnsRecharge" :data="tableRecharge" :loading="loading"></Table>
            <div style="float: right;margin-top: 10px">
                <Page :total="dataCount" :current="1" @on-change="changePage" class="recharge_btn"></Page>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from "vue";
    import VueQriously from "vue-qriously";
    Vue.use(VueQriously);

    export default {
        components: {
            VueQriously
        },
        data() {
            return {
                isShowEwm: false,
                dataCount: 0,
                loading: true,
                qrcode: {
                    value: "",
                    size: 200,
                    coinName: ""
                },
                coinType: "",
                coinList: [],
                tableRecharge: [],
                allTableRecharge: [],
                memberId: '',
            };
        },
        methods: {
            changePage(index) {
                this.getList(index);
            },
            getCurrentCoinRecharge() {
                if (this.coinType != "") {
                    var temp = [];
                    for (var i = 0; i < this.allTableRecharge.length; i++) {
                        if (this.allTableRecharge[i].symbol == this.coinType) {
                            temp.push(this.allTableRecharge[i]);
                        }
                    }
                    this.tableRecharge = temp;
                } else {
                    this.tableRecharge = this.allTableRecharge;
                }
            },
            showEwm() {
                this.isShowEwm = !this.isShowEwm;
            },
            onCopy(e) {
                this.$Message.success(
                    this.$t("uc.finance.recharge.copysuccess") + e.text
                );
            },
            onError(e) {
                this.$Message.error(this.$t("uc.finance.recharge.copysuccess"));
            },
            changeCoin(value) {
                for (var i = 0; i < this.coinList.length; i++) {
                    if (this.coinList[i].coin.unit == value) {
                        this.qrcode.value = this.coinList[i].address;
                        this.qrcode.coinName = this.coinList[i].coin.name.toLowerCase();
                    }
                }
                this.getCurrentCoinRecharge();
            },
            getMoney() {
                //获取
                this.$http.post(this.host + this.api.uc.wallet).then(response => {
                    var resp = response.body;
                    if (resp.code == 0) {
                        for (let i = 0; i < resp.data.length; i++) {
                            var coin = resp.data[i];
                            if (coin.coin.canRecharge == 1) {
                                this.coinList.push(coin);
                            }
                        }
                        this.changeCoin(this.coinType);
                    } else {
                        this.$Message.error(resp.message);
                    }
                });
            },
            getList(pageN) {
                //获取tableRecharge
                let memberId = 0;
                !this.$store.getters.isLogin && this.$router.push("/login");
                this.$store.getters.isLogin && (memberId = this.$store.getters.member.id);
                let pageNo = pageN,
                    pageSize = 10,
                    type = 0,
                    params = { memberId, pageNo, pageSize, type };
                this.$http.post(this.host + "/uc/asset/transaction/all", params).then(response => {
                    var resp = response.body;
                    if (resp.code == 0) {
                        if (resp.data) {
                            let trueData = resp.data;
                            this.allTableRecharge = trueData.content || [];
                            this.dataCount = trueData.totalElements || 0;
                            this.getCurrentCoinRecharge();
                        }
                        this.loading = false;
                    } else {
                        this.$Message.error(resp.message);
                    }
                });
            },
            getMember() {
                let self = this;
                this.$http.post(this.host + "/uc/approve/security/setting").then(response => {
                    var resp = response.body;
                    if (resp.code == 0) {
                        if (resp.data.realName == null || resp.data.realName == "") {
                            // 判断是否实名认证，未认证跳转到实名认证页面；
                            this.$Message.success(this.$t("otc.publishad.submittip1"));
                            self.$router.push("/uc/safe");
                        } /** else if (resp.data.phoneVerified == 0) {
              // 判断是否是手机号0，1，未认证跳转到实名认证页面；
              this.$Message.success(this.$t("otc.publishad.submittip2"));
              self.$router.push("/uc/safe");
            } */else if (resp.data.fundsVerified == 0) {
                            // 判断是否设置交易密码，未认证跳转到实名认证页面；
                            this.$Message.success(this.$t("otc.publishad.submittip3"));
                            self.$router.push("/uc/safe");
                        } else {
                            this.memberId = resp.data.id;
                        }
                    } else {
                        this.$Message.error(resp.message);
                    }
                });
            }
        },
        created() {
            this.coinType = this.$route.query.name || "";
            this.getMember();
            this.getMoney();
            this.getList(1);
        },
        computed: {
            tableColumnsRecharge() {
                let columns = [];
                columns.push({
                    title: this.$t("uc.finance.recharge.time"),
                    width: 150,
                    align: "center",
                    render: (h, param) => {
                        let str = param.row.createTime;
                        return h("div", {}, str);
                    }
                });
                columns.push({
                    title: this.$t("uc.finance.recharge.symbol"),
                    width: 90,
                    align: "center",
                    render: (h, param) => {
                        let str = param.row.symbol;
                        return h("div", {}, str);
                    }
                });
                columns.push({
                    title: this.$t("uc.finance.recharge.address"),
                    width: 150,
                    align: "center",
                    render: (h, param) => {
                        let str = param.row.address;
                        return h("div", {}, str);
                    }
                });
                columns.push({
                    title: this.$t("uc.finance.recharge.amount"),
                    width: 150,
                    align: "center",
                    render: (h, param) => {
                        let str = param.row.amount;
                        return h("div", {}, str);
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
    .link-copy {
        font-size: 14px;
        color: #f0a70a;
    }
    .link-qrcode {
        margin-left: 20px;
        font-size: 14px;
        position: relative;
        color: #f0a70a;
    }
</style>
