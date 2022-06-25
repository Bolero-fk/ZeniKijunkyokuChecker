var circles = [];
function mapLoad() {

    var testDatas = GetJson();
    var map = InitializeMap();
    
    var makers = [];
    for (let i = 0; i < testDatas.length; i++) {
        var marker = AddRefarenceStationMarker(testDatas[i], map);
        var circle = AddRefarenceStationCircle(testDatas[i], map);
        makers.push(marker);
        circles.push(circle);
    }
}

function ChangeCircles(_radius)
{
    for (let i = 0; i < circles.length; i++) {
        circles[i].setRadius(_radius);
    }
}

function GetJson()
{
    var json = [];
    $.ajaxSetup({async: false});//同期通信(json取得処理終了までそのあとの処理を実行しない)
    $.getJSON("https://raw.githubusercontent.com/Bolero-fk/githubPagesTest/main/docs/resource/test.json", (data) => {
        for (let i = 0; i < data.testData.length; i++){
            var referenceStationData = {};
            referenceStationData["建物名"] = data.testData[i].建物名;
            referenceStationData["北緯"] = data.testData[i].北緯;
            referenceStationData["東経"] = data.testData[i].東経;
            json.push(referenceStationData);
        }
       });
    $.ajaxSetup({async: true});
    return json;
}

function InitializeMap()
{
    var map = L.map('map');
    map.setView([35.40, 136], 5);
    L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
    }).addTo(map);

    // 距離スケール
    L.control.scale({position: 'bottomright', imperial: false }).addTo(map);
    AddSlider(map);

    return map;
}

function AddSlider(_map)
{
    var control = L.control.range({
        position: 'bottomleft',
        orient: 'horizontal',
        min: 0, 
        max: 100, 
        value: 30,
        icon:false
    });

    control.on('change input', function(e) {
        ChangeCircles(e.value * 1000);
    })

    _map.addControl(control);
}

function AddRefarenceStationMarker(_referenceStationData, map)
{
    var text = _referenceStationData.建物名;
    var markerPosition = [_referenceStationData.北緯, _referenceStationData.東経];
    var marker = L.marker(markerPosition).addTo(map);
    marker.bindPopup(text);

    return marker;
}

function AddRefarenceStationCircle(_referenceStationData, map)
{
    var markerPosition = [_referenceStationData.北緯, _referenceStationData.東経];
    var radius = 30000; // 30[km]
    var circle = L.circle(markerPosition, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: radius
    }).addTo(map);

    return circle;
}


