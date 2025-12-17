<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Recitation {
  name: string
  text: string
}

interface ApiResponse {
  meta: {
    surah: number
    ayah: number
    surah_name_en: string
    surah_name_ar: string
    base_text_emlaey: string
  }
  recitations: Recitation[]
}

const surah = ref(1)
const ayah = ref(1)
const data = ref<ApiResponse | null>(null)
const loading = ref(false)
const error = ref('')

// Basic range validation
// const maxSurah = 114 // Unused for now
// A simplified max ayah map could be added, but for MVP we rely on API error

const fetchData = async () => {
  loading.value = true
  error.value = ''
  data.value = null
  
  try {
    const res = await fetch(`http://localhost:3000/api/qiraat/compare?surah=${surah.value}&ayah=${ayah.value}`)
    if (!res.ok) {
      throw new Error('Verse not found or API error')
    }
    const json = await res.json()
    data.value = json
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const nextVerse = () => {
  ayah.value++
  fetchData()
}

const prevVerse = () => {
  if (ayah.value > 1) {
    ayah.value--
    fetchData()
  }
}

</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8 text-right" dir="rtl">
    <header class="mb-8 text-center">
      <h1 class="text-3xl font-bold mb-2">منصة مقارنة القراءات</h1>
      <p class="text-gray-600">أداة بحثية لمقارنة الروايات القرآنية</p>
    </header>

    <div class="max-w-4xl mx-auto mb-8 bg-white p-6 rounded-lg shadow-md flex flex-wrap gap-4 items-center justify-center">
      <div class="flex items-center gap-2">
        <label>سورة:</label>
        <input v-model="surah" type="number" min="1" max="114" class="border p-2 rounded w-20 text-center" />
      </div>
      <div class="flex items-center gap-2">
        <label>آية:</label>
        <input v-model="ayah" type="number" min="1" class="border p-2 rounded w-20 text-center" />
      </div>
      <button @click="fetchData" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">بحث</button>
      
      <div class="flex gap-2 mr-auto">
        <button @click="prevVerse" :disabled="ayah <= 1" class="bg-gray-200 px-3 py-1 rounded disabled:opacity-50">السابق</button>
        <button @click="nextVerse" class="bg-gray-200 px-3 py-1 rounded">التالي</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">جاري التحميل...</div>
    <div v-else-if="error" class="text-center py-10 text-red-600">{{ error }}</div>
    
    <div v-else-if="data" class="max-w-6xl mx-auto">
      <div class="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
        <h2 class="text-2xl font-bold mb-2">{{ data.meta.surah_name_ar }} - آية {{ data.meta.ayah }}</h2>
        <p class="text-gray-500 text-sm mb-4">{{ data.meta.surah_name_en }}</p>
        <div class="text-xl text-gray-800 font-serif leading-loose">{{ data.meta.base_text_emlaey }}</div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="rec in data.recitations" :key="rec.name" class="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <h3 class="font-bold text-lg mb-2 text-blue-800 border-b pb-2">{{ rec.name }}</h3>
          <p class="text-2xl leading-loose font-amiri">{{ rec.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.font-amiri {
  font-family: 'Amiri', serif;
}
</style>
