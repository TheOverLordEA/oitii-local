// Local SQLite storage for tracking user applications
import Database from 'better-sqlite3';

export class JobTracker {
    private db: Database.Database;

    constructor(dbPath: string) {
        this.db = new Database(dbPath);
        this.initDb();
    }

    private initDb() {
        // AI Editor: Write SQL to create 'applications' table 
        // Schema: id (TEXT), job_id (TEXT), status (TEXT), applied_at (DATETIME)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                job_id TEXT NOT NULL,
                status TEXT NOT NULL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    async logApplication(jobId: string, status: string): Promise<void> {
        const stmt = this.db.prepare('INSERT INTO applications (id, job_id, status) VALUES (?, ?, ?)');
        // AI Editor: Generate a UUID for the id and execute the statement
    }
}