<script setup lang="ts">
// Тестовая страница для проверки Sentry (см. README раздел «Мониторинг»).
// Каждая кнопка порождает свой тип ошибки; если NUXT_PUBLIC_SENTRY_DSN
// задан, событие уходит в Sentry. Страница безвредна и в проде: ошибки
// создаёт только явный клик по скрытому URL /sentry-test.
const api = useApi()

const jsError = () => {
  throw new Error('SENTRY TEST: ручная JS-ошибка (клик)')
}

const unhandledRejection = () => {
  Promise.reject(new Error('SENTRY TEST: необработанный rejection'))
}

const vueError = () => {
  // Ошибка в рендере компонента — ловится Vue errorHandler → Sentry.
  // @ts-expect-error намеренно вызываем функцию, которой нет
  void nonexistentFunctionForSentryTest()
}

const apiError = async () => {
  try {
    await api.get('/__nonexistent_endpoint_for_sentry_test')
  } catch (e: any) {
    // 404 — штатный ответ, вручную отправим как событие API-ошибки
    const { captureException } = await import('@sentry/nuxt')
    captureException(e, { tags: { sentry_test: 'true' }, extra: { url: '/__nonexistent_endpoint_for_sentry_test' } })
  }
}
</script>

<template>
  <div class="p-8 space-y-4">
    <h1 class="text-xl font-semibold">Sentry test</h1>
    <div class="flex flex-col gap-2 max-w-xs">
      <button class="border rounded px-4 py-2" data-test="js-error" @click="jsError">JS error</button>
      <button class="border rounded px-4 py-2" data-test="unhandled-rejection" @click="unhandledRejection">Unhandled rejection</button>
      <button class="border rounded px-4 py-2" data-test="vue-error" @click="vueError">Vue error</button>
      <button class="border rounded px-4 py-2" data-test="api-error" @click="apiError">API error event</button>
    </div>
  </div>
</template>
