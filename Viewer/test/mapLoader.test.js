const assert = require('node:assert/strict');
const { test } = require('node:test');

const {
    extractScrapingResult
} = require('../js/mapLoader.js');

const referenceStations = [
    {
        id: 1,
        station_name: 'xxx基準局'
    }
];

test('JSONから基準局一覧と取得日時を取り出す', () => {
    const result = extractScrapingResult({
        'UpdateTime(JST)': '2026-07-27 00:03:00',
        ReferenceStationData: referenceStations
    });

    assert.deepEqual(result.referenceStations, referenceStations);
    assert.equal(
        result.retrievalTimestamp,
        '2026-07-27 00:03:00'
    );
});

test('取得日時が存在しない場合でも基準局一覧を取り出す', () => {
    const result = extractScrapingResult({
        ReferenceStationData: referenceStations
    });

    assert.deepEqual(result.referenceStations, referenceStations);
    assert.equal(result.retrievalTimestamp, undefined);
});

test('JSONデータが不正な場合は空の結果を返す', () => {
    const result = extractScrapingResult(undefined);

    assert.deepEqual(result.referenceStations, []);
    assert.equal(result.retrievalTimestamp, undefined);
});

test('基準局一覧が配列でない場合は空配列を返す', () => {
    const result = extractScrapingResult({
        'UpdateTime(JST)': '2026-07-27 00:03:00',
        ReferenceStationData: null
    });

    assert.deepEqual(result.referenceStations, []);
    assert.equal(
        result.retrievalTimestamp,
        '2026-07-27 00:03:00'
    );
});