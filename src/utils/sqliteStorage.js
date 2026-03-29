import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  { name: 'local_storage.db', location: 'default' },
  () => {
    console.log('[sqliteStorage] Database opened successfully');
  },
  error => {
    console.log('[sqliteStorage] SQLite Error:', error);
  }
);

// Initialize the settings table for key-value storage
export const initStorageTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT
      );`,
      [],
      () => {
        console.log('[sqliteStorage] settings table ensured/created');
      },
      (tx, error) => {
        console.log('[sqliteStorage] Error creating settings table:', error);
      }
    );
  });
};

// Ensure table is created on import
initStorageTable();

const sqliteStorage = {
  setItem: (key, value) => {
    return new Promise((resolve, reject) => {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      db.transaction(tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
          [key, stringValue],
          () => resolve(),
          (tx, error) => reject(error)
        );
      });
    });
  },

  getItem: (key) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT value FROM settings WHERE key = ? LIMIT 1;',
          [key],
          (tx, results) => {
            if (results.rows.length > 0) {
              const value = results.rows.item(0).value;
              resolve(value);
            } else {
              resolve(null);
            }
          },
          (tx, error) => reject(error)
        );
      });
    });
  },

  removeItem: (key) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM settings WHERE key = ?;',
          [key],
          () => resolve(),
          (tx, error) => reject(error)
        );
      });
    });
  },

  clear: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM settings;',
          [],
          () => resolve(),
          (tx, error) => reject(error)
        );
      });
    });
  },

  getAllKeys: () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT key FROM settings;',
          [],
          (tx, results) => {
            let keys = [];
            for (let i = 0; i < results.rows.length; i++) {
              keys.push(results.rows.item(i).key);
            }
            resolve(keys);
          },
          (tx, error) => reject(error)
        );
      });
    });
  }
};

export default sqliteStorage;
