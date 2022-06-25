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

function toggleFunction(_radius) {
    ChangeCircles(_radius * 1000);
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
    AddSlider();

    var map = L.map('map');
    map.setView([35.40, 136], 5);
    L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        attribution: "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>"
    }).addTo(map);

    var control = L.control.range({
        orient: 'vertical',
        value: 100
    });

    control.on('change input', function(e) {
        console.log(e.value);
        layer.setOpacity(e.value / 100);
    })

    map.addControl(control);

    // 距離スケール
    L.control.scale({position: 'bottomright', imperial: false }).addTo(map);
    

    return map;
}

function AddSlider()
{
    console.log("aaa");
    L.Control.Range = L.Control.extend({
        options: {
            position: 'topleft',
            min: 0,
            max: 100,
            value: 0,
            step: 1,
            orient: 'horizontal',
            iconClass: 'leaflet-range-icon',
            icon: true
        },
        
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'leaflet-range-control leaflet-bar ' + this.options.orient);
            if (this.options.icon) {
              L.DomUtil.create('span', this.options.iconClass, container);
            };
            var slider = L.DomUtil.create('input', '', container);
            slider.type = 'range';
            slider.setAttribute('orient', this.options.orient);
            slider.min = this.options.min;
            slider.max = this.options.max;
            slider.step = this.options.step;
            slider.value = this.options.value;
    
            L.DomEvent.on(slider, 'mousedown mouseup click touchstart', L.DomEvent.stopPropagation);
    
            /* IE11 seems to process events in the wrong order, so the only way to prevent map movement while dragging the
             * slider is to disable map dragging when the cursor enters the slider (by the time the mousedown event fires
             * it's too late becuase the event seems to go to the map first, which results in any subsequent motion
             * resulting in map movement even after map.dragging.disable() is called.
             */
            L.DomEvent.on(slider, 'mouseenter', function(e) {
                map.dragging.disable()
            });
            L.DomEvent.on(slider, 'mouseleave', function(e) {
                map.dragging.enable();
            });
    
            L.DomEvent.on(slider, 'change', function(e) {
                this.fire('change', {value: e.target.value});
            }.bind(this));
    
            L.DomEvent.on(slider, 'input', function(e) {
                this.fire('input', {value: e.target.value});
            }.bind(this));
    
            this._slider = slider;
            this._container = container;
    
            return this._container;
        },
    
        setValue: function(value) {
            this.options.value = value;
            this._slider.value = value;
        },
    });
    
    L.Control.Range.include(L.Evented.prototype)
    
    L.control.range = function (options) {
      return new L.Control.Range(options);
    };
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
    var radius = 150000; // [m]
    var circle = L.circle(markerPosition, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: radius
    }).addTo(map);

    return circle;
}


