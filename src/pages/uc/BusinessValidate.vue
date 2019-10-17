<template>
    <div class="main_background">
        <div>
            <div class="ident-title" v-if="certStatus === 0" style="text-align: center">
                <!-- 申请认证商家 -->
                <h1>{{$t('uc.identity.apply')}}</h1>
            </div>
            <div class="ident-title" v-else-if="certStatus == 1">
                <h1>{{$t('uc.identity.tijiao')}}</h1>
            </div>
            <div class="ident-title" v-else-if="certStatus == 2">
                <h1>{{$t('uc.identity.tijiaosuc')}}</h1>
            </div>
            <div class="ident-title" v-else-if="certStatus == 3">
                <h1>{{$t("uc.identity.tijiaofail")}}</h1>
            </div>
            <div class="ident-title" v-else-if="certStatus == 5">
                <h1>{{$t("uc.identity.zhuxiaotijiao")}}</h1>
            </div>
            <div class="ident-title" v-else-if="certStatus == 6">
                <h1>{{$t("uc.identity.shenhefail")}}</h1>
            </div>
            <div class="ident-title" v-else-if="certStatus == 7">
                <h1>{{$t("uc.identity.shenhesuc")}}</h1>
            </div>
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
        <div class="sq" style="margin-top: 20px;text-align: center;">
            <Button @click="apply" style="background:#f0a70a;color:#fff;outline:none;width: 200px;">{{$t("uc.identity.lijishenqing")}}</Button>
        </div>

        <Modal v-model="modal_read">
            <!-- 如何申请成为商家 -->
            <p slot="header">
                <span style="font-size: 16px">{{$t('uc.identity.second.line')}}</span>
            </p>
            <div class="apply-note" style="font-size: 14px;color: white">
                <h3 style="margin-top: 15px;">{{$t('uc.identity.second.step1')}}</h3>
                <p style="margin-top: 5px">{{$t('uc.identity.second.step1c1')}}<br>{{$t('uc.identity.second.step1c2')}}</p>
                <h3 style="margin-top: 15px">{{$t('uc.identity.second.step2')}}</h3>
                <p style="margin-top: 5px">{{$t('uc.identity.second.step2c')}}</p>
                <h3 style="margin-top: 15px">{{$t('uc.identity.second.step3')}}</h3>
                <p style="margin-top: 5px">{{$t('uc.identity.second.stepc')}}</p>
                <div style="text-align: left;padding: 30px 0;">
                    <Checkbox v-model="agreeFrozen"></Checkbox> {{$t('uc.identity.second.agree')}}
                    <span>
            <font color="#f0a70a">{{auditText}}</font>{{$t('uc.identity.second.agreec')}}</span>
                </div>
                <Button @click="apply2" long style="font-size: 16px;background:#f0a70a;color:#fff;border:1px solid #f0a70a;">{{$t('uc.identity.second.shenqingchngweishangjia')}}</Button>
            </div>
            <p slot="footer"></p>
        </Modal>

    </div>
</template>

<script>
    export default {
        name: "BusinessValidate",
        data() {
            return {
                certStatus: 0, //认证申请状态，0:未申请，1：审核中，2：已认证，3：认证失败
                modal_read: false,
                single: false,
                agreeFrozen: false,
            }
        },
        methods: {
            apply() {
                let stasingle = this.single;
                if (stasingle == false) {
                    this.$Message.warning(this.$t("uc.identity.approve"));
                    return;
                }
                this.modal_read = true;
            },
            apply2() {
                let agreeFrozen = this.agreeFrozen;
                if (agreeFrozen == false) {
                    this.$store.state.lang != "English" &&
                    this.$Message.warning("请同意冻结相应数量的币");
                    this.$store.state.lang == "English" &&
                    this.$Message.warning(
                        "Please agree to freeze the corresponding amount of currency"
                    );
                    return;
                }
                this.modal_read = false;
                this.$router.push("/goApply");
            },
        }
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
