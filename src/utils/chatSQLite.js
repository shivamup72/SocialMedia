import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {name: 'chat_messages.db', location: 'default'},
  () => {},
  error => {
    console.log('SQLite Error:', error);
  },
);

export const initChatTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        conversation_id TEXT,
        sender_id TEXT,
        content TEXT,
        created_at TEXT,
        status TEXT,
        is_group INTEGER,
        extra TEXT
      );`,
    );
  });
};

export const logAllMessages = () => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM messages ORDER BY datetime(created_at) DESC;',
      [],
      (tx, results) => {
        const rows = results.rows;
        let messages = [];
        for (let i = 0; i < rows.length; i++) {
          messages.push(rows.item(i));
        }
        console.log('SQLite Messages:', messages);
      },
      error => {
        console.log('SQLite Error:', error);
      },
    );
  });
};
export const insertMessage = message => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT OR REPLACE INTO messages (id, conversation_id, sender_id, content, created_at, status, is_group, extra) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        message.id,
        message.conversation_id,
        message.sender_id,
        message.content,
        message.created_at,
        message.status || '',
        message.is_group ? 1 : 0,
        JSON.stringify(message.extra || {}),
      ],
    );
  });
};

export const getMessages = (conversation_id, is_group, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM messages WHERE conversation_id = ? AND is_group = ? ORDER BY datetime(created_at) DESC;`,
      [conversation_id, is_group ? 1 : 0],
      (tx, results) => {
        const rows = results.rows;
        let messages = [];
        for (let i = 0; i < rows.length; i++) {
          messages.push(rows.item(i));
        }
        callback(messages);
      },
    );
  });
};

export default db;
