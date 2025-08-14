from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
import re
from datetime import datetime, timedelta
import secrets
import requests
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-here')

def get_db_connection():
    conn = sqlite3.connect('tedris.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    
    # Create users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            nni TEXT UNIQUE NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            user_category TEXT NOT NULL,
            wilaya TEXT NOT NULL,
            moughataa TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_online BOOLEAN DEFAULT FALSE,
            last_seen TIMESTAMP
        )
    ''')
    
    # Create conversations table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id INTEGER NOT NULL,
            user2_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user1_id) REFERENCES users (id),
            FOREIGN KEY (user2_id) REFERENCES users (id),
            UNIQUE(user1_id, user2_id)
        )
    ''')
    
    # Create messages table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (conversation_id) REFERENCES conversations (id),
            FOREIGN KEY (sender_id) REFERENCES users (id)
        )
    ''')
    
    # Create game_questions table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS game_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            question_ar TEXT NOT NULL,
            question_fr TEXT NOT NULL,
            answer_ar TEXT NOT NULL,
            answer_fr TEXT NOT NULL,
            explanation_ar TEXT,
            explanation_fr TEXT,
            difficulty INTEGER DEFAULT 1,
            points INTEGER DEFAULT 100,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create game_sessions table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS game_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            game_type TEXT NOT NULL,
            language_mode TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            questions_answered INTEGER DEFAULT 0,
            correct_answers INTEGER DEFAULT 0,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Mauritanian Wilayas and Moughataas
WILAYAS_MOUGHATAAS = {
    'نواكشوط الشمالية': ['تفرغ زينة', 'دار النعيم', 'توجونين'],
    'نواكشوط الغربية': ['كرفور', 'تيارت', 'الميناء'],
    'نواكشوط الجنوبية': ['الرياض', 'عرفات', 'الخير'],
    'الحوض الشرقي': ['النعمة', 'الباسكنو', 'فصاله', 'أمجريه الجديدة'],
    'الحوض الغربي': ['العيون', 'تمبدغه', 'كوبني', 'بوتلميت'],
    'العصابة': ['كيفه', 'العصابة', 'بركيول', 'قورو'],
    'كوركول': ['سيلبابي', 'مبوت', 'يارل', 'فولو فولبه'],
    'البراكنة': ['ألاك', 'بوكي', 'مال', 'مقطع لحجار', 'أفديرك'],
    'الترارزة': ['روصو', 'المذرذرة', 'بوتيليميت', 'كور ماصين'],
    'آدرار': ['أطار', 'شنقيط', 'وادان', 'أوجفت'],
    'داخلت نواديبو': ['نواديبو'],
    'تكانت': ['تيجكجه', 'تامشكط', 'بومديد', 'كنكوصه'],
    'كيدي ماغا': ['كيدي ماغا', 'جعوار', 'كوبني', 'نيملان'],
    'إنشيري': ['أكجوجت', 'بنشاب', 'زويرات'],
    'تيرس زمور': ['بير أم كرين', 'الكليبه', 'زويرات']
}

USER_CATEGORIES = [
    'طالب',
    'معلم',
    'أستاذ',
    'مدير مدرسة',
    'مفتش تربوي',
    'إداري',
    'ولي أمر'
]

def validate_phone(phone):
    """Validate Mauritanian phone number (20000000-49999999)"""
    if not phone:
        return False
    # Remove any spaces or special characters
    phone = re.sub(r'[^\d]', '', phone)
    # Check if it's 8 digits and within the valid range
    if len(phone) == 8 and phone.isdigit():
        phone_int = int(phone)
        return 20000000 <= phone_int <= 49999999
    return False

def validate_nni(nni):
    """Validate NNI (numeric only)"""
    return nni and re.match(r'^\d+$', nni)

def update_user_online_status(user_id, is_online=True):
    """Update user's online status"""
    conn = get_db_connection()
    conn.execute(
        'UPDATE users SET is_online = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
        (is_online, user_id)
    )
    conn.commit()
    conn.close()

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        nni = request.form.get('nni', '').strip()
        phone = request.form.get('phone', '').strip()
        password = request.form.get('password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()
        user_category = request.form.get('user_category', '').strip()
        wilaya = request.form.get('wilaya', '').strip()
        moughataa = request.form.get('moughataa', '').strip()
        
        # Validation
        if not all([full_name, nni, phone, password, user_category, wilaya, moughataa]):
            flash('جميع الحقول مطلوبة', 'error')
            return render_template('register.html')
        
        if not validate_phone(phone):
            flash('رقم الهاتف غير صحيح (يجب أن يكون 8 أرقام وينتقل بين 20000000 و49999999)', 'error')
            return render_template('register.html')
        
        if not validate_nni(nni):
            flash('رقم البطاقة الوطنية غير صحيح (أرقام فقط)', 'error')
            return render_template('register.html')
        
        if len(password) < 6:
            flash('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error')
            return render_template('register.html')
        
        if password != confirm_password:
            flash('كلمات المرور غير متطابقة', 'error')
            return render_template('register.html')
        
        if user_category not in USER_CATEGORIES:
            flash('فئة المستخدم غير صحيحة', 'error')
            return render_template('register.html')
        
        if wilaya not in WILAYAS_MOUGHATAAS:
            flash('الولاية غير صحيحة', 'error')
            return render_template('register.html')
        
        if moughataa not in WILAYAS_MOUGHATAAS[wilaya]:
            flash('المقاطعة غير صحيحة', 'error')
            return render_template('register.html')
        
        # Check if user already exists
        conn = get_db_connection()
        existing_user = conn.execute(
            'SELECT id FROM users WHERE nni = ? OR phone = ?',
            (nni, phone)
        ).fetchone()
        
        if existing_user:
            flash('المستخدم موجود بالفعل (رقم البطاقة أو الهاتف مستخدم)', 'error')
            conn.close()
            return render_template('register.html')
        
        # Create user directly without verification
        password_hash = generate_password_hash(password)
        conn.execute('''
            INSERT INTO users (full_name, nni, phone, password_hash, user_category, wilaya, moughataa)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (full_name, nni, phone, password_hash, user_category, wilaya, moughataa))
        
        conn.commit()
        conn.close()
        
        flash('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        phone = request.form.get('phone', '').strip()
        new_password = request.form.get('new_password', '').strip()
        confirm_password = request.form.get('confirm_password', '').strip()
        
        if not validate_phone(phone):
            flash('رقم الهاتف غير صحيح', 'error')
            return render_template('forgot_password.html')
        
        if len(new_password) < 6:
            flash('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error')
            return render_template('forgot_password.html')
        
        if new_password != confirm_password:
            flash('كلمات المرور غير متطابقة', 'error')
            return render_template('forgot_password.html')
        
        # Check if user exists
        conn = get_db_connection()
        user = conn.execute('SELECT id FROM users WHERE phone = ?', (phone,)).fetchone()
        
        if not user:
            flash('لا يوجد حساب مرتبط بهذا الرقم', 'error')
            conn.close()
            return render_template('forgot_password.html')
        
        # Update password directly
        password_hash = generate_password_hash(new_password)
        conn.execute('UPDATE users SET password_hash = ? WHERE phone = ?', (password_hash, phone))
        conn.commit()
        conn.close()
        
        flash('تم تغيير كلمة المرور بنجاح!', 'success')
        return redirect(url_for('login'))
    
    return render_template('forgot_password.html')

@app.route('/reset-password')
def reset_password():
    """Reset password page"""
    phone = request.args.get('phone', '')
    return render_template('reset_password.html', phone=phone)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page"""
    if request.method == 'POST':
        phone = request.form.get('phone', '').strip()
        password = request.form.get('password', '').strip()
        
        if not validate_phone(phone):
            flash('رقم الهاتف غير صحيح', 'error')
            return render_template('login.html')
        
        if not password:
            flash('كلمة المرور مطلوبة', 'error')
            return render_template('login.html')
        
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE phone = ?',
            (phone,)
        ).fetchone()
        conn.close()
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['user_name'] = user['full_name']
            session['user_category'] = user['user_category']
            
            # Update online status
            update_user_online_status(user['id'], True)
            
            flash(f'مرحباً {user["full_name"]}', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('رقم الهاتف أو كلمة المرور غير صحيحة', 'error')
    
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    """User dashboard"""
    if 'user_id' not in session:
        flash('يجب تسجيل الدخول أولاً', 'error')
        return redirect(url_for('login'))
    
    return render_template('dashboard.html')

@app.route('/chat')
def chat():
    """Chat page"""
    if 'user_id' not in session:
        flash('يجب تسجيل الدخول أولاً', 'error')
        return redirect(url_for('login'))
    
    return render_template('chat.html')

@app.route('/admin')
def admin():
    """Admin dashboard"""
    if 'user_id' not in session:
        flash('يجب تسجيل الدخول أولاً', 'error')
        return redirect(url_for('login'))
    
    conn = get_db_connection()
    
    # Get statistics
    total_users = conn.execute('SELECT COUNT(*) FROM users').fetchone()[0]
    
    # Users by category
    categories = conn.execute('''
        SELECT user_category, COUNT(*) as count 
        FROM users 
        GROUP BY user_category
    ''').fetchall()
    
    # Recent registrations (last 7 days)
    recent_count = conn.execute('''
        SELECT COUNT(*) FROM users 
        WHERE created_at >= datetime('now', '-7 days')
    ''').fetchone()[0]
    
    # All users
    users = conn.execute('''
        SELECT * FROM users 
        ORDER BY created_at DESC 
        LIMIT 50
    ''').fetchall()
    
    conn.close()
    
    stats = {
        'total_users': total_users,
        'recent_registrations': recent_count,
        'categories': {cat['user_category']: cat['count'] for cat in categories}
    }
    
    return render_template('admin.html', stats=stats, users=users)

@app.route('/logout')
def logout():
    """Logout user"""
    if 'user_id' in session:
        update_user_online_status(session['user_id'], False)
    
    session.clear()
    flash('تم تسجيل الخروج بنجاح', 'success')
    return redirect(url_for('index'))

@app.route('/games')
def games():
    """Games menu page"""
    if 'user_id' not in session:
        flash('يجب تسجيل الدخول أولاً', 'error')
        return redirect(url_for('login'))
    
    return render_template('games.html')

@app.route('/games/math-jeopardy')
def math_jeopardy():
    """Math Jeopardy game page"""
    if 'user_id' not in session:
        flash('يجب تسجيل الدخول أولاً', 'error')
        return redirect(url_for('login'))
    
    return render_template('math_jeopardy.html')

@app.route('/api/users/search')
def search_users():
    """Search users for chat"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    query = request.args.get('q', '').strip()
    current_user_id = session['user_id']
    
    conn = get_db_connection()
    
    if query:
        users = conn.execute('''
            SELECT id, full_name, user_category, school, is_online, last_seen
            FROM users 
            WHERE id != ? AND is_verified = TRUE AND (
                full_name LIKE ? OR 
                phone LIKE ? OR 
                school LIKE ?
            )
            ORDER BY is_online DESC, full_name ASC
            LIMIT 20
        ''', (current_user_id, f'%{query}%', f'%{query}%', f'%{query}%')).fetchall()
    else:
        users = conn.execute('''
            SELECT id, full_name, user_category, school, is_online, last_seen
            FROM users 
            WHERE id != ? AND is_verified = TRUE
            ORDER BY is_online DESC, full_name ASC
            LIMIT 20
        ''', (current_user_id,)).fetchall()
    
    conn.close()
    
    return jsonify([{
        'id': user['id'],
        'name': user['full_name'],
        'category': user['user_category'],
        'school': user['school'],
        'is_online': bool(user['is_online']),
        'last_seen': user['last_seen']
    } for user in users])

@app.route('/api/conversations')
def get_conversations():
    """Get user's conversations"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    conn = get_db_connection()
    
    conversations = conn.execute('''
        SELECT 
            c.id,
            c.updated_at,
            u.id as other_user_id,
            u.full_name as other_user_name,
            u.user_category as other_user_category,
            u.is_online as other_user_online,
            m.content as last_message,
            m.sender_id as last_sender_id,
            m.created_at as last_message_time,
            (SELECT COUNT(*) FROM messages 
             WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE) as unread_count
        FROM conversations c
        JOIN users u ON (
            CASE 
                WHEN c.participant1_id = ? THEN u.id = c.participant2_id
                ELSE u.id = c.participant1_id
            END
        )
        LEFT JOIN messages m ON m.id = c.last_message_id
        WHERE c.participant1_id = ? OR c.participant2_id = ?
        ORDER BY c.updated_at DESC
    ''', (user_id, user_id, user_id, user_id)).fetchall()
    
    conn.close()
    
    return jsonify([{
        'id': conv['id'],
        'other_user': {
            'id': conv['other_user_id'],
            'name': conv['other_user_name'],
            'category': conv['other_user_category'],
            'is_online': bool(conv['other_user_online'])
        },
        'last_message': {
            'content': conv['last_message'] or '',
            'sender_id': conv['last_sender_id'],
            'time': conv['last_message_time']
        },
        'unread_count': conv['unread_count'],
        'updated_at': conv['updated_at']
    } for conv in conversations])

@app.route('/api/conversations/<int:conversation_id>/messages')
def get_messages(conversation_id):
    """Get messages for a conversation"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    conn = get_db_connection()
    
    # Verify user is part of this conversation
    conversation = conn.execute('''
        SELECT * FROM conversations 
        WHERE id = ? AND (participant1_id = ? OR participant2_id = ?)
    ''', (conversation_id, user_id, user_id)).fetchone()
    
    if not conversation:
        conn.close()
        return jsonify({'error': 'Conversation not found'}), 404
    
    # Get messages
    messages = conn.execute('''
        SELECT 
            m.id,
            m.content,
            m.sender_id,
            m.is_read,
            m.created_at,
            u.full_name as sender_name
        FROM messages m
        JOIN users u ON u.id = m.sender_id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
    ''', (conversation_id,)).fetchall()
    
    # Mark messages as read
    conn.execute('''
        UPDATE messages 
        SET is_read = TRUE 
        WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE
    ''', (conversation_id, user_id))
    
    conn.commit()
    conn.close()
    
    return jsonify([{
        'id': msg['id'],
        'content': msg['content'],
        'sender_id': msg['sender_id'],
        'sender_name': msg['sender_name'],
        'is_read': bool(msg['is_read']),
        'created_at': msg['created_at'],
        'is_mine': msg['sender_id'] == user_id
    } for msg in messages])

@app.route('/api/send-message', methods=['POST'])
def send_message():
    """Send a new message"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    user_id = session['user_id']
    recipient_id = data.get('recipient_id')
    content = data.get('content', '').strip()
    
    if not recipient_id or not content:
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db_connection()
    
    # Find or create conversation
    conversation = conn.execute('''
        SELECT id FROM conversations 
        WHERE (participant1_id = ? AND participant2_id = ?) 
           OR (participant1_id = ? AND participant2_id = ?)
    ''', (user_id, recipient_id, recipient_id, user_id)).fetchone()
    
    if not conversation:
        # Create new conversation
        cursor = conn.execute('''
            INSERT INTO conversations (participant1_id, participant2_id)
            VALUES (?, ?)
        ''', (min(user_id, recipient_id), max(user_id, recipient_id)))
        conversation_id = cursor.lastrowid
    else:
        conversation_id = conversation['id']
    
    # Insert message
    cursor = conn.execute('''
        INSERT INTO messages (conversation_id, sender_id, content)
        VALUES (?, ?, ?)
    ''', (conversation_id, user_id, content))
    message_id = cursor.lastrowid
    
    # Update conversation's last message
    conn.execute('''
        UPDATE conversations 
        SET last_message_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (message_id, conversation_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message_id': message_id,
        'conversation_id': conversation_id
    })

@app.route('/api/moughataas/<wilaya>')
def get_moughataas(wilaya):
    """API endpoint to get moughataas for a wilaya"""
    moughataas_data = {
        'nouakchott_north': [
            {'value': 'dar_naim', 'label_ar': 'دار النعيم', 'label_fr': 'Dar Naim'},
            {'value': 'toujounine', 'label_ar': 'توجونين', 'label_fr': 'Toujounine'}
        ],
        'nouakchott_south': [
            {'value': 'arafat', 'label_ar': 'عرفات', 'label_fr': 'Arafat'},
            {'value': 'sebkha', 'label_ar': 'السبخة', 'label_fr': 'Sebkha'}
        ],
        'trarza': [
            {'value': 'rosso', 'label_ar': 'روصو', 'label_fr': 'Rosso'},
            {'value': 'mederdra', 'label_ar': 'مدردرة', 'label_fr': 'Mederdra'}
        ],
        'adrar': [
            {'value': 'atar', 'label_ar': 'أطار', 'label_fr': 'Atar'},
            {'value': 'chinguetti', 'label_ar': 'شنقيط', 'label_fr': 'Chinguetti'}
        ]
    }
    
    return jsonify(moughataas_data.get(wilaya, []))

@app.route('/api/schools')
def get_schools():
    """API endpoint to get schools"""
    conn = get_db_connection()
    schools = conn.execute('SELECT name FROM schools WHERE is_active = 1 ORDER BY name').fetchall()
    conn.close()
    
    return jsonify([{'value': school['name'], 'label': school['name']} for school in schools])

@app.route('/api/games/math-jeopardy/start', methods=['POST'])
def start_math_jeopardy():
    """Start a new Math Jeopardy game session"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    language_mode = data.get('language_mode', 'arabic')  # 'arabic', 'french', or 'mixed'
    
    user_id = session['user_id']
    conn = get_db_connection()
    
    # Create new game session
    cursor = conn.execute('''
        INSERT INTO game_sessions (user_id, game_type, language_mode)
        VALUES (?, ?, ?)
    ''', (user_id, 'math_jeopardy', language_mode))
    
    session_id = cursor.lastrowid
    
    # Get questions organized by category and points
    questions = conn.execute('''
        SELECT id, category, points, question_ar, question_fr, difficulty_level
        FROM math_jeopardy_questions
        ORDER BY category, points
    ''').fetchall()
    
    conn.close()
    
    # Organize questions into board format
    board = {}
    for question in questions:
        category = question['category']
        if category not in board:
            board[category] = {}
        
        # Choose question text based on language mode
        if language_mode == 'french':
            question_text = question['question_fr']
        else:
            question_text = question['question_ar']
        
        board[category][question['points']] = {
            'id': question['id'],
            'question': question_text,
            'answered': False
        }
    
    return jsonify({
        'session_id': session_id,
        'board': board,
        'language_mode': language_mode
    })

@app.route('/api/games/math-jeopardy/question/<int:question_id>')
def get_jeopardy_question(question_id):
    """Get a specific question for Math Jeopardy"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db_connection()
    question = conn.execute('''
        SELECT * FROM math_jeopardy_questions WHERE id = ?
    ''', (question_id,)).fetchone()
    conn.close()
    
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    
    return jsonify({
        'id': question['id'],
        'category': question['category'],
        'points': question['points'],
        'question_ar': question['question_ar'],
        'question_fr': question['question_fr'],
        'difficulty_level': question['difficulty_level']
    })

@app.route('/api/games/math-jeopardy/answer', methods=['POST'])
def submit_jeopardy_answer():
    """Submit answer for Math Jeopardy question"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    question_id = data.get('question_id')
    user_answer = data.get('answer', '').strip()
    session_id = data.get('session_id')
    language_mode = data.get('language_mode', 'arabic')
    
    conn = get_db_connection()
    
    # Get question details
    question = conn.execute('''
        SELECT * FROM math_jeopardy_questions WHERE id = ?
    ''', (question_id,)).fetchone()
    
    if not question:
        conn.close()
        return jsonify({'error': 'Question not found'}), 404
    
    # Check answer (case-insensitive, flexible matching)
    correct_answer_ar = question['answer_ar'].lower().strip()
    correct_answer_fr = question['answer_fr'].lower().strip()
    user_answer_lower = user_answer.lower().strip()
    
    is_correct = (user_answer_lower == correct_answer_ar or 
                  user_answer_lower == correct_answer_fr or
                  user_answer_lower in correct_answer_ar or
                  user_answer_lower in correct_answer_fr)
    
    # Update game session
    if is_correct:
        conn.execute('''
            UPDATE game_sessions 
            SET score = score + ?, questions_answered = questions_answered + 1, 
                correct_answers = correct_answers + 1
            WHERE id = ?
        ''', (question['points'], session_id))
    else:
        conn.execute('''
            UPDATE game_sessions 
            SET questions_answered = questions_answered + 1
            WHERE id = ?
        ''', (session_id,))
    
    conn.commit()
    
    # Get updated session info
    session_info = conn.execute('''
        SELECT score, questions_answered, correct_answers FROM game_sessions WHERE id = ?
    ''', (session_id,)).fetchone()
    
    conn.close()
    
    # Choose explanation based on language mode
    if language_mode == 'french':
        explanation = question['explanation_fr']
        correct_answer = question['answer_fr']
    else:
        explanation = question['explanation_ar']
        correct_answer = question['answer_ar']
    
    return jsonify({
        'correct': is_correct,
        'correct_answer': correct_answer,
        'explanation': explanation,
        'points_earned': question['points'] if is_correct else 0,
        'total_score': session_info['score'],
        'questions_answered': session_info['questions_answered'],
        'correct_answers': session_info['correct_answers']
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
