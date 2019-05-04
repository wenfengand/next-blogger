<template>
  <div id="home" v-loading="loading">
    <div class="search-input-wrap">
      <input 
        v-model="searchValue"
        @keyup.enter="toSearch()"
        type="search"
        placeholder="输入关键字搜索..."
        id="search-input"
        class="search-real-input">
    </div>
    <article-card2
      v-for="(article, index) in articleList"
      :key="index"
      :article="article" />
    <!-- 分页 -->
    <div
      class="pagination"
      v-show="total > 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="pageSize"
        @current-change="pageChange"
        :current-page="currentPage"
        :total="total">
      </el-pagination>
    </div>
    <!-- 分页 结束 -->
    <no-data
      v-if="total === 0"
      text="没有找到文章"/>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters
} from 'vuex'

import { scroll } from 'MIXINS/scroll'

import articleCard2 from 'COMMON/articleCard/articleCard2'
import noData from 'COMMON/noData/noData'

export default {
  name: 'home',
  components: {
    articleCard2,
    noData
  },
  mixins: [scroll],
  data () {
    return {
      articleList: [],
      page: 0,
      pageSize: 10,
      currentPage: 0,
      total: 0,
      loading: false,
      searchValue: ''
    }
  },
  created() {
    this.page = 0
    this.getList()
  },
  methods: {
    ...mapActions([
      'getBlogArticleList',
      'searchArticle'
    ]),
    pageChange(currentPage) {
      this.scrollToTarget(0, false)
      this.page = currentPage - 1
      this.currentPage = currentPage
      this.getList()
    },
    getList() {
      this.loading = true
      this.getBlogArticleList({
          page: this.page,
          pageSize: this.pageSize
        })
        .then( (data) => {
          
          this.total = data.total
          
          this.articleList = data.list
          this.loading = false
        })
        .catch(()=> {
          this.articleList = []
          this.loading = false
        })
    },
    toSearch(){
      if (this.searchValue === '') {
        this.$toast('搜索内容不能为空', 'error')
        return
      }
      else {

        this.loading = true
        this.searchArticle({
            searchValue: this.searchValue,
            page: this.page,
            pageSize: this.pageSize
          })
          .then((data) => {
        
            this.total = data.total
            this.articleList = data.list
            this.loading = false
          })
          .catch(()=> {
            this.articleList = []
            this.loading = false
          })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~STYLUS/color.styl'
#home
  position: relative
  padding: 30px 10px
  min-height: 100px
  .search-input-wrap
    width: 100%
    max-width: 300px
    height: 30px
    border-radius: 5px
    border: 1px solid #eeeeee
    margin-bottom: 10px 

    .search-real-input
      width: 100%
      height: 28px
      padding: 5px 10px
      border-radius: 5px
      border: none
      font-size: 14px
      background-color: $color-white
      &::placeholder
        color: $text-tip
  .pagination
    width: 100%
    padding: 10px 0
    display: flex
    display: -webkit-flex
    flex-direction: row
    justify-content: center
    background-color: $color-white


.slide-fade-enter
.slide-fade-leave-to
  opacity: 0
</style>
