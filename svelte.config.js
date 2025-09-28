import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-static only supports some environments, see https://kit.svelte.dev/docs/adapter-static for a list.
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: 'index.html', // SPA mode for client-side routing
			precompress: false,
			strict: true
		}),
		serviceWorker: {
			register: false // We'll handle service worker registration manually for PWA
		}
	}
};

export default config;
