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
        for (let i = 0; i < data.ReferenceStationData.length; i++){
            var referenceStationData = {};
            referenceStationData["cityName"] = data.ReferenceStationData[i].cityName;
            referenceStationData["latitude"] = data.ReferenceStationData[i].latitude;
            referenceStationData["longitude"] = data.ReferenceStationData[i].longitude;
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
        min: 10, 
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
    var text = _referenceStationData.cityName;
    var markerPosition = [_referenceStationData.latitude, _referenceStationData.longitude];
    var marker = L.marker(markerPosition).addTo(map);
    marker.bindPopup(text);

    return marker;
}

function AddRefarenceStationCircle(_referenceStationData, map)
{
    var markerPosition = [_referenceStationData.latitude, _referenceStationData.longitude];
    var radius = 30000; // 30[km]
    var circle = L.circle(markerPosition, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: radius
    }).addTo(map);

    return circle;
}


