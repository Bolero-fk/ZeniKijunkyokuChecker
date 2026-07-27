const assert = require('node:assert/strict');
const { afterEach, beforeEach, test } = require('node:test');
const { JSDOM } = require('jsdom');

const {
    createRetrievalTimestampElement,
    addRetrievalTimestampControl
} = require('../js/retrievalTimestampControl.js');

let dom;

beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body></body></html>');

    global.document = dom.window.document;
});

afterEach(() => {
    dom.window.close();

    delete global.document;
    delete global.L;
});

test('情報取得日時を表示するHTMLElementを返す', () => {
    const element = createRetrievalTimestampElement(
        '2026-07-27 00:03:00'
    );

    assert.ok(element instanceof dom.window.HTMLElement);
    assert.equal(element.className, 'retrieval-timestamp-control');

    assert.equal(
        element.querySelector(
            '.retrieval-timestamp-control__label'
        ).textContent,
        '基準局情報の取得日'
    );

    assert.equal(
        element.querySelector(
            '.retrieval-timestamp-control__value'
        ).textContent,
        '2026年7月27日 00:03'
    );
});

test('取得日時が不正な場合は取得日時不明と表示する', () => {
    const element = createRetrievalTimestampElement(undefined);

    assert.equal(
        element.querySelector(
            '.retrieval-timestamp-control__value'
        ).textContent,
        '取得日時不明'
    );
});

test('右上にLeafletコントロールを追加する', () => {
    const map = {};
    let controlOptions;
    let addedMap;
    let clickPropagationTarget;
    let scrollPropagationTarget;

    global.L = {
        control(options) {
            controlOptions = options;

            return {
                onAdd: undefined,

                addTo(targetMap) {
                    addedMap = targetMap;
                    this.element = this.onAdd();

                    return this;
                }
            };
        },

        DomEvent: {
            disableClickPropagation(element) {
                clickPropagationTarget = element;
            },

            disableScrollPropagation(element) {
                scrollPropagationTarget = element;
            }
        }
    };

    const control = addRetrievalTimestampControl(
        map,
        '2026-07-27 00:03:00'
    );

    assert.deepEqual(controlOptions, {
        position: 'bottomright'
    });
    assert.equal(addedMap, map);
    assert.equal(clickPropagationTarget, control.element);
    assert.equal(scrollPropagationTarget, control.element);
});