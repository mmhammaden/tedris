from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime
import re

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-in-production'

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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

def validate_nni(nni):
    """Validate NNI (numeric only)"""
    return nni and re.match(r'^\d+$', nni)

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Registration page"""
    if request.method == 'POST':
        # Get form data
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
        
        if existing_user:
            flash('مستخدم موجود بالفعل بهذا الهاتف أو رقم التعريف أو الرقم المرجعي', 'error')
            conn.close()
            return render_template('register.html')
        
        # Hash password and insert user
        password_hash = generate_password_hash(password)
        
        try:
            conn.execute('''
                INSERT INTO users (
                    phone, nni, matricule, full_name, password_hash,
                    user_category, specific_role, wilaya, moughataa, school, is_new_school
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (phone, nni, matricule, full_name, password_hash,
                  user_category, specific_role, wilaya, moughataa, school, is_new_school))
            
            conn.commit()
            conn.close()
            
            flash('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول', 'success')
            return redirect(url_for('login'))
            
        except sqlite3.IntegrityError:
            flash('حدث خطأ أثناء التسجيل', 'error')
            conn.close()
            return render_template('register.html')
    
    return render_template('register.html')

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
    session.clear()
    flash('تم تسجيل الخروج بنجاح', 'success')
    return redirect(url_for('index'))

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
