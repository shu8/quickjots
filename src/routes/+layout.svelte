<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { settings } from '$lib/stores';
	import Header from '$lib/components/Header.svelte';
	import HelpPanel from '$lib/components/HelpPanel.svelte';

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
</svelte:head>

<main>
	<div class="app">
		<Header />
		<slot />
		<HelpPanel />
	</div>
</main>

<style>
	:global(button) {
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
		font-family: inherit;
	}

	.app {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #ffffff;
		color: #333333;
		overflow: hidden;
	}

	:global(body.dark) .app {
		background-color: #1a1a1a;
		color: #e0e0e0;
	}
</style>
