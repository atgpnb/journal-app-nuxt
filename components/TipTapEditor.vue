<template>
  <div class="relative w-full min-h-screen bg-background">
    <!-- Floating Toolbar -->
    <div 
      v-if="editor && showToolbar" 
      class="fixed z-[1000] bg-gray-800 border border-gray-600 rounded-lg shadow-xl backdrop-blur-sm p-2 flex items-center gap-1 min-w-[280px] animate-in fade-in duration-200"
      :style="{ top: toolbarPosition.top + 'px', left: toolbarPosition.left + 'px' }"
    >
      <!-- Text Formatting Group -->
      <div class="flex items-center gap-1">
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('bold') }"
          title="Bold"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          </svg>
        </button>
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('italic') }"
          title="Italic"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="4" x2="10" y2="4" />
            <line x1="14" y1="20" x2="5" y2="20" />
            <line x1="15" y1="4" x2="9" y2="20" />
          </svg>
        </button>
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('strike') }"
          title="Strikethrough"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4H9a3 3 0 0 0-2.83 4" />
            <path d="M14 12a4 4 0 0 1 0 8H6" />
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        </button>
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('code') }"
          title="Code"
          @click="editor.chain().focus().toggleCode().run()"
        >
          <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16,18 22,12 16,6" />
            <polyline points="8,6 2,12 8,18" />
          </svg>
        </button>
      </div>
      
      <div class="w-px h-6 bg-gray-600 mx-2" />
      
      <!-- Heading Group -->
      <div class="flex items-center gap-1">
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('heading', { level: 1 }) }"
          title="Heading 1"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          H1
        </button>
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('heading', { level: 2 }) }"
          title="Heading 2"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          H2
        </button>
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('heading', { level: 3 }) }"
          title="Heading 3"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          H3
        </button>
      </div>
      
      <div class="w-px h-6 bg-gray-600 mx-2" />
      
      <!-- Block Type Group -->
      <div class="flex items-center gap-1">
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('bulletList') }"
          title="Bullet List"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('orderedList') }"
          title="Numbered List"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="10" y1="6" x2="21" y2="6" />
            <line x1="10" y1="12" x2="21" y2="12" />
            <line x1="10" y1="18" x2="21" y2="18" />
            <path d="M4 6h1v4" />
            <path d="M4 10h2" />
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
          </svg>
        </button>
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('blockquote') }"
          title="Quote"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          </svg>
        </button>
        <button
          class="flex items-center justify-center w-8 h-8 rounded-md text-gray-300 border-none bg-transparent cursor-pointer text-xs font-semibold transition-all duration-150 ease-in-out hover:text-white hover:bg-gray-700 hover:scale-105"
          :class="{ 'bg-blue-500 text-white': editor.isActive('codeBlock') }"
          title="Code Block"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4,7 4,4 20,4 20,7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </button>
      </div>
      
      <!-- Arrow pointing down -->
      <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-800" />
    </div>

    <!-- Block Menu -->
    <div 
      v-if="showBlockMenu" 
      data-block-menu
      class="fixed z-[1000] bg-background border border-gray-200 rounded-lg shadow-xl p-2 min-w-[280px] max-h-96 overflow-y-auto animate-in fade-in duration-200"
      :style="{ top: blockMenuPosition.top + 'px', left: blockMenuPosition.left + 'px' }"
    >
      <div class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors" @click="insertBlock('paragraph')">
        <div class="w-10 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded text-xs font-semibold text-gray-600">
          T
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">Text</div>
          <div class="text-xs text-gray-500">Just start writing with plain text</div>
        </div>
      </div>
      <div class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors" @click="insertBlock('heading', { level: 1 })">
        <div class="w-10 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded text-xs font-semibold text-gray-600">
          H1
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">Heading 1</div>
          <div class="text-xs text-gray-500">Big section heading</div>
        </div>
      </div>
      <div class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors" @click="insertBlock('heading', { level: 2 })">
        <div class="w-10 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded text-xs font-semibold text-gray-600">
          H2
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">Heading 2</div>
          <div class="text-xs text-gray-500">Medium section heading</div>
        </div>
      </div>
      <div class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors" @click="insertBlock('heading', { level: 3 })">
        <div class="w-10 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded text-xs font-semibold text-gray-600">
          H3
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">Heading 3</div>
          <div class="text-xs text-gray-500">Small section heading</div>
        </div>
      </div>
      <div class="h-px bg-gray-200 my-1" />
      <div class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors" @click="insertBlock('bulletList')">
        <div class="w-10 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded">
          <svg class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">Bulleted list</div>
          <div class="text-xs text-gray-500">Create a simple bulleted list</div>
        </div>
      </div>
      <div class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors" @click="insertBlock('orderedList')">
        <div class="w-10 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded">
          <svg class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="10" y1="6" x2="21" y2="6" />
            <line x1="10" y1="12" x2="21" y2="12" />
            <line x1="10" y1="18" x2="21" y2="18" />
            <path d="M4 6h1v4" />
            <path d="M4 10h2" />
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">Numbered list</div>
          <div class="text-xs text-gray-500">Create a list with numbering</div>
        </div>
      </div>
      <div class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors" @click="insertBlock('blockquote')">
        <div class="w-10 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded">
          <svg class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">Quote</div>
          <div class="text-xs text-gray-500">Capture a quote</div>
        </div>
      </div>
      <div class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors" @click="insertBlock('codeBlock')">
        <div class="w-10 h-8 flex items-center justify-center bg-gray-100 border border-gray-200 rounded">
          <svg class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4,7 4,4 20,4 20,7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">Code block</div>
          <div class="text-xs text-gray-500">Capture a code snippet</div>
        </div>
      </div>
    </div>

    <!-- Plus Button -->
    <div 
      v-if="showPlusButton && editor" 
      data-plus-button
      class="fixed z-100 w-6 h-6 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 hover:scale-110 flex items-center justify-center cursor-pointer text-gray-500 hover:text-gray-700 transition-all duration-150 shadow-sm"
      :style="{ top: plusButtonPosition.top + 'px', left: plusButtonPosition.left + 'px' }"
      @click.stop="toggleBlockMenu"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>

    <!-- Main Editor Content -->
    <div class="w-full max-w-4xl mx-auto px-6 py-8 min-h-[calc(100vh-4rem)]" @click="focusEditor">
      <TiptapEditorContent 
        :editor="editor" 
        class="prose prose-lg max-w-none focus:outline-none"
        @mouseup="handleSelection"
        @keyup="handleSelection"
        @touchend="handleSelection"
        @mouseover="handleMouseOver"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted, onBeforeUnmount } from 'vue'

// Reactive state
const showToolbar = ref(false)
const toolbarPosition = reactive({ top: 0, left: 0 })
const showPlusButton = ref(false)
const showBlockMenu = ref(false)
const plusButtonPosition = reactive({ top: 0, left: 0 })
const blockMenuPosition = reactive({ top: 0, left: 0 })
const currentLinePosition = ref(null)

// Editor instance
const editor = useEditor({
  content: "<h1>Welcome to your journal</h1><p>Start writing your thoughts here...</p>",
  extensions: [TiptapStarterKit],
  editorProps: {
    attributes: {
      class: 'prose prose-lg max-w-none focus:outline-none',
    },
  },
  onSelectionUpdate: ({ editor }) => {
    const { selection } = editor.state
    const { from, to } = selection
    
    if (from !== to && !selection.empty) {
      showToolbar.value = true
      showPlusButton.value = false
      showBlockMenu.value = false
      nextTick(() => {
        updateToolbarPosition()
      })
    } else {
      showToolbar.value = false
    }
  },
})

// Editor methods
const focusEditor = () => {
  if (editor.value) {
    editor.value.commands.focus()
  }
}

const handleSelection = () => {
  if (!editor.value) return
  
  const { selection } = editor.value.state
  const { from, to } = selection
  
  if (from !== to && !selection.empty) {
    showToolbar.value = true
    showPlusButton.value = false
    showBlockMenu.value = false
    nextTick(() => {
      updateToolbarPosition()
    })
  } else {
    showToolbar.value = false
  }
}

const handleMouseOver = (event) => {
  if (!editor.value || showToolbar.value || showBlockMenu.value) return
  
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

  if (!currentLinePosition.value) {
    return
  }
  
  const rect = currentLinePosition.value.rect
  blockMenuPosition.top = rect.top
  blockMenuPosition.left = plusButtonPosition.left + 40
  showBlockMenu.value = true
}

const insertBlock = (type, options = {}) => {
  if (!editor.value || !currentLinePosition.value) return
  
  editor.value.commands.focus()
  
  switch (type) {
    case 'paragraph':
      editor.value.chain().focus().setParagraph().run()
      break
    case 'heading':
      editor.value.chain().focus().setHeading(options).run()
      break
    case 'bulletList':
      editor.value.chain().focus().toggleBulletList().run()
      break
    case 'orderedList':
      editor.value.chain().focus().toggleOrderedList().run()
      break
    case 'blockquote':
      editor.value.chain().focus().setBlockquote().run()
      break
    case 'codeBlock':
      editor.value.chain().focus().setCodeBlock().run()
      break
  }
  
  showBlockMenu.value = false
  showPlusButton.value = false
}

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
  } catch {
    toolbarPosition.top = 60
    toolbarPosition.left = 50
  }
}

// Event handlers
const hidePlusButton = () => {
  setTimeout(() => {
    if (!showBlockMenu.value) {
      showPlusButton.value = false
    }
  }, 100)
}

const handleClickOutside = (event) => {
  // Check if click is inside block menu or plus button using data attributes
  const blockMenu = event.target.closest('[data-block-menu]')
  const plusButton = event.target.closest('[data-plus-button]')
  
  if (!blockMenu && !plusButton) {
    if (showBlockMenu.value) {
      showBlockMenu.value = false
    }
    if (!event.target.closest('.prose') && showPlusButton.value) {
      showPlusButton.value = false
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('mouseleave', hidePlusButton)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('mouseleave', hidePlusButton)
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
/* Custom animations */
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

.animate-in {
  animation: fadeIn 0.2s ease-out;
}

.fade-in {
  animation: fadeIn 0.2s ease-out;
}

/* ProseMirror Editor Styles */
:deep(.ProseMirror) {
  outline: none;
  border: none;
  color: #111827;
  line-height: 1.625;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 1rem;
  padding: 0;
  margin: 0;
}

/* Headings */
:deep(.ProseMirror h1) {
  font-size: 2.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
  margin-top: 2rem;
  line-height: 1.25;
}

:deep(.ProseMirror h2) {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
  line-height: 1.375;
}

:deep(.ProseMirror h3) {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
  margin-top: 1.25rem;
  line-height: 1.375;
}

/* Paragraphs */
:deep(.ProseMirror p) {
  color: #111827;
  margin-bottom: 0.75rem;
  line-height: 1.625;
}

/* Lists */
:deep(.ProseMirror ul) {
  list-style: none;
  margin-bottom: 1rem;
  margin-left: 0;
  padding-left: 0;
}

:deep(.ProseMirror ol) {
  list-style: none;
  margin-bottom: 1rem;
  margin-left: 0;
  padding-left: 0;
  counter-reset: list-counter;
}

:deep(.ProseMirror li) {
  margin-bottom: 0.5rem;
  color: #111827;
  line-height: 1.625;
  position: relative;
  padding-left: 1.5rem;
  display: flex;
  align-items: flex-start;
}

:deep(.ProseMirror ul li::before) {
  content: "•";
  position: absolute;
  left: 0.5rem;
  top: 0;
  color: #6b7280;
  font-weight: 700;
  width: 1rem;
  text-align: center;
}

:deep(.ProseMirror ol li) {
  counter-increment: list-counter;
}

:deep(.ProseMirror ol li::before) {
  content: counter(list-counter) ".";
  position: absolute;
  left: 0;
  top: 0;
  color: #6b7280;
  font-weight: 500;
  width: 1.25rem;
  text-align: left;
  min-width: 20px;
}

/* Blockquotes */
:deep(.ProseMirror blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  background-color: #f9fafb;
  color: #4b5563;
  font-style: italic;
  border-radius: 0 0.25rem 0.25rem 0;
}

/* Code */
:deep(.ProseMirror code) {
  background-color: #f3f4f6;
  color: #dc2626;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

:deep(.ProseMirror pre) {
  background-color: #111827;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

:deep(.ProseMirror pre code) {
  background: transparent;
  color: #f3f4f6;
  padding: 0;
}

/* Text formatting */
:deep(.ProseMirror strong) {
  font-weight: 600;
  color: #111827;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror s) {
  text-decoration: line-through;
  color: #6b7280;
}

:deep(.ProseMirror hr) {
  border: 0;
  border-top: 1px solid #e5e7eb;
  margin: 2rem 0;
}

/* Placeholder */
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #9ca3af;
  content: "Type '/' for commands, or start writing...";
  float: left;
  height: 0;
  pointer-events: none;
}

/* Focus and selection */
:deep(.ProseMirror:focus) {
  outline: none;
}

:deep(.ProseMirror .ProseMirror-selectednode) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Responsive design */
@media (max-width: 768px) {
  .fixed {
    left: 1rem !important;
    right: 1rem !important;
    width: auto !important;
    transform: none !important;
  }
  
  :deep(.ProseMirror h1) {
    font-size: 1.875rem;
  }
  
  :deep(.ProseMirror h2) {
    font-size: 1.5rem;
  }
  
  :deep(.ProseMirror h3) {
    font-size: 1.25rem;
  }
}
</style>
