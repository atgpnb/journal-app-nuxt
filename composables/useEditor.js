import { ref, reactive, nextTick } from 'vue'

export const useEditorToolbar = (editor) => {
  const showToolbar = ref(false)
  const toolbarPosition = reactive({ top: 0, left: 0 })
  
  const updateToolbarPosition = () => {
    if (!editor.value) return
    
    const { selection } = editor.value.state
    const { from, to } = selection
    
    try {
      const start = editor.value.view.coordsAtPos(from)
      const end = editor.value.view.coordsAtPos(to)
      
      const centerX = (start.left + end.left) / 2
      const topY = Math.min(start.top, end.top)
      
      toolbarPosition.top = topY - 60
      toolbarPosition.left = centerX - 140
      
      // Viewport bounds checking
      const toolbarWidth = 280
      const viewportWidth = window.innerWidth
      
      if (toolbarPosition.left < 10) {
        toolbarPosition.left = 10
      } else if (toolbarPosition.left + toolbarWidth > viewportWidth - 10) {
        toolbarPosition.left = viewportWidth - toolbarWidth - 10
      }
      
      if (toolbarPosition.top < 10) {
        toolbarPosition.top = topY + 40
      }
    } catch (error) {
      console.log('Error positioning toolbar:', error)
      toolbarPosition.top = 60
      toolbarPosition.left = 50
    }
  }
  
  const handleSelection = () => {
    if (!editor.value) return
    
    const { selection } = editor.value.state
    const { from, to } = selection
    
    if (from !== to && !selection.empty) {
      showToolbar.value = true
      nextTick(() => {
        updateToolbarPosition()
      })
    } else {
      showToolbar.value = false
    }
  }
  
  return {
    showToolbar,
    toolbarPosition,
    updateToolbarPosition,
    handleSelection
  }
}

export const useBlockMenu = () => {
  const showPlusButton = ref(false)
  const showBlockMenu = ref(false)
  const plusButtonPosition = reactive({ top: 0, left: 0 })
  const blockMenuPosition = reactive({ top: 0, left: 0 })
  const currentLinePosition = ref(null)
  
  const handleMouseOver = (event, editor) => {
    if (!editor.value || showBlockMenu.value) return
    
    const target = event.target
    const editorElement = target.closest('.ProseMirror')
    if (!editorElement) return
    
    const blockElement = target.closest('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre')
    if (!blockElement) return
    
    const rect = blockElement.getBoundingClientRect()
    const editorRect = editorElement.getBoundingClientRect()
    
    plusButtonPosition.top = rect.top + (rect.height / 2) - 12
    plusButtonPosition.left = editorRect.left - 40
    
    currentLinePosition.value = { element: blockElement, rect: rect }
    showPlusButton.value = true
  }
  
  const toggleBlockMenu = () => {
    if (showBlockMenu.value) {
      showBlockMenu.value = false
      return
    }
    
    if (!currentLinePosition.value) return
    
    const rect = currentLinePosition.value.rect
    blockMenuPosition.top = rect.top
    blockMenuPosition.left = plusButtonPosition.left + 40
    showBlockMenu.value = true
  }
  
  const insertBlock = (editor, type, options = {}) => {
    if (!editor.value || !currentLinePosition.value) return
    
    editor.value.commands.focus()
    
    const actions = {
      heading: () => editor.value.chain().focus().setHeading(options).run(),
      bulletList: () => editor.value.chain().focus().toggleBulletList().run(),
      orderedList: () => editor.value.chain().focus().toggleOrderedList().run(),
      blockquote: () => editor.value.chain().focus().setBlockquote().run(),
      codeBlock: () => editor.value.chain().focus().setCodeBlock().run(),
    }
    
    actions[type]?.()
    
    showBlockMenu.value = false
    showPlusButton.value = false
  }
  
  return {
    showPlusButton,
    showBlockMenu,
    plusButtonPosition,
    blockMenuPosition,
    currentLinePosition,
    handleMouseOver,
    toggleBlockMenu,
    insertBlock
  }
}
