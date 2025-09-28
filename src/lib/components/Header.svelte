<script lang="ts">
  import { ui, settings } from '$lib/stores';
</script>

<header class="header">
  <div class="header-left">
    <a
      href="https://www.buymeacoffee.com/shubhamjain"
      target="_blank"
      data-umami-event="Buy me a coffee button"
      ><img
        src="/default-yellow.png"
        alt="Buy Me A Coffee"
        title="Buy Me A Coffee to help support the development of QuickJots!"
        style="height: 35px"
      /></a
    >
  </div>

  <h1 class="title">
    <img src="/quickjots.svg" alt="QuickJots" class="logo" />
  </h1>

  <div class="header-right">
    <button
      data-umami-event="Dark mode toggle button"
      class="btn btn-icon dark-mode"
      on:click={() => settings.toggleDarkMode()}
      title="Toggle dark mode"
      aria-label="Toggle dark mode"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path
          d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"
        />
      </svg>
    </button>

    <button
      data-umami-event="Help button"
      class="btn btn-icon help"
      on:click={() => ui.toggleHelpPanel()}
      title="Show help"
      aria-label="Show help"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        <path
          d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"
        />
      </svg>
    </button>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background-color: var(--bg-primary);
    border-bottom: 1px solid var(--border-color);
    flex-shrink: 0;
    height: 60px;
    position: relative;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .logo {
    height: 40px;
  }

  :global(.dark) .logo {
    filter: invert(1);
  }

  @media (max-width: 768px) {
    .header {
      padding: 0.5rem;
    }

    .title {
      font-size: 1.1rem;
    }
  }

  @media (max-width: 480px) {
    .header-left {
      gap: 0.5rem;
    }

    .header-right {
      gap: 0.25rem;
    }

    .btn {
      padding: 0.375rem;
    }
  }
</style>
