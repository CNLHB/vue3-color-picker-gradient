import ColorPickerGradient from './components/color-picker-gradient.vue';
import ColorPickerPanel from './components/color-picker-panel.vue';

/* istanbul ignore next */
ColorPickerGradient.install = function(Vue) {
  Vue.component(ColorPickerGradient.name, ColorPickerGradient);
  Vue.component(ColorPickerPanel.name, ColorPickerPanel);
};

export default ColorPickerGradient;
export { ColorPickerPanel };