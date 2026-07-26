const assert = require('node:assert/strict');
const { afterEach, beforeEach, test } = require('node:test');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const {
    createSanitizedCommentFragment,
    isAllowedCommentUrl
} = require('../js/commentSanitizer.js');

let dom;

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

test('リンクと改行を保持する', () => {
    const fragment = createSanitizedCommentFragment(
        '詳細：' +
        '<a href="https://example.com/path">公式ページ</a>' +
        '<br><br>' +
        'マウントポイント：TEST'
    );

    const container = document.createElement('div');
    container.append(fragment);

    const link = container.querySelector('a');

    assert.ok(link);
    assert.equal(link.textContent, '公式ページ');
    assert.equal(
        link.getAttribute('href'),
        'https://example.com/path'
    );
    assert.equal(link.target, '_blank');
    assert.equal(link.rel, 'noopener noreferrer');

    assert.equal(container.querySelectorAll('br').length, 2);
    assert.match(container.textContent, /マウントポイント：TEST/);
});

test('リンクから許可していない属性を除去する', () => {
    const fragment = createSanitizedCommentFragment(
        '<a ' +
        'href="https://example.com" ' +
        'onclick="alert(1)" ' +
        'style="color: red" ' +
        'class="danger">' +
        '詳細' +
        '</a>'
    );

    const container = document.createElement('div');
    container.append(fragment);

    const link = container.querySelector('a');

    assert.ok(link);
    assert.equal(link.hasAttribute('onclick'), false);
    assert.equal(link.hasAttribute('style'), false);
    assert.equal(link.hasAttribute('class'), false);
});

test('危険なURLをリンクとして残さない', () => {
    const fragment = createSanitizedCommentFragment(
        '<a href="javascript:alert(1)">危険なリンク</a>'
    );

    const container = document.createElement('div');
    container.append(fragment);

    assert.equal(container.querySelector('a'), null);
    assert.equal(container.textContent, '危険なリンク');
});

test('許可していない要素を除去する', () => {
    const fragment = createSanitizedCommentFragment(
        '<strong>重要</strong>' +
        '<img src=x onerror="alert(1)">' +
        '<iframe src="https://example.com"></iframe>' +
        '<script>alert(1)</script>'
    );

    const container = document.createElement('div');
    container.append(fragment);

    assert.equal(
        container.querySelector(
            'strong, img, iframe, script'
        ),
        null
    );

    assert.match(container.textContent, /重要/);
});

test('HTTPとHTTPSのURLだけを許可する', () => {
    assert.equal(
        isAllowedCommentUrl('https://example.com'),
        true
    );
    assert.equal(
        isAllowedCommentUrl('http://example.com'),
        true
    );
    assert.equal(
        isAllowedCommentUrl('javascript:alert(1)'),
        false
    );
    assert.equal(
        isAllowedCommentUrl('data:text/html,test'),
        false
    );
    assert.equal(
        isAllowedCommentUrl('/relative/path'),
        false
    );
    assert.equal(
        isAllowedCommentUrl(null),
        false
    );
});