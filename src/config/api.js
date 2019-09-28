export default {
    common: {
        area: '/uc/uc/support/country'
    },
    uc: { //会员中心接口
        login: '/uc/uc/login',
        check: '/uc/uc/check',
        checkLogin: '/uc/uc/check/login',
        register: '/uc/uc/register',
        wallet: '/uc/uc/asset/wallet/',
        captcha: '/uc/uc/start/captcha',
        advertise: "/uc/uc/ancillary/system/advertise",
        identification: '/uc/uc/approve/certified/business/status', //商家认证
        apply: '/uc/uc/approve/certified/business/apply', //商家认证申请
        announcement: '/uc/uc/announcement/page', //公告列表
        paydividends: "/uc/uc/bonus/user/page", //持币分红
        mylistrecord: "/uc/uc/mine/detail/", //交易挖矿详情
        emaillogincode: '/uc/uc/email/login/code',
        emailloginsuccesscode: '/uc/uc/email/login/success/code',
        coininfo: "/uc/uc/withdraw/support/coin/info",
        withdrawrecord: '/uc/uc/withdraw/record',
        withdrawapplycode: '/uc/uc/withdraw/apply/code',
        emailwithdrawcode: '/uc/uc/email/withdraw/code',
    },
    market: { //币币交易行情接口
        // ws: '/market/market-ws',
        ws: '/marketws/market-ws',
        thumb: '/market/market/symbol-thumb',
        thumbTrend: '/market/market/symbol-thumb-trend',
        plate: '/market/market/exchange-plate', //主动查询的盘口信息
        platemini: '/market/market/exchange-plate-mini', //获取10条数据
        platefull: '/market/market/exchange-plate-full', //获取所有数据
        trade: '/market/market/latest-trade', //主动查询的实时成交信息
        symbolInfo: '/market/market/symbol-info',
		indexData: "/market/market/index_info",
		baseSymbols: "/market/market/base-symbols",
        usdCny:"/market/market/exchange-rate/usd-cny",
		getSymbolsThumb: '/market/market/get-symbols-thumb' //查询自选
    },
    exchange: { //币币交易委托提交与查询接口
        orderAdd: '/exchange-api/exchange/order/add', //提交订单接口
        current: '/exchange-api/exchange/order/current', //当前委托接口
        history: '/exchange-api/exchange/order/history', //历史委托接口
        detail: '/exchange-api/exchange/order/detail/', //详细订单接口
        favorFind: '/exchange-api/exchange/favor/find', //查询自选
        favorAdd: '/exchange-api/exchange/favor/add', //添加自选
        favorDelete: '/exchange-api/exchange/favor/delete', //删除自选
        orderCancel: '/exchange-api/exchange/order/cancel' //取消委托
    },
    otc: {
        coin: '/otc/otc/coin/all', //查询支持的币种
        advertise: '/otc/otc/advertise/page-by-unit', //获取广告
        createAd: '/uc/uc/ad/create', //创建广告
        adDetail: '/otc/otc/advertise/detail'
    }
}
