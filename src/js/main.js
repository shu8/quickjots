const SAVE_AFTER_INSERTIONS = 10;

(quickjots => {
  // Do nothing on the homepage
  if (document.body.classList.contains('homepage')) return;

  window.showdown = require('showdown');
  if ('serviceWorker' in navigator) {
    console.info('Service worker registration in progress');
    navigator.serviceWorker.register('/service-worker.js');
  } else {
    console.info('Service worker not supported, this webapp will not work offline in this browser.');
  }

  quickjots.state = {
    markdown: {
      input: document.getElementById('markdown-input'),
      preview: document.getElementById('markdown-preview'),
      insertionsSinceSave: 0,
      modified: false,
    },

    plaintext: {
      input: document.getElementById('plaintext-input'),
      insertionsSinceSave: 0,
      modified: false,
    },
  };

  quickjots.renderMarkdown = () => {
    if (!quickjots.mdConverter) {
      quickjots.mdConverter = new window.showdown.Converter({
        tables: true,
        emoji: true,
        openLinksInNewWindow: true,
      });
      quickjots.mdConverter.setFlavor('github');
    }

    const text = quickjots.state.markdown.input.value;
    const html = quickjots.mdConverter.makeHtml(text);
    quickjots.state.markdown.preview.innerHTML = html;
  };

  quickjots.restoreDBContents = () => {
    // This function will only be called from the storage code, so the DB will definitely
    // be open at this point
    quickjots.storage.get('dark', quickjots.storage.METADATA_STORE, result => {
      if (!result.success) return;
      if (result.value.value) document.body.classList.add('dark');
    });

    ['markdown', 'plaintext'].forEach(type => {
      quickjots.storage.get(`${type}_expanded`, quickjots.storage.METADATA_STORE, result => {
        if (!result.success) return;

        // result.value will be undefined if this type has never had this setting saved
        if (result.value && result.value.value) {
          document.body.classList.add('expanded');
          document.getElementById(`${type}-container`).classList.add('expanded');
        }
      });

      quickjots.storage.get(type, quickjots.storage.MAIN_STORE, result => {
        if (result.success) {
          quickjots.state[type].input.value = result.value.text;
          document.getElementById(`${type}-status`).innerText = 'saved';
          if (type === 'markdown') quickjots.renderMarkdown();
          return;
        }

        document.getElementById(`${type}-status`).innerText = 'error';
        window.alert('There was an error getting saved notes, if this keeps happening please press F12 to show more details');
        if (result.err) console.error(result.err);
        console.error('There was an error getting saved notes. Please raise an issue on GitHub at https://github.com/shu8/quickjots, and include anything relevant from this console.');
      });
    });
  };

  quickjots.saveTextForType = type => {
    // Skip saving if the textarea hasn't been modified since the last save
    if (!quickjots.state[type].modified) return;

    let input;
    if (type === 'markdown') input = quickjots.state.markdown.input;
    else if (type === 'plaintext') input = quickjots.state.plaintext.input;
    else return;

    quickjots.storage.save(type, input.value, quickjots.storage.MAIN_STORE, result => {
      if (result.success) return;
      window.alert('There was an error saving your notes, if this keeps happening please press F12 to show more details');
      if (result.err) console.error(result.err);
      console.error('There was an error saving your data. Please raise an issue on GitHub at https://github.com/shu8/quickjots, and include anything relevant from this console.');
    });
  };

  quickjots.textChangeListener = (e, type) => {
    const statusSpan = document.getElementById(type + '-status');
    quickjots.state[type].insertionsSinceSave++;
    quickjots.state[type].modified = true;
    statusSpan.innerText = 'unsaved';
    statusSpan.classList.remove('transition');

    // Looking for `type` in Edge, `inputType` in other browsers
    const inputType = e.inputType || e.type;

    if (
      // Save as soon as something is pasted; allows users to e.g. just open site, paste, and close tab immediately
      (inputType === 'paste') || (inputType === 'insertFromPaste') ||
      // Save on any backspaces/chunk deletes
      (inputType === 'deleteContentBackward') ||
      // Save every SAVE_AFTER_INSERTIONS insertions
      // Ideally, we only look for 'insertText', 'insertFromPaste', 'deleteContentBackward'
      // But Edge *only ever* returns 'input' (even for deletes, pastes, etc)
      // This textChangeListener is also attached to the paste event for the 'paste' check above
      ((inputType === 'input' || inputType === 'insertText') &&
        quickjots.state[type].insertionsSinceSave >= SAVE_AFTER_INSERTIONS)
    ) {
      quickjots.saveTextForType(type);
      quickjots.state[type].insertionsSinceSave = 0;
      quickjots.state[type].modified = false;
      statusSpan.innerText = 'saved';
      statusSpan.classList.add('transition');
    }
  };

  quickjots.deleteNotesListener = deleteBtn => {
    const type = deleteBtn.dataset.type;
    if (!window.confirm('Are you sure you want to delete this text?')) return;

    quickjots.storage.delete(type, quickjots.storage.MAIN_STORE, result => {
      if (result.success) return window.location.reload();

      window.alert('There was an error deleting the data. Please raise an issue on GitHub. Press F12 to open the Console for more details');
      if (result.err) console.error(result.err);
      console.error('There was an error deleting the data. Please raise an issue on GitHub at https://github.com/shu8/quickjots, and include anything relevant from this console. Meanwhile, you can still delete your data by deleting the data in "IndexedDB" in the "Application" panel in Developer Tools!');
    });
  };

  window.onbeforeunload = () => {
    quickjots.saveTextForType('markdown');
    quickjots.saveTextForType('plaintext');
  };

  quickjots.state.plaintext.input.addEventListener('input', e =>
    quickjots.textChangeListener(e, 'plaintext'));

  quickjots.state.markdown.input.addEventListener('input', e => {
    quickjots.renderMarkdown();
    quickjots.textChangeListener(e, 'markdown');
  });

  quickjots.state.plaintext.input.addEventListener('paste', e =>
    quickjots.textChangeListener(e, 'plaintext'));

  quickjots.state.markdown.input.addEventListener('paste', e =>
    quickjots.textChangeListener(e, 'markdown'));

})(window.quickjots = window.quickjots || {});
