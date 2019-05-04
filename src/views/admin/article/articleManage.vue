<template>
  <div id="article-manage">
    <p>已发布（共计：{{ total }}篇）</p>
    <div class="article-table-wrap">
      <div class="search-input-wrap">
        <input 
          v-model="searchValue"
          @keyup.enter="toSearch()"
          type="search"
          placeholder="输入关键字搜索..."
          id="search-input"
          class="search-real-input">
      </div>
      <el-table
        :data="articleList"
        border
        stripe
        size="mini"
        style="width: 100%">
        <el-table-column
          label="标题"
          show-overflow-tooltip
          min-width="200">
          <template slot-scope="scope">
            <div class="article-title" @click="preview(scope.row)">{{ scope.row.title || '未填写标题' }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="封面图"
          width="61">
          <template slot-scope="scope">
            <img
              v-if="scope.row.cover"
              :src="scope.row.cover" 
              style="width: 100%;height: 20px; cursor: pointer"
              @click="previewImg">
          </template>
        </el-table-column>
        <el-table-column
          prop="category.name"
          label="分类"
          show-overflow-tooltip
          width="120">
        </el-table-column>
        <el-table-column
          prop="pageview"
          label="阅读量"
          width="60">
        </el-table-column>
        <el-table-column
          label="加密"
          width="45">
          <template slot-scope="scope">
            {{ scope.row.isEncrypt === '0' ? '否' : '是' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="create_time"
          label="创建时间"
          width="128"
          :formatter="formatTime">
        </el-table-column>
        <el-table-column
          prop="publish_time"
          label="发布时间"
          width="128"
          :formatter="formatTime">
        </el-table-column>
        <el-table-column
          prop="update_time"
          label="更新时间"
          width="128"
          :formatter="formatTime">
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="70">
          <template slot-scope="scope">
            <el-tag :type="success" size="mini">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          label="操作" 
          fixed="right"
          width="112">
          <template slot-scope="scope">
            <el-button
              size="mini"
              icon="el-icon-edit"
              type="primary"
              circle
              @click="edit(scope.row)">
            </el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              circle
              @click="under(scope.row)">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div
        class="pagination"
        v-show="articleList.length > 0">
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
    </div>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters
} from 'vuex'

import moment from 'moment'
import { scroll } from 'MIXINS/scroll'

export default {
  name: 'article-manage',
  components: {
  },
  mixins: [scroll],
  data () {
    return {
      articleList: [],
      page: 0,
      pageSize: 15,
      currentPage: 0,
      total: 0
    }
  },
  created() {
    this.page = 0
    this.getList()
  },
  methods: {
    ...mapActions([
      'getArticleList',
      'deleteArticle',
      'searchArticle'
    ]),
    formatTime(row, column, cellValue, index) {
      return cellValue ? moment(cellValue).format('YYYY-MM-DD HH:mm') : '-'
    },
    formatStatus(value) {
      return value == '0' ? '已发布' : '-'
    },
    edit(article) {
      this.$router.push({
        name: 'editArticle',
        query: {
          id: article.id
        }
      })
    },
    under(article) {
      this.showDialog('此操作会将该文章标记为删除，不再显示, 是否继续?', ()=> {
        this.deleteArticle(article.id)
          .then((data) => {
            this.$toast('已删除')
            this.page = 0
            this.getList()
          })
          .catch((err)=> {
            this.$toast(err.msg, 'error')
          })
      })
    },
    pageChange(currentPage) {
      this.scrollToTarget(0, false)
      this.page = currentPage - 1
      this.currentPage = currentPage
      this.getList()
    },
    getList() {
      this.getArticleList({
          by: 'status',
          status: '已发布',
          page: this.page,
          pageSize: this.pageSize
        })
        .then((data) => {
          this.total = data.total
          this.articleList = data.list
        })
        .catch(()=> {
          this.articleList = []
        })
    },
    previewImg(e) {
      this.$photoPreview.open(0, [{src: e.target.src, w: 40, h: 20, target: e.target}])
    },
    preview (article) {
      this.$router.push({
        name: 'articlePreview',
        query: {
          id: article.id
        }
      })
    },
    showDialog(tip, next) {
      this.$confirm(tip, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          next()
        }).catch(()=>{})
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
#article-manage
  position: relative
  padding-top: 52px
  > p
    position: fixed
    width: 100%
    top: 0
    padding: 18px
    font-size: 16px
    font-weight: bold
    background-color: $color-white
    box-shadow: 1px 1px 10px 1px rgba(38, 42, 48, .1)
    z-index: 1000
  .search-input-wrap
    width: 100%
    max-width: 300px
    height: 30px
    border-radius: 5px
    border: 1px solid #eeeeee
    margin-bottom: 10px 
    margin-top: 10px
    
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
  .article-table-wrap
    width: 100%
    animation: show .8s
    .pagination
      width: 100%
      margin: 20px 0
      display: flex
      justify-content: center

.article-title
  cursor: pointer
  &:hover
    color: #29b6f6

@keyframes show {
  from {
    margin-top: -10px;
    opacity: 0;
  }
  to {
    margin-top: 0px;
    opacity: 1;
  }
}
</style>
