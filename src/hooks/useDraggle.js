import { reactive, toRefs } from 'vue'

export default function useDraggle (onDragStar, onDragMove, onDragDone, useCapture = false) {
  const state = reactive({
    mouseStartPst: {},
    movePst: {
      x: 0,
      y: 0
    },
    pageX: 0,
    pageY: 0
  })

  const doc = document.body
  let isSelectBoxMouseDown = false
  function resetDraggle () {
    isSelectBoxMouseDown = false
    state.mouseStartPst = {}
    state.movePst.x = 0
    state.movePst.y = 0
  }
  function bindEvents () {
    doc.addEventListener('mousedown', handleEleMouseDown, useCapture)
    doc.addEventListener('mousemove', handleEleMouseMove, useCapture)
    doc.addEventListener('mouseup', handleEleMouseUp, useCapture)
  }

  function unbindEvents () {
    doc.removeEventListener('mousedown', handleEleMouseDown, useCapture)
    doc.removeEventListener('mousemove', handleEleMouseMove, useCapture)
    doc.removeEventListener('mouseup', handleEleMouseUp, useCapture)
  }

  function handleEleMouseDown (e) {
    // e.stopPropagation()
    isSelectBoxMouseDown = true
    state.mouseStartPst.x = e.pageX
    state.mouseStartPst.y = e.pageY
    state.dragEleDistPst = {}
    typeof onDragStar === 'function' && onDragStar(e)
  }

  function handleEleMouseMove (e) {
    if (!isSelectBoxMouseDown) return
    state.movePst.x = e.pageX - state.mouseStartPst.x
    state.movePst.y = e.pageY - state.mouseStartPst.y
    state.pageX = e.pageX
    state.pageY = e.pageY
    typeof onDragMove === 'function' && onDragMove(e)
  }

  function handleEleMouseUp (e) {
    isSelectBoxMouseDown = false
    clearDraggble()

    typeof onDragDone === 'function' && onDragDone(e)

  }

  function clearDraggble () {
    unbindEvents()
  }

  function enableDraggle () {
    bindEvents()
  }

  return {
    ...toRefs(state),
    clearDraggble,
    enableDraggle,
    resetDraggle
  }
}
