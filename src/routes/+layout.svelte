<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores';
  import Header from '$lib/components/Header.svelte';
  import HelpPanel from '$lib/components/HelpPanel.svelte';
  import { pwaInfo } from 'virtual:pwa-info';

  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

  let darkMode = false;

  onMount(() => {
    settings.load();

    const unsubscribe = settings.subscribe(($settings) => {
      darkMode = $settings.darkMode;
      if (darkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    });

    return unsubscribe;
  });
</script>

<svelte:head>
  <title>QuickJots</title>
  {@html webManifestLink}
</svelte:head>

<main>
  <div class="app">
    <Header />
    <slot />
    <HelpPanel />
  </div>
</main>

<style>
  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
    color: #333333;
    overflow: hidden;
  }
</style>
