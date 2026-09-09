import { getDb } from "./index";
import { hashPassword } from "./auth";
import type { TaskItem, HabitItem, HabitType, HabitCategory } from "../todoHabitTypes";
import type { PomodoroSession, GamificationProfile } from "../pomodoroTypes";
import type { Quote, CustomizationSettings } from "../types";
import type {
  Goal,
  GoalInstance,
  GoalReview,
  GoalRecoveryPlan,
  GoalLevel,
  GoalImportance,
  GoalTiming,
  GoalCategory,
  GoalRecurrence,
  GoalStatus,
  GoalInstanceStatus,
  RolloverAction,
} from "../goalTypes";

export interface DbUser {
  id: string;
  username: string;
  email: string;
  created_at: number;
}

export const Repository = {
  // --- USER METHODS ---

  createUser(username: string, email: string, passwordPlain: string): DbUser {
    const db = getDb();
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { hash, salt } = hashPassword(passwordPlain);
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, salt, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, username.toLowerCase().trim(), email.toLowerCase().trim(), hash, salt, now);

    return { id, username: username.toLowerCase().trim(), email: email.toLowerCase().trim(), created_at: now };
  },

  findUserByUsernameOrEmail(identifier: string): {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    salt: string;
    created_at: number;
  } | null {
    const db = getDb();
    const cleanId = identifier.toLowerCase().trim();
    const stmt = db.prepare(`
      SELECT * FROM users
      WHERE username = ? OR email = ?
    `);
    const row = stmt.get(cleanId, cleanId) as {
      id: string;
      username: string;
      email: string;
      password_hash: string;
      salt: string;
      created_at: number;
    } | undefined;

    return row ?? null;
  },

  getUserById(id: string): DbUser | null {
    const db = getDb();
    const stmt = db.prepare("SELECT id, username, email, created_at FROM users WHERE id = ?");
    const row = stmt.get(id) as DbUser | undefined;
    return row ?? null;
  },

  // --- HABITS METHODS ---

  getHabits(userId: string): HabitItem[] {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC
    `);
    const rows = stmt.all(userId) as Array<{
      id: string;
      user_id: string;
      name: string;
      category: string;
      type: string;
      target_metric: string | null;
      current_streak: number;
      best_streak: number;
      completed_dates: string;
      quit_start_date: string | null;
      resisted_urges: number;
      color: string;
      icon: string;
    }>;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category as HabitCategory,
      type: r.type as HabitType,
      targetMetric: r.target_metric ?? undefined,
      currentStreak: r.current_streak,
      bestStreak: r.best_streak,
      completedDates: JSON.parse(r.completed_dates || "[]") as string[],
      quitStartDate: r.quit_start_date ?? undefined,
      resistedUrges: r.resisted_urges,
      color: r.color,
      icon: r.icon,
    }));
  },

  upsertHabit(userId: string, habit: HabitItem): void {
    const db = getDb();
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO habits (
        id, user_id, name, category, type, target_metric,
        current_streak, best_streak, completed_dates, quit_start_date,
        resisted_urges, color, icon, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        type = excluded.type,
        target_metric = excluded.target_metric,
        current_streak = excluded.current_streak,
        best_streak = excluded.best_streak,
        completed_dates = excluded.completed_dates,
        quit_start_date = excluded.quit_start_date,
        resisted_urges = excluded.resisted_urges,
        color = excluded.color,
        icon = excluded.icon,
        updated_at = excluded.updated_at
    `);
    stmt.run(
      habit.id,
      userId,
      habit.name,
      habit.category,
      habit.type,
      habit.targetMetric ?? null,
      habit.currentStreak,
      habit.bestStreak,
      JSON.stringify(habit.completedDates || []),
      habit.quitStartDate ?? null,
      habit.resistedUrges ?? 0,
      habit.color,
      habit.icon,
      now,
      now
    );
  },

  deleteHabit(userId: string, habitId: string): void {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM habits WHERE id = ? AND user_id = ?");
    stmt.run(habitId, userId);
  },

  // --- TASKS METHODS ---

  getTasks(userId: string): TaskItem[] {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId) as Array<{
      id: string;
      user_id: string;
      title: string;
      completed: number;
      priority: string;
      estimated_pomodoros: number;
      completed_pomodoros: number;
      category: string | null;
      due_date: string | null;
      created_at: number;
      completed_at: number | null;
    }>;

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      completed: Boolean(r.completed),
      priority: r.priority as TaskItem["priority"],
      estimatedPomodoros: r.estimated_pomodoros,
      completedPomodoros: r.completed_pomodoros,
      category: r.category ?? undefined,
      dueDate: r.due_date ?? undefined,
      createdAt: r.created_at,
      completedAt: r.completed_at ?? undefined,
    }));
  },

  upsertTask(userId: string, task: TaskItem): void {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO tasks (
        id, user_id, title, completed, priority,
        estimated_pomodoros, completed_pomodoros, category,
        due_date, created_at, completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        completed = excluded.completed,
        priority = excluded.priority,
        estimated_pomodoros = excluded.estimated_pomodoros,
        completed_pomodoros = excluded.completed_pomodoros,
        category = excluded.category,
        due_date = excluded.due_date,
        completed_at = excluded.completed_at
    `);
    stmt.run(
      task.id,
      userId,
      task.title,
      task.completed ? 1 : 0,
      task.priority,
      task.estimatedPomodoros,
      task.completedPomodoros,
      task.category ?? null,
      task.dueDate ?? null,
      task.createdAt || Date.now(),
      task.completedAt ?? null
    );
  },

  deleteTask(userId: string, taskId: string): void {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
    stmt.run(taskId, userId);
  },

  // --- POMODORO SESSIONS & GAMIFICATION ---

  getPomodoroSessions(userId: string, limit = 50): PomodoroSession[] {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM pomodoro_sessions
      WHERE user_id = ?
      ORDER BY completed_at DESC
      LIMIT ?
    `);
    const rows = stmt.all(userId, limit) as Array<{
      id: string;
      duration_minutes: number;
      mode: string;
      task_name: string;
      completed_at: number;
    }>;

    return rows.map((r) => ({
      id: r.id,
      timestamp: r.completed_at,
      durationMinutes: r.duration_minutes,
      mode: r.mode as PomodoroSession["mode"],
      taskName: r.task_name,
    }));
  },

  addPomodoroSession(userId: string, session: PomodoroSession): void {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO pomodoro_sessions (id, user_id, duration_minutes, mode, task_name, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      session.id,
      userId,
      session.durationMinutes,
      session.mode,
      session.taskName || "",
      session.timestamp
    );
  },

  getGamification(userId: string): GamificationProfile | null {
    const db = getDb();
    const stmt = db.prepare("SELECT * FROM pomodoro_gamification WHERE user_id = ?");
    const row = stmt.get(userId) as {
      total_focus_minutes: number;
      streak_days: number;
      last_active_date: string | null;
      level: number;
      xp: number;
      unlocked_badges: string;
      completed_pomodoros: number;
    } | undefined;

    if (!row) return null;

    let parsedBadges: Record<string, number> = {};
    try {
      parsedBadges = JSON.parse(row.unlocked_badges || "{}");
    } catch {
      parsedBadges = {};
    }

    return {
      totalMinutesFocused: row.total_focus_minutes,
      totalPomodorosCompleted: row.completed_pomodoros,
      totalXP: row.xp,
      currentLevel: row.level,
      levelTitle: "", // client calculates title
      streakDays: row.streak_days,
      lastActiveDate: row.last_active_date || "",
      badges: parsedBadges,
    };
  },

  saveGamification(userId: string, gamification: GamificationProfile): void {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO pomodoro_gamification (
        user_id, total_focus_minutes, streak_days, last_active_date,
        level, xp, unlocked_badges, completed_pomodoros
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        total_focus_minutes = excluded.total_focus_minutes,
        streak_days = excluded.streak_days,
        last_active_date = excluded.last_active_date,
        level = excluded.level,
        xp = excluded.xp,
        unlocked_badges = excluded.unlocked_badges,
        completed_pomodoros = excluded.completed_pomodoros
    `);
    stmt.run(
      userId,
      gamification.totalMinutesFocused,
      gamification.streakDays,
      gamification.lastActiveDate,
      gamification.currentLevel,
      gamification.totalXP,
      JSON.stringify(gamification.badges || {}),
      gamification.totalPomodorosCompleted
    );
  },

  // --- FAVORITES METHODS ---

  getFavorites(userId: string): Quote[] {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT quote_id, quote_text, author, category FROM favorites
      WHERE user_id = ?
      ORDER BY saved_at DESC
    `);
    const rows = stmt.all(userId) as Array<{
      quote_id: number;
      quote_text: string;
      author: string;
      category: string | null;
    }>;

    return rows.map((r) => ({
      id: r.quote_id,
      text: r.quote_text,
      author: r.author,
      category: r.category ?? undefined,
    }));
  },

  saveFavorites(userId: string, favorites: Quote[]): void {
    const db = getDb();
    const now = Date.now();
    db.exec("BEGIN TRANSACTION;");
    try {
      db.prepare("DELETE FROM favorites WHERE user_id = ?").run(userId);
      const stmt = db.prepare(`
        INSERT INTO favorites (id, user_id, quote_id, quote_text, author, category, saved_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const q of favorites) {
        stmt.run(
          `fav_${userId}_${q.id}`,
          userId,
          q.id,
          q.text,
          q.author,
          q.category ?? null,
          now
        );
      }
      db.exec("COMMIT;");
    } catch (err) {
      db.exec("ROLLBACK;");
      throw err;
    }
  },

  // --- USER SETTINGS ---

  getUserSettings(userId: string): CustomizationSettings | null {
    const db = getDb();
    const stmt = db.prepare("SELECT settings_json FROM user_settings WHERE user_id = ?");
    const row = stmt.get(userId) as { settings_json: string } | undefined;
    if (!row) return null;
    try {
      return JSON.parse(row.settings_json) as CustomizationSettings;
    } catch {
      return null;
    }
  },

  saveUserSettings(userId: string, settings: CustomizationSettings): void {
    const db = getDb();
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO user_settings (user_id, settings_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        settings_json = excluded.settings_json,
        updated_at = excluded.updated_at
    `);
    stmt.run(userId, JSON.stringify(settings), now);
  },

  // --- GOALS METHODS ---

  getGoals(userId: string, level?: GoalLevel): Goal[] {
    const db = getDb();
    let query = "SELECT * FROM goals WHERE user_id = ?";
    const params: (string | number)[] = [userId];
    if (level) {
      query += " AND level = ?";
      params.push(level);
    }
    query += " ORDER BY created_at ASC";
    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as Array<{
      id: string;
      user_id: string;
      parent_goal_id: string | null;
      name: string;
      description: string | null;
      level: string;
      importance: string;
      timing: string;
      target_value: number;
      unit: string;
      category: string;
      recurrence: string;
      status: string;
      created_at: number;
      updated_at: number;
    }>;

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      parentGoalId: r.parent_goal_id ?? undefined,
      name: r.name,
      description: r.description ?? undefined,
      level: r.level as GoalLevel,
      importance: r.importance as GoalImportance,
      timing: r.timing as GoalTiming,
      targetValue: r.target_value,
      unit: r.unit,
      category: r.category as GoalCategory,
      recurrence: r.recurrence as GoalRecurrence,
      status: r.status as GoalStatus,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  getGoalById(userId: string, goalId: string): Goal | null {
    const db = getDb();
    const stmt = db.prepare("SELECT * FROM goals WHERE id = ? AND user_id = ?");
    const r = stmt.get(goalId, userId) as {
      id: string;
      user_id: string;
      parent_goal_id: string | null;
      name: string;
      description: string | null;
      level: string;
      importance: string;
      timing: string;
      target_value: number;
      unit: string;
      category: string;
      recurrence: string;
      status: string;
      created_at: number;
      updated_at: number;
    } | undefined;

    if (!r) return null;
    return {
      id: r.id,
      userId: r.user_id,
      parentGoalId: r.parent_goal_id ?? undefined,
      name: r.name,
      description: r.description ?? undefined,
      level: r.level as GoalLevel,
      importance: r.importance as GoalImportance,
      timing: r.timing as GoalTiming,
      targetValue: r.target_value,
      unit: r.unit,
      category: r.category as GoalCategory,
      recurrence: r.recurrence as GoalRecurrence,
      status: r.status as GoalStatus,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  upsertGoal(userId: string, goal: Goal): Goal {
    const db = getDb();
    const now = Date.now();
    const goalId = goal.id || `goal_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = goal.createdAt || now;
    const updatedAt = now;

    const stmt = db.prepare(`
      INSERT INTO goals (
        id, user_id, parent_goal_id, name, description,
        level, importance, timing, target_value, unit,
        category, recurrence, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        parent_goal_id = excluded.parent_goal_id,
        name = excluded.name,
        description = excluded.description,
        level = excluded.level,
        importance = excluded.importance,
        timing = excluded.timing,
        target_value = excluded.target_value,
        unit = excluded.unit,
        category = excluded.category,
        recurrence = excluded.recurrence,
        status = excluded.status,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      goalId,
      userId,
      goal.parentGoalId || null,
      goal.name,
      goal.description || null,
      goal.level,
      goal.importance,
      goal.timing,
      goal.targetValue,
      goal.unit,
      goal.category,
      goal.recurrence,
      goal.status,
      createdAt,
      updatedAt
    );

    return {
      ...goal,
      id: goalId,
      userId,
      createdAt,
      updatedAt,
    };
  },

  deleteGoal(userId: string, goalId: string): boolean {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM goals WHERE id = ? AND user_id = ?");
    const result = stmt.run(goalId, userId);
    return Number(result.changes) > 0;
  },

  // --- GOAL INSTANCES ---

  getGoalInstances(userId: string, periodKey?: string): GoalInstance[] {
    const db = getDb();
    let query = "SELECT * FROM goal_instances WHERE user_id = ?";
    const params: (string | number)[] = [userId];
    if (periodKey) {
      query += " AND period_key = ?";
      params.push(periodKey);
    }
    query += " ORDER BY period_key DESC, created_at ASC";
    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as Array<{
      id: string;
      goal_id: string;
      user_id: string;
      period_key: string;
      target_value: number;
      actual_value: number;
      completion_percentage: number;
      earned_points: number;
      possible_points: number;
      status: string;
      rollover_action: string | null;
      created_at: number;
      updated_at: number;
    }>;

    return rows.map((r) => ({
      id: r.id,
      goalId: r.goal_id,
      userId: r.user_id,
      periodKey: r.period_key,
      targetValue: r.target_value,
      actualValue: r.actual_value,
      completionPercentage: r.completion_percentage,
      earnedPoints: r.earned_points,
      possiblePoints: r.possible_points,
      status: r.status as GoalInstanceStatus,
      rolloverAction: (r.rollover_action as RolloverAction) ?? undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  getGoalInstance(userId: string, goalId: string, periodKey: string): GoalInstance | null {
    const db = getDb();
    const stmt = db.prepare("SELECT * FROM goal_instances WHERE user_id = ? AND goal_id = ? AND period_key = ?");
    const r = stmt.get(userId, goalId, periodKey) as {
      id: string;
      goal_id: string;
      user_id: string;
      period_key: string;
      target_value: number;
      actual_value: number;
      completion_percentage: number;
      earned_points: number;
      possible_points: number;
      status: string;
      rollover_action: string | null;
      created_at: number;
      updated_at: number;
    } | undefined;

    if (!r) return null;
    return {
      id: r.id,
      goalId: r.goal_id,
      userId: r.user_id,
      periodKey: r.period_key,
      targetValue: r.target_value,
      actualValue: r.actual_value,
      completionPercentage: r.completion_percentage,
      earnedPoints: r.earned_points,
      possiblePoints: r.possible_points,
      status: r.status as GoalInstanceStatus,
      rolloverAction: (r.rollover_action as RolloverAction) ?? undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  upsertGoalInstance(userId: string, inst: GoalInstance): GoalInstance {
    const db = getDb();
    const now = Date.now();
    const id = inst.id || `ginst_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = inst.createdAt || now;
    const updatedAt = now;

    const stmt = db.prepare(`
      INSERT INTO goal_instances (
        id, goal_id, user_id, period_key, target_value, actual_value,
        completion_percentage, earned_points, possible_points, status,
        rollover_action, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(goal_id, period_key) DO UPDATE SET
        target_value = excluded.target_value,
        actual_value = excluded.actual_value,
        completion_percentage = excluded.completion_percentage,
        earned_points = excluded.earned_points,
        possible_points = excluded.possible_points,
        status = excluded.status,
        rollover_action = excluded.rollover_action,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      id,
      inst.goalId,
      userId,
      inst.periodKey,
      inst.targetValue,
      inst.actualValue,
      inst.completionPercentage,
      inst.earnedPoints,
      inst.possiblePoints,
      inst.status,
      inst.rolloverAction || null,
      createdAt,
      updatedAt
    );

    return {
      ...inst,
      id,
      userId,
      createdAt,
      updatedAt,
    };
  },

  // --- GOAL REVIEWS ---

  getGoalReviews(userId: string, periodType?: "weekly" | "monthly"): GoalReview[] {
    const db = getDb();
    let query = "SELECT * FROM goal_reviews WHERE user_id = ?";
    const params: (string | number)[] = [userId];
    if (periodType) {
      query += " AND period_type = ?";
      params.push(periodType);
    }
    query += " ORDER BY period_key DESC";
    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as Array<{
      id: string;
      user_id: string;
      period_type: string;
      period_key: string;
      daily_execution_score: number;
      outcome_score: number;
      overall_score: number;
      reflection: string | null;
      created_at: number;
    }>;

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      periodType: r.period_type as "weekly" | "monthly",
      periodKey: r.period_key,
      dailyExecutionScore: r.daily_execution_score,
      outcomeScore: r.outcome_score,
      overallScore: r.overall_score,
      reflection: r.reflection ?? undefined,
      createdAt: r.created_at,
    }));
  },

  saveGoalReview(userId: string, review: GoalReview): GoalReview {
    const db = getDb();
    const id = review.id || `grev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = review.createdAt || Date.now();

    const stmt = db.prepare(`
      INSERT INTO goal_reviews (
        id, user_id, period_type, period_key,
        daily_execution_score, outcome_score, overall_score,
        reflection, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, period_type, period_key) DO UPDATE SET
        daily_execution_score = excluded.daily_execution_score,
        outcome_score = excluded.outcome_score,
        overall_score = excluded.overall_score,
        reflection = excluded.reflection
    `);

    stmt.run(
      id,
      userId,
      review.periodType,
      review.periodKey,
      review.dailyExecutionScore,
      review.outcomeScore,
      review.overallScore,
      review.reflection || null,
      createdAt
    );

    return { ...review, id, userId, createdAt };
  },

  // --- GOAL RECOVERY PLANS ---

  getGoalRecoveryPlans(userId: string, weekKey?: string): GoalRecoveryPlan[] {
    const db = getDb();
    let query = "SELECT * FROM goal_recovery_plans WHERE user_id = ?";
    const params: (string | number)[] = [userId];
    if (weekKey) {
      query += " AND week_key = ?";
      params.push(weekKey);
    }
    query += " ORDER BY created_at DESC";
    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as Array<{
      id: string;
      user_id: string;
      week_key: string;
      source_instance_id: string;
      recovery_date: string;
      target_value: number;
      actual_value: number;
      capacity_minutes: number;
      priority: string;
      status: string;
      created_at: number;
    }>;

    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      weekKey: r.week_key,
      sourceInstanceId: r.source_instance_id,
      recoveryDate: r.recovery_date,
      targetValue: r.target_value,
      actualValue: r.actual_value,
      capacityMinutes: r.capacity_minutes,
      priority: r.priority as "critical" | "recommended" | "optional",
      status: r.status as "planned" | "in_progress" | "completed" | "cancelled",
      createdAt: r.created_at,
    }));
  },

  saveGoalRecoveryPlan(userId: string, plan: GoalRecoveryPlan): GoalRecoveryPlan {
    const db = getDb();
    const id = plan.id || `grec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = plan.createdAt || Date.now();

    const stmt = db.prepare(`
      INSERT INTO goal_recovery_plans (
        id, user_id, week_key, source_instance_id, recovery_date,
        target_value, actual_value, capacity_minutes, priority, status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        actual_value = excluded.actual_value,
        status = excluded.status
    `);

    stmt.run(
      id,
      userId,
      plan.weekKey,
      plan.sourceInstanceId,
      plan.recoveryDate,
      plan.targetValue,
      plan.actualValue,
      plan.capacityMinutes,
      plan.priority,
      plan.status,
      createdAt
    );

    return { ...plan, id, userId, createdAt };
  },

  // --- 2-WAY SYNC BATCH METHOD ---

  syncAllUserData(
    userId: string,
    clientData: {
      habits?: HabitItem[];
      tasks?: TaskItem[];
      sessions?: PomodoroSession[];
      gamification?: GamificationProfile;
      favorites?: Quote[];
      settings?: CustomizationSettings;
      goals?: Goal[];
      goalInstances?: GoalInstance[];
      goalReviews?: GoalReview[];
      goalRecoveryPlans?: GoalRecoveryPlan[];
    }
  ) {
    // 1. Sync habits (merge client with server, keeping union by id)
    if (clientData.habits && clientData.habits.length > 0) {
      for (const h of clientData.habits) {
        this.upsertHabit(userId, h);
      }
    }
    const mergedHabits = this.getHabits(userId);

    // 2. Sync tasks
    if (clientData.tasks && clientData.tasks.length > 0) {
      for (const t of clientData.tasks) {
        this.upsertTask(userId, t);
      }
    }
    const mergedTasks = this.getTasks(userId);

    // 3. Sync pomodoro sessions
    if (clientData.sessions && clientData.sessions.length > 0) {
      for (const s of clientData.sessions) {
        this.addPomodoroSession(userId, s);
      }
    }
    const mergedSessions = this.getPomodoroSessions(userId);

    // 4. Sync gamification (take higher XP/minutes)
    const serverGamification = this.getGamification(userId);
    let finalGamification = serverGamification;
    if (clientData.gamification) {
      if (!serverGamification || clientData.gamification.totalXP >= serverGamification.totalXP) {
        this.saveGamification(userId, clientData.gamification);
        finalGamification = clientData.gamification;
      }
    }

    // 5. Sync favorites
    if (clientData.favorites && clientData.favorites.length > 0) {
      const serverFavs = this.getFavorites(userId);
      const favMap = new Map<number, Quote>();
      for (const f of serverFavs) favMap.set(f.id, f);
      for (const f of clientData.favorites) favMap.set(f.id, f);
      const combined = Array.from(favMap.values());
      this.saveFavorites(userId, combined);
    }
    const mergedFavorites = this.getFavorites(userId);

    // 6. Settings
    if (clientData.settings) {
      this.saveUserSettings(userId, clientData.settings);
    }
    const mergedSettings = this.getUserSettings(userId);

    // 7. Goals
    if (clientData.goals && clientData.goals.length > 0) {
      for (const g of clientData.goals) {
        this.upsertGoal(userId, g);
      }
    }
    const mergedGoals = this.getGoals(userId);

    // 8. Goal Instances
    if (clientData.goalInstances && clientData.goalInstances.length > 0) {
      for (const gi of clientData.goalInstances) {
        this.upsertGoalInstance(userId, gi);
      }
    }
    const mergedGoalInstances = this.getGoalInstances(userId);

    // 9. Goal Reviews
    if (clientData.goalReviews && clientData.goalReviews.length > 0) {
      for (const gr of clientData.goalReviews) {
        this.saveGoalReview(userId, gr);
      }
    }
    const mergedGoalReviews = this.getGoalReviews(userId);

    // 10. Goal Recovery Plans
    if (clientData.goalRecoveryPlans && clientData.goalRecoveryPlans.length > 0) {
      for (const rp of clientData.goalRecoveryPlans) {
        this.saveGoalRecoveryPlan(userId, rp);
      }
    }
    const mergedRecoveryPlans = this.getGoalRecoveryPlans(userId);

    return {
      habits: mergedHabits,
      tasks: mergedTasks,
      sessions: mergedSessions,
      gamification: finalGamification,
      favorites: mergedFavorites,
      settings: mergedSettings,
      goals: mergedGoals,
      goalInstances: mergedGoalInstances,
      goalReviews: mergedGoalReviews,
      goalRecoveryPlans: mergedRecoveryPlans,
    };
  },
};
