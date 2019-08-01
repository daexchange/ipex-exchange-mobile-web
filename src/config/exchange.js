 export function reload (params) {
      if (params == undefined) {
        this.$router.push("/exchange/" + this.defaultPath);
        params = this.defaultPath;
      }
      const basecion = params.split("_")[1];
      if (basecion) {
        this.basecion = basecion;
      }
      var coin = params.toUpperCase().split("_")[0];
      var base = params.toUpperCase().split("_")[1];
      this.currentCoin.symbol = coin + "/" + base;
      this.currentCoin.base = base;
      this.$store.commit("navigate", "nav-exchange");
      this.$store.commit("setSkin", this.skin);
      this.getCNYRate();
      this.getSymbolScale();
      this.getSymbol(); //包含 K线图、getFavor、startWebsock等
      this.getPlate(); //买卖盘
      this.getTrade();
      this.sliderBuyLimitPercent = 0;
      this.sliderSellLimitPercent = 0;
      this.sliderBuyMarketPercent = 0;
      this.sliderSellMarketPercent = 0;
}

export function loadBaseSymbol () {
	let params = {
    };
	this.$http.post(this.host + this.api.market.baseSymbols, params).then(response => {
        var resp = response.body;
        
        for (var i = 0; i < resp.length; i++) {
          	var coin = resp[i];
          	 alert(coin);
        }
    });
}