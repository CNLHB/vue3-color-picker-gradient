<template>
  <div class="color-picker-gradient" ref="triggerRef">
    <div
      class="color-trigger"
      :class="{ 'is-disabled': disabled }"
      @click="togglePicker"
    >
      <span class="color-trigger-inner" :style="triggerStyle">
        <span v-if="!modelValue" class="color-trigger-empty">
          <span class="color-trigger-empty-icon">×</span>
        </span>
      </span>
    </div>

    <Teleport to="body">
      <div
        v-if="showPicker"
        class="color-picker-dropdown"
        :style="dropdownStyle"
        ref="dropdownRef"
      >
        <ColorPickerPanel
          :type="currentMode"
          :pColor="currentColorObj"
          :pColors="currentColorsArray"
          :pDeg="currentDeg"
          :disabledColorDeg="disabledColorDeg"
          :showClose="true"
          :titleConfig="titleConfig"
          @change="handleColorChange"
          @close="closePicker"
        />
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import ColorPickerPanel from './color-picker-panel.vue'

export default {
  name: 'ColorPickerGradient',
  components: {
    ColorPickerPanel
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'linear', // 'linear' | 'gradient'
      validator: (value) => ['linear', 'gradient'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showAlpha: {
      type: Boolean,
      default: true
    },
    disabledColorDeg: {
      type: Boolean,
      default: false
    },
    colorFormat: {
      type: String,
      default: 'rgba'
    },
    size: {
      type: String,
      default: 'default' // 'large' | 'default' | 'small'
    },
    titleConfig: {
      type: Object,
      default() {
        return {
          text: '颜色选择器',
          style: {},
          show: true
        }
      }
    }
  },
  emits: ['update:modelValue', 'change', 'active-change'],
  setup(props, { emit }) {
    const triggerRef = ref(null)
    const dropdownRef = ref(null)
    const showPicker = ref(false)
    const isInternalUpdate = ref(false) // 标志是否是内部更新

    // 只有当 modelValue 有值时才解析，否则为 undefined
    const currentColorObj = ref(props.modelValue && props.type === 'linear' ? parseColorString(props.modelValue) : undefined)
    const currentColorsArray = ref(props.type === 'gradient' ? parseGradientString(props.modelValue) : undefined)
    const currentDeg = ref(props.type === 'gradient' ? parseGradientDeg(props.modelValue) : 90)
    const currentMode = ref(props.type) // 保存当前模式状态
    const dropdownStyle = ref({})

    // 计算触发器的背景样式
    const triggerStyle = computed(() => {
      if (!props.modelValue) return {}

      if (props.type === 'linear') {
        return {
          background: props.modelValue
        }
      } else {
        return {
          background: props.modelValue
        }
      }
    })

    // 解析纯色字符串为颜色对象
    function parseColorString(colorStr) {
      if (!colorStr) {
        return {
          hex: '#000000',
          rgba: { r: 0, g: 0, b: 0, a: 1 },
          color: 'rgba(0,0,0,1)',
        }
      }

      // 处理 rgba 格式
      const rgbaMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
      if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1])
        const g = parseInt(rgbaMatch[2])
        const b = parseInt(rgbaMatch[3])
        const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
        const hex = rgbToHex(r, g, b)

        return {
          hex,
          rgba: { r, g, b, a },
          color: `rgba(${r}, ${g}, ${b}, ${a})`
        }
      }

      // 处理 hex 格式
      if (colorStr.startsWith('#')) {
        const rgba = hexToRgba(colorStr)
        return {
          hex: colorStr,
          rgba,
          color: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
        }
      }

      // 默认值
      return {
        hex: '#000000',
        rgba: { r: 0, g: 0, b: 0, a: 1 },
        color: 'rgba(0,0,0,1)',
      }
    }

    // 解析渐变字符串为颜色数组
    function parseGradientString(gradientStr) {
      if (!gradientStr || !gradientStr.includes('linear-gradient')) {
        return [
          {
            color: 'rgba(255, 255, 255, 1)',
            hex: '#ffffff',
            rgba: { r: 255, g: 255, b: 255, a: 1 },
            pst: 0,
          },
          {
            color: 'rgba(0, 0, 0, 1)',
            hex: '#000000',
            rgba: { r: 0, g: 0, b: 0, a: 1 },
            pst: 100,
          },
        ]
      }

      const colors = []
      // 提取渐变色值: linear-gradient(90deg, color1 0%, color2 100%)
      const colorStopsMatch = gradientStr.match(/,\s*([^,]+?)\s+(\d+(?:\.\d+)?%)/g)

      if (colorStopsMatch) {
        colorStopsMatch.forEach(stop => {
          const match = stop.match(/,?\s*(.+?)\s+(\d+(?:\.\d+)?%)/)
          if (match) {
            const colorStr = match[1].trim()
            const pst = parseFloat(match[2])
            const colorObj = parseColorString(colorStr)
            colors.push({
              ...colorObj,
              pst
            })
          }
        })
      }

      return colors.length >= 2 ? colors : [
        {
          color: 'rgba(255, 255, 255, 1)',
          hex: '#ffffff',
          rgba: { r: 255, g: 255, b: 255, a: 1 },
          pst: 0,
        },
        {
          color: 'rgba(0, 0, 0, 1)',
          hex: '#000000',
          rgba: { r: 0, g: 0, b: 0, a: 1 },
          pst: 100,
        },
      ]
    }

    // 解析渐变角度
    function parseGradientDeg(gradientStr) {
      if (!gradientStr || !gradientStr.includes('linear-gradient')) {
        return 90
      }

      const degMatch = gradientStr.match(/linear-gradient\((\d+)deg/)
      return degMatch ? parseInt(degMatch[1]) : 90
    }

    // RGB 转 HEX
    function rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }).join('')
    }

    // HEX 转 RGBA
    function hexToRgba(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
      } : { r: 0, g: 0, b: 0, a: 1 }
    }

    // 切换选择器显示状态
    function togglePicker() {
      if (props.disabled) return
      showPicker.value = !showPicker.value

      if (showPicker.value) {
        nextTick(() => {
          updateDropdownPosition()
        })
      }
    }

    // 更新下拉框位置
    function updateDropdownPosition() {
      if (!triggerRef.value || !dropdownRef.value) return

      const triggerRect = triggerRef.value.getBoundingClientRect()
      const dropdownEl = dropdownRef.value
      const dropdownHeight = dropdownEl.offsetHeight
      const viewportHeight = window.innerHeight

      let top = triggerRect.bottom + 8

      // 检查下方空间是否足够
      if (top + dropdownHeight > viewportHeight) {
        // 下方空间不足,显示在上方
        top = triggerRect.top - dropdownHeight - 8
      }

      dropdownStyle.value = {
        position: 'fixed',
        left: triggerRect.left + 'px',
        top: top + 'px',
        zIndex: 2000
      }
    }

    // 关闭选择器
    function closePicker() {
      showPicker.value = false
    }

    // 处理颜色变化
    function handleColorChange({ style, colors, color, deg, mode }) {
      let newValue = ''

      // 更新当前模式
      if (mode) {
        currentMode.value = mode
      }

      // 根据返回的数据判断是纯色还是渐变
      if (style) {
        // 渐变模式
        newValue = style.replace(/;$/, '')
        currentColorsArray.value = colors
        currentDeg.value = deg
      } else if (color) {
        // 纯色模式
        newValue = color.color
        currentColorObj.value = color
      }

      // 标记为内部更新，避免 modelValue watcher 重新解析
      isInternalUpdate.value = true
      emit('update:modelValue', newValue)
      emit('change', newValue)
      emit('active-change', newValue)

      // 下一个 tick 后重置标志
      setTimeout(() => {
        isInternalUpdate.value = false
      }, 0)
    }

    // 点击外部关闭
    function handleClickOutside(event) {
      if (!showPicker.value) return

      const trigger = triggerRef.value
      const dropdown = dropdownRef.value

      if (
        trigger && !trigger.contains(event.target) &&
        dropdown && !dropdown.contains(event.target)
      ) {
        closePicker()
      }
    }

    // 监听 modelValue 变化
    watch(() => props.modelValue, (newVal) => {
      // 如果是内部更新导致的 modelValue 变化，不重新解析（避免丢失颜色数据）
      if (isInternalUpdate.value) return

      if (props.type === 'linear') {
        currentColorObj.value = parseColorString(newVal)
      } else {
        currentColorsArray.value = parseGradientString(newVal)
        currentDeg.value = parseGradientDeg(newVal)
      }
    })

    // 监听窗口滚动和调整大小
    function handleScroll() {
      if (showPicker.value) {
        updateDropdownPosition()
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleScroll)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    })

    return {
      triggerRef,
      dropdownRef,
      showPicker,
      currentColorObj,
      currentColorsArray,
      currentDeg,
      currentMode,
      triggerStyle,
      dropdownStyle,
      togglePicker,
      closePicker,
      handleColorChange
    }
  }
}
</script>

<style lang="scss" scoped>
.color-picker-gradient {
  display: inline-block;
  position: relative;
}

.color-trigger {
  display: inline-block;
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  padding: 4px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 0;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: #409eff;
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      border-color: #dcdfe6;
    }
  }
}

.color-trigger-inner {
  display: inline-block;
  width: 100%;
  height: 100%;
  border-radius: 2px;
  position: relative;
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJ0lEQVQoU2M8c/X2fwYkYKylgsxlYKSDgv///6O44ey1O6huoL0CAJgaKeXe+C99AAAAAElFTkSuQmCC') repeat;
}

.color-trigger-empty {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.color-trigger-empty-icon {
  font-size: 20px;
  color: #909399;
  font-weight: bold;
  transform: rotate(45deg);
}

.color-picker-dropdown {
  position: fixed;
  width: 218px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
