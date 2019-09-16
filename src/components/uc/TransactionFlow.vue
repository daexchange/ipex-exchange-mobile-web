<template>
    <div class="main_background">
        <Form class="form" :model="formItem" :label-width="65">
            <FormItem label="起止时间:">
                <DatePicker type="daterange" v-model="rangeDate" @on-change="changedate" @on-clear="clear" style="width:180px;"></DatePicker>
            </FormItem>
            <FormItem label="交易对:">
                <Select v-model="coinType" @on-change="getAddrList" style="width:180px;">
                    <Option v-for="item in coinList" :value="item.unit" :key="item.unit">{{ item.unit }}</Option>
                </Select>
            </FormItem>
            <FormItem label="操作类型: ">
                <Select v-model="recordValue" clearable style="width:180px" @on-change="getType">
                    <Option v-for="item in recordType" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </FormItem>
            <FormItem>
                <Button type="warning" @click="queryOrder" style="padding: 6px 30px;margin-left:10px;background-color:#f0a70a;border-color:#f0a70a">
                    {{$t('uc.finance.record.search')}}
                </Button>
            </FormItem>
        </Form>
        <div style="margin-bottom: 50px">
            <Table :no-data-text="$t('common.nodata')" :columns="tableColumnsRecord" :data="tableRecord" :disabled-hover="true" :loading="loading"></Table>
            <div style="float: right;margin-top: 10px">
                <Page :total="total" :pageSize="pageSize" show-total :current="page" @on-change="changePage" id="record_pages"></Page>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        components: {},
        data() {
            return {
                loading: false,
                ordKeyword: "",
                rangeDate: "",
                startTime: "",
                endTime: "",
                recordValue: "",
                recordType: [
                    {
                        value: 0,
                        // label: this.$t("uc.finance.record.otcbuy")
                        label: this.$t("uc.finance.money.transfertip5")
                    },
                    {
                        value: 1,
                        //label: this.$t("uc.finance.record.otcsell")
                        label: this.$t("uc.finance.money.transfertip6")
                    }
                ],
                coinList: [],
                coinType: "",
                pageSize: 10,
                page: 1,
                total: 0,
                tableRecord: []
            };
        },
        created: function() {
            this.getList(this.page);
            this.getAddrList();
        },
        methods: {
            changedate() {
                if (this.rangeDate[0]) {
                    this.startTime = this.dateform(this.rangeDate[0]);
                    this.endTime = this.dateform(this.rangeDate[1]);
                }
            },
            changePage(pageindex) {
                this.page=pageindex;
                this.getList(this.page);
            },
            queryOrder() {
                if (this.rangeDate.length == 0) {
                    this.$Message.error("请选择搜索日期范围");
                    return;
                } else {
                    try {
                        this.page=1;
                        this.getList(this.page);
                    } catch (ex) {
                        this.$Message.error("请选择搜索日期范围");
                        return;
                    }
                }
            },
            clearValues() {

                //  this.withdrawAdress = "";
                //  this.inputAddress = "";
                //  this.withdrawAmount = 0;
                // this.withdrawFee= 0;
                // this.withdrawOutAmount = 0;
            },
            getAddrList() {
                //初始化页面上的值
                this.clearValues();
                //获取地址
                this.$http
                    .post(this.host + "/uc/withdraw/support/coin/info")
                    .then(response => {
                        var resp = response.body;
                        if (resp.code == 0 && resp.data.length > 0) {
                            this.coinList = resp.data;
                        } else {
                            this.$Message.error(resp.message);
                        }
                    });
            },
            getType() {
                // console.log(this.recordValue);
            },
            dateform(time) {
                var date = new Date(time);
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                m = m < 10 ? "0" + m : m;
                var d = date.getDate();
                d = d < 10 ? "0" + d : d;
                var h = date.getHours();
                h = h < 10 ? "0" + h : h;
                var minute = date.getMinutes();
                var second = date.getSeconds();
                minute = minute < 10 ? "0" + minute : minute;
                second = second < 10 ? "0" + second : second;
                return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second;
            },
            getList(pageNo) {
                //获取tableWithdraw
                let memberId = 0;
                !this.$store.getters.isLogin && this.$router.push("/login");
                this.$store.getters.isLogin && (memberId = this.$store.getters.member.id);
                let startTime = "";
                let endTime = "";
                let symbol = "";
                let type = "";
                this.startTime && (startTime = this.startTime);
                this.endTime && (endTime = this.endTime);
                this.coinType && (symbol = this.coinType);
                if(this.recordValue == 0 || this.recordValue){
                    type = this.recordValue;
                }
                // this.recordValue!="" || this.recordValue!=undefined && (type = this.recordValue);
                this.loading = true;
                let params = {
                    pageNo: pageNo,
                    pageSize: this.pageSize,
                    startTime,
                    endTime,
                    memberId,
                    symbol,
                    type
                };
                this.$http.post(this.host + "/uc/transfer-self/record/page", params).then(response => {
                    var resp = response.body;
                    if (resp.code == 0) {
                        this.loading = false;
                        if (resp.data) {
                            let trueData = resp.data;
                            this.total = trueData.totalElements;
                            this.tableRecord = trueData.content;
                        }
                    } else {
                        this.$Message.error(resp.message);
                    }
                    this.loading = false;
                });
            },
            clear() {
                this.startTime = "";
                this.endTime = "";
            }
        },
        computed: {
            tableColumnsRecord() {
                let columns = [];
                var that = this;
                columns.push({
                    title: this.$t("uc.finance.record.chargetime"),
                    align: "center",
                    width: 150,
                    key:"createTime"
                });
                columns.push({
                    title: this.$t("uc.finance.record.symbol"),
                    width: 80,
                    align: "center",
                    key:"symbol",
                    render: (h, param) => {
                        return h("div", {}, param.row.coin.unit);
                    }
                });
                columns.push({
                    title: this.$t("uc.finance.record.type"),
                    width: 120,
                    render: function(h, params) {
                        let str = "";
                        let type = params.row.type;
                        if (type == 0) {
                            str = that.$t("uc.finance.money.transfertip5");
                        } else if (type == 1) {
                            str = that.$t("uc.finance.money.transfertip6");
                        }
                        return h("div", str, "");
                    }
                });
                columns.push({
                    title: this.$t("uc.finance.record.num"),
                    width: 90,
                    align: "center",
                    render(h, params) {
                        return h(
                            "span",
                            {
                                attrs: {
                                    title: params.row.arrivedAmount
                                }
                            },
                            that.toFloor(params.row.arrivedAmount || "0")
                        );
                    }
                });
                /**  columns.push({
        title: this.$t("uc.finance.record.shouldfee"), //"应付手续费"
        align: "center",
        render(h, params) {
          return h(
            "span",
            {
              attrs: {
                title: params.row.fee
              }
            },
            that.toFloor(params.row.fee || "0")
          );
        }
      });
                 columns.push({
        title: this.$t("uc.finance.record.discountfee"), //"抵扣手续费"
        align: "center",
        render(h, params) {
          return h(
            "span",
            {
              attrs: {
                title: params.row.discountFee
              }
            },
            that.toFloor(params.row.discountFee || "0")
          );
        }
      });
                 columns.push({
        title: this.$t("uc.finance.record.realfee"), //"实际手续费"
        align: "center",
        render(h, params) {
          return h(
            "span",
            {
              attrs: {
                title: params.row.realFee
              }
            },
            that.toFloor(params.row.realFee || "0")
          );
        }
      }); */
                columns.push({
                    title: this.$t("uc.finance.record.status"),
                    // key: "status",
                    width: 90,
                    align: "center",
                    render: (h, params) => {
                        return h("div", that.$t("uc.finance.record.finish"), "");
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
