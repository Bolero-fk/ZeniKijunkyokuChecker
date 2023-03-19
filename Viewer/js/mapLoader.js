var circles = [];

/**
 * 地図を初期化してJSONファイルからデータを読み込み、基準局のマーカーと円を追加する。
 */
function mapLoad() {
    // JSONファイルから基準局の情報を取得する
    const referenceStations = getJson();
    // 地図を初期化する
    const map = initializeMap();
    // 基準局のマーカーを格納する配列
    const markers = [];

    // 基準局の情報を一つずつ処理する
    referenceStations.forEach((referenceStation) => {
        // 基準局のマーカーを追加する
        const marker = addReferenceStationMarker(referenceStation, map);
        // 基準局の円を追加する
        const circle = addReferenceStationCircle(referenceStation, map);
        markers.push(marker);
        // 基準局のステータスが "公開" であれば、円を circles に格納する
        if (circle != null) {
            circles.push(circle);
        }
    });
}

/**
 * 円の半径を変更する関数
 * @param {number} radius - 円の半径
 */
function changeCircles(radius) {
    circles.forEach((circle) => {
        circle.setRadius(radius);
    });
}

/**
 * JSON データを取得する関数
 * @returns {Array} 取得したJsonデータ
 */
function getJson() {
    let json = [];

    // 非同期通信でJSONデータを取得する
    $.ajax({
        url: "https://raw.githubusercontent.com/Bolero-fk/ZeniKijunkyokuChecker/main/Viewer/resource/result.json",
        dataType: "json",
        async: false,
        success: function (data) {
            // JSONデータの中のReferenceStationDataをループし、配列に格納する
            for (let i = 0; i < data.ReferenceStationData.length; i++) {
                json.push(data.ReferenceStationData[i]);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus + ": " + errorThrown);
        }
    });
    return json;
}

/**
 * 地図を初期化する関数
 * @returns {L.Map} 地図オブジェクト
 */
function initializeMap() {
    const map = L.map('map', {
        preferCanvas: true,
        center: [38, 136],
        zoom: 6,
    });

    L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
        attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
    }).addTo(map);

    // 距離スケールの追加
    L.control.scale({ position: 'bottomright', imperial: false }).addTo(map);

    // スライダーの追加
    addDistanceSlider(map);

    return map;
}

/**
 * 地図にスライダーを追加する関数
 * @param {Object} map - 地図オブジェクト
 */
function addDistanceSlider(map) {

    /*
    スライダーの値が変更された時に実行される関数
    @param {number} value - スライダーの値
    */
    function onChangeSlider(value) {
        changeCircleRadius(value * 1000);
    }

    // 距離スライダー
    var distanceSlider = L.control.slider(onChangeSlider, {
        position: 'bottomleft',
        max: 100,
        min: 10,
        value: 30,
        step: 1,
        size: '250px',
        orientation: 'horizontal',
        id: 'distance-slider',
        showValue: true,
        syncSlider: true,
        collapsed: false
    });

    distanceSlider.addTo(map);
}

/**
 * 円の表示半径を変更する関数
 * @param {number} radius - 円の表示半径(m)
 */
function changeCircleRadius(radius) {
    for (let i = 0; i < circles.length; i++) {
        circles[i].setRadius(radius);
    }
}

/**
 * 地図に基準局のマーカーを追加する関数
 * @param {Object} referenceStationData - 追加する基準局の情報 
 * @param {Object} map - 地図 
 * @returns 
 */
function addReferenceStationMarker(referenceStationData, map) {
    // マーカーの位置
    const markerPosition = [referenceStationData.latitude, referenceStationData.longitude];

    // マーカーのアイコン
    const iconColor = referenceStationData.status != "公開" ? 'red' : 'green';
    const marker = L.marker(markerPosition, { riseOnHover: true }).addTo(map);
    marker.setIcon(L.spriteIcon(iconColor))

    // ポップアップの設定
    const popupOptions = {
        'maxWidth': '500',
        'width': '200'
    };
    marker.bindPopup(convertStationDataToPopupText(referenceStationData), popupOptions);

    return marker;
}

/**
 * 参照局の情報をポップアップウィンドウのテキスト形式に変換する。
 * @param {Object} referenceStationData - 基準局の情報
 * @returns {string} ポップアップウィンドウに表示するテキスト
 */
function convertStationDataToPopupText(referenceStationData) {
    // ステータスの色を決定する
    const statusColor = referenceStationData.status === "公開" ? "green" : "red";

    // ヘッダーとコンテンツの文字列を作成する
    const header = `
    <header>
      <div>${referenceStationData.stationName}</div>
      <div><font color="${statusColor}">${referenceStationData.status}中</font></div>
    </header>
  `;

    const contents = `
    <hr>
    <font size="4">
      ${referenceStationData.cityName}<br>
      北緯: ${referenceStationData.latitude}, 東経: ${referenceStationData.longitude}, 楕円体高: ${referenceStationData.geoidHeight}<br>
      サーバアドレス: ntrip.phys.info.hiroshima-cu.ac.jp${referenceStationData.serverAddress}<br>
      ポート番号: ${referenceStationData.portNumber}, データ形式: ${referenceStationData.dataType}, 接続形式: ${referenceStationData.connectionType}<br>
      コメント<br>
      <div class="comment-box">${referenceStationData.comment}</div>
    </font>
  `;

    // ヘッダーとコンテンツを連結して、ポップアップウィンドウのテキストを作成する
    return header + contents;
}

/**
 * 基準局を中心とした円を追加する
 * @param {Object} referenceStationData - 基準局の情報 
 * @param {Object} map - 地図オブジェクト
 * @returns {Object} 追加された円オブジェクト。基準局が非公開の場合はnullを返す
 */
function addReferenceStationCircle(referenceStationData, map) {
    // 基準局が非公開の場合は円を追加しない
    if (referenceStationData.status != "公開") {
        return null;
    }

    // 基準局の位置を中心に、30km半径の円を追加する
    const markerPosition = [referenceStationData.latitude, referenceStationData.longitude];
    const radius = 30000; // 30[km]
    const circleOptions = {
        color: 'green',
        fillColor: '#3f0',
        fillOpacity: 0.1,
        radius: radius
    };
    const circle = L.circle(markerPosition, circleOptions).addTo(map);

    return circle;
}


