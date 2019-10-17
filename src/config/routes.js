// import Vue from 'vue'
// import Layout from '../public/layout'
// import tradingcenter from '../pages/otc/TradingCenter'
// import ordermanagement from '../pages/uc/OrderManagement'
import membercenter from '../pages/uc/MemberCenter'
import membercen from '../pages/uc/MemberCen'
import checkuser from '../pages/otc/CheckUser'
import chat from '../pages/otc/Chat'
import notice from '../pages/cms/Notice'
import noticeitem from '../pages/cms/NoticeItem'
// import newhelp from '../pages/cms/NewHelp'
// import question from '../pages/cms/Question'
// import agreement from '../pages/cms/Agreement'
// import exchargerule from '../pages/cms/ExchargeRule' /*交易规则*/
// import userprotocol from '../pages/cms/UserProtocol' /*使用协议*/
// import feenote from '../pages/cms/FeeNote' /*资费说明*/
// import merchantprotocol from '../pages/cms/MerchantProtocol'
// import homenotice from '../pages/cms/HomeNotice' /*首页公告*/
import aboutus from '../pages/cms/AboutUs' /*关于我们*/
// import joinus from '../pages/cms/JoinUs' /*加入我们*/
// import rate from '../pages/cms/Rate'
import moneyindex from '../components/uc/MoneyIndex'
import record from '../components/uc/Record'
import trade from '../components/uc/MinTrade'
import paydividends from '../components/uc/PayDividends'
import invitingmining from '../components/uc/InvitingMin'
import recharge from '../components/uc/Recharge'
import safe from '../components/uc/Safe'
import account from '../components/uc/Account'
import withdrawAddr from '../components/uc/WithdrawAddress'
// import chatline from '../components/otc/Chatline'
// import noticeindex from '../components/cms/NoticeDeails'
import Index from '../pages/index/index'
import Login from '../pages/uc/Login'
import regist from '../pages/uc/regist'
import FindPwd from '../pages/uc/findpwd'
import Exchange from '../pages/exchange/exchange'
import Help from '../pages/cms/help'
import HelpList from '../pages/cms/HelpList' //帮助分类列表
import HelpDetail from '../pages/cms/HelpDetail' //帮助详情
import OTCMain from '../pages/otc/OTCHome'
import OtcTrade from '../pages/otc/OTCTrade'
import OtcOrder from '../components/uc/myorder'
import OtcAd from '../components/otc/MyAd'
import adPublish from '../pages/otc/AdPublish'
import identbusiness from '../pages/uc/IdentBusiness'
import findPassword from "../pages/uc/findPassword"
import userAgreement from '../pages/cms/UserAgreement'
import legalcurrencymoney from '../components/uc/legalcurrencymoney'
import legalcurrencyrecord from '../components/uc/legalcurrencyrecord'
import CreateAd from '../pages/otc/CreateAd'
import MyAdver from '../components/otc/MyAdver'
import MyOrder from '../components/uc/MyOrders'
import CurrentEntrust from  '../components/uc/CurrentEntrust'
import HistoryEntrust from  '../components/uc/HistoryEntrust'
import PersonalAssets from '../components/uc/PersonalAssets'
import TransactionFlow from '../components/uc/TransactionFlow'
import ExchangeAssets from '../components/uc/ExchangeAssets'
import ExchangeFlow from '../components/uc/ExchangeFlow'
import ExchangeRecharge from '../components/uc/ExchangeRecharge'
import ExchangeDetail from '../pages/exchange/ExchangeDetail'
import SymbolList from '../pages/exchange/SymbolList'
import Withdrawal from  '../components/uc/Withdrawal'
import Trans from '../components/uc/TransferAccounts'
import Safe from '../components/uc/SafeSetting'
import Authentication from '../components/uc/Authentication'
import Account from '../components/uc/AccountSetting'
import TradeDetail from '../pages/otc/TradeDetail'
import BusinessValidate from '../pages/uc/BusinessValidate'
import ApplyBusiness from '../pages/uc/ApplyBusiness'

// 币理财
// import Blc from '../pages/blc/Bilicai'
// import meblc from "../components/uc/Blc"
// import mebjc from "../components/uc/Bjc"
// 平台的小时分配和昨天的分配路由
// import platedistribute from "../pages/plate/distribution.vue"
// import today from "../components/plate/Today"
// import yesterday from "../components/plate/Yesterday"
// import Bjc from "../pages/bjc/Bijingcai"
// 平台手续费返还
// import feereturn from "../pages/feereturn/Feereturn"

export default [
    { path: '/', component: Index },
    { path: '/index', component: Index },
    { path: '/login', component: Login },
    { path: '/login/returnUrl/:returnUrl', component: Login },
    { path: '/register', component: regist },
    { path: '/findPwd', component: findPassword },
    { path: '/findPWD..', component: FindPwd },
    { path: '/exchange', component: Exchange },
    { path: '/exchange/*', component: Exchange },
    { path: '/help', component: Help },
    { path: '/helplist', component: HelpList },
    { path: '/helpdetail', component: HelpDetail },
    { path: '/notice', component: notice },
    { path: '/notice/index', component: noticeitem },
    { path: '/userAgreement', component: userAgreement },
    { path: '*', component: Index },
    { path: '/myadver', component: MyAdver },
    { path: '/myorder', component: MyOrder },
    { path: '/current', component: CurrentEntrust },
    { path: '/history', component: HistoryEntrust },
    { path: '/personalassets', component: PersonalAssets },
    { path: '/transationflow', component: TransactionFlow },
    { path: '/exchangeassets', component: ExchangeAssets },
    { path: '/ExchangeFlow', component: ExchangeFlow },
    { path: '/recharge', component: ExchangeRecharge },
    { path: '/detail/*', component: ExchangeDetail },
    { path: '/symbol', component: SymbolList },
    { path: '/withdrawal', component: Withdrawal },
    { path: '/transfer', component: Trans },
    { path: '/safe', component: Safe },
    { path: '/goAuthentication', component: Authentication },
    { path: '/account', component: Account },
    { path: '/goApply', component: ApplyBusiness },
    {
        name: 'tradeDetail',
        path: '/otc/tradeDetail',
        component: TradeDetail
    },
    {
        path: '/create',
        component: CreateAd
    },
    {
        path: '/otc',
        component: OTCMain,
        children: [{
                path: 'trade/*',
                component: OtcTrade
            }
        ]
    },
    {
        path: '/memberCenter',
        component: membercen,
    },
    {
        path: '/uc',
        component: membercenter,
        children: [{
                path: '',
                component: safe
            },
            {
                path: 'safe',
                component: safe
            },
            {
                path: 'account',
                component: account
            },
            {
                path: 'money',
                component: moneyindex
            },
            {
                path: 'record',
                component: record
            },
            {
                path: 'recharge',
                component: recharge
            },
            {
                path: 'withdraw/address',
                component: withdrawAddr
            },
            {
                path: 'ad',
                component: OtcAd
            },
            /*{
                path: 'ad/create',
                component: adPublish
            },*/
            {
                path: 'ad/update',
                component: adPublish
            },
            {
                path: 'order',
                component: OtcOrder
            },
            /*{
                path: 'entrust/current',
                component: EntrustCurrent
            },
            {
                path: 'entrust/history',
                component: EntrustHistory
            }, */
            {
                path: 'trade',
                component: trade
            },
            {
                path: 'invitingmining',
                component: invitingmining
            },
            {
                path: 'paydividends',
                component: paydividends
            },
            {
                path: 'legalcurrencymoney',
                component: legalcurrencymoney
            },
            {
                path: 'legalcurrencyrecord',
                component: legalcurrencyrecord
            },
        ]
    },
    {
        path: '/checkuser',
        component: checkuser
    },
    {
        path: '/chat',
        component: chat
    },
    {
        path: '/identbusiness',
        component: BusinessValidate
    },
    // {
    //     path: '/newhelp',
    //     component: newhelp,
    //     children: [{
    //             path: '',
    //             component: noticeindex
    //         },
    //         {
    //             path: 'index',
    //             component: noticeindex
    //         },
    //         {
    //             path: 'account',
    //             component: account
    //         },
    //     ]
    // },
    // {
    //     path: '/question',
    //     component: question
    // },
    // {
    //     path: '/agreement',
    //     component: agreement
    // },
    // {
    //     path: '/rate',
    //     component: rate
    // },
    // {
    //     path: '/about-rule',
    //     component: exchargerule
    // },
    // {
    //     path: '/about-protocol',
    //     component: userprotocol
    // },
    // {
    //     path: '/about-fee',
    //     component: feenote
    // },
    // {
    //     path: '/about-notice',
    //     component: homenotice
    // },
    {
        path: '/about-us',
        component: aboutus
    },
    // {
    //     path: '/join-us',
    //     component: joinus
    // },
    // {
    //     path: '/about-merchant',
    //     component: merchantprotocol
    // }
];
