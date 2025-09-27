(quickjots => {
  // Help panel management
  quickjots.toggleHelp = (show = null) => {
    const helpPanel = document.getElementById('help-panel');

    if (show === null) {
      // Toggle current state
      show = !helpPanel.classList.contains('open');
    }

    if (show) {
      helpPanel.classList.add('open');
    } else {
      helpPanel.classList.remove('open');
    }
  };

  // Dark mode toggle
  quickjots.toggleDarkMode = () => {
    const isNowDark = document.body.classList.contains('dark') ? false : true;

    quickjots.storage.save('dark', isNowDark, quickjots.storage.METADATA_STORE, result => {
      if (!result.success) console.error('There was an error saving the new dark mode value', result);
    });

    if (isNowDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  // Keyboard shortcuts
  quickjots.handleKeyboardShortcuts = e => {
    // Check for Ctrl/Cmd key combinations
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault();
        if (quickjots.createNewNote) {
          quickjots.createNewNote();
        }
        break;
      case 's':
        e.preventDefault();
        if (quickjots.saveCurrentNote) {
          quickjots.saveCurrentNote();
        }
        break;
      case 'd':
        e.preventDefault();
        quickjots.toggleDarkMode();
        break;
      }
    }

    // Escape key to close help
    if (e.key === 'Escape') {
      quickjots.toggleHelp(false);
    }
  };

  // Initialize event listeners when DOM is ready
  const initializeListeners = () => {
    // Dark mode toggle button
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', quickjots.toggleDarkMode);
    }

    // Help toggle button
    const helpToggle = document.getElementById('help-toggle');
    if (helpToggle) {
      helpToggle.addEventListener('click', () => quickjots.toggleHelp());
    }

    // Help panel close button
    const helpPanelClose = document.getElementById('help-panel-close');
    if (helpPanelClose) {
      helpPanelClose.addEventListener('click', () => quickjots.toggleHelp(false));
    }

    // Help panel overlay (click outside to close)
    const helpPanelOverlay = document.querySelector('.help-panel-overlay');
    if (helpPanelOverlay) {
      helpPanelOverlay.addEventListener('click', () => quickjots.toggleHelp(false));
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', quickjots.handleKeyboardShortcuts);

    // Prevent help panel content from closing when clicked
    const helpPanelContent = document.querySelector('.help-panel-content');
    if (helpPanelContent) {
      helpPanelContent.addEventListener('click', e => {
        e.stopPropagation();
      });
    }
  };

  // Initialize listeners when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeListeners);
  } else {
    initializeListeners();
  }

  console.info('Event listeners initialized for new UI');

})(window.quickjots = window.quickjots || {});