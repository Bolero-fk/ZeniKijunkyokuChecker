const assert = require('node:assert/strict');
const { test } = require('node:test');

const {
    formatRetrievalTimestamp
} = require('../js/retrievalTimestamp.js');

test('取得日時を表示用の形式へ整形する', () => {
    const timestamp = formatRetrievalTimestamp(
        '2026-07-27 00:03:00'
    );

    assert.equal(timestamp, '2026年7月27日 00:03');
});

test('取得日時が存在しない場合は取得日時不明を返す', () => {
    const timestamp = formatRetrievalTimestamp(undefined);

    assert.equal(timestamp, '取得日時不明');
});

test('取得日時の形式が不正な場合は取得日時不明を返す', () => {
    const timestamp = formatRetrievalTimestamp(
        '2026/07/27 00:03:00'
    );

    assert.equal(timestamp, '取得日時不明');
});

test('実在しない日付の場合は取得日時不明を返す', () => {
    const timestamp = formatRetrievalTimestamp(
        '2026-02-30 00:03:00'
    );

    assert.equal(timestamp, '取得日時不明');
});