<template>
  <div class="color_picker_wrapper">
    <div class="color_picker_box" ref="refBox" @click.stop>
      <div class="color_hd" v-if="type === 'gradient'">
        <div class="title">颜色</div>
        <div class="gcolor">
          <div class="gcolor_deg" v-if="!disabledColorDeg">
            <div class="gcolor_deg_span">角度</div>
            <Slider v-model="deg" :min="0" :max="360" :show-tooltip="false" />
            <input class="number_input" v-model="deg" />
          </div>

          <div class="gcolor_bar" ref="refColorBar">
            <div
              class="gcolor_bar_bg"
              :style="barStyle"
              @click="handlePotBar"
            ></div>
            <div class="gcolor_bar_pot_box">
              <div
                class="gcolor_bar_pot"
                v-for="(item, index) in colors"
                :key="`${item.pst}_${index}`"
                :style="{
                  left: getBarPst(item.pst),
                }"
                :class="{
                  on: selectIndex === index,
                }"
                @mousedown="sliderPotDown(index)"
                @click="clickGcolorPot(index)"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="gradient_box" v-if="type === 'gradient'">
        <template v-for="(item, index) in colors" :key="`${item.pst}_${index}`">
          <ColorPicker
            theme="light"
            :color="item.color"
            :sucker-hide="true"
            @changeColor="changeColor"
            v-if="index === selectIndex"
          />
        </template>
      </div>

      <div class="linear" v-else>
        <ColorPicker
          theme="light"
          :color="color.color"
          :sucker-hide="true"
          @changeColor="changeColor"
        />
      </div>
    </div>
  </div>
</template>

<script>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
  watch,
} from 'vue'
import { ColorPicker } from 'vue-color-kit'
import ColorScale from 'color-scales'
import { cloneDeep } from '../utils/index'
import useDraggle from '../hooks/useDraggle'
import Slider from 'element-plus/lib/components/slider'
import 'element-plus/es/components/slider/style/css'

/**
 * https://www.npmjs.com/package/color-scales
 */

export default {
  name: 'ColorPickerGradient',
  components: {
    ColorPicker,
    Slider,
  },
  props: {
    type: {
      type: String,
      default: 'linear',
    },
    disabledColorDeg: {
      type: Boolean,
      default: false,
    },
    pDeg: {
      type: Number,
      default: 90,
    },
    pColor: {
      type: Object,
      default() {
        return {
          hex: '#000000',
          rgba: { r: 0, g: 0, b: 0, a: 1 },
          color: 'rgba(0,0,0,1)',
        }
      },
    },
    pColors: {
      type: Array,
      default() {
        return [
          {
            color: 'rgba(255, 255, 255, 1)',
            hex: '#ffffff',
            rgba: { r: 255, g: 255, b: 255, a: 1 },
            pst: 100,
          },
          {
            color: 'rgba(0, 0, 0, 1)',
            hex: '#000000',
            rgba: { r: 0, g: 0, b: 0, a: 1 },
            pst: 0,
          },
        ]
      },
    },
  },
  setup(props, { emit }) {
    const { type, pColors, pDeg, pColor } = toRefs(props)
    const state = reactive({
      refColorBar: null,
      refBox: null,
      color: pColor.value,
      deg: pDeg.value,
      colors: pColors.value,
      selectIndex: 0,
      startMovePst: 0,
    })

    const barStyle = computed(() => {
      if (!state.colors) {
        return ''
      }
      const colors = cloneDeep(state.colors)
        .sort((a, b) => a.pst - b.pst)
        .map((item) => {
          return `${item.color} ${item.pst}%`
        })

      return `background-image: linear-gradient(${state.deg}deg, ${colors.join(
        ','
      )});`
    })

    // 拖拽距离
    const { movePst, enableDraggle, resetDraggle } = useDraggle(
      sliderStart,
      sliderMove,
      sliderDone
    )

    onUnmounted(() => {
      emit('onClose')
      unbindEvents()
    })

    onMounted(() => {
      initColors()
    })

    watch(barStyle, (barStyle) => {
      if (type.value === 'linear') return

      emitColorChange({
        style: barStyle,
      })
    })

    watch(
      pColor,
      (pColor) => {
        state.color = cloneDeep(pColor)
      },
      {
        deep: true,
      }
    )

    watch(
      pColors,
      (pColors) => {
        console.log('pColors', pColors)
        if (state.selectIndex >= pColors.length) {
          state.selectIndex = pColors.length - 1
        }
        state.colors = cloneDeep(pColors)
      },
      {
        deep: true,
      }
    )

    function initColors() {
      bindEvents()

      // 初始化颜色值
      if (type.value === 'gradient') {
        const renderList = cloneDeep(state.colors).sort((a, b) => a.pst - b.pst)
        state.selectIndex = state.colors.findIndex(
          (item) => item.pst === renderList[0].pst
        )

        nextTick(() => {
          emitColorChange({
            style: barStyle.value,
          })
        })
      } else {
        emitColorChange({
          color: cloneDeep(state.color),
        })
      }
    }

    function bindEvents() {
      type.value === 'gradient' && window.addEventListener('keyup', handleKeyup)
      window.addEventListener('click', handleClosePicker)
    }

    function unbindEvents() {
      type.value === 'gradient' &&
        window.removeEventListener('keyup', handleKeyup)
      window.removeEventListener('click', handleClosePicker)
    }

    function handleClosePicker() {
      emit('onClose')
    }

    function handleKeyup(e) {
      if ([8, 46].includes(e.keyCode)) {
        deleteColorPot()
      }
    }

    function deleteColorPot() {
      // 渐变色至少有两点
      if (state.colors.length === 2) return
      state.colors.splice(state.selectIndex, 1)

      // 删完滑块需要重新渲染
      initColors()
    }

    function handlePotBar(e) {
      const barBounding = state.refColorBar.getBoundingClientRect()
      const barLeft = barBounding.left
      const colorPotDist = e.pageX - barLeft
      console.log(cloneDeep(state.colors))
      // 渐变条stopColors
      const rangColors = cloneDeep(state.colors)
        .sort((a, b) => a.pst - b.pst)
        .map((item) => {
          return item.hex
        })

      // 初始化色条Range，用来取渐变色值
      const colorScale = new ColorScale(0, barBounding.width, rangColors)
      const colorPotHex = colorScale.getColor(colorPotDist).toHexString()
      const colorPotRgba = colorScale.getColor(colorPotDist).toRGBAString()
      const colorPotPst = (100 * colorPotDist) / barBounding.width

      state.colors.push({
        color: colorPotRgba,
        hex: colorPotHex,
        pst: colorPotPst,
      })

      // 增加后默认选中
      state.selectIndex = state.colors.length - 1
    }

    function sliderPotDown(index) {
      clickGcolorPot(index)
      enableDraggle()
    }

    function sliderStart() {
      state.startMovePst = state.colors[state.selectIndex].pst
    }

    function sliderDone() {
      resetDraggle()
    }

    function sliderMove() {
      const barWidth = state.refColorBar?.getBoundingClientRect().width
      let distRatio =
        ((state.startMovePst * barWidth) / 100 + movePst.value.x) / barWidth

      if (distRatio > 1) {
        distRatio = 1
      } else if (distRatio < 0) {
        distRatio = 0
      }
      state.colors[state.selectIndex].pst = Math.round(distRatio * 100)
    }

    function getBarPst(pst) {
      return `calc(${pst}% - 8px)`
    }

    function changeColor(color) {
      const rgba = color.rgba
      const hex = color.hex

      if (type.value === 'linear') {
        const colorValue = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
        state.color = {
          rgba,
          hex,
          color: colorValue,
        }

        emitColorChange({
          color: cloneDeep(state.color),
        })
      } else {
        handleGradientColorChange(color)
      }
    }

    function emitColorChange({
      style,
      colors = cloneDeep(state.colors),
      color = cloneDeep(state.color),
      deg = state.deg,
    }) {
      emit('changeColor', {
        style,
        colors,
        color,
        deg,
      })
    }

    function handleGradientColorChange(color) {
      const rgba = color.rgba
      state.colors[
        state.selectIndex
      ].color = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
      state.colors[state.selectIndex].hex = color.hex
      state.colors[state.selectIndex].rgba = color.rgba
    }

    function clickGcolorPot(index) {
      if (state.selectIndex === index) return
      state.selectIndex = index
    }

    return {
      ...toRefs(state),
      changeColor,
      getBarPst,
      barStyle,
      clickGcolorPot,
      sliderPotDown,
      handlePotBar,
    }
  },
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '~vue-color-kit/dist/vue-color-kit.css';
// @import 'element-plus/lib/components/style/css.css';
.color_picker_wrapper {
  width: 218px;
  .color_picker_box {
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.16);
    border-radius: 4px;
    background: #f7f8f9;
    padding: 15px 10px;
    :deep() {
      .hu-color-picker {
        box-shadow: none;
        border-radius: 0;
        background: #f7f8f9;
        padding: 0;
      }
    }

    .gcolor_deg {
      display: block;
      display: flex;
      align-items: center;
      .gcolor_deg_span {
        font-size: 12px;
        margin-right: 10px;
      }
      .number_input {
        min-width: 20px;
        max-width: 20px;
        float: none;
        order: 1;
        margin-left: 10px;
        margin-top: 0;
        display: flex;
        align-items: center;
        text-align: center;
        color: #606266;
        font-size: 12px;
      }
      :deep() {
        .el-input-number__decrease,
        .el-input-number__increase {
          display: none;
        }
        .el-input--mini .el-input__inner {
          padding: 0;
          width: 100% !important;
          height: 22px;
          line-height: 22px;
        }
        .el-slider {
          display: flex;
          flex: 1;
        }
        .el-slider__input {
          min-width: 2em;
          max-width: 2em;
          float: none;
          order: 1;
          margin-left: 10px;
          margin-top: 0;
          display: flex;
          align-items: center;
        }
        .el-slider__runway.show-input {
          margin-right: 0;
          flex: 1;
          order: 0;
          height: 3px;
        }
        .el-slider__button {
          width: 13px;
          height: 13px;
          border-color: #fff;
          box-shadow: 0 0 4px rgba($color: #000, $alpha: 0.4);
        }
        .el-slider__bar {
          height: 3px;
        }
        .el-slider__button-wrapper {
          top: -17px;
        }
      }
    }

    .color_hd {
      margin-bottom: 15px;
    }

    .title {
      font-size: 16px;
      text-align: left;
    }
    .gcolor {
      position: relative;
      margin: 10px 0 20px;
    }
    .gcolor_bar {
      position: relative;
      margin-top: 3px;
      height: 16px;
      background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJ0lEQVQoU2M8c/X2fwYkYKylgsxlYKSDgv///6O44ey1O6huoL0CAJgaKeXe+C99AAAAAElFTkSuQmCC')
        repeat;
      border-radius: 2px;
    }
    .gcolor_bar_bg {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
    .gcolor_bar_pot_box {
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      z-index: 1;
      width: calc(100% - 16px);
      pointer-events: none;
    }
    .gcolor_bar_pot {
      pointer-events: initial;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 16px;
      width: 12px;
      cursor: pointer;
      border: 2px solid #fff;
      &.on {
        &:before {
          visibility: visible;
        }
        z-index: 2;
      }
      &:after {
        content: '';
        position: absolute;
        left: -3px;
        right: -3px;
        top: -3px;
        bottom: -3px;
        border: 1px solid #999;
        border-radius: 3px;
      }
      &:before {
        content: '';
        position: absolute;
        left: -4px;
        right: -4px;
        top: -4px;
        bottom: -4px;
        border: 2px solid var(--hoverColor);
        visibility: hidden;
        z-index: 1;
        border-radius: 3px;
      }
    }
  }
}
</style>
