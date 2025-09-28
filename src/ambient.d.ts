/**
 * Ambient type declarations for QuickJots
 */

// Global window extensions for legacy compatibility during migration
declare global {
	interface Window {
		quickjots?: {
			state?: any;
			storage?: any;
			[key: string]: any;
		};
	}
}

// Service Worker types
declare let self: ServiceWorkerGlobalScope;

// PWA Manifest
declare module '*?manifest' {
	const manifest: any;
	export default manifest;
}

// Static assets
declare module '*.svg' {
	const content: string;
	export default content;
}

declare module '*.png' {
	const content: string;
	export default content;
}

declare module '*.ico' {
	const content: string;
	export default content;
}

export {};