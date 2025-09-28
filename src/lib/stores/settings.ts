import { derived, writable, type Writable } from 'svelte/store';
import { storageService } from '$lib/services/storage.js';

export interface AppSettings {
	darkMode: boolean;
	notesListCollapsed: boolean;
}

interface SettingsStore extends Writable<AppSettings> {
	toggleDarkMode: () => void;
	toggleNotesCollapsed: () => void;
	reset: () => void;
	load: () => void;
}

const defaultSettings: AppSettings = {
	darkMode: false,
	notesListCollapsed: true
};

function createSettingsStore(): SettingsStore {
	const { subscribe, set, update } = writable<AppSettings>(defaultSettings);

	return {
		subscribe,
		set,
		update,
		toggleDarkMode: () => {
			update((settings) => {
				storageService.saveSetting('dark', !settings.darkMode);
				return { ...settings, darkMode: !settings.darkMode };
			});
		},
		toggleNotesCollapsed: () => {
			update((settings) => {
				const newValue = settings.notesListCollapsed == null ? true : !settings.notesListCollapsed;
				storageService.saveSetting('notesCollapsed', newValue);
				return { ...settings, notesListCollapsed: newValue };
			});
		},
		reset: () => set(defaultSettings),
		load: async () => {
			const settings = await storageService.getSettings();
			update(() => settings);
		}
	};
}

export const settings = createSettingsStore();
export const notesCollapsed = derived(settings, ($settings) => $settings.notesListCollapsed);
