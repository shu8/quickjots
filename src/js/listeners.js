(quickjots => {
  quickjots.toggleHelp = newVisibleState => {
    const helpContainer = document.getElementById('help-container');
    const mainContainer = document.getElementById('container');
    if (newVisibleState === true) {
      helpContainer.classList.remove('hidden');
      mainContainer.classList.add('faded');
    } else {
      helpContainer.classList.add('hidden');
      mainContainer.classList.remove('faded');
    }
  };

  quickjots.expandButtonListener = expandBtn => {
    // Un-expand existing expanded textarea(s), if any
    const expanded = document.getElementsByClassName('expanded');
    [...expanded].forEach(el => {
      // We'll handle this case outside of the loop, just below
      if (el === expandBtn.parentElement) return;

      el.classList.remove('expanded');
    });

    const type = expandBtn.dataset.type;
    const isNowExpanded = expandBtn.parentElement.classList.contains('expanded') ? false : true;
    if (isNowExpanded) {
      expandBtn.parentElement.classList.add('expanded');
      document.body.classList.add('expanded');
    } else {
      expandBtn.parentElement.classList.remove('expanded');
      document.body.classList.remove('expanded');
    }

    quickjots.storage.save(`${type}_expanded`, isNowExpanded, quickjots.storage.METADATA_STORE, result => {
      if (!result.success) console.error('There was an error saving the new expanded state', result);
    });
  };

  [...document.getElementsByClassName('expand-icon')].forEach(btn =>
    btn.addEventListener('click', () => quickjots.expandButtonListener(btn))
  );

  [...document.getElementsByClassName('notes-delete')].forEach(btn =>
    btn.addEventListener('click', () => quickjots.deleteNotesListener(btn))
  );

  document.getElementById('dark-mode-toggle').addEventListener('click', () => {
    const isNowDark = document.body.classList.contains('dark') ? false : true;

    quickjots.storage.save('dark', isNowDark, quickjots.storage.METADATA_STORE, value => {
      if (!value.success) console.error('There was an error saving the new dark mode value', value);
    });

    if (isNowDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  });

  document.getElementById('help-toggle').addEventListener('click', () => {
    const helpContainer = document.getElementById('help-container');
    const isHelpNowShown = helpContainer.classList.contains('hidden');

    if (isHelpNowShown) quickjots.toggleHelp(true);
    else quickjots.toggleHelp(false);
  });

  document.addEventListener('click', e => {
    // Hide help dialog on click outside of the container
    const helpContainer = document.getElementById('help-container');
    const isHelpAlreadyShown = helpContainer.classList.contains('hidden') ? false : true;

    if (!isHelpAlreadyShown) return;
    if (helpContainer.contains(e.target)) return;
    if (document.getElementById('dark-mode-toggle').contains(e.target)) return;
    if (document.getElementById('help-toggle').contains(e.target)) return;

    quickjots.toggleHelp(false);
  });

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) document.getElementById('plaintext-container').classList.add('expanded');
  else document.getElementById('plaintext-container').classList.remove('expanded');
})(window.quickjots = window.quickjots || {});
