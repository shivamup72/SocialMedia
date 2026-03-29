// Update message content and updated_at in SQLite
export const updateMessageContent = (id, content, updated_at) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE messages SET content = ?, updated_at = ? WHERE id = ?;`,
      [content, updated_at, id],
    );
  });
};
// Get local_media_path by message id
export const getLocalMediaPathByMessageId = messageId => {
  return new Promise((resolve, reject) => {
    console.log(
      '[chatSQLite] getLocalMediaPathByMessageId called with:',
      messageId,
    );
    db.transaction(tx => {
      tx.executeSql(
        'SELECT extra FROM messages WHERE id = ? LIMIT 1;',
        [messageId],
        (tx, results) => {
          console.log(
            '[chatSQLite] SQL results for id',
            messageId,
            ':',
            results.rows.length,
            results.rows.item(0),
          );
          if (results.rows.length > 0) {
            const extra = results.rows.item(0).extra;
            try {
              const extraObj = extra ? JSON.parse(extra) : {};
              console.log('[chatSQLite] Parsed extraObj:', extraObj);
              resolve(extraObj.local_media_path || null);
            } catch (e) {
              console.log('[chatSQLite] Error parsing extra JSON:', e);
              resolve(null);
            }
          } else {
            console.log('[chatSQLite] No message found for id:', messageId);
            resolve(null);
          }
        },
        (tx, error) => {
          console.log('[chatSQLite] SQL error for id', messageId, ':', error);
          reject(error);
        },
      );
    });
  });
};
import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';

const db = SQLite.openDatabase(
  {name: 'chat_messages.db', location: 'default'},
  () => {
    console.log('[chatSQLite] Database opened successfully');
  },
  error => {
    console.log('[chatSQLite] SQLite Error:', error);
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
      [],
      () => {
        console.log('[chatSQLite] messages table ensured/created');
      },
      (tx, error) => {
        console.log('[chatSQLite] Error creating messages table:', error);
      },
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS conversations (
        conversation_id TEXT PRIMARY KEY NOT NULL,
        chat_name TEXT,
        chat_email TEXT,
        chat_avatar TEXT,
        is_group INTEGER,
        unread_count INTEGER,
        last_message TEXT
      );`,
      [],
      () => {
        console.log('[chatSQLite] conversations table ensured/created');
      },
      (tx, error) => {
        console.log('[chatSQLite] Error creating conversations table:', error);
      },
    );
  });
};
// Ensure table is created on import
initChatTable();
// };

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
  console.log('Saving message to local DB before send:', message);
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

// Utility: Download remote media and update local DB
/**
 * Download remote media to local storage and update message in DB
 * @param {string} remoteUrl - The remote media URL
 * @param {object} message - The message object (must have id)
 * @param {string} fileName - The desired local file name
 * @param {function} onDownloaded - Callback with new local path
 */
export async function downloadAndStoreMedia(
  remoteUrl,
  message,
  fileName,
  onDownloaded,
) {
  try {
    const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.downloadFile({fromUrl: remoteUrl, toFile: destPath}).promise;
    const localPath = `file://${destPath}`;
    // Update message in DB (add/update local_media_path)
    insertMessage({
      ...message,
      extra: {
        ...(message.extra || {}),
        local_media_path: localPath,
      },
    });
    if (onDownloaded) onDownloaded(localPath);
    return localPath;
  } catch (err) {
    console.log('Error downloading media:', err);
    return null;
  }
}

export const getPendingMessages = callback => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM messages WHERE status = ? ORDER BY datetime(created_at) ASC;`,
      ['pending'],
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

export const updateMessageStatus = (id, status) => {
  db.transaction(tx => {
    tx.executeSql(`UPDATE messages SET status = ? WHERE id = ?;`, [status, id]);
  });
};

export const insertConversation = conversation => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT OR REPLACE INTO conversations (conversation_id, chat_name, chat_email, chat_avatar, is_group, unread_count, last_message) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        conversation.conversation_id,
        conversation.chat_name,
        conversation.chat_email,
        conversation.chat_avatar,
        conversation.is_group ? 1 : 0,
        conversation.unread_count || 0,
        JSON.stringify(conversation.last_message || {}),
      ],
    );
  });
};

export const getConversations = callback => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM conversations;`,
      [],
      (tx, results) => {
        const rows = results.rows;
        let conversations = [];
        for (let i = 0; i < rows.length; i++) {
          const item = rows.item(i);
          conversations.push({
            ...item,
            is_group: !!item.is_group,
            last_message: JSON.parse(item.last_message || '{}'),
          });
        }
        callback(conversations);
      },
      (tx, error) => {
        console.log('[chatSQLite] Error fetching conversations:', error);
        callback([]);
      },
    );
  });
};

export default db;
