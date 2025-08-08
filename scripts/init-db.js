const { initializeDatabase } = require('../lib/database')

console.log('Initializing SQLite database...')
try {
  initializeDatabase()
  console.log('Database initialized successfully!')
} catch (error) {
  console.error('Error initializing database:', error)
  process.exit(1)
}
