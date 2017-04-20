'use strict';

const HOST = '127.0.0.1';
const NONEXISTHOST = '192.0.2.1'; // 例示用IPアドレス。存在しないホスト。
const PORT = '10011';
const SQ_USERNAME = 'serveradmin';
const SQ_PASSWORD = 'sLkn8BnK';
const SQ_FAKEPASSWORD = 'hogehoge';
const TSObserver = require('../src/index.js');

describe('サーバにユーザが接続されたことを検出する(要接続操作TSクライアント)', function() {
  this.timeout(20 * 1000);
  it.skip('cliententerview', function (done) {
    const observer = new TSObserver(HOST, PORT, SQ_USERNAME, SQ_PASSWORD, {});
    observer.login();
    observer.on(TSObserver.ONCONNECTED, () => {
      console.log('QueryServerに接続しました。TSクライアントでサーバに接続して下さい。接続待機中...');
      observer.on(TSObserver.ONCLIENTENTERVIEW, (data) => {
        done();
      });
    });
    observer.on(TSObserver.ONERROR, (error) => done(new Error(JSON.stringify(error))));
  });
  it('socket.emit("connect" is called when instance created', function(done) {
    const observer = new TSObserver(HOST, PORT, SQ_USERNAME, SQ_PASSWORD, {});
    observer.on(TSObserver.ONCONNECTED, () => done());
  });
  it('login() then occurred ONAUTHENTICATED', function(done) {
    const observer = new TSObserver(HOST, PORT, SQ_USERNAME, SQ_PASSWORD, {});
    observer.on(TSObserver.ONAUTHENTICATED, () => done());
    observer.login();
  });
  it('login() failed then occurred ONERROR', function(done) {
    const observer = new TSObserver(HOST, PORT, SQ_FAKEPASSWORD, SQ_PASSWORD, {});
    observer.on(TSObserver.ONERROR, () => done());
    observer.login();
  });
  it('socket.emit("end") is called when calls quit()', function (done) {
    const observer = new TSObserver(HOST, PORT, SQ_USERNAME, SQ_PASSWORD, {});
    observer.on(TSObserver.ONCONNECTED, () => observer.quit());
    observer.on(TSObserver.ONEND, () => done());
  });
  it('socket.emit("close") is called when calls quit()', function (done) {
    const observer = new TSObserver(HOST, PORT, SQ_USERNAME, SQ_PASSWORD, {});
    observer.on(TSObserver.ONCONNECTED, () => {
      observer.quit();
    });
    observer.on(TSObserver.ONCLOSE, () => done());
  });
  it('接続先がダウンしていることをタイムアウト以外で検出することが出来ない。', function(done) {
    const observer = new TSObserver(NONEXISTHOST);
    observer.tsquery.sock.setTimeout(500);
    observer.on(TSObserver.ONTIMEOUT, () => done());
    observer.on(TSObserver.ONSOCKETERROR, (error) => done());
    observer.on(TSObserver.ONEND, () => done());
    observer.on(TSObserver.ONCLOSE, () => done());
    observer.on(TSObserver.ONCONNECTED, () => done());
  });
});

describe.skip('ユーザがチャンネルを移動したことを検出する(要接続済みTSクライアント)', function() {
});
