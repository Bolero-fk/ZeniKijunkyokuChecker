const UNKNOWN_RETRIEVAL_TIMESTAMP_TEXT = '取得日時不明';

/**
 * JSONに含まれる情報取得日時を、画面表示用の形式へ整形する。
 *
 * @param {unknown} timestamp - `YYYY-MM-DD HH:mm:ss` 形式の取得日時
 * @returns {string} 整形した取得日時。不正な場合は「取得日時不明」
 */
function formatRetrievalTimestamp(timestamp) {
    if (typeof timestamp !== 'string') {
        return UNKNOWN_RETRIEVAL_TIMESTAMP_TEXT;
    }

    const match =
        /^(\d{4})-(\d{2})-(\d{2}) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/
            .exec(timestamp);

    if (match === null) {
        return UNKNOWN_RETRIEVAL_TIMESTAMP_TEXT;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = match[4];
    const minute = match[5];

    if (!isValidDate(year, month, day)) {
        return UNKNOWN_RETRIEVAL_TIMESTAMP_TEXT;
    }

    return `${year}年${month}月${day}日 ${hour}:${minute} JST`;
}

/**
 * 年月日が実在する日付か判定する。
 *
 * @param {number} year - 年
 * @param {number} month - 月
 * @param {number} day - 日
 * @returns {boolean} 実在する場合はtrue
 */
function isValidDate(year, month, day) {
    if (year < 1 || month < 1 || month > 12 || day < 1) {
        return false;
    }

    const daysPerMonth = [
        31,
        isLeapYear(year) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];

    return day <= daysPerMonth[month - 1];
}

/**
 * 指定した年がうるう年か判定する。
 *
 * @param {number} year - 年
 * @returns {boolean} うるう年の場合はtrue
 */
function isLeapYear(year) {
    return year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formatRetrievalTimestamp };
}