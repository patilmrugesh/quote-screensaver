import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const defaultPath = process.env.VERCEL
    ? path.join("/tmp", "screensaver.db")
    : path.join(process.cwd(), "data", "screensaver.db");

  const dbPath = process.env.DATABASE_PATH || defaultPath;
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);

  // Enable foreign keys and WAL mode for high concurrency
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  // Initialize all tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      target_metric TEXT,
      current_streak INTEGER NOT NULL DEFAULT 0,
      best_streak INTEGER NOT NULL DEFAULT 0,
      completed_dates TEXT NOT NULL DEFAULT '[]',
      quit_start_date TEXT,
      resisted_urges INTEGER NOT NULL DEFAULT 0,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL,
      estimated_pomodoros INTEGER NOT NULL DEFAULT 1,
      completed_pomodoros INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      due_date TEXT,
      created_at INTEGER NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      mode TEXT NOT NULL,
      task_name TEXT NOT NULL,
      completed_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pomodoro_gamification (
      user_id TEXT PRIMARY KEY,
      total_focus_minutes INTEGER NOT NULL DEFAULT 0,
      streak_days INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT,
      level INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      unlocked_badges TEXT NOT NULL DEFAULT '[]',
      completed_pomodoros INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quote_id INTEGER NOT NULL,
      quote_text TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT,
      saved_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      settings_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      parent_goal_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      level TEXT NOT NULL,
      importance TEXT NOT NULL,
      timing TEXT NOT NULL,
      target_value REAL NOT NULL,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      recurrence TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_goal_id) REFERENCES goals(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS goal_instances (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      period_key TEXT NOT NULL,
      target_value REAL NOT NULL,
      actual_value REAL NOT NULL,
      completion_percentage REAL NOT NULL,
      earned_points REAL NOT NULL,
      possible_points REAL NOT NULL,
      status TEXT NOT NULL,
      rollover_action TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(goal_id, period_key)
    );

    CREATE TABLE IF NOT EXISTS goal_reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      period_type TEXT NOT NULL,
      period_key TEXT NOT NULL,
      daily_execution_score REAL NOT NULL,
      outcome_score REAL NOT NULL,
      overall_score REAL NOT NULL,
      reflection TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, period_type, period_key)
    );

    CREATE TABLE IF NOT EXISTS goal_recovery_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      week_key TEXT NOT NULL,
      source_instance_id TEXT NOT NULL,
      recovery_date TEXT NOT NULL,
      target_value REAL NOT NULL,
      actual_value REAL NOT NULL,
      capacity_minutes INTEGER NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user ON pomodoro_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
    CREATE INDEX IF NOT EXISTS idx_goals_level ON goals(level);
    CREATE INDEX IF NOT EXISTS idx_goal_instances_user_period ON goal_instances(user_id, period_key);
    CREATE INDEX IF NOT EXISTS idx_goal_reviews_user ON goal_reviews(user_id, period_key);
    CREATE INDEX IF NOT EXISTS idx_goal_recovery_user ON goal_recovery_plans(user_id, week_key);
  `);

  dbInstance = db;
  return dbInstance;
}
