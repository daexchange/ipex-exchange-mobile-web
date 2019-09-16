<template>
    <div class="menu">
        <div class="wrapper">
            <van-collapse v-model="activeNames" border="false">
                <van-collapse-item title="账户管理" name="1" size="large" class="collapseItem">
                    <van-cell title="安全设置" is-link to="index"/>
                    <van-cell title="账户设置" is-link to="index"/>
                </van-collapse-item>
                <van-collapse-item title="币币账户" name="2" size="large">
                    <van-cell title="个人资产" is-link to="index" />
                    <van-cell title="资产流水" is-link to="index" />
                    <van-cell title="充币" is-link to="index" />
                    <van-cell title="提币" is-link to="index" />
                    <van-cell title="转账" is-link to="index" />
                </van-collapse-item>
                <van-collapse-item title="法币账户" name="3" size="large">
                    <van-cell title="个人资产" is-link to="/personalassets" />
                    <van-cell title="资产流水" is-link to="/transationflow" />
                </van-collapse-item>
                <van-collapse-item title="币币管理" name="4" size="large">
                    <van-cell title="当前委托" is-link to="/current" />
                    <van-cell title="委托历史" is-link to="/history" />
                </van-collapse-item>
                <van-collapse-item title="法币管理" name="5" size="large">
                    <van-cell title="我的广告" is-link to="/myadver" />
                    <van-cell title="我的订单" is-link to="/myorder" />
                </van-collapse-item>
            </van-collapse>
        </div>
    </div>
</template>

<script>
    export default {
        name: "MemberCen",
        data() {
            return {
                activeNames: ['1'],
            }
        },
    }
</script>

<style scoped>
    .menu {
        width: 100%;
        /*height: 580px;
        background: #808695;*/
    }
    .wrapper /deep/ .van-cell {
        color: #fff;
        background-color: #192330;
    }
    .wrapper /deep/ .van-collapse-item__content {
        padding: 0px 220px 0px 34px;
        background-color: #192330;
    }
    .wrapper /deep/ .van-hairline--top-bottom::after, .van-hairline-unset--top-bottom::after {
        border-width: 0px;
    }
    .wrapper /deep/ .van-cell:not(:last-child)::after {
        border-width: 0px;
    }
    .van-hairline--top::after {
        border-width: 0px;
    }
</style>
