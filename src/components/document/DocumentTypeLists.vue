<template>
  <component
    :is="componentByType[type] || 'div'"
    :items="items"
    :get-document-status="getDocumentStatus"
    :get-type-display="getTypeDisplay"
    :get-type-icon="getTypeIcon"
    :get-type-colors="getTypeColors"
    :format-date="formatDate"
    @open="$emit('open', $event)"
    @edit="$emit('edit', $event)"
  />
</template>

<script setup>
import PdfList from "./lists/PdfList.vue"
import TextList from "./lists/TextList.vue"
import UrlList from "./lists/UrlList.vue"

defineProps({
  type: {
    type: String,
    default: "",
  },
  items: {
    type: Array,
    default: () => [],
  },
  getDocumentStatus: {
    type: Function,
    required: true,
  },
  getTypeDisplay: {
    type: Function,
    required: true,
  },
  getTypeIcon: {
    type: Function,
    required: true,
  },
  getTypeColors: {
    type: Function,
    required: true,
  },
  formatDate: {
    type: Function,
    required: true,
  },
})

defineEmits(["open", "edit"])

const componentByType = {
  TYPE_PDF: PdfList,
  TYPE_TEXT: TextList,
  TYPE_URL: UrlList,
}
</script>
