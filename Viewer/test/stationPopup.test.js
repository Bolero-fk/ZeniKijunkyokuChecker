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

beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body></body></html>');
    global.document = dom.window.document;
});

afterEach(() => {
    dom.window.close();

    delete global.document;
    delete globalThis.scriptExecuted;
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

test('外部データに含まれるHTMLを要素として解釈しない', () => {
    const unsafeData = {
        ...referenceStationData,
        station_name:
            '<img src=x onerror="globalThis.scriptExecuted = true">',
        city_name: '<strong>xxx市</strong>',
        status: '<svg onload="globalThis.scriptExecuted = true">',
        server_address: '<a href="https://example.com">example.com</a>',
        data_type: '<iframe src="https://example.com"></iframe>',
        connection_type:
            '<script>globalThis.scriptExecuted = true</script>',
        comment:
            '1行目\n' +
            '<button onclick="globalThis.scriptExecuted = true">実行</button>\n' +
            '3行目'
    };

    globalThis.scriptExecuted = false;

    const popup = createStationPopupElement(unsafeData);

    assert.equal(
        popup.querySelector('img, strong, svg, a, iframe, script, button'),
        null
    );

    assert.match(popup.textContent, /<img src=x onerror=/);
    assert.match(popup.textContent, /<strong>xxx市<\/strong>/);
    assert.match(popup.textContent, /<svg onload=/);
    assert.match(popup.textContent, /<a href=/);
    assert.match(popup.textContent, /<iframe src=/);
    assert.match(popup.textContent, /<script>/);
    assert.match(popup.textContent, /<button onclick=/);

    assert.equal(globalThis.scriptExecuted, false);
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