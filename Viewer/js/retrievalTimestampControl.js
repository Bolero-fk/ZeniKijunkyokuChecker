const retrievalTimestampFormatter =
    typeof module !== 'undefined' && module.exports
        ? require('./retrievalTimestamp.js')
        : globalThis;

/**
 * 情報取得日時を表示するDOM要素を構築する。
 *
 * @param {unknown} timestamp - JSONに含まれる情報取得日時
 * @returns {HTMLElement} 情報取得日時を表示するDOM要素
 */
function createRetrievalTimestampElement(timestamp) {
    const container = document.createElement('div');
    container.classList.add('retrieval-timestamp-control');

    const label = document.createElement('div');
    label.classList.add('retrieval-timestamp-control__label');
    label.textContent = '基準局情報の取得日';

    const value = document.createElement('div');
    value.classList.add('retrieval-timestamp-control__value');
    value.textContent =
        retrievalTimestampFormatter.formatRetrievalTimestamp(timestamp);

    container.append(label, value);

    return container;
}

/**
 * 情報取得日時を表示するLeafletコントロールを地図へ追加する。
 *
 * @param {L.Map} map - 表示先の地図
 * @param {unknown} timestamp - JSONに含まれる情報取得日時
 * @returns {L.Control} 追加したLeafletコントロール
 */
function addRetrievalTimestampControl(map, timestamp) {
    const control = L.control({
        position: 'bottomright'
    });

    control.onAdd = function () {
        const container = createRetrievalTimestampElement(timestamp);

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        return container;
    };

    return control.addTo(map);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createRetrievalTimestampElement,
        addRetrievalTimestampControl
    };
}