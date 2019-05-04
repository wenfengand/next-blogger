<template>
  <div id="m-header">
    <div class="header-wrap" :style="{height: isPc ? '90px' : '60px'}">
      <div class="header-logo" @click="toHomeFromLogo" 
        :style="{
        'justify-content': isPc ? 'space-between' : 'center',
        'padding': isPc ? '25px' : '0px'
        }">
        <p class="line" v-if="isPc"></p>
        <p class="blog-name">{{ siteInfo.siteName  }}</p>
        <p class="line" v-if="isPc"></p>
      </div>
      
      <header-tab-view v-if="isPc" :tabs="tabs" @tab-click="selectTab" />
    
      <div class="toggle" v-if="!isPc" @click="toggle">
        <span
          class="toggle-line"
          v-for="(line, index) in toggleLineData"
          :key="index"
          :style="{
            width: line.width,
            top: line.top,
            transform: line.transform,
            opacity: line.opacity,
            transition: 'all .3s'
          }">
        </span>
      </div>
    </div>
    
    <el-collapse-transition>
      <div class="mobile-tab-wrap" v-show="!isPc&&showMobileTabs">
        <div class="tab" v-for="(tab, index) in tabs" :key="index" @click="selectTab(tab)">
          <i class="iconfont" :class="tab.icon"></i>
          <span>{{ tab.name }}</span>
        </div>
      </div>
    </el-collapse-transition>
    
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations
} from 'vuex'

import headerTabView from 'COMMON/headerTabView/headerTabView'

export default {
  name: 'm-header',
  components: {
    headerTabView
  },
  data () {
    return {
      isPc: true,
      tabs: [
        {
          id : '1',
          name: '首页',
          icon: 'icon-home',
          router: 'home'
        },
        {
          id : '2',
          name: '分类/标签',
          icon: 'icon-tag',
          router: 'categories'
        },
        {
          id : '3',
          name: '前端',
          icon: 'icon-tag',
          items: [
            {
              id   : '5ca8aa44c05a800073bde20e',
              name : 'html',
              router   : 'articleList',
              type : 'category'
            },
            {
              id   : '5ccd8875d5de2b0074fac5bd',
              name : 'css',
              type  : 'category',
              router   : 'articleList',
            },
            {
              id   : '5ccd896e17b54d0068cd2bd8',
              name : 'javascript',
              type : 'category',
              router   : 'articleList'
            }, 
            {
              id   : '5ca89494a3180b0068f01210',
              name : 'Vue',
              type : 'category',
              router   : 'articleList'
            },
          ]
        },
        {
          id  : '4',
          name: '后端',
          icon: 'icon-tag',
          items: [
            {
              id   : '5ccd899dba39c80070d756e0',
              name : 'mysql',
              type : 'category',
              router   : 'articleList'
            },
            {
              id   : '5ccd89b00237d7006f27253e',
              name : 'apache',
              type : 'category',
              router   : 'articleList'
            },
            {
              id   : '5ccd89d30237d7006f2726cd',
              name : 'nginx',
              type : 'category',
              router   : 'articleList'
            }
          ]
        },
        
        {
          id  : '5',
          name: '机器学习',
          icon: 'icon-tag',
          items:[
            {
              id   : '5ca8aa6c0237d70068d88688',
              name : '机器学习',
              type : 'category',
              router: 'articleList'
            },
            {
              id   : '5ccd89f4d3761600694e6a69',
              name : '深度学习',
              type : 'category',
              router: 'articleList'
            },
          ]
          
        },
        
        /*
        {
          name: '归档',
          icon: 'icon-archives',
          to: 'archives'
        },
        {
          name: '关于',
          icon: 'icon-about',
          to: 'about'
        },
        {
          name: '友链',
          icon: 'icon-friends-link',
          to: 'friends'
        },
        {
          name: '更多',
          icon: 'icon-more',
          to: 'morefunc'
        },
        {
          name: '搜索',
          icon: 'icon-search',
          to: 'search'
        }
        */
      ],
      lineStyle: {
        normalLineData: [
          {
            width: '100%',
            top: '0px',
            transform: 'rotateZ(0deg)',
            opacity: '1'
          },
          {
            width: '100%',
            top: '0px',
            transform: 'rotateZ(0deg)',
            opacity: '1'
          },
          {
            width: '100%',
            top: '0px',
            transform: 'rotateZ(0deg)',
            opacity: '1'
          }
        ],
        closeLineData: [
          {
            width: '100%',
            top: '6px',
            transform: 'rotateZ(-45deg)',
            opacity: '1'
          },
          {
            width: '100%',
            top: '0px',
            transform: 'rotateZ(0deg)',
            opacity: '0'
          },
          {
            width: '100%',
            top: '-6px',
            transform: 'rotateZ(45deg)',
            opacity: '1'
          }
        ]
      },
      toggleLineData: [],
      showMobileTabs: false
    }
  },
  watch: {
    screen (value) {
      this.isPc = true

      if (value.width <= 768) {
        this.isPc = false
      }
    }
  },
  created() {
    this.toggleLineData = this.lineStyle.normalLineData
  },
  mounted () {
  },
  computed: {
    ...mapGetters([
      'screen',
      'siteInfo'
    ])
  },
  methods: {
    ...mapActions([
    ]),
    toHomeFromLogo () {
      
      window.location.href = `${window.location.origin}`
    },
    toggle () {
      this.showMobileTabs = !this.showMobileTabs
      this.toggleLineData = this.showMobileTabs ? this.lineStyle.closeLineData : this.lineStyle.normalLineData
    },
    selectTab (tab) {
      if (tab.router === 'morefunc') {
        this.$toast('更多功能待开发...')
        return
      }
      this.toggle()
      let route_str = {}
      route_str.name = tab.router 

      if(tab.type){
        route_str.query = {}
        route_str.query.type = tab.type 
        route_str.query.id   = tab.id 
      }
     
      this.$router.push(route_str)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '~STYLUS/color.styl'
*
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0)
#m-header
  position: relative
  width: 100%
  background-color: #f9f9f9
  .header-wrap
    position: relative
    max-width: 1000px
    padding: 0 10px
    margin: 0 auto
    height: 90px
    display: flex
    flex-direction: row
    justify-content: space-between
    align-items: center
    transition: height .3s
    .header-logo
      height: 100%
      display: flex
      flex-direction: column
      align-items: center
      justify-content: space-between
      color: $color-main
      font-size: 20px
      font-weight: bold
      padding: 25px 0
      &:hover
        cursor: pointer
        .line
          width: 0px
      .line
        width: 70px
        height: 2px
        background-color: $color-main
        animation: logo-line .5s
        transition: width .3s
      .blog-name
        animation: logo-name .5s
    .toggle
      width: 24px
      height: 24px
      background-color: #f9f9f9
      padding: 5px
      cursor: pointer
      line-height: 0
      .toggle-line
        position: relative
        display: inline-block
        vertical-align: top
        width: 100%
        height: 2px
        margin-top: 4px
        background-color: $color-main
        &:first-child
          margin-top: 0px
  .mobile-tab-wrap
    width: 100%
    transition: all .3s
    // overflow: hidden
    border-top: 1px solid #eeeeee
    .tab
      position: relative
      width: 100%
      padding: 8px 15px
      font-size: 12px
      line-height: 1
      .iconfont
        font-size: 12px
        margin-right: 5px

@keyframes logo-name {
  from {
    margin-left: -60px;
    opacity: 0
  }
  to {
    margin-left: 0px;
    opacity: 1
  }
}
@keyframes logo-line {
  from {
    width: 0px;
  }
  to {
    width: 70px;
  }
}
</style>
