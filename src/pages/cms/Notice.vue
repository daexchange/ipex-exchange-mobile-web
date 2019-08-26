<template>
    <div class="notice">
        <div class="banner">
            <span style="margin-bottom: 25px">{{$t("cms.gonggaoban")}}</span>
        </div>
        <div class="main">
            <div class="list">
                <div class="item" v-for="item in FAQList" @click="noticedeail(item.id)">
                    <span class="text">{{item.title}}</span>
                    <img v-show="item.isTop==0" class="iconimg" src="../../assets/images/icon-top.png" alt="">
                    <span class="time">
            {{item.createTime}}
          </span>
                </div>
            </div>
            <div class="paging">
                <Page :total="totalNum" :pageSize="pageSize" :current="pageNo" size="small" @on-change="loadDataPage"></Page>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                pageNo: 1,
                pageSize: 10,
                totalNum: 0,
                FAQList: []
            };
        },
        created: function() {
            this.init();
        },
        computed: {
            lang() {
                return this.$store.state.lang;
            }
        },
        methods: {
            init() {
                this.$store.state.HeaderActiveName = "1-7";
                this.$store.commit("navigate", "nav-service");
                this.loadDataPage(this.pageNo);
            },
            loadDataPage(pageIndex) {
                var param = {};
                (param["pageNo"] = pageIndex),
                    (param["pageSize"] = this.pageSize),
                    this.$http
                        .post(this.host + this.api.uc.announcement, param)
                        .then(response => {
                            // console.log(response);
                            var resp = response.body;
                            if (resp.code == 0) {
                                if (resp.data.content.length == 0) return;
                                this.FAQList = resp.data.content;
                                this.totalNum = resp.data.totalElements;
                            } else {
                                this.$Notice.error({
                                    title: this.$t("common.tip"),
                                    desc: resp.message
                                });
                            }
                        });
            },
            noticedeail(id) {
                var path = { path: "/notice/index", query: { id: id } };
                this.$router.push(path);
            },
            titleLang(str) {
                const reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
                if (reg.test(str)) {
                    return "简体中文";
                } else {
                    return "English";
                }
            }
        }
    };
</script>

<style scoped lang="scss">
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
    .main {
        width: 90%;
        height: 200px;
        margin: -30px auto 10px auto;
        border-radius: 6px;
        color: #fff;
        background-color: #192330;
    }
    .list {
        font-size: 14px;
    }
    .item {
        padding: 3px 20px;
        line-height: 40px;
        border-bottom: 1px solid #27313e;
        cursor: pointer;
    }
    .iconimg {
        width: 14px;
        vertical-align: sub;
        margin-left: 20px;
    }
    .time {
        float: right;
        color: #999;
        font-size: 14px;
    }
    .paging {
        text-align: right;
        margin-top: 12px;
        margin-right: 12px;
    }
</style>
