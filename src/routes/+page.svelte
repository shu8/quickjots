<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { notes, ui, settings, currentNoteId } from '$lib/stores';
  import { storageService } from '$lib/services/storage.js';

  import Editor from '$lib/components/Editor.svelte';
  import NotesList from '$lib/components/NotesList.svelte';

  let error: string | null;

  function handleGlobalKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          createNewNote();
          break;
        case 's':
          e.preventDefault();
          saveCurrentNote();
          break;
        case 'd':
          e.preventDefault();
          settings.toggleDarkMode();
          break;
      }
    }
  }

  async function createNewNote() {
    try {
      const newNote = await notes.add('');
      ui.setCurrentNote(newNote.id);
    } catch (error) {
      console.error('Failed to create note:', error);
      ui.setSaveStatus('error');
    }
  }

  async function saveCurrentNote() {
    if (!$currentNoteId) return;

    try {
      ui.setSaveStatus('saving');

      const editor = document.querySelector('.editor') as HTMLTextAreaElement;
      if (!editor) return;

      const content = editor.value;
      await notes.updateNote($currentNoteId, content);

      ui.setSaveStatus('saved');
    } catch (error) {
      console.error('Failed to save note:', error);
      ui.setSaveStatus('error');
    }
  }

  onMount(() => {
    if (browser) {
      storageService
        .init()
        .then(settings.load)
        .then(notes.load)
        .then(async () => {
          const lastOpened = await storageService.getSetting('lastOpened', null);
          if (!lastOpened) {
            ui.toggleHelpPanel();
          }
        })
        .then(async () => await storageService.saveSetting('lastOpened', new Date().getTime()))
        .then(() => {
          if (notes.getById('welcome')) {
            ui.setCurrentNote('welcome');
          }
        })
        .catch((err) => {
          console.error('Failed to initialise:', err);
          error = err instanceof Error ? err.message : 'Unknown error occurred';
        });
    }
  });
</script>

<svelte:head>
  <title>QuickJots</title>
</svelte:head>

{#if error}
  <div class="app-error">
    <p>Something went wrong.</p>
    <p>{error}</p>
  </div>
{:else}
  <div class="app-content">
    <Editor />
    <NotesList />
  </div>
{/if}

<svelte:window on:keydown={handleGlobalKeyDown} />

<style>
  .app-error {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }

  .app-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
