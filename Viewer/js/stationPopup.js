const commentSanitizer =
    typeof module !== 'undefined' && module.exports
        ? require('./commentSanitizer.js')
        : globalThis;

/**
 * 基準局情報を表示するポップアップ要素を構築する。
 *
 * @param {Object} referenceStationData - 基準局の情報
 * @returns {HTMLElement} ポップアップに表示するDOM要素
 */
function createStationPopupElement(referenceStationData) {
    const popup = document.createElement('div');
    popup.classList.add('station-popup');

    const header = document.createElement('header');
    header.classList.add('station-popup__header');

    const stationName = document.createElement('div');
    stationName.classList.add('station-popup__station-name');
    stationName.textContent = referenceStationData.station_name;

    const status = document.createElement('div');
    status.classList.add(
        'station-popup__status',
        referenceStationData.status === '公開'
            ? 'station-popup__status--public'
            : 'station-popup__status--inactive'
    );
    status.textContent = `${referenceStationData.status}中`;

    header.append(stationName, status);
    popup.append(header, document.createElement('hr'));

    const contents = document.createElement('div');
    contents.classList.add('station-popup__contents');

    const cityName = document.createElement('div');
    cityName.textContent = referenceStationData.city_name;

    const position = document.createElement('div');
    position.textContent =
        `北緯: ${referenceStationData.latitude}, ` +
        `東経: ${referenceStationData.longitude}, ` +
        `楕円体高: ${referenceStationData.geoid_height}`;

    const serverAddress = document.createElement('div');
    serverAddress.textContent =
        `サーバアドレス: ${referenceStationData.server_address}`;

    const connection = document.createElement('div');
    connection.textContent =
        `ポート番号: ${referenceStationData.port_number}, ` +
        `データ形式: ${referenceStationData.data_type}, ` +
        `接続形式: ${referenceStationData.connection_type}`;

    const commentLabel = document.createElement('div');
    commentLabel.textContent = 'コメント';

    const comment = document.createElement('div');
    comment.classList.add('comment-box');
    comment.append(commentSanitizer.createSanitizedCommentFragment(referenceStationData.comment));

    contents.append(
        cityName,
        position,
        serverAddress,
        connection,
        commentLabel,
        comment
    );

    popup.append(contents);

    return popup;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createStationPopupElement };
}