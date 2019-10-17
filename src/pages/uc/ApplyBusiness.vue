<template>
    <div class="main_background">
        <div style="text-align: center">
            <h2>{{$t("uc.identity.tijiaoziliao")}}</h2>
            <p style="margin-top: 20px">{{$t("uc.identity.place")}}</p>
        </div>
        <Form :model="apply_form" label-position="right" :label-width="90" style="margin-top: 40px">
            <FormItem>
                <label slot="label" style="font-size: 16px;color: white">手机</label>
                <Input type="text" v-model="apply_form.telno" :placeholder="noEmpty" style="width: 200px"></Input>
            </FormItem>
            <FormItem>
                <label slot="label" style="font-size: 16px;color: white">微信</label>
                <Input type="text" v-model="apply_form.wechat" :placeholder="noEmpty" style="width: 200px"></Input>
            </FormItem>
            <FormItem>
                <label slot="label" style="font-size: 16px;color: white">QQ</label>
                <Input type="text" v-model="apply_form.qq" :placeholder="noEmpty" style="width: 200px"></Input>
            </FormItem>
            <div style="width: 100%;padding: 0 50px 0 50px">
                <div style="float: left">
                    <div style="text-align: center;font-size: 14px">保证金币种</div>
                    <Input readonly value="        ETH" style="width: 100px;margin: 5px 0 15px 0"/>
                    <Upload type="drag" ref="upload1" :on-success="assetHandleSuccess" :headers="uploadHeaders" :action="uploadUrl" :on-remove="assetRemove">
                        <span style="line-height: 100px;font-size: 50px;color:#ccc;">+</span>
                        <img v-show="assetImg" class="previewImg" :src="assetImg">
                    </Upload>
                    <span>{{$t("uc.identity.gerenzichan")}}</span>
                </div>
                <div style="float: left;margin-left: 50px">
                    <div style="text-align: center;font-size: 14px">保证金数量</div>
                    <Input readonly value="            2" style="width: 100px;margin: 5px 0 15px 0"/>
                    <Upload type="drag" ref="upload2" :on-success="tradeHandleSuccess" :headers="uploadHeaders" :action="uploadUrl" :on-remove="tradeRemove">
                        <span style="line-height: 100px;font-size: 50px;color:#ccc;">+</span>
                        <img v-show="tradeImg" class="previewImg" :src="tradeImg">
                    </Upload>
                    <span>{{$t("uc.identity.shuzizichan")}}</span>
                </div>
            </div>
            <div style="text-align: center;">
                <Button style="width:80%;background:#f0a70a;color:#fff;border:1px solid #f0a70a;margin: 30px 0px" type="info" @click="apply3('apply_form')" :disabled="applyBtn">{{$t("uc.identity.lijishenqing")}}</Button>
            </div>
        </Form>
    </div>
</template>

<script>
    export default {
        name: "BusinessDetail",
        data() {
            return {
                apply_form: {
                    telno: "",
                    wechat: "",
                    qq: "",
                    coinSymbol: "",
                    amount: "",
                    assetData: "",
                    tradeData: ""
                },
            }
        }
    }
</script>

<style scoped>
    .main_background {
        background-color: #192330;
        padding: 25px;
        color: #fff;
    }
</style>
