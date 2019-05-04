import api from 'API/index'
import {
  SET_SITE_INFO,
  SET_AUTHOR_INFO
} from '../mutation-types'

import {
  cachedSiteInfo
} from 'API/cacheService'

const state = {
  siteInfo: cachedSiteInfo.load() || {},
  authorInfo : {}
}

const getters = {
  siteInfo (state) {
    return state.siteInfo
  },
  authorInfo(state){
    return state.authorInfo 
  }
}

const mutations = {
  [SET_SITE_INFO] (state, data) {
    state.siteInfo = data
  },
  [SET_AUTHOR_INFO] (state, data) {
    state.authorInfo = data
  }
}

const actions = {
  /**
   * 获取 关于我 页面
   */
  getBlogAboutMe (store) {
    return api.getBlogAboutMe()
      .then((data) => {
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * 获取博客信息
   */
  getSiteInfo (store) {
    return api.getSiteInfo()
      .then((data) => {
        cachedSiteInfo.save(data)
        store.commit(SET_SITE_INFO, data)
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * 获取文章列表
   */
  getBlogArticleList (store, params) {
    return api.getBlogArticleList(params)
      .then((data) => 
      {
       
        // console.log('in blog.js we got', article_list)
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * 获取文章归档列表
   */
  getBlogArticleArchives (store, params) {
    return api.getBlogArticleArchives(params)
      .then((data) => {
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * 获取文章信息
   */
  getBlogArticle (store, articleId) {
    return api.getBlogArticle(articleId)
      .then((data) => {
        store.commit(SET_AUTHOR_INFO, data.author)
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  
  
  /**
   * 获取分类列表
   */
  getBlogCategoryList (store) {
    return api.getBlogCategoryList()
      .then((data) => {
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * 获取标签列表
   */
  getBlogTagList (store) {
    return api.getBlogTagList()
      .then((data) => {
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * 获取友链列表
   */
  getBlogFriendsList (store) {
    return api.getBlogFriendsList()
      .then((data) => {
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * 获取文章评论列表
   */
  getBlogComments (store, articleId) {
    return api.getBlogComments(articleId)
      .then((data) => {
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * 添加评论
   */
  replyComments (store, params) {
    return api.replyComments(params)
      .then((data) => {
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * 获取 我的简历 页面
   */
  getBlogResume (store) {
    return api.getBlogResume()
      .then((data) => {
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  },
  /**
   * 按文章标题和简介搜索
   */
  searchArticle (store, params) {
    return api.searchArticle(params)
      .then((data) => {
        return Promise.resolve(data)
      })
      .catch((error) => {
        return Promise.reject(error)
      })
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
