<template>
  <div id="app">
    <h1>Vue3 Color Picker Gradient - 颜色选择器</h1>

    <div class="demo-section">
      <h2>统一颜色选择器（支持纯色/渐变切换）</h2>
      <div class="demo-row">
        <ColorPickerGradient
          v-model="currentColor"
          @change="handleColorChange"
        />
        <div class="color-preview" :style="{ background: currentColor }">
          <div class="color-value" :class="{ 'gradient-value': isGradient }">
            {{ currentColor || '未选择颜色' }}
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>带初始纯色值</h2>
      <div class="demo-row">
        <ColorPickerGradient
          v-model="currentColor2"
          type="linear"
          @change="handleColorChange2"
        />
        <div class="color-preview" :style="{ background: currentColor2 }">
          <div class="color-value">{{ currentColor2 }}</div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>带初始渐变值</h2>
      <div class="demo-row">
        <ColorPickerGradient
          v-model="currentColor3"
          type="gradient"
        />
        <div class="color-preview" :style="{ background: currentColor3 }">
          <div class="color-value gradient-value">{{ currentColor3 }}</div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>禁用角度控制</h2>
      <div class="demo-row">
        <ColorPickerGradient
          v-model="currentColor4"
          type="gradient"
          :disabledColorDeg="true"
        />
        <div class="color-preview" :style="{ background: currentColor4 }">
          <div class="color-value gradient-value">{{ currentColor4 }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, computed } from 'vue'
import ColorPickerGradient from './components/color-picker-gradient.vue'

export default {
  name: 'App',
  components: {
    ColorPickerGradient,
  },
  setup() {
    const state = reactive({
      // 第一个选择器 - 不传初始值
      currentColor: '',

      // 第二个选择器 - 带初始纯色值
      currentColor2: 'rgba(25, 77, 51, 1)',

      // 第三个选择器 - 带初始渐变值
      currentColor3: 'linear-gradient(90deg, rgba(64, 158, 255, 1) 0%, rgba(103, 194, 58, 1) 100%)',

      // 第四个选择器 - 禁用角度
      currentColor4: '',
    })

    const isGradient = computed(() => {
      return state.currentColor && state.currentColor.startsWith('linear-gradient')
    })

    function handleColorChange(value) {
      console.log('颜色变化:', value)
      state.currentColor = value
    }

    function handleColorChange2(value) {
      console.log('颜色变化2:', value)
      state.currentColor2 = value
    }

    function handleColorChange3(value) {
      console.log('颜色变化3:', value)
      state.currentColor3 = value
    }

    function handleColorChange4(value) {
      console.log('颜色变化4:', value)
      state.currentColor4 = value
    }

    return {
      ...toRefs(state),
      isGradient,
      handleColorChange,
      handleColorChange2,
      handleColorChange3,
      handleColorChange4,
    }
  },
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    font-size: 32px;
    margin-bottom: 40px;
    color: #303133;
  }

  h2 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #606266;
    font-weight: 500;
  }
}

.demo-section {
  margin-bottom: 40px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.color-preview {
  flex: 1;
  min-width: 300px;
  height: 120px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAJ0lEQVQoU2M8c/X2fwYkYKylgsxlYKSDgv///6O44ey1O6huoL0CAJgaKeXe+C99AAAAAElFTkSuQmCC') repeat;
}

.color-value {
  background: rgba(255, 255, 255, 0.95);
  padding: 8px 16px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #303133;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  word-break: break-all;
  text-align: center;

  &.gradient-value {
    font-size: 11px;
  }
}
</style>
