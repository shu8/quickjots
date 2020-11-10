const DB_VERSION = 1;
const DEFAULT_MARKDOWN_TEXT = `**This space is for any of your short-term markdown notes**

You can use GitHub Flavoured Markdown:

- [ ] task lists are supported
- [x] mark items as complete as you finish them

Emojis are supported too! :smile:

Any links become clickable: http://example.com
...[and you can add your own text like this](http://example.com)

Read [the Markdown cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) for more details!`;

const DEFAULT_PLAINTEXT = `This space is for any of your short-term plain-text notes.

Follow up claim -- call 01234561298. Reference XC12345567.`;

(quickjots => {
  // Do nothing on the homepage
  if (document.body.classList.contains('homepage')) return;

  quickjots.storage = {
    MAIN_STORE: 'quickjots',
    METADATA_STORE: 'quickjots_metadata',

    transact(mode, desiredStore, cb) {
      try {
        const transaction = this.db.transaction([desiredStore], mode);
        transaction.onerror = e => console.error('Failed transaction', e);

        const store = transaction.objectStore(desiredStore);
        cb(null, transaction, store);
      } catch (err) {
        cb(err);
      }
    },

    save(key, value, desiredStore, cb) {
      this.transact('readwrite', desiredStore, (err, transaction, store) => {
        if (err) return cb({ success: false, err });
        try {
          const request = store.put(
            desiredStore === quickjots.storage.MAIN_STORE ?
              { type: key, text: value } : { name: key, value }
          );
          request.onsuccess = () => cb({ success: true });
          request.onerror = () => cb({ success: false });
        } catch (e) {
          cb({ success: false, err: e });
        }
      });
    },

    get(key, desiredStore, cb) {
      this.transact('readonly', desiredStore, (err, transaction, store) => {
        if (err) return cb({ success: false, err });
        const request = store.get(key);
        request.onsuccess = () => cb({ success: true, value: request.result });
        request.onerror = () => cb({ successs: false });
      });
    },

    delete(key, desiredStore, cb) {
      this.transact('readwrite', desiredStore, (err, transaction, store) => {
        if (err) return cb({ success: false, err });
        try {
          const request = store.delete(key);
          request.onsuccess = () => cb({ success: true });
          request.onerror = () => cb({ success: false });
        } catch (e) {
          cb({ success: false, err: e });
        }
      });
    }
  };

  const request = window.indexedDB.open('quickjots', DB_VERSION);

  request.onerror = err => console.error('There was an error opening the database', err);

  request.onsuccess = () => {
    console.info('Database opened successfully');
    quickjots.storage.db = request.result;
    quickjots.restoreDBContents();
  };

  request.onupgradeneeded = e => {
    const db = e.target.result;

    const quickjotsStore = db.createObjectStore(quickjots.storage.MAIN_STORE, {
      keyPath: 'type',
    });
    quickjotsStore.createIndex('text', 'text', { unique: false });

    const metadataStore = db.createObjectStore(quickjots.storage.METADATA_STORE, {
      keyPath: 'name',
    });
    metadataStore.createIndex('value', 'value', { unique: false });

    const initialMarkdown = { type: 'markdown', text: DEFAULT_MARKDOWN_TEXT };
    const initialPlaintext = { type: 'plaintext', text: DEFAULT_PLAINTEXT };
    const initalDarkMode = { name: 'dark', value: null };

    const records = [initialMarkdown, initialPlaintext];
    records.forEach(record => quickjotsStore.put(record));
    metadataStore.put(initalDarkMode);

    // Show help -- new user
    quickjots.toggleHelp(true);
    console.info('Initial quickjots schema created');
  };
})(window.quickjots = window.quickjots || {});
