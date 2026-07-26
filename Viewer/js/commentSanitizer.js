/**
 * コメントHTMLを、許可された要素だけを含むDOMへ変換する。
 *
 * 許可する要素:
 * - a[href]
 * - br
 *
 * @param {string} commentHtml - コメントのHTML
 * @returns {DocumentFragment} サニタイズ済みのDOM
 */
function createSanitizedCommentFragment(commentHtml) {
    const fragment = globalThis.DOMPurify.sanitize(commentHtml, {
        ALLOWED_TAGS: ['a', 'br'],
        ALLOWED_ATTR: ['href'],
        ALLOW_DATA_ATTR: false,
        ALLOW_ARIA_ATTR: false,
        RETURN_DOM_FRAGMENT: true
    });

    fragment.querySelectorAll('a').forEach((link) => {
        const href = link.getAttribute('href');

        if (!isAllowedCommentUrl(href)) {
            link.replaceWith(
                document.createTextNode(link.textContent)
            );
            return;
        }

        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    });

    return fragment;
}

/**
 * コメント内リンクとして許可するURLか判定する。
 *
 * @param {string|null} href - リンク先
 * @returns {boolean} HTTPまたはHTTPSのURLならtrue
 */
function isAllowedCommentUrl(href) {
    if (href === null) {
        return false;
    }

    try {
        const url = new URL(href);

        return url.protocol === 'http:' ||
            url.protocol === 'https:';
    } catch {
        return false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createSanitizedCommentFragment,
        isAllowedCommentUrl
    };
} else {
    globalThis.createSanitizedCommentFragment =
        createSanitizedCommentFragment;
    globalThis.isAllowedCommentUrl =
        isAllowedCommentUrl;
}