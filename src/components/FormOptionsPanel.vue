<template>
  <div class="w-full py-1 overflow-y-auto h-full shadow-md bg-white overflow-y-auto h-full" id='FormOptionsPanel'>
    <section class="shadow row">
      <div class="tabs">
        <draggable
            tag="ul"
            v-model="formReadAreasSortable"
            handle=".handle"
            item-key="name"
        >
          <template #item="{ element, index }">
            <div class="border-b tab" @click="selectArea(element.name)">
              <li class="border-l-2 border-transparent relative">
                <field-drop-down-otion
                    v-if="!element.isAnchor"
                    :area="element"
                    :selected="fabricActiveObject === element.name"
                />
              </li>
            </div>
          </template>
        </draggable>
      </div>
    </section>
  </div>
</template>

<script>

import FieldDropDownOtion from './FieldDropDownOtion.vue'
import helpers from "../mixins"
import draggable from 'vuedraggable'
import {store} from "../store";

export default {
  name: 'FormOptionsPanel',
  inject: ['$globals'],
  mixins: [helpers],
  components: {FieldDropDownOtion, draggable},
  data() {
    return {
      list: []
    };
  },
  methods: {
    selectArea(areaName){
      this.$globals.canvas.getObjects().forEach((obj) => {
        if(obj.name === areaName){
          this.$globals.canvas.setActiveObject(obj)
          this.$globals.canvas.requestRenderAll()
        }
      });
    }
  },
  computed: {
    formReadAreasSortable: {
      get: function () {
        let areasArray = Object.keys(this.formReadAreas).map((key) => this.formReadAreas[key])
        return areasArray.sort((area1, area2) => {
          return area1.columnPosition > area2.columnPosition ? 1 : -1
        })
      },
      set(areas) {
        for (let position in areas){
          store.state.formReadAreas[areas[position].name]['columnPosition'] = position
        }
        store.commit('mutateProperty', ['formReadAreas',  store.state.formReadAreas])
      }
    },
  }

}
</script>

<style scoped>

</style>