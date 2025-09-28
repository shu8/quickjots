<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { notes, ui, currentNoteId } from '$lib/stores';
	import type { Note } from '$lib/types/Note.js';

	let editor: HTMLTextAreaElement;
	let currentNote: Note | null = null;
	let content = '';
	let isInitialized = false;
	let debounceTimeout: number | null = null;

	$: if ($currentNoteId && isInitialized) {
		loadCurrentNote($currentNoteId);
	}

	onMount(() => {
		isInitialized = true;

		if ($currentNoteId) {
			loadCurrentNote($currentNoteId);
		}

		if (editor) {
			editor.focus();
		}

		const handleBeforeUnload = async () => {
			if (currentNote && !currentNote.content.trim()) {
				try {
					await saveCurrentNote();
					await notes.delete(currentNote.id);
				} catch (error) {
					console.error('Failed to clean up empty note on unload:', error);
				}
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);

			if (debounceTimeout) {
				clearTimeout(debounceTimeout);
			}
		};
	});

	onDestroy(() => {
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}
	});

	async function loadCurrentNote(noteId: string) {
		try {
			// Clean up previous note if it's empty
			if (currentNote && !currentNote.content.trim()) {
				await notes.delete(currentNote.id);
			}

			const allNotes = $notes;
			const note = allNotes.find((n) => n.id === noteId);

			if (note) {
				currentNote = note;
				content = note.content;
			} else {
				ui.setCurrentNote(null);
				currentNote = null;
				content = '';
			}
		} catch (error) {
			console.error('Failed to load note:', error);
			ui.setSaveStatus('error');
		}
	}

	async function saveCurrentNote() {
		if (!currentNote) return;

		try {
			ui.setSaveStatus('saving');

			await notes.updateNote(currentNote.id, content);

			currentNote = { ...currentNote, content, updatedAt: new Date() };

			ui.setSaveStatus('saved');

			if (debounceTimeout) {
				clearTimeout(debounceTimeout);
				debounceTimeout = null;
			}
		} catch (error) {
			console.error('Failed to save note:', error);
			ui.setSaveStatus('error');
		}
	}

	function debouncedSave() {
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}

		ui.setSaveStatus('unsaved');

		debounceTimeout = window.setTimeout(() => {
			if (currentNote) {
				saveCurrentNote();
			}
		}, 500);
	}

	function handleBeforeInput(e: InputEvent) {
		if (e.inputType === 'insertFromPaste' || e.inputType === 'paste') {
			if (debounceTimeout) {
				clearTimeout(debounceTimeout);
			}
			setTimeout(() => {
				if (currentNote) {
					saveCurrentNote();
				}
			}, 0);
		}
	}

	async function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		content = target.value;

		// If no note is selected and user starts typing, create a new note
		if (!currentNote && content.trim()) {
			try {
				const newNote = await notes.add(content);
				ui.setCurrentNote(newNote.id);
				currentNote = newNote;
			} catch (error) {
				console.error('Failed to create note while typing:', error);
				ui.setSaveStatus('error');
			}
		} else if (currentNote) {
			// Use debounced save for existing notes
			debouncedSave();
		}
	}

	function getPlaceholderText(): string {
		return 'Start jotting...';
	}
</script>

<div class="editor-container">
	<textarea
		bind:this={editor}
		class="editor"
		value={content}
		placeholder={getPlaceholderText()}
		spellcheck="true"
		on:beforeinput={handleBeforeInput}
		on:input={handleInput}
	></textarea>
</div>

<style>
	.editor-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		background-color: #ffffff;
	}

	.editor {
		flex: 1;
		width: 100%;
		padding: 1.5rem;
		border: none;
		outline: none;
		resize: none;
		font-family: 'Fira Code', monospace;
		font-size: 14px;
		line-height: 1.5;
		color: #333333;
		background-color: #fafafa;
		transition: all var(--transition-fast);
	}

	.editor:focus {
		background-color: #fafafa;
	}

	.editor::placeholder {
		color: #999999;
		font-style: italic;
	}

	/* Dark mode */
	:global(body.dark) .editor-container {
		background-color: #1a1a1a;
	}

	:global(body.dark) .editor {
		background-color: #2d2d2d;
		color: #e0e0e0;
	}

	:global(body.dark) .editor:focus {
		background-color: #2d2d2d;
	}

	:global(body.dark) .editor::placeholder {
		color: #888888;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.editor {
			padding: 1rem;
			font-size: 16px; /* Prevent zoom on iOS */
		}
	}

	@media (max-width: 480px) {
		.editor {
			padding: 0.75rem;
		}
	}
</style>
