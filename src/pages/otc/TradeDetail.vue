<template>
    <div class="main_background">
        <Form label-position="right" :label-width="100">
            <FormItem>
                <label slot="label">
                    <span style="color: white;font-size: 16px">{{$t('otc.tradeinfo.price')}}</span>
                </label>
                <Input readonly :value="user.price+' CNY / '+user.unit" style="width: 200px"></Input>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <span style="color: white;font-size: 16px">{{$t('otc.tradeinfo.num')}}</span>
                </label>
                <Input readonly :value="user.number +' '+ user.unit" style="width: 200px"></Input>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <span style="color: white;font-size: 16px">{{$t('otc.tradeinfo.paymethod')}}</span>
                </label>
                <Input readonly :value="user.payMode" style="width: 200px"></Input>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <span style="color: white;font-size: 16px">{{$t('otc.tradeinfo.exchangelimitamount')}}</span>
                </label>
                <Input readonly :value="user.minLimit+' - '+user.maxLimit" style="width: 200px"></Input>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <span style="color: white;font-size: 16px">{{$t('otc.tradeinfo.location')}}</span>
                </label>
                <Input readonly :value="$t('otc.tradeinfo.location_text')" style="width: 200px"></Input>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <span style="color: white;font-size: 16px">{{$t('otc.tradeinfo.exchangeperiod')}}</span>
                </label>
                <Input readonly :value="user.timeLimit+' '+$t('otc.tradeinfo.minute')" style="width: 200px"></Input>
            </FormItem>
        </Form>
        <div>
            <Poptip trigger="focus" :content="text1" style="width: 80%;">
                <Input @on-change="transform1" v-model="buyPrice" size="large" :placeholder="$t('otc.tradeinfo.amounttip')" style="width: 255px;margin-left: 45px">
                    <span slot="prepend">CNY</span>
                </Input>
            </Poptip>
            <Poptip trigger="focus" :content="text2" style="width: 100%;margin-top: 12px">
                <Input @on-change="transform2" v-model="nuyNum" size="large" :placeholder="$t('otc.tradeinfo.numtip')" style="width: 255px;margin-left: 45px">
                    <span slot="prepend">{{user.unit}}</span>
                </Input>
            </Poptip>
            <div style="margin-left: 45px;font-size: 18px">
                <p style="color: #ff9900;margin-top: 10px">
                    <!--<em>{{type}}:</em>-->
                    {{type}}:
                    <span>&nbsp;&nbsp;{{buyPrice}} CNY / {{nuyNum}} {{user.unit}}</span>
                </p>
                <Button type="primary" @click="submit" :disabled="btnDisabled" style="margin-top: 10px;width: 255px;">{{btnType}}</Button>
            </div>
        </div>
        <div style="margin-top: 15px;margin-left: 25px">
            <h2 class="titles">
                <span>{{$t('otc.tradeinfo.remarktitle')}}</span>
            </h2>
            <p tyle="font-size: 14px">
                {{user.remark}}
            </p>
            <h3 class="titles" style="margin-top: 10px">
                <span>{{$t('otc.tradeinfo.exchangetitle')}}</span>
            </h3>
            <div style="font-size: 14px">
                <p style="margin-top: 10px">{{$t('otc.tradeinfo.exchange_tip1')}}</p>
                <p style="margin-top: 10px">{{$t('otc.tradeinfo.exchange_tip2')}}</p>
                <p style="margin-top: 10px">{{$t('otc.tradeinfo.exchange_tip3')}}</p>
                <p style="margin-top: 10px">{{$t('otc.tradeinfo.exchange_tip4')}}</p>
                <p style="margin-top: 10px">{{$t('otc.tradeinfo.exchange_tip5')}}</p>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        components: {},
        data() {
            return {
                usernameS: "",
                text1: "",
                text2: "",
                btnDisabled: false,
                submitBtn: false,
                btnType: "",
                type: "",
                user: {
                    username:"aaa"
                },
                // price: '',
                buyPrice: "",
                nuyNum: 0,
                minLimit: 100,
                maxLimit: 1000,
                // number:0.6,
                advertiseType: 1
            };
        },
        methods: {
            update() {
                // this.price = '100';
                // this.user.advertiseType=1
            },
            transform1() {
                if (!Number.isNaN(Number(this.buyPrice))) {
                    this.nuyNum = this.round(this.div(this.buyPrice, this.priceNow), 8);
                    if (/^\d+(\.\d{1,2})?$/.test(this.buyPrice)) {
                        this.submitBtn = true;
                    } else {
                        this.submitBtn = false;
                        this.text1 = this.$t("otc.tradeinfo.warning1");
                    }
                } else {
                    this.text1 =
                        this.$t("otc.tradeinfo.warning2") +
                        this.user.minLimit +
                        "~" +
                        this.user.maxLimit;
                    this.submitBtn = false;
                    return false;
                }
            },
            transform2() {
                if (!Number.isNaN(Number(this.nuyNum))) {
                    this.buyPrice = this.round(this.mul(this.nuyNum, this.priceNow), 8);
                    if (this.nuyNum <= this.user.number) {
                        if (/^\d+(\.\d{1,8})?$/.test(this.nuyNum)) {
                            this.submitBtn = true;
                        } else {
                            this.submitBtn = false;
                            this.text2 = this.$t("otc.tradeinfo.warning3");
                        }
                    } else {
                        this.submitBtn = false;
                        return false;
                    }
                } else {
                    this.text2 =
                        this.$t("otc.tradeinfo.warning4") +
                        this.minNum +
                        "~" +
                        this.user.number;
                    this.submitBtn = false;
                    return false;
                }
            },
            getIdAdv() {
                //获取id广告信息
                this.$http
                    .post(this.host + this.api.otc.orderpre, { id: this.$route.query.tradeId })
                    .then(response => {
                        var resp = response.body;
                        if (resp.code == 0) {
                            this.user = resp.data;
                            this.text1 =
                                this.$t("otc.tradeinfo.warning2") +
                                this.user.minLimit +
                                "~" +
                                this.user.maxLimit;
                            // this.minNum = (this.user.minLimit/this.user.price).toFixed(8);
                            this.text2 =
                                this.$t("otc.tradeinfo.warning4") +
                                this.minNum +
                                "~" +
                                this.user.number;
                            // console.log(this.user)
                            if (this.user.advertiseType == 1) {
                                this.btnType = this.$t("otc.tradeinfo.confirmbuyin");
                                this.type = this.$t("otc.tradeinfo.buyin");
                            } else if (this.user.advertiseType == 0) {
                                this.btnType = this.$t("otc.tradeinfo.confirmsellout");
                                this.type = this.$t("otc.tradeinfo.sellout");
                            }
                            this.usernameS = (this.user.username + "")
                                .replace(/^\s+|\s+$/g, "")
                                .slice(0, 1);
                        } else {
                            this.$Message.error(resp.message);
                        }
                    });
            },
            submit() {
                if (this.submitBtn) {
                    this.btnDisabled = true;
                    if (this.user.advertiseType == 1) {
                        let param = {};
                        param["id"] = this.$route.query.tradeId;
                        param["coinId"] = this.user.otcCoinId;
                        param["price"] = this.user.price;
                        param["money"] = this.buyPrice;
                        param["amount"] = this.nuyNum;
                        this.$http
                            .post(this.host + this.api.otc.buy, param)
                            .then(response => {
                                this.btnDisabled = false;
                                var resp = response.body;
                                if (resp.code == 0) {
                                    this.$Message.success(resp.message);

                                    let self = this;
                                    setTimeout(() => {
                                        self.$router.push("/chat?tradeId=" + resp.data);
                                    }, 2000);
                                } else {
                                    this.$Message.error(resp.message);
                                }
                            });
                    } else if (this.user.advertiseType == 0) {
                        let param = {};
                        param["id"] = this.$route.query.tradeId;
                        param["coinId"] = this.user.otcCoinId;
                        param["price"] = this.user.price;
                        param["money"] = this.buyPrice;
                        param["amount"] = this.nuyNum;
                        this.$http
                            .post(this.host + this.api.otc.ordersell, param)
                            .then(response => {
                                this.btnDisabled = false;
                                var resp = response.body;
                                if (resp.code == 0) {
                                    this.$Message.success(resp.message);
                                    let self = this;
                                    setTimeout(() => {
                                        self.$router.push("/chat?tradeId=" + resp.data);
                                    }, 2000);
                                } else {
                                    this.$Message.error(resp.message);
                                }
                            });
                    }
                } else {
                    this.$Message.error(this.$t("otc.tradeinfo.warning5"));
                }
            },
            sendMsg() {
                // this.$http.post(this.host + '/otc/order/sell', param).then(response => {
                //   var resp = response.body;
                //   if (resp.code == 0) {
                //     this.$Message.success(resp.message);
                //     let self = this
                //     setTimeout(() => {
                //       self.$router.push('/chat?tradeId=' + resp.data);
                //     }, 2000)
                //   } else {
                //     this.$Message.error(resp.message);
                //   }
                // })
            },
            mul(a, b) {
                var c = 0,
                    d = a.toString(),
                    e = b.toString();
                try {
                    c += d.split(".")[1].length;
                } catch (f) {}
                try {
                    c += e.split(".")[1].length;
                } catch (f) {}
                return (
                    Number(d.replace(".", "")) *
                    Number(e.replace(".", "")) /
                    Math.pow(10, c)
                );
            },
            div(a, b) {
                var c,
                    d,
                    e = 0,
                    f = 0;
                try {
                    e = a.toString().split(".")[1].length;
                } catch (g) {}
                try {
                    f = b.toString().split(".")[1].length;
                } catch (g) {}
                return (
                    (c = Number(a.toString().replace(".", ""))),
                        (d = Number(b.toString().replace(".", ""))),
                        this.mul(c / d, Math.pow(10, f - e))
                );
            },
            round(v, e) {
                var t = 1;
                for (; e > 0; t *= 10, e--);
                for (; e < 0; t /= 10, e++);
                return Math.round(v * t) / t;
            },
            strpro(str) {
                let newStr = str;
                str = str.slice(1);
                var re = /[\D\d]*/g;
                var str2 = str.replace(re, function(str) {
                    var result = "";
                    for (var i = 0; i < str.length; i++) {
                        result += "*";
                    }
                    return result;
                });
                return newStr.slice(0, 1) + str2;
            }
        },
        created() {
            // console.log(this.$route.query)
            // console.log(this.div(121.03, 121.03) + '--00--')
            // this.update()
            this.getIdAdv();
        },
        computed: {
            priceNow: function() {
                return (
                    (this.user.price + "").replace(/,/g, "").replace(/[^\d|.]/g, "") - 0
                );
            },
            minNum: function() {
                return (this.user.minLimit / this.priceNow).toFixed(8);
            },
            maxNum: function() {
                return this.user.maxLimit / this.priceNow;
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
    .ivu-form-item {
        margin-bottom: 16px;
    }
</style>
