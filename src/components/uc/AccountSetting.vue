<template>
    <div class="main_background">
        <Form label-position="top">
            <FormItem>
                <label slot="label">
                    <img src="../../assets/img/bankcard.png" style="height: 17px;width: 17px;margin-bottom: -2px">
                    <span style="font-size: 16px;color: white">&nbsp;银行卡账号</span>
                </label>
                <Input style="width: 250px" readonly value="个人银行卡信息未绑定"></Input>
                <Button type="primary" style="margin-left: 10px">绑定</Button>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <img src="../../assets/img/alipay.png" style="height: 17px;width: 17px;margin-bottom: -2px">
                    <span style="font-size: 16px;color: white">&nbsp;支付宝账号</span>
                </label>
                <Input style="width: 250px" readonly value="个人支付宝账户未绑定"></Input>
                <Button type="primary" style="margin-left: 10px">绑定</Button>
            </FormItem>
            <FormItem>
                <label slot="label">
                    <img src="../../assets/img/wechat.png" style="height: 17px;width: 17px;margin-bottom: -2px">
                    <span style="font-size: 16px;color: white">&nbsp;微信账号</span>
                </label>
                <Input style="width: 250px" readonly value="个人微信账户未绑定"></Input>
                <Button type="primary" style="margin-left: 10px">绑定</Button>
            </FormItem>
        </Form>
    </div>
</template>

<script>
    export default {
        name: "AccountSetting"
    }
</script>
<style scoped>
    .main_background {
        background-color: #192330;
        padding: 25px;
        color: #fff;
    }
</style>
