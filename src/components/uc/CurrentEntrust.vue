<template>
    <div class="main_background">
        <Form class="form" :model="formItem" :label-width="65">
            <FormItem label="起止时间:">
                <DatePicker type="daterange" v-model="formItem.date" style="width:180px;"></DatePicker>
            </FormItem>
            <FormItem label="交易对:">
                <Select v-model="formItem.symbol" style="width:180px;">
                    <Option v-for="(item,index) in symbol " :value="item.symbol " :key="index">{{item.symbol}}</Option>
                </Select>
            </FormItem>
            <FormItem label="类型: ">
                <Select v-model="formItem.type" style="width:180px;">
                    <Option value="LIMIT_PRICE">限价</Option>
                    <Option value="MARKET_PRICE">市价</Option>
                </Select>
            </FormItem>
            <FormItem label="方向: ">
                <Select v-model="formItem.direction" style="width:180px;">
                    <Option value="0">买入</Option>
                    <Option value="1">卖出</Option>
                </Select>
            </FormItem>
            <FormItem>
                <Button type="warning" @click="handleSubmit">搜索</Button>
                <Button style="margin-left: 8px " @click="handleClear " class="clear_btn">清空条件</Button>
            </FormItem>
        </Form>
        <div style="margin-bottom: 50px">
            <Table :columns="columns " :data="orders" :loading="loading"></Table>
            <div style="float: right;margin-top: 10px">
                <Page :total="total" :pageSize="pageSize" :current="pageNo" @on-change="loadDataPage"></Page>
            </div>
        </div>
    </div>
</template>

<script>
    var moment = require("moment");
    import expandRow from "@components/exchange/expand.vue";

    export default {
        components: { expandRow },
        data() {
            const self = this;
            return {
                loading: false,
                pageSize: 10,
                pageNo: 1,
                total: 10,
                symbol: [],
                formItem: {
                    symbol: "",
                    type: "",
                    direction: "",
                    date: ""
                },
                columns: [
                    {
                        type: "expand",
                        width: 20,
                        render: (h, params) => {
                            return h(expandRow, {
                                props: {
                                    skin: params.row.skin,
                                    rows: params.row.detail
                                }
                            });
                        }
                    },
                    {
                        title: this.$t("exchange.time"),
                        key: "time",
                        minWidth: 95,
                        render: (h, params) => {
                            return h("span", {}, this.dateFormat(params.row.time));
                        }
                    },
                    {
                        title: "交易对",
                        key: "symbol",
                        width: 105,
                    },
                    {
                        title: "类型",
                        width: 60,
                        render(h, params) {
                            return h(
                                "span",
                                params.row.type === "LIMIT_PRICE" ? "限价" : "市价"
                            );
                        }
                    },
                    {
                        title: this.$t("exchange.direction"),
                        key: "direction",
                        width: 60,
                        render: (h, params) => {
                            const row = params.row;
                            const className = row.direction.toLowerCase();
                            return h(
                                "span",
                                {
                                    attrs: {
                                        class: className
                                    }
                                },
                                row.direction == "BUY"
                                    ? this.$t("exchange.buyin")
                                    : this.$t("exchange.sellout")
                            );
                        }
                    },
                    {
                        title: this.$t("exchange.price"),
                        key: "price",
                        width: 110,
                        render(h, params) {
                            return h(
                                "span",
                                {
                                    attrs: {
                                        title: params.row.price
                                    }
                                },
                                self.toFloor(params.row.price)
                            );
                        }
                    },
                    {
                        title: this.$t("exchange.num"),
                        key: "amount",
                        width: 90,
                        render(h, params) {
                            return h(
                                "span",
                                {
                                    attrs: {
                                        title: params.row.amount
                                    }
                                },
                                self.toFloor(params.row.amount)
                            );
                        }
                    },
                    {
                        title: this.$t("exchange.traded"),
                        key: "tradedAmount",
                        width: 80,
                        render(h, params) {
                            return h(
                                "span",
                                {
                                    attrs: {
                                        title: params.row.tradedAmount
                                    }
                                },
                                self.toFloor(params.row.tradedAmount)
                            );
                        }
                    },
                    {
                        title: "成交金额",
                        key: "turnover",
                        width: 90,
                        render(h, params) {
                            return h(
                                "span",
                                {
                                    attrs: {
                                        title: params.row.turnover
                                    }
                                },
                                self.toFloor(params.row.turnover)
                            );
                        }
                    },
                    {
                        title: this.$t("exchange.action"),
                        key: "operate",
                        width: 110,
                        render: (h, params) => {
                            return h(
                                "Button",
                                {
                                    props: {
                                        size: "small"
                                    },
                                    style: {
                                        border: "1px solid #f0ac19",
                                        color: "#f1ac19",
                                        "line-height": "1.2",
                                        "border-radius": "10px"
                                    },
                                    on: {
                                        click: () => {
                                            // console.log("======开始撤单")
                                            this.cancel(params.row.orderId);
                                        }
                                    }
                                },
                                this.$t("exchange.undo")
                            );
                        }
                    }
                ],
                orders: []
            };
        },
        created() {
            this.getHistoryOrder();
            this.getSymbol();
        },
        methods: {
            dateFormat: function(tick) {
                return moment(tick).format("YYYY-MM-DD HH:mm:ss");
            },
            timeFormat: function(tick) {
                return moment(tick).format("HH:mm:ss");
            },
            loadDataPage(data) {
                this.pageNo = data;
                this.getHistoryOrder();
            },
            handleSubmit() {
                this.pageNo = 1;
                this.getHistoryOrder();
            },
            handleClear() {
                this.formItem = {
                    symbol: "",
                    type: "",
                    direction: "",
                    date: ""
                };
            },
            getHistoryOrder() {
                //查询历史委托
                this.loading = true;
                const { symbol, type, direction, date: rangeDate } = this.formItem,
                    startTime = new Date(rangeDate[0]).getTime() || "",
                    endTime = new Date(rangeDate[1]).getTime() || "";
                let params = {};
                if (symbol) params.symbol = symbol;
                if (direction) params.direction = direction;
                if (type) params.type = type;
                if (startTime) params.startTime = startTime;
                if (endTime) params.endTime = endTime;
                params.pageNo = this.pageNo;
                params.pageSize = this.pageSize;
                var that = this;
                this.orders = [];
                this.$http
                    .post(this.host + "/exchange/order/personal/current", params)
                    .then(response => {
                        var resp = response.body;
                        let rows = [];
                        if (resp.content.length > 0) {
                            this.total = resp.totalElements;
                            for (var i = 0; i < resp.content.length; i++) {
                                var row = resp.content[i];
                                row.price =
                                    row.type == "MARKET_PRICE"
                                        ? that.$t("exchange.marketprice")
                                        : row.price;
                                rows.push(row);
                            }
                            this.orders = rows;
                            console.log(this.orders);
                        }
                        this.loading = false;
                    });
            },
            getSymbol() {
                this.$http.post(this.host + this.api.market.thumb, {}).then(response => {
                    var resp = response.body;
                    if (resp.length > 0) {
                        this.symbol = resp;
                    }
                });
            },
            cancel(orderId) {
                this.$Modal.confirm({
                    content: this.$t("exchange.undotip"),
                    onOk: () => {
                        this.$http
                            .post(this.host + this.api.exchange.orderCancel + "/" + orderId, {})
                            .then(response => {
                                var resp = response.body;
                                if (resp.code == 0) {
                                    this.getHistoryOrder();
                                } else {
                                    this.$Notice.error({
                                        title: this.$t("exchange.tip"),
                                        desc: resp.message
                                    });
                                }
                            });
                    }
                });
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
