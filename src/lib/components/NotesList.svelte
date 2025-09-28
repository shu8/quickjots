<script lang="ts">
  import {
    notes,
    ui,
    currentNoteId,
    sortedNotes,
    saveStatus,
    settings,
    notesCollapsed
  } from '$lib/stores';
  import type { Note } from '$lib/types/Note.js';
  import { formatDate, generateNoteTitle } from '$lib/utils/noteHelpers.js';

  let isCollapsed = false;
  $: isCollapsed = $notesCollapsed;

  function selectNote(note: Note) {
    ui.setCurrentNote(note.id);
  }

  async function deleteNote(note: Note, event: Event) {
    event.stopPropagation();

    if (confirm(`Delete this note? This action cannot be undone.`)) {
      try {
        await notes.delete(note.id);

        // If this was the current note, clear selection
        if ($currentNoteId === note.id) {
          ui.setCurrentNote(null);
        }
      } catch (error) {
        console.error('Failed to delete note:', error);
        ui.setSaveStatus('error');
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent, note: Note) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectNote(note);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      deleteNote(note, event);
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
</script>

<!-- Save Status Bar -->
<div class="status-bar">
  <div class="save-status">
    {#if $saveStatus === 'saving'}
      <span class="status saving">
        <div class="spinner"></div>
        Saving...
      </span>
    {:else if $saveStatus === 'saved'}
      <span class="status saved">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"
          />
        </svg>
        Saved
      </span>
    {:else if $saveStatus === 'unsaved'}
      <span class="status unsaved">
        <div class="dot"></div>
        Unsaved
      </span>
    {:else if $saveStatus === 'error'}
      <span class="status error">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-2.008 0L.127 13.233c-.618 1.043.205 2.346 1.379 2.346h13.022c1.173 0 1.996-1.303 1.379-2.346L8.982 1.566z"
          />
          <path
            d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"
          />
        </svg>
        Error
      </span>
    {/if}
  </div>

  <div class="new-note-area">
    <button
      class="btn btn-primary new-note"
      data-umami-event="New note button"
      on:click={createNewNote}
      title="Create new note (Ctrl+N)"
      aria-label="Create new note"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path
          d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
        />
      </svg>
      New
    </button>
  </div>
</div>

<aside class="notes-list" class:collapsed={isCollapsed}>
  <div class="notes-header">
    <h2 class="notes-title">
      <strong>Your Notes</strong>
      {#if $notes.length > 0}
        <span class="count">{$notes.length} note{$notes.length === 1 ? '' : 's'}</span>
      {:else}
        <span class="count">0 notes</span>
      {/if}
    </h2>

    <button
      class="btn btn-icon collapse-btn"
      data-umami-event="Collapse notes button"
      on:click={settings.toggleNotesCollapsed}
      title={isCollapsed ? 'Expand notes list' : 'Collapse notes list'}
      aria-label={isCollapsed ? 'Expand notes list' : 'Collapse notes list'}
    >
      {#if isCollapsed}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
          />
        </svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
        </svg>
      {/if}
    </button>
  </div>

  {#if !isCollapsed}
    <div class="notes-content">
      {#if $notes.length === 0}
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zM4.5 9a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4.5 10.5a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7z"
            />
          </svg>
          <p>No notes yet</p>
          <small>Create your first note to get started</small>
        </div>
      {:else}
        <div class="notes-scroll">
          {#each $sortedNotes as note (note.id)}
            <button
              class="note-item"
              class:active={$currentNoteId === note.id}
              on:click={() => selectNote(note)}
              on:keydown={(e) => handleKeyDown(e, note)}
              title="Click to select note"
            >
              <div class="note-content">
                <div class="note-preview">
                  {generateNoteTitle(note.content, note.createdAt)}
                </div>
                <div class="note-meta">
                  <span class="note-date">
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
              </div>

              <button
                class="delete-btn"
                on:click={(e) => deleteNote(note, e)}
                title="Delete note"
                aria-label="Delete note"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84L13.962 3.5H14.5a.5.5 0 0 0 0-1h-1.004a.58.58 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"
                  />
                </svg>
              </button>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</aside>

<style>
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background-color: #f8f9fa;
    border-top: 1px solid #e9ecef;
    flex-shrink: 0;
    min-height: 40px;
  }

  .save-status {
    display: flex;
    align-items: center;
  }

  .new-note-area {
    display: flex;
    align-items: center;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: var(--border-radius-sm);
  }

  .status.saving {
    color: var(--accent-primary);
    background-color: rgba(0, 123, 255, 0.1);
  }

  .status.saved {
    color: var(--accent-success);
    background-color: rgba(40, 167, 69, 0.1);
  }

  .status.unsaved {
    color: var(--accent-warning);
    background-color: rgba(255, 193, 7, 0.1);
  }

  .status.error {
    color: var(--accent-danger);
    background-color: rgba(220, 53, 69, 0.1);
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid currentColor;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .dot {
    width: 8px;
    height: 8px;
    background-color: currentColor;
    border-radius: 50%;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .notes-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #f8f9fa;
    border-top: 1px solid #e9ecef;
    transition: all var(--transition-normal);
    flex-shrink: 0;
    min-height: auto;
    max-height: 25vh;
  }

  .notes-list.collapsed {
    max-height: 60px;
    min-height: 60px;
  }

  .notes-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e9ecef;
    background-color: #f8f9fa;
    flex-shrink: 0;
  }

  .notes-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #6c757d;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow: hidden;
    white-space: nowrap;
  }

  .count {
    font-size: 0.8rem;
    font-weight: 400;
    padding-top: 3px;
    color: #adb5bd;
  }

  .collapse-btn {
    padding: 0.5rem;
  }

  .collapse-btn svg {
    transition: opacity var(--transition-fast);
  }

  .notes-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    text-align: center;
    color: var(--text-muted);
    min-height: 80px;
  }

  .empty-state svg {
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .empty-state p {
    margin: 0 0 0.5rem 0;
    font-weight: 500;
  }

  .empty-state small {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .notes-scroll {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-height: calc(25vh - 60px); /* Subtract header height */
  }

  .note-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    padding: 12px 20px;
    border: none;
    border-bottom: 1px solid #e9ecef;
    cursor: pointer;
    transition: background-color 0.2s;
    text-align: left;
    position: relative;
  }

  .note-item:hover {
    background-color: #f8f9fa;
  }

  .note-item.active {
    background-color: #e3f2fd;
    border-left: 4px solid #2196f3;
  }

  .note-item.active .note-preview {
    color: #1976d2;
    font-weight: 500;
  }

  .note-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .note-preview {
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.3;
    margin-bottom: 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #0066cc;
  }

  .note-meta {
    font-size: 0.75rem;
    color: #6c757d;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .note-date {
    color: #6c757d;
  }

  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    opacity: 0;
    transition:
      opacity 0.2s ease,
      background-color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
  }

  .note-item:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background-color: #ffebee;
  }

  .delete-btn svg {
    width: 16px;
    height: 16px;
    fill: #d32f2f;
  }

  /* Dark mode support */
  :global(body.dark) .status-bar {
    background-color: #2d2d2d;
    border-top-color: #404040;
  }

  :global(body.dark) .notes-list {
    background-color: #2d2d2d;
    border-top-color: #404040;
  }

  :global(body.dark) .notes-header {
    background-color: #2d2d2d;
    border-bottom-color: #404040;
  }

  :global(body.dark) .notes-title {
    color: #adb5bd;
  }

  :global(body.dark) .count {
    color: #6c757d;
  }

  :global(body.dark) .note-item {
    background-color: #2d2d2d;
    border-bottom-color: #404040;
  }

  :global(body.dark) .note-item:hover {
    background-color: #3a3a3a;
  }

  :global(body.dark) .note-item.active {
    background-color: #1e3a5f;
    border-left-color: #64b5f6;
  }

  :global(body.dark) .note-preview {
    color: #e0e0e0;
  }

  :global(body.dark) .note-item.active .note-preview {
    color: #64b5f6;
  }

  :global(body.dark) .note-date {
    color: #adb5bd;
  }

  :global(body.dark) .delete-btn:hover {
    background-color: #5d1f1f;
  }

  :global(body.dark) .delete-btn svg {
    fill: #f44336;
  }

  @media (max-width: 768px) {
    .delete-btn {
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    .notes-header {
      padding: 0.75rem;
    }

    .note-item {
      padding: 0.5rem;
    }

    .note-preview {
      -webkit-line-clamp: 1;
    }
  }
</style>
