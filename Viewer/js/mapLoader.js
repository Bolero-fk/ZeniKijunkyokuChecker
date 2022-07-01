var circles = [];
function mapLoad() {

    var testDatas = GetJson();
    var map = InitializeMap();
    
    var makers = [];
    for (let i = 0; i < testDatas.length; i++) {
        var marker = AddRefarenceStationMarker(testDatas[i], map);
        var circle = AddRefarenceStationCircle(testDatas[i], map);
        makers.push(marker);
        if(circle != null)
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
            var referenceStationData = data.ReferenceStationData[i];
            json.push(referenceStationData);
        }
       });
    $.ajaxSetup({async: true});
    return json;
}

function InitializeMap()
{
    var map = L.map('map',{
        preferCanvas:true
    });
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
    // slider
    slider = L.control.slider(function(value) {
        ChangeCircles(value * 1000);
    }, {
        position:'bottomleft',
        max: 100,
        min: 10,
        value: 30,
        step:1,
        size: '250px',
        orientation:'horizontal',
        id: 'slider',
        showValue: true, 
        syncSlider:true,
        collapsed:false
    }).addTo(_map);
}

function AddRefarenceStationMarker(_referenceStationData, map)
{
    var text = _referenceStationData.cityName;
    var markerPosition = [_referenceStationData.latitude, _referenceStationData.longitude];
    var marker = L.marker(markerPosition, {riseOnHover: true}).addTo(map);
    if(_referenceStationData.status != "公開")
        marker.setIcon(L.spriteIcon('red'))
    // marker.bindPopup();
    ConvertStationDataToKanban(_referenceStationData, marker);
    return marker;
}

function ConvertStationDataToKanban(_referenceStationData, marker)
{
    var customPopup = "<b>My office</b><br/>";
    
    // specify popup options 
    var customOptions =
    {
        'maxWidth': '500',
        'width': '200',
    };

    var statusColor = "red";
    if(_referenceStationData.status == "公開")
    statusColor = "green";

    var header = "<span class=station-name>" + _referenceStationData.stationName + "</span>" + 
    "<span class=station-status><font color = " + statusColor + ">" + _referenceStationData.status + "中</font></span>";
    var contents = "<hr><font size=4>" + _referenceStationData.cityName + 
    "<br> 北緯: " + _referenceStationData.latitude + ", 東経: " + _referenceStationData.longitude + ", 楕円体高: " + _referenceStationData.geoidHeight + 
    "<br> サーバアドレス: ntrip.phys.info.hiroshima-cu.ac.jp" + _referenceStationData.serverAddress + 
    "<br> ポート番号: " + _referenceStationData.portNumber + ", データ形式: " + _referenceStationData.dataType + ", 接続形式: " + _referenceStationData.connectionType +
    "<br> コメント " + 
    "<br> <div class=comment-box>" + _referenceStationData.comment + "</div>" +  "</font>";
    marker.bindPopup(header + contents, customOptions);
}

function AddRefarenceStationCircle(_referenceStationData, map)
{
    if(_referenceStationData.status != "公開")
        return null;

    var markerPosition = [_referenceStationData.latitude, _referenceStationData.longitude];
    var radius = 30000; // 30[km]
    var circle = L.circle(markerPosition, {
        color: 'blue',
        fillColor: '#30f',
        fillOpacity: 0.5,
        radius: radius
    }).addTo(map);

    return circle;
}


