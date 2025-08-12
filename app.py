from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime, timedelta
import re
import requests
import secrets
import json

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

# WhatsApp Business API Configuration
WHATSAPP_API_URL = "https://graph.facebook.com/v18.0"
WHATSAPP_PHONE_NUMBER_ID = os.environ.get('WHATSAPP_PHONE_NUMBER_ID', 'your_phone_number_id')
WHATSAPP_ACCESS_TOKEN = os.environ.get('WHATSAPP_ACCESS_TOKEN', 'your_access_token')

# Database configuration
DATABASE = 'data/tedris.db'

def get_db_connection():
    """Get database connection"""
    if not os.path.exists('data'):
        os.makedirs('data')
    
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize database with tables and sample data"""
    conn = get_db_connection()
    
    # Create users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            nni TEXT UNIQUE NOT NULL,
            matricule TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            user_category TEXT NOT NULL,
            specific_role TEXT NOT NULL,
            wilaya TEXT NOT NULL,
            moughataa TEXT NOT NULL,
            school TEXT NOT NULL,
            is_new_school BOOLEAN DEFAULT FALSE,
            is_verified BOOLEAN DEFAULT FALSE,
            is_online BOOLEAN DEFAULT FALSE,
            last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create verification codes table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS verification_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT NOT NULL,
            code TEXT NOT NULL,
            purpose TEXT NOT NULL, -- 'registration' or 'password_reset'
            expires_at TIMESTAMP NOT NULL,
            is_used BOOLEAN DEFAULT FALSE,
            attempts INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create conversations table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            participant1_id INTEGER NOT NULL,
            participant2_id INTEGER NOT NULL,
            last_message_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (participant1_id) REFERENCES users (id),
            FOREIGN KEY (participant2_id) REFERENCES users (id),
            UNIQUE(participant1_id, participant2_id)
        )
    ''')
    
    # Create messages table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations (id),
            FOREIGN KEY (sender_id) REFERENCES users (id)
        )
    ''')
    
    # Create schools table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS schools (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            wilaya TEXT NOT NULL,
            moughataa TEXT NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert sample schools if table is empty
    school_count = conn.execute('SELECT COUNT(*) FROM schools').fetchone()[0]
    if school_count == 0:
        schools = [
            ('مدرسة النور الابتدائية', 'نواكشوط الشمالية', 'دار النعيم'),
            ('مدرسة الأمل الثانوية', 'نواكشوط الجنوبية', 'عرفات'),
            ('مدرسة المستقبل', 'الترارزة', 'روصو'),
            ('مدرسة الرسالة', 'أدرار', 'أطار'),
            ('مدرسة الفجر', 'الحوض الشرقي', 'النعمة'),
            ('مدرسة الهدى', 'الحوض الغربي', 'العيون'),
            ('مدرسة التقوى', 'العصابة', 'كيفة'),
            ('مدرسة الإيمان', 'كوركول', 'سيلبابي'),
            ('مدرسة الصلاح', 'كيدي ماغا', 'كيدي ماغا'),
            ('مدرسة النجاح', 'البراكنة', 'ألاك')
        ]
        
        for school in schools:
            try:
                conn.execute(
                    'INSERT INTO schools (name, wilaya, moughataa) VALUES (?, ?, ?)',
                    school
                )
            except sqlite3.IntegrityError:
                pass  # Ignore duplicates
    
    conn.commit()
    conn.close()

def validate_phone(phone):
    """Validate phone number"""
    if not phone or len(phone) != 8:
        return False
    try:
        phone_num = int(phone)
        return 20000000 <= phone_num <= 49999999
    except ValueError:
        return False

def format_phone_for_whatsapp(phone):
    """Format phone number for WhatsApp (add country code)"""
    if phone.startswith('222'):
        return phone
    return f"222{phone}"

def validate_nni(nni):
    """Validate NNI (numeric only)"""
    return nni and re.match(r'^\d+$', nni)

def generate_verification_code():
    """Generate 6-digit verification code"""
    return f"{secrets.randbelow(900000) + 100000:06d}"

def send_whatsapp_verification(phone, code, purpose='registration'):
    """Send verification code via WhatsApp"""
    try:
        whatsapp_phone = format_phone_for_whatsapp(phone)
        
        if purpose == 'registration':
            message = f"""🎓 *تدريس - منصة التعليم الموريتانية*

مرحباً بك في منصة تدريس!

رمز التحقق الخاص بك هو: *{code}*

يرجى إدخال هذا الرمز لإكمال عملية التسجيل.

⏰ صالح لمدة 10 دقائق فقط
🔒 لا تشارك هذا الرمز مع أي شخص آخر

شكراً لانضمامك إلى مجتمع تدريس التعليمي! 📚"""
        else:  # password_reset
            message = f"""🔐 *تدريس - إعادة تعيين كلمة المرور*

تم طلب إعادة تعيين كلمة المرور لحسابك.

رمز التحقق: *{code}*

يرجى إدخال هذا الرمز لإعادة تعيين كلمة المرور.

⏰ صالح لمدة 10 دقائق فقط
🔒 إذا لم تطلب هذا، يرجى تجاهل هذه الرسالة

منصة تدريس 🎓"""
        
        payload = {
            "messaging_product": "whatsapp",
            "to": whatsapp_phone,
            "type": "text",
            "text": {
                "body": message
            }
        }
        
        headers = {
            "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            f"{WHATSAPP_API_URL}/{WHATSAPP_PHONE_NUMBER_ID}/messages",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            return True, "تم إرسال رمز التحقق بنجاح"
        else:
            print(f"WhatsApp API Error: {response.status_code} - {response.text}")
            return False, "فشل في إرسال رمز التحقق"
            
    except Exception as e:
        print(f"WhatsApp Error: {str(e)}")
        return False, "حدث خطأ في إرسال رمز التحقق"

def store_verification_code(phone, code, purpose='registration'):
    """Store verification code in database"""
    conn = get_db_connection()
    
    # Delete old codes for this phone and purpose
    conn.execute(
        'DELETE FROM verification_codes WHERE phone = ? AND purpose = ?',
        (phone, purpose)
    )
    
    # Store new code (expires in 10 minutes)
    expires_at = datetime.now() + timedelta(minutes=10)
    conn.execute('''
        INSERT INTO verification_codes (phone, code, purpose, expires_at)
        VALUES (?, ?, ?, ?)
    ''', (phone, code, purpose, expires_at))
    
    conn.commit()
    conn.close()

def verify_code(phone, code, purpose='registration'):
    """Verify the provided code"""
    conn = get_db_connection()
    
    verification = conn.execute('''
        SELECT * FROM verification_codes 
        WHERE phone = ? AND purpose = ? AND is_used = FALSE
        ORDER BY created_at DESC LIMIT 1
    ''', (phone, purpose)).fetchone()
    
    if not verification:
        conn.close()
        return False, "رمز التحقق غير صحيح"
    
    # Check if expired
    if datetime.now() > datetime.fromisoformat(verification['expires_at']):
        conn.close()
        return False, "انتهت صلاحية رمز التحقق"
    
    # Check attempts
    if verification['attempts'] >= 3:
        conn.close()
        return False, "تم تجاوز عدد المحاولات المسموح"
    
    # Check code
    if verification['code'] != code:
        # Increment attempts
        conn.execute(
            'UPDATE verification_codes SET attempts = attempts + 1 WHERE id = ?',
            (verification['id'],)
        )
        conn.commit()
        conn.close()
        return False, "رمز التحقق غير صحيح"
    
    # Mark as used
    conn.execute(
        'UPDATE verification_codes SET is_used = TRUE WHERE id = ?',
        (verification['id'],)
    )
    conn.commit()
    conn.close()
    
    return True, "تم التحقق بنجاح"

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
    """Registration page"""
    if request.method == 'POST':
        step = request.form.get('step', '1')
        
        if step == '1':
            # Step 1: Collect user data and send verification code
            phone = request.form.get('phone', '').strip()
            nni = request.form.get('nni', '').strip()
            matricule = request.form.get('matricule', '').strip()
            full_name = request.form.get('fullName', '').strip()
            password = request.form.get('password', '').strip()
            user_category = request.form.get('userCategory', '').strip()
            specific_role = request.form.get('specificRole', '').strip()
            wilaya = request.form.get('wilaya', '').strip()
            moughataa = request.form.get('moughataa', '').strip()
            school = request.form.get('school', '').strip()
            is_new_school = request.form.get('isNewSchool') == 'true'
            
            # Validation
            errors = []
            
            if not validate_phone(phone):
                errors.append('رقم الهاتف يجب أن يكون 8 أرقام بين 22000000 و 49999999')
            
            if not validate_nni(nni):
                errors.append('رقم التعريف الوطني يجب أن يكون أرقام فقط')
            
            if not all([matricule, full_name, password, user_category, specific_role, wilaya, moughataa, school]):
                errors.append('جميع الحقول مطلوبة')
            
            if len(password) < 6:
                errors.append('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
            
            if errors:
                for error in errors:
                    flash(error, 'error')
                return render_template('register.html')
            
            # Check if user already exists
            conn = get_db_connection()
            existing_user = conn.execute(
                'SELECT id FROM users WHERE phone = ? OR nni = ? OR matricule = ?',
                (phone, nni, matricule)
            ).fetchone()
            conn.close()
            
            if existing_user:
                flash('مستخدم موجود بالفعل بهذا الهاتف أو رقم التعريف أو الرقم المرجعي', 'error')
                return render_template('register.html')
            
            # Store registration data in session
            session['registration_data'] = {
                'phone': phone,
                'nni': nni,
                'matricule': matricule,
                'full_name': full_name,
                'password': password,
                'user_category': user_category,
                'specific_role': specific_role,
                'wilaya': wilaya,
                'moughataa': moughataa,
                'school': school,
                'is_new_school': is_new_school
            }
            
            # Generate and send verification code
            code = generate_verification_code()
            store_verification_code(phone, code, 'registration')
            
            success, message = send_whatsapp_verification(phone, code, 'registration')
            if success:
                flash('تم إرسال رمز التحقق إلى WhatsApp الخاص بك', 'success')
                return render_template('verify_phone.html', phone=phone, purpose='registration')
            else:
                flash(message, 'error')
                return render_template('register.html')
        
        elif step == '2':
            # Step 2: Verify code and complete registration
            verification_code = request.form.get('verification_code', '').strip()
            phone = request.form.get('phone', '').strip()
            
            if not verification_code or len(verification_code) != 6:
                flash('يرجى إدخال رمز التحقق المكون من 6 أرقام', 'error')
                return render_template('verify_phone.html', phone=phone, purpose='registration')
            
            success, message = verify_code(phone, verification_code, 'registration')
            if not success:
                flash(message, 'error')
                return render_template('verify_phone.html', phone=phone, purpose='registration')
            
            # Get registration data from session
            reg_data = session.get('registration_data')
            if not reg_data:
                flash('انتهت صلاحية جلسة التسجيل، يرجى المحاولة مرة أخرى', 'error')
                return redirect(url_for('register'))
            
            # Create user account
            conn = get_db_connection()
            password_hash = generate_password_hash(reg_data['password'])
            
            try:
                conn.execute('''
                    INSERT INTO users (
                        phone, nni, matricule, full_name, password_hash,
                        user_category, specific_role, wilaya, moughataa, school, 
                        is_new_school, is_verified
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (reg_data['phone'], reg_data['nni'], reg_data['matricule'], 
                      reg_data['full_name'], password_hash, reg_data['user_category'],
                      reg_data['specific_role'], reg_data['wilaya'], reg_data['moughataa'],
                      reg_data['school'], reg_data['is_new_school'], True))
                
                conn.commit()
                conn.close()
                
                # Clear registration data from session
                session.pop('registration_data', None)
                
                flash('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول', 'success')
                return redirect(url_for('login'))
                
            except sqlite3.IntegrityError:
                flash('حدث خطأ أثناء التسجيل', 'error')
                conn.close()
                return render_template('register.html')
    
    return render_template('register.html')

@app.route('/verify-phone')
def verify_phone():
    """Phone verification page"""
    phone = request.args.get('phone', '')
    purpose = request.args.get('purpose', 'registration')
    return render_template('verify_phone.html', phone=phone, purpose=purpose)

@app.route('/resend-code', methods=['POST'])
def resend_code():
    """Resend verification code"""
    data = request.get_json()
    phone = data.get('phone', '').strip()
    purpose = data.get('purpose', 'registration')
    
    if not validate_phone(phone):
        return jsonify({'success': False, 'message': 'رقم الهاتف غير صحيح'})
    
    # Generate and send new code
    code = generate_verification_code()
    store_verification_code(phone, code, purpose)
    
    success, message = send_whatsapp_verification(phone, code, purpose)
    return jsonify({'success': success, 'message': message})

@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Forgot password page"""
    if request.method == 'POST':
        step = request.form.get('step', '1')
        
        if step == '1':
            # Step 1: Send verification code
            phone = request.form.get('phone', '').strip()
            
            if not validate_phone(phone):
                flash('رقم الهاتف غير صحيح', 'error')
                return render_template('forgot_password.html')
            
            # Check if user exists
            conn = get_db_connection()
            user = conn.execute('SELECT id FROM users WHERE phone = ?', (phone,)).fetchone()
            conn.close()
            
            if not user:
                flash('لا يوجد حساب مرتبط بهذا الرقم', 'error')
                return render_template('forgot_password.html')
            
            # Generate and send verification code
            code = generate_verification_code()
            store_verification_code(phone, code, 'password_reset')
            
            success, message = send_whatsapp_verification(phone, code, 'password_reset')
            if success:
                flash('تم إرسال رمز التحقق إلى WhatsApp الخاص بك', 'success')
                return render_template('verify_phone.html', phone=phone, purpose='password_reset')
            else:
                flash(message, 'error')
                return render_template('forgot_password.html')
        
        elif step == '2':
            # Step 2: Verify code and reset password
            verification_code = request.form.get('verification_code', '').strip()
            phone = request.form.get('phone', '').strip()
            new_password = request.form.get('new_password', '').strip()
            confirm_password = request.form.get('confirm_password', '').strip()
            
            if not verification_code or len(verification_code) != 6:
                flash('يرجى إدخال رمز التحقق المكون من 6 أرقام', 'error')
                return render_template('reset_password.html', phone=phone)
            
            if len(new_password) < 6:
                flash('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error')
                return render_template('reset_password.html', phone=phone)
            
            if new_password != confirm_password:
                flash('كلمات المرور غير متطابقة', 'error')
                return render_template('reset_password.html', phone=phone)
            
            success, message = verify_code(phone, verification_code, 'password_reset')
            if not success:
                flash(message, 'error')
                return render_template('reset_password.html', phone=phone)
            
            # Update password
            conn = get_db_connection()
            password_hash = generate_password_hash(new_password)
            conn.execute(
                'UPDATE users SET password_hash = ? WHERE phone = ?',
                (password_hash, phone)
            )
            conn.commit()
            conn.close()
            
            flash('تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول', 'success')
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
            if not user['is_verified']:
                flash('يجب تأكيد رقم الهاتف أولاً', 'error')
                return render_template('login.html')
            
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

# Chat API Routes (keeping existing ones)
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

if __name__ == '__main__':
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000)
