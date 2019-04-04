import Vue from 'vue'
import moment from 'moment'

const time = (value, formatString = 'YYYY-MM-DD HH:mm') => {
  return moment(value).format(formatString)
}

Vue.filter('time', time)

export default Vue
