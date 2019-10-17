<template>
    <div class="main_background">
        <div class="ident-title" style="text-align: center">
            <!-- 申请认证商家 -->
            <h1>{{$t('uc.identity.apply')}}</h1>
        </div>
        <div class="business-function" style="text-align: center;margin-top: 20px">
            <img alt="" src="../../assets/images/business_show.png" width="300px">
            <p style="padding: 20px 0;font-weight: 600;font-size: 18px">{{$t('uc.identity.seat')}}</p>
            <span style="font-size: 14px;overflow:hidden; overflow: hidden;text-overflow:ellipsis;display: block;white-space:nowrap;color:#999;">{{$t("uc.identity.zhusnhu")}}</span>
        </div>
        <div class="business-function" style="text-align: center;margin-top: 30px">
            <img alt="" src="../../assets/images/business_service.png" width="300px">
            <p style="padding: 20px 0;font-weight: 600;font-size: 18px">{{$t('uc.identity.service')}}</p>
            <span style="font-size: 14px;color:#999;">{{$t("uc.identity.service")}}</span>
        </div>
        <div class="business-function" style="text-align: center;margin-top: 30px">
            <img alt="" src="../../assets/images/business_fee.png" width="300px">
            <p style="padding: 20px 0;font-weight: 600;font-size: 18px">{{$t('uc.identity.lowfee')}}</p>
            <span style="font-size: 14px;color:#999;">{{$t("uc.identity.lowfee")}}</span>
        </div>
        <!-- 同意第一步的协议 -->
        <div style="text-align: center;font-size: 16px;margin-top:30px">
            <Checkbox v-model="single"></Checkbox>
            <span>{{$t("uc.identity.read")}}</span>
            <router-link target="_blank" to="/helpdetail?cate=1&id=2&cateTitle=常见问题" class="cur" style="color:#f0a70a">{{$t('uc.identity.agreement')}}</router-link>
        </div>
        <!-- 同意第一步的按钮 -->
        <div class="sq" style="margin-top: 20px">
            <Button @click="apply" style="background:#f0a70a;color:#fff;outline:none;width: 200px;margin-left: 80px">{{$t("uc.identity.lijishenqing")}}</Button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "BusinessValidate"
    }
</script>

<style scoped>
    .main_background {
        background-color: #192330;
        padding: 25px;
        color: #fff;
    }
    .ivu-btn {
        border: 0px;
    }
</style>
