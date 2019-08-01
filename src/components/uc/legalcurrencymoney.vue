<template>
  <div class="nav-rights">
    <div class="nav-right col-xs-12 col-md-10 padding-right-clear">
      <div class="bill_box rightarea padding-right-clear">
        <div class="shaow">
          <div class="money_table">
            <Table :columns="tableColumnsMoney" :data="tableMoney" :loading="loading" :disabled-hover="true"></Table>
          </div>
        </div>
      </div>
    </div>
    <Modal v-model="modal" :title="$t('uc.finance.money.fundstransfer')" @on-ok="transferAccount">
    	<div id="wrapper">
			<i-button long style="height:70px;">
					<div id="first">{{$t('uc.finance.money.transfertip3')}}<br/><span>{{ from }}</span></div>
					<div id="second">
					    <svg @click="changeAccount" id="icon-f_4" viewBox="0 0 1024 1024" width="100%" height="100%" 
						style="width:40px;height: 30px;line-height: 0px;text-align: center;"><path d="M512 1024C229.233778 1024 0 794.766222 0 512S229.233778 0 512 0s512 229.233778 512 512-229.233778 512-512 512z m0-28.444444c267.064889 0 483.555556-216.490667 483.555556-483.555556S779.064889 28.444444 512 28.444444 28.444444 244.935111 28.444444 512s216.490667 483.555556 483.555556 483.555556z" fill="#24A0F5"></path><path d="M471.608889 426.666667H625.777778a85.333333 85.333333 0 0 1 85.333333 85.333333H312.888889l157.809778-170.666667 0.881777 85.333334zM552.391111 654.222222H398.222222a85.333333 85.333333 0 0 1-85.333333-85.333333h398.222222l-157.809778 170.666667-0.881777-85.333334z" fill="#24A0F5"></path></svg>
				   	</div>
				   <div id="third">{{$t('uc.finance.money.transfertip4')}}<br/><span>{{to}}</span></div>
			</i-button>
	 	</div>
      <br/>
      <p>
        <span>{{$t('uc.finance.money.transfertip1')}}：</span>
        <InputNumber style="width: 100%;border-color: #fff;background: none;" type="text" v-model="matchAmount" :placeholder="$t('uc.finance.money.transfertip2')"></InputNumber>
      </p>
      <P style="font-weight: bold;padding: 10px 0;">{{$t('uc.finance.money.transfertip2')}}：{{balanceAmount}}</p>
    </Modal>
    <Modal v-model="modal_msg" :title="$t('uc.finance.money.fundstransfer')">
      <p>{{match_msg}}</p>
    </Modal>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
	  balanceAmount: 0,
	  legalCurrencyBalance: 0,
	  exchangeBalance: 0,
      matchAmount: 0,
      modal: false,
      loginmsg: this.$t("common.logintip"),
      loading: true,
      ordKeyword: "",
      tableMoney: [],
      canMatch: true,
      modal_msg: false,
      match_msg: "",
	  coinId: "",
	  from:this.$t("usercenter.legalcurrencyaccount"),
	  to:this.$t("usercenter.exchangeaccount")
    };
  },
  methods: {
    getMoney() {
      //获取
      this.$http.post(this.host + "/uc/legal-currency/asset/wallet").then(response => {
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
	changeAccount() {
		var temp = this.from;
	 	this.from = this.to;
		this.to= temp;
		if (this.from==this.$t("usercenter.legalcurrencyaccount")) {
			this.balanceAmount=this.legalCurrencyBalance;
		} else {
			this.balanceAmount=this.exchangeBalance;
		}
    },
    getCoinAmount(coinName) {
      this.coinId = coinName;
      //获取
      this.$http
        .post(this.host + "/uc/legal-currency/asset/coin?coinId="+coinName)
        .then(response => {
          var resp = response.body;
          if (resp.code == 0) {
            this.canMatch = true;
			this.legalCurrencyBalance = resp.data.legalCurrencyBalance;
			this.exchangeBalance = resp.data.exchangeBalance;
			
			if (this.from==this.$t("usercenter.legalcurrencyaccount")) {
				this.balanceAmount=this.legalCurrencyBalance;
			} else {
				this.balanceAmount=this.exchangeBalance;
			}
          } else { this.canMatch = true;
           // this.canMatch = false;
           // this.match_msg = resp.message;
            // this.$Message.error(this.loginmsg);
          }
          this.showMatchDailog();
        });
    },
    showMatchDailog() {
      if (this.canMatch) this.modal = true;
      else this.modal_msg = true;
    },
    transferAccount() { 
      if (this.matchAmount <= 0) {
        this.$Message.warning(this.$t("uc.finance.money.transfererr1"));
      } else if (this.matchAmount > this.GCCMatchAmount) {
        this.$Message.warning(this.$t("uc.finance.money.transfererr2"));
     } else {
        let params = {};
		params["amount"] = this.matchAmount;
		
		if (this.from==this.$t("usercenter.legalcurrencyaccount")) {
			params["from"] = 'LegalCurrencyAccount';
        	params["to"] = 'ExchangeAccount';
		} else {
			params["from"] = 'ExchangeAccount';
        	params["to"] = 'LegalCurrencyAccount';
		}
        params["coinId"] = this.coinId;
        
        this.$http
          .post(this.host + "/uc/legal-currency/asset/transfer", params)
          .then(response => {
            var resp = response.body;
            if (resp.code == 0) {
			  	this.getMoney();
            	this.$Message.success(this.$t("uc.finance.money.transfersuccess"));
            } else {
              	this.$Message.error(resp.message);
            }
          });
      }
    },
    resetAddress(unit) {
    }
  },
  created() {
    this.getMoney();
  },
  computed: {
    tableColumnsMoney() {
      let self = this;
      let columns = [];
      columns.push({
        title: this.$t("uc.finance.money.cointype"),
        key: "coinType",
        width: 100,
        align: "center"
      });
      columns.push({
        title: this.$t("uc.finance.money.balance"),
        key: "balance",
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
        align: "center",
        render: function(h, params) {
        	var actions = [];
          	// 资金划转;
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
                      self.getCoinAmount(params.row.coin.name);
                    }
                  },
                  style: {
                    marginRight: "8px"
                  }
                },
                self.$t("uc.finance.money.fundstransfer")
              )
            );
          return h("p", actions);
        }
      });
      return columns;
    }
  }
};
</script>
<style lang="scss">
.nav-right {
  .rightarea.bill_box {
    .shaow {
      padding: 5px;
    }
    .money_table {
      .ivu-table-wrapper {
        .ivu-table-header{
          background: #27313e;
          th{
            color: #fff;
          }
        }
        .ivu-table-body {
          td {
            color: #fff;
            .ivu-table-cell {
              p .ivu-btn {
                background: transparent;
                height: 25px;
                padding: 0 10px;
                span {
                  display: inline-block;
                  line-height: 25px;
                  font-size: 14px;
                }
              }
              p .ivu-btn.ivu-btn-info {
                border: 1px solid #f0ac19;
                border-radius: 20px;
                span {
                  color: #f0ac19;
                }
              }
              p .ivu-btn.ivu-btn-error {
                border: 1px solid #f15057;
                border-radius: 20px;
                span {
                  color: #f15057;
                }
              }
              p .ivu-btn.ivu-btn-primary {
                border: 1px solid #00b275;
                border-radius: 20px;
                span {
                  color: #00b275;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

<style scoped lang="scss">
.nav-right {
  height: auto;
  overflow: hidden;
  padding: 0 0 0 15px;
  .rightarea.bill_box {
    padding-left: 15px;
    width: 100%;
    height: auto;
    overflow: hidden;
  }
}
</style>

<style type="text/css">
#wrapper {
  clear:both;
  margin:0 auto;
  text-align:center;
  
}
#first {
  width:30%;
  float:left;
}
#second {
  width:30%;
  float:left;
}
#third {
  float:left;
}
btn.ivu-btn-default {
    background-color: #27313e;
    color: #ccc;
    width: 100%;
}
</style>