import sqlite3
from flask import Flask, jsonify, request, render_template, url_for, session, redirect
import argon2


app = Flask(__name__)

def init_db():
    print("init db")
    with sqlite3.connect('users.db') as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        conn.commit()

app.route('/api/users/', methods=['POST'])
def add_user():
    data = request.get_json()

    # Validate required fields
    if not data or 'name' not in data or 'password' not in data:
        return jsonify({'error': 'Name and password are required'}), 400
    #ph = argon2.PasswordHasher()
    #password_ciphertext = ph.hash(data['password'])
    try:
        with sqlite3.connect('users.db') as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO users (name, password) VALUES (?, ?)',
                (data['name'], data['password'])
            )
            conn.commit()
            user_id = cursor.lastrowid
            #return the user that was just added, without exposing the password
            user = {'id': user_id, 'name': data['name']}
            return jsonify({'message': 'User added successfully', 'user': user}), 201
   # except sqlite3.IntegrityError:
    #    return jsonify({'error': 'Email already exists'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/allusers/', methods=['GET'])
def get_users():
    with sqlite3.connect('users.db') as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT id, name, FROM users')
        users = [{'id': row[0], 'name': row[1]} for row in cursor.fetchall()]
        return jsonify({'users': users})
    
@app.route('/api/users/remove', methods=['POST'])
def remove_user():
    data = request.get_json() 
    if not data or 'id' not in data:
        return jsonify({'message': 'user ID required'})
    with sqlite3.connect('users.db') as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = ?", (data['id']))
        return jsonify({'message' : "User removed successfuly."})
    
def find_user_by_id(id): 
    data = request.get_json()

    if not data or 'id' not in data:
        return jsonify({'message':'ID required.'})
    
    with sqlite3.connect('users.db') as conn: 
        cursor = conn.cursor()
        query = ("SELECT name, email, id FROM users WHERE id = ?", (data['id']))
        cursor.execute(query)
        #untested
        return jsonify(cursor)


@app.route('/api/users/find_user_by_name', methods=['GET'])
def find_user_by_name():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'message':'name required.'})
    
@app.route('/submit', methods = ['POST'])
def submit_new_user():
    init_db()
   # ph = argon2.PasswordHasher() 
    print("Fourm submission properly recieved")
    name = request.form.get('name')
    #email = request.form.get('email')
    plaintext_password = request.form.get('password')
    if not name or not plaintext_password:
        return render_template('error_page.html')
   # ciphertext_password = ph.hash(plaintext_password)
    try:
        with sqlite3.connect('users.db') as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO users (name, password) VALUES (?, ?)',
                (name, plaintext_password)
            )
            conn.commit()
            user_id = cursor.lastrowid
            user = {'id': user_id, 'name': name}
            return jsonify({'message': 'User added successfully', 'user': user}), 201
    #the following two are subjecto to change depending on future error handlers 
    #except sqlite3.IntegrityError:
     #   return render_template('account_create.html') #error='Email not avaliable.'
    except Exception as e:
       return render_template('index.html')
    #session['user'] = {'email' : email, 'name' : name}
    #return redirect(url_for('home.html'))
    