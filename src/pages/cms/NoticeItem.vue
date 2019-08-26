<template>
    <div class="notice">
        <div class="banner">
            <span style="margin-bottom: 25px">{{$t("cms.gonggaoban")}}</span>
        </div>
        <div class="content-wrap">
            <router-link to="../notice" class="link"> <公告列表 </router-link>
            <div class="header">
                <h2>{{data.info.title}}</h2>
                <span>{{data.info.createTime}}</span>
            </div>
            <div class="content">
                <span v-html="data.info.content"></span>
            </div>
            <div class="nav-bottom">
                <div class="left" v-if="data.back">
                    <router-link class="link" :to="'../notice/index?id='+data.back.id">
                        <上一篇 <p>{{data.back.title}}</p>
                    </router-link>
                </div>
                <div class="right" v-if="data.next">
                    <router-link class="link" :to="'../notice/index?id='+data.next.id">下一篇>
                        <p>{{data.next.title}}</p>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                data: { info: {} },
                queryId: "",
                title: "",
                time: "",
                content: "",
                initLang: this.$store.state.lang
            };
        },
        created: function() {
            this.initialize();
            var self = this;
            self.fetchData();
            this.$store.commit("navigate", "nav-service");
        },
        computed: {
            lang() {
                if (this.$store.state.lang != this.initLang) {
                    this.$router.back();
                }
                return this.$store.state.lang;
            }
        },
        methods: {
            initialize() {
                this.loadNoticeInfo();
            },
            loadNoticeInfo() {
                let id = this.$route.query.id;
                if (id == null || id == "") {
                    this.$router.push("/notice");
                    return;
                }
                // this.$http.get(this.host + "/uc/announcement/" + id).then(response => {
                //   var result = response.body;
                //   if (result.code == 0) {
                //     this.title = result.data.title;
                //     this.time = result.data.createTime;
                //     this.content = result.data.content;
                //   }
                // });
                this.$http
                    .post(this.host + "/uc/announcement/more", { id })
                    .then(response => {
                        var result = response.body;
                        if (result.code == 0) {
                            const data = result.data;
                            this.data = data;
                            // this.title = result.data.title;
                            // this.time = result.data.createTime;
                            // this.content = result.data.content;
                        }
                    });
            },
            fetchData() {
                let id = this.$route.query.id;
                this.loadNoticeInfo();
            }
        },
        watch: {
            $route: "fetchData"
        }
    };
</script>

<style scoped>
    .banner {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 120px;
        background: linear-gradient(to right, #001a40, #000109);
        background-image: url("../../assets/images/notice_banner.png");
        background-size: 100% 100%;
        color: #fff;
        font-size: 32px;
    }
    .content-wrap {
        position: relative;
        width: 90%;
        height: 495px;
        margin: 0 auto;
        background-color: #192330;
        color: #fff;
        /*box-shadow: 0 0 2px #ccc;*/
        margin-top: -30px;
        border-radius: 6px;
        padding: 20px;
    }
    .link {
        font-size: 14px;
        color: #f0a70a;
    }
    .header {
        text-align: right;
        margin-bottom: 10px;
        padding: 10px 0;
        border-bottom: 1px solid #27313e;
    }
    .header h2 {
        text-align: center;
        margin-bottom: 10px;
    }
    .header span {
        padding: 0 10px;
        color: #999;
    }
    .content {
        color: #ccc;
    }
    .nav-bottom {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        padding: 20px 100px 50px 100px;
        display: flex;
        justify-content: space-between;
    }
    .link > p {
        color: #fff;
        line-height: 1;
        margin-top: 10px;
    }
    .left {
        text-align: left;
    }
    .right {
        text-align: right;
    }
</style>
