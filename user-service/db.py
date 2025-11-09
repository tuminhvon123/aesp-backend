from flask_mysqldb import MySQL

mysql = MySQL()

def init_db(app):
    app.config['MYSQL_HOST'] = 'localhost'
    app.config['MYSQL_USER'] = 'Von'
    app.config['MYSQL_PASSWORD'] = 'Von123456789'
    app.config['MYSQL_DB'] = 'user_service_db'
    app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

    mysql.init_app(app)