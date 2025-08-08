#!/usr/bin/env python3
"""
Tedris2 - Python Flask Application
Educational platform for Mauritania
"""

from app import app, init_database

if __name__ == '__main__':
    # Initialize database on startup
    init_database()
    
    # Run the application
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )
