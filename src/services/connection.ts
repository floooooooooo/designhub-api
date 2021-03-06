import conf = require('../config-rewrapper');
import {createPool, Pool} from 'mysql';

let con: Pool;

function printErrorAndMessage(zelf, err, getconnection: boolean): void {
    console.log('/!\\ Cannot establish a connection with the database. /!\\ (' + err.code + ')');
    console.log(err);
    if (getconnection) {zelf.getConnection(); }
}

module Connection {
    // This is a singleton: Only one instance will be created and returned.
    export function getConnection(): Pool {
        let self = this;
        if (con) { return con; }
        con = createPool({
            connectionLimit: 10,
            host: conf.mysql.host,
            user: conf.mysql.user,
            password: conf.mysql.password,
            database: conf.mysql.database,
            debug: conf.sqldebug
        });

        con.on('error', function (err) {
            switch (err.code) {
                case 'PROTOCOL_CONNECTION_LOST':
                    printErrorAndMessage(self, err, true);
                    break;
                case 'PROTOCOL_ENQUEUE_AFTER_QUIT':
                    printErrorAndMessage(self, err, true);
                    break;
                case 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR':
                    printErrorAndMessage(self, err, true);
                    break;
                case 'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE':
                    printErrorAndMessage(self, err, false);
                    break;
                default:
                    console.log('/!\\ Cannot establish a connection with the database. /!\\ (' + err.code + ')');
                    console.log(err);
                    self.getConnection();
                    break;
            }
        });
        return con;
    }
}
export = Connection;
