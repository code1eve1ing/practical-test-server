require('dotenv').config();
const { Sequelize } = require('sequelize');

class Database {
    connection;
    constructor() {
        this.connection = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USERNAME,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                dialect: 'mysql',
                dialectModule: require('mysql2')
            }
        );
    }

    async connect() {
        this.connection.sync()
        .then(() => console.log('Connected to MySQL database'))
        .catch(err => console.log('Error: ' + err));
    }
}

module.exports = new Database();