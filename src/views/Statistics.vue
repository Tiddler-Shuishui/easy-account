<template>
  <Layout>
    <Tabs class-prefix="type" :data-source="recordTypeList" :value.sync="type"/>
    <ol>
      <li v-for="(group,index) in groupList" :key="index">
        <ol>
          <h3 class="title">{{ beautify(group.title) }} <span>￥{{group.total}}</span> </h3>
          <li class="record" v-for="item in group.items" :key="item.id">
            <span>{{ tagString(item.tags) }}</span>
            <span class="notes">{{ item.notes }}</span>
            <span>￥{{ item.amount }}</span>
          </li>
        </ol>
      </li>
    </ol>
  </Layout>
</template>


<script lang="ts">
import Vue from 'vue';
import {Component} from 'vue-property-decorator';
import Tabs from '@/components/Tabs.vue';
import recordTypeList from '@/constants/recordTypeList';
import dayjs from 'dayjs';
import clone from '@/lib/clone';

@Component({
  components: {Tabs}
})
export default class Statistics extends Vue {
  tagString(tags: string[]) {
    return tags.length === 0 ? '无' : tags.join(',');
  }

  beautify(string: string) {
    const day = dayjs(string);
    const now = dayjs();
    if (day.isSame(now, 'day')) {
      return '今天';
    } else if (day.isSame(now.subtract(1, 'day'), 'day')) {
      return '昨天';
    } else if (day.isSame(now.subtract(2, 'day'), 'day')) {
      return '前天';
    } else if (day.isSame(now, 'year')) {
      return day.format('M月D日');
    } else {
      return day.format('YYYY年M月D日');
    }
  }

  get recordList() {
    return (this.$store.state as RootState).recordList;
  }


  get groupList() {
    type Result = {title: string; total?: number; items: RecordItem[]}[]
    const {recordList} = this;
    if(recordList.length === 0){return [];}
    const newList = clone(recordList).filter(r => r.type === this.type).sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
    const result: Result = [{title: dayjs(newList[0].createdAt).format('YYYY-MM-DD'),items: [newList[0]]}];
    let last = dayjs(newList[0].createdAt).format('YYYY-MM-DD')
    for(let i=1;i<newList.length;i++){
      if(dayjs(newList[i].createdAt).format('YYYY-MM-DD')=== last){
        result[result.length-1].items.push(newList[i])
      }else{
        result.push({title: dayjs(newList[i].createdAt).format('YYYY-MM-DD'),items: [newList[i]]})
        last = dayjs(newList[i].createdAt).format('YYYY-MM-DD')
      }
    }
    result.map(group => {
      group.total = group.items.reduce((sum,item) => sum + item.amount,0)
  })
    return result;
  }

  mounted() {
    this.$store.commit('fetchRecords');
  }

  type = '-';
  recordTypeList = recordTypeList;
}
</script>
<style scoped lang="scss">
::v-deep {
  .type-tabs-item {
    background: white;

    &.selected {
      background: #c4c4c4;

      &::after {
        display: none;
      }
    }
  }

  .interval-tabs-item {
    height: 48px;
  }
}

%item {
  padding: 8px 16px;
  line-height: 24px;
  display: flex;
  justify-content: space-between;
  align-content: center;
}

.title {
  @extend %item;
}

.record {
  @extend %item;
  background: white;
}

.notes {
  margin-right: auto;
  margin-left: 16px;
  color: #999;
}
</style>
