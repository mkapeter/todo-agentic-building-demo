/**
 * User model for database operations
 */

import { Database } from './Database';
import { User, UserCreate } from '../types';
import bcrypt from 'bcryptjs';

export class UserModel {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Create a new user with hashed password
   */
  async create(userData: UserCreate): Promise<User> {
    const { email, password, name } = userData;
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO users (email, password, name)
        VALUES (?, ?, ?)
      `;
      
      this.db.getDatabase().run(sql, [email, hashedPassword, name], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Get the created user
        const userId = this.lastID;
        const selectSql = 'SELECT * FROM users WHERE id = ?';
        
        this.db.getDatabase().get(selectSql, [userId], (err, row: User) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        });
      }.bind(this));
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      
      this.db.getDatabase().get(sql, [email], (err, row: User) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      
      this.db.getDatabase().get(sql, [id], (err, row: User) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  /**
   * Update user information
   */
  async update(id: number, updates: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    const fields = [];
    const values = [];

    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.password) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(updates.password, saltRounds);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    return new Promise((resolve, reject) => {
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      
      this.db.getDatabase().run(sql, values, function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Get the updated user
        const selectSql = 'SELECT * FROM users WHERE id = ?';
        this.db.getDatabase().get(selectSql, [id], (err, row: User) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row || null);
        });
      });
    });
  }

  /**
   * Delete user
   */
  async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM users WHERE id = ?';
      
      this.db.getDatabase().run(sql, [id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }
}