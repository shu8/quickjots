<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { isReturningUser } from '$lib/stores';

  let showBanner = false;

  $: if ($isReturningUser) {
    const status = localStorage.getItem('keepAliveBannerStatus');
    if (!status) {
      showBanner = true;
    }
  }

  function handleVote() {
    localStorage.setItem('keepAliveBannerStatus', 'voted');
    showBanner = false;
  }

  function handleDismiss() {
    localStorage.setItem('keepAliveBannerStatus', 'dismissed');
    showBanner = false;
  }
</script>

{#if showBanner}
  <div class="modal-overlay" transition:fade={{ duration: 200 }}>
    <div class="modal-card" transition:fly={{ y: 20, duration: 300 }}>
      <div class="modal-header">
        <span>👋</span>
        <h2>A quick note from the developer</h2>
      </div>
      <div class="modal-body">
        <p>
          Hey there! I'm <a href="https://sjain.dev" target="_blank" rel="noopener">Shubham</a>, the
          creator of QuickJots. I built this notepad app in 2019 to make jotting notes private,
          fast, and completely free of ads.
        </p>
        <p>
          Hosting and domain renewal costs are coming up, and I want to make sure people are
          actively getting value out of the app before keeping it online.
        </p>
        <p>
          Regardless of what happens, the project will always remain free and open source on <a
            href="https://github.com/shu8/quickjots"
            target="_blank"
            rel="noopener">GitHub</a
          >.
        </p>
        <div class="highlight-text">
          <strong>If you find QuickJots useful</strong>, please click below to register your vote.
          Every click helps justify keeping the site alive!
        </div>
      </div>
      <div class="modal-footer">
        <button
          class="btn btn-primary"
          data-umami-event="Keep active vote button"
          on:click={handleVote}
        >
          Yes, I use QuickJots!
        </button>

        <div class="modal-secondary-actions">
          <a
            href="https://www.buymeacoffee.com/shubhamjain"
            target="_blank"
            data-umami-event="Buy me a coffee button - feedback banner"
          >
            <img src="/default-yellow.png" alt="Buy Me A Coffee" />
          </a>
          <button
            class="btn"
            data-umami-event="Dismiss support banner button"
            on:click={handleDismiss}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .modal-card {
    background: var(--bg-primary);
    color: var(--text-primary);
    width: calc(100% - 32px);
    max-width: 480px;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-color);
    border-top: 8px solid var(--accent-primary);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 12px;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }

  .modal-header span {
    font-size: 24px;
  }

  .modal-body {
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--text-secondary);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .modal-body p {
    margin: 0;
  }

  .modal-body a {
    color: var(--accent-primary);
    text-decoration: underline;
    font-weight: 600;
  }

  .modal-body a:hover {
    color: #0056b3;
  }

  :global(body.dark) .modal-body a:hover {
    color: #29b6f6;
  }

  .highlight-text {
    background-color: var(--bg-secondary);
    border-left: 4px solid var(--accent-primary);
    padding: 12px;
    border-radius: var(--border-radius-sm);
    color: var(--text-primary);
  }

  .modal-footer {
    display: flex;
    flex-direction: column;
    gap: 16px;
    border-top: 1px solid var(--border-color);
    padding-top: 16px;
  }

  .modal-footer .btn-primary {
    width: 100%;
    padding: 10px 16px;
    font-weight: 700;
  }

  .modal-secondary-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .modal-secondary-actions a img {
    border-radius: 4px;
    height: 35px;
    transition: opacity 0.2s ease;
  }

  .modal-secondary-actions a img:hover {
    opacity: 0.85;
  }

  .modal-secondary-actions button {
    font-size: 13px;
    padding: 6px 14px;
  }

  @media (max-width: 480px) {
    .modal-card {
      padding: 16px;
    }
    .modal-secondary-actions {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
    :global(.modal-secondary-actions button) {
      width: 100%;
      text-align: center;
    }
    .modal-secondary-actions a {
      text-align: center;
    }
  }
</style>
