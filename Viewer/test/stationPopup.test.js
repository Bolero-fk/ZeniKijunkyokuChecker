const assert = require('node:assert/strict');
const { afterEach, beforeEach, test } = require('node:test');
const { JSDOM } = require('jsdom');

const {
    createStationPopupElement
} = require('../js/stationPopup.js');

const referenceStationData = {
    station_name: 'xxx基準局',
    city_name: 'xxx市',
    status: '公開',
    latitude: 30.0,
    longitude: 130.0,
    geoid_height: 40.0,
    server_address: 'example.com',
    port_number: 2101,
    data_type: 'RTCM3',
    connection_type: 'NTRIP',
    comment: '利用できます。'
};

let dom;

const createDOMPurify = require('dompurify');

beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body></body></html>');

    global.document = dom.window.document;
    globalThis.DOMPurify = createDOMPurify(dom.window);
});

afterEach(() => {
    dom.window.close();

    delete globalThis.DOMPurify;
    delete global.document;
});

test('基準局情報を表示するHTMLElementを返す', () => {
    const popup = createStationPopupElement(referenceStationData);

    assert.ok(popup instanceof dom.window.HTMLElement);
    assert.equal(popup.className, 'station-popup');

    assert.match(popup.textContent, /xxx基準局/);
    assert.match(popup.textContent, /xxx市/);
    assert.match(popup.textContent, /公開中/);
    assert.match(popup.textContent, /北緯: 30/);
    assert.match(popup.textContent, /東経: 130/);
    assert.match(popup.textContent, /楕円体高: 40/);
    assert.match(popup.textContent, /サーバアドレス: example\.com/);
    assert.match(popup.textContent, /ポート番号: 2101/);
    assert.match(popup.textContent, /データ形式: RTCM3/);
    assert.match(popup.textContent, /接続形式: NTRIP/);
    assert.match(popup.textContent, /利用できます。/);
});

test('公開中のステータスクラスを設定する', () => {
    const popup = createStationPopupElement(referenceStationData);
    const status = popup.querySelector('.station-popup__status');

    assert.ok(status);
    assert.ok(
        status.classList.contains('station-popup__status--public')
    );
    assert.ok(
        !status.classList.contains('station-popup__status--inactive')
    );
});

test('休止中のステータスクラスを設定する', () => {
    const popup = createStationPopupElement({
        ...referenceStationData,
        status: '休止'
    });
    const status = popup.querySelector('.station-popup__status');

    assert.ok(status);
    assert.ok(
        status.classList.contains('station-popup__status--inactive')
    );
    assert.ok(
        !status.classList.contains('station-popup__status--public')
    );
});

test('コメント内の許可されたリンクと改行を表示する', () => {
    const popup = createStationPopupElement({
        ...referenceStationData,
        comment:
            '詳細：' +
            '<a href="https://example.com">公式ページ</a>' +
            '<br><br>' +
            '2行目'
    });

    const comment = popup.querySelector('.comment-box');
    const link = comment.querySelector('a');

    assert.ok(link);
    assert.equal(link.textContent, '公式ページ');
    assert.equal(comment.querySelectorAll('br').length, 2);
});

test('コメント以外の項目ではHTMLを解釈しない', () => {
    const popup = createStationPopupElement({
        ...referenceStationData,
        station_name: '<img src=x onerror="alert(1)">',
        city_name: '<strong>川崎市</strong>',
        status: '<svg onload="alert(1)">',
        server_address:
            '<a href="https://example.com">example.com</a>',
        data_type: '<iframe src="https://example.com"></iframe>',
        connection_type: '<script>alert(1)</script>'
    });

    assert.equal(
        popup.querySelector(
            '.station-popup__header img, ' +
            '.station-popup__contents strong, ' +
            '.station-popup__status svg, ' +
            '.station-popup__contents a, ' +
            '.station-popup__contents iframe, ' +
            '.station-popup__contents script'
        ),
        null
    );

    assert.match(popup.textContent, /<img src=x/);
    assert.match(popup.textContent, /<strong>川崎市<\/strong>/);
});