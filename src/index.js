EventEmitter = require('events');
TeamspeakQuery = require('teamspeak-query');

class TeamspeakObserver extends EventEmitter {
  static get ONCLIENTENTERVIEW() { return 'oncliententerview'; }
  static get ONCLIENTLEFTVIEW() { return 'onclientleftview'; }
  static get ONCONNECTED() { return 'onconnect'; }
  static get ONAUTHENTICATED() { return 'onauthenticated'; }
  static get ONCLOSE() { return 'onclose'; }
  static get ONEND() { return 'onend'; }
  static get ONTIMEOUT() { return 'ontimeout'; }
  static get ONSOCKETERROR() { return 'onsocketerror'; }
  static get ONERROR() { return 'error'; }
  /**
   * Create a new Query Client
   *  * @class
   *
   * @param      {String}  [host=127.0.0.1]  The IP of your teamspeak server
   * @param      {Number}  [port=10011]      The port of your teamspeak server
   * @param      {String}  [username=serveradmin]      The port of your teamspeak server
   * @param      {Number}  [password=changeme]      The port of your teamspeak server
   * @param      {Object}  [options=Object]  Options for the socket
   */
  constructor(host, port, username, password, options) {
    super();
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    options = options || {};

    this.tsquery = new TeamspeakQuery(this.host, this.port, this.options); // 接続処理がコンストラクタに内包されている
    console.log('TeamspeakObserver: connecting to ' + this.host + ':' + this.port + '....');
    // socketへのイベントハンドラ登録
    // 遅れるとconnectイベントが拾えない。バグの香り。

    // 改善案
    process.nextTick(function() {
      this.tsquery.sock.on('connect', () => {
        this.emit(TeamspeakObserver.ONCONNECTED);
      });
      this.tsquery.sock.on('error', (error) => {
        this.emit(TeamspeakObserver.ONSOCKETERROR, error);
      });
      this.tsquery.sock.on('end', () => {
        this.emit(TeamspeakObserver.ONEND);
      });
      this.tsquery.sock.on('close', (had_error) => {
        this.emit(TeamspeakObserver.ONCLOSE, had_error);
      });
      this.tsquery.sock.on('timeout', () => {
        this.emit(TeamspeakObserver.ONTIMEOUT);
      });
    }.bind(this));

    // TeamspeakQueryへのイベントハンドラ登録
    this.tsquery.on('cliententerview', (data) => {
      this.emit(TeamspeakObserver.ONCLIENTENTERVIEW, data);
    });
    this.tsquery.on('clientleftview', (data) => {
      this.emit(TeamspeakObserver.ONCLIENTLEFTVIEW, data);
    });
  }

  login() {
    this.tsquery.send('login', this.username, this.password)
        .then(() => this.tsquery.send('use', 1))
        .then(() => this.tsquery.send('servernotifyregister', {'event': 'server'}))
        .then(() => this.emit(TeamspeakObserver.ONAUTHENTICATED))
        .catch((error) => {
          this.emit(TeamspeakObserver.ONERROR, error);
        });
  }

  quit() {
    // teamspeak-query/lib/throttle.jsで無限ループが回っているためプログラムが終了できない。
    return this.tsquery.send('quit');
  }
}

module.exports = TeamspeakObserver;
