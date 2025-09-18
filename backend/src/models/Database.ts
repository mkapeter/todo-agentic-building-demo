/**
 * Database connection and initialization
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

export class Database {
  private db: sqlite3.Database;
  private dbPath: string;

  constructor(dbPath: string = './database/todo.db') {
    this.dbPath = path.resolve(dbPath);
    this.ensureDatabaseDirectory();
    this.db = new sqlite3.Database(this.dbPath);
    this.initializeTables();
  }

  private ensureDatabaseDirectory(): void {
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  private initializeTables(): void {
    // Create users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create todos table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)`);
  }

  getDatabase(): sqlite3.Database {
    return this.db;
  }

  close(): void {
    this.db.close();
  }
}