#!/usr/bin/env python3
"""
Tedris2 - Python Flask Application
Educational platform for Mauritania
"""

import os
from app import app, init_database

if __name__ == '__main__':
    # Initialize database on startup
    init_database()
    
    # Get configuration from environment variables
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    # Run the application
    app.run(
        debug=debug,
        host=host,
        port=port
    )
