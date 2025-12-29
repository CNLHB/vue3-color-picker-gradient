<template>
  <div id="app">
    <h1>Vue3 Color Picker Gradient - Element-Plus 风格</h1>

    <div class="demo-section">
      <h2>纯色选择器 (Linear)</h2>
      <div class="demo-row">
        <ColorPickerGradient
          v-model="linearColor"
          type="linear"
          @change="handleLinearChange"
        />
        <div class="color-preview" :style="{ background: linearColor }">
          <div class="color-value">{{ linearColor || '未选择颜色' }}</div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>渐变选择器 (Gradient)</h2>
      <div class="demo-row">
        <ColorPickerGradient
          v-model="gradientColor"
          type="gradient"
          @change="handleGradientChange"
        />
        <div class="color-preview" :style="{ background: gradientColor }">
          <div class="color-value gradient-value">{{ gradientColor || '未选择渐变' }}</div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>禁用角度控制的渐变选择器</h2>
      <div class="demo-row">
        <ColorPickerGradient
          v-model="gradientColor2"
          type="gradient"
          :disabledColorDeg="true"
        />
        <div class="color-preview" :style="{ background: gradientColor2 }">
          <div class="color-value gradient-value">{{ gradientColor2 || '未选择渐变' }}</div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>禁用状态</h2>
      <div class="demo-row">
        <ColorPickerGradient
          v-model="disabledColor"
          type="linear"
          :disabled="true"
        />
        <span class="info-text">禁用状态下无法打开选择器</span>
      </div>
    </div>

    <div class="demo-section">
      <h2>多个选择器</h2>
      <div class="demo-row">
        <ColorPickerGradient v-model="color1" type="linear" />
        <ColorPickerGradient v-model="color2" type="linear" />
        <ColorPickerGradient v-model="color3" type="linear" />
        <ColorPickerGradient v-model="gradient1" type="gradient" />
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import ColorPickerGradient from './components/color-picker-gradient.vue'

export default {
  name: 'App',
  components: {
    ColorPickerGradient,
  },
  setup() {
    const state = reactive({
      // 纯色
      linearColor: 'rgba(25, 77, 51, 1)',

      // 渐变色
      gradientColor: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(0, 0, 0, 1) 100%)',
      gradientColor2: 'linear-gradient(90deg, rgba(64, 158, 255, 1) 0%, rgba(103, 194, 58, 1) 100%)',

      // 禁用
      disabledColor: 'rgba(200, 200, 200, 1)',

      // 多个选择器
      color1: 'rgba(255, 0, 0, 1)',
      color2: 'rgba(0, 255, 0, 1)',
      color3: 'rgba(0, 0, 255, 1)',
      gradient1: 'linear-gradient(45deg, rgba(255, 0, 0, 1) 0%, rgba(0, 0, 255, 1) 100%)',
    })

    function handleLinearChange(value) {
      console.log('纯色变化:', value)
    }

    function handleGradientChange(value) {
      console.log('渐变色变化:', value)
    }

    return {
      ...toRefs(state),
      handleLinearChange,
      handleGradientChange,
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

.info-text {
  color: #909399;
  font-size: 14px;
}
</style>
