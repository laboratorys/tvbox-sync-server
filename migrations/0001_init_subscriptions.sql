-- Migration number: 0001 	 2026-04-20T03:03:10.795Z
-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  user_key TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 订阅内容表
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 用户与订阅的中间表
CREATE TABLE IF NOT EXISTS user_subscriptions (
  user_key TEXT NOT NULL,
  subscription_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_key, subscription_id),
  FOREIGN KEY (user_key) REFERENCES users(user_key) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS keep (
    user_key TEXT NOT NULL,
    key TEXT NOT NULL,
    siteName TEXT,
    vodName TEXT,
    vodPic TEXT,
    createTime INTEGER DEFAULT 0,
    type INTEGER DEFAULT 0,
    cid INTEGER DEFAULT 0,
    PRIMARY KEY (key)
);

CREATE TABLE IF NOT EXISTS history (
    user_key TEXT NOT NULL, 
    key TEXT NOT NULL,
    vodPic TEXT,
    vodName TEXT,
    vodFlag TEXT,
    vodRemarks TEXT,
    episodeUrl TEXT,
    revSort INTEGER DEFAULT 0,
    revPlay INTEGER DEFAULT 0,
    createTime INTEGER DEFAULT 0,
    opening INTEGER DEFAULT -1, 
    ending INTEGER DEFAULT -1,
    position INTEGER DEFAULT -1,
    duration INTEGER DEFAULT -1,
    speed REAL DEFAULT 1.0,
    scale INTEGER DEFAULT -1,
    cid INTEGER DEFAULT 0,
    PRIMARY KEY (user_key, key),
    FOREIGN KEY (user_key) REFERENCES users(user_key) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS search_history (
    user_key TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_key, title),
    FOREIGN KEY (user_key) REFERENCES users(user_key) ON DELETE CASCADE
);
-- 4. 索引
CREATE INDEX IF NOT EXISTS idx_user_subs_key ON user_subscriptions(user_key);
CREATE INDEX IF NOT EXISTS idx_keep_cid ON keep(cid);
CREATE INDEX IF NOT EXISTS idx_history_user_cid ON history(user_key, cid);
CREATE INDEX IF NOT EXISTS idx_history_user_name ON history(user_key, vodName);
CREATE INDEX IF NOT EXISTS idx_history_time ON history(createTime);
CREATE INDEX IF NOT EXISTS idx_search_history_user_time ON search_history(user_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_key ON user_subscriptions(user_key);