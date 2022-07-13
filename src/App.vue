<template>
  <div class="color_poick" v-if="isShowColorPicker">
      <ColorPicker
        type="gradient"
        @changeColor="changeColor"
        @onClose="onClosePicker"
      />
    </div>
    <div class="box_xxx" :style="style"></div>
</template>

<script>
import ColorPicker from './components/vue3-color-picker.vue'
import {reactive, toRefs} from 'vue'
export default {
  name: 'App',
  components: {
    ColorPicker
  },
  setup(){
    const state = reactive({
      isShowColorPicker: true,
      color: {
          hex: '#000000',
          rgba: { r: 0, g: 0, b: 0, a: 1 },
          color: 'rgba(0,0,0,1)'
        },
        style: ''
    })
    function changeColor ({ style, colors, deg, color }) {
      const obj = { type: 'color', value: color }
      console.log(style, colors, deg);
      console.log(obj);
      
      state.style = style;
      // updateProps(obj)
    }
   function onClosePicker () {
      // state.isColorChange = false
      // state.isShowColorPicker && (state.isShowColorPicker = false)
    }
    return {
      ...toRefs(state),
      changeColor,
      onClosePicker
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.box_xxx{
  width: 300px;
  height: 500px;
}

</style>
