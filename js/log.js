class Log {
    static info(val, funcName) {
        const APPNAME = '[nicosapo]';
        const FNCNAME = funcName ? '[' + funcName + ']' : '';
        const VALNAME = Log._getValName(val);
        console.info(APPNAME + FNCNAME +  '' + VALNAME + ' = ', val);
    }

    static out(str, funcName) {
        const APPNAME = '[nicosapo]';
        const FNCNAME = funcName ? '[' + funcName + ']' : '';
        console.info(APPNAME + FNCNAME + str);
    }


    static _getValName(val) {
        return Object.keys({val})[0];
    }
}
