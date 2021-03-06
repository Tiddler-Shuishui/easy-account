<template>
  <Layout>
    <Tabs class-prefix="type" :data-source="recordTypeList" :value.sync="type"/>
    <ol v-if="groupList.length>0" class="group">
      <li v-for="(group,index) in groupList" :key="index">
        <ol class="groupItem">
          <h3 class="title">{{ beautify(group.title) }} <span>￥{{group.total}}</span> </h3>
          <li class="record" v-for="item in group.items" :key="item.id">
            <span>{{ tagString(item.tags) }}</span>
            <span class="notes">{{ item.notes }}</span>
            <span>￥{{ item.amount }}</span>
          </li>
        </ol>
      </li>
    </ol>
    <div v-else class="noResult">
      目前没有相关记录
    </div>
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
  tagString(tags: Tag[]) {
    return tags.length === 0 ? '无' : tags.map(t=>t.name).join('，');
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

    const newList = clone(recordList).filter(r => r.type === this.type).sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
    if(newList.length === 0){return [];}
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
@import "~@/assets/style/helper.scss";
.noResult{
  padding: 16px;
  text-align: center;
}
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
.group{
  border-radius: 8px;
  padding: 8px;
  .groupItem{
    margin-bottom: 8px ;
    li:last-child{
      border-radius: 0 0 8px 8px;
    }


    background: rgb(251,251,251);
    border-radius: 8px;
    .title {
      @extend %item;
      border-radius: 8px 8px 0 0;
    }

    .record {
      @extend %item;
      background: white;
      padding: 8px;
    }

    .notes {
      margin-right: auto;
      margin-left: 16px;
      color: #999;
    }
  }
}


</style>
