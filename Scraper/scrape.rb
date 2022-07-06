require 'open-uri'
require 'nokogiri'
require 'json'

def ReadKijunkyokuTableRow(_tableRow)
    stationData = {}
    stationData.store('cityName', _tableRow.css('td')[0].text)
    stationData.store('stationName', _tableRow.css('td')[1].text)
    stationData.store('latitude', _tableRow.css('td')[2].text)
    stationData.store('longitude', _tableRow.css('td')[3].text)
    stationData.store('geoidHeight', _tableRow.css('td')[4].text)
    stationData.store('serverAddress', _tableRow.css('td')[5].text)
    stationData.store('portNumber', _tableRow.css('td')[6].text)
    stationData.store('dataType', _tableRow.css('td')[7].text)
    stationData.store('connectionType', _tableRow.css('td')[8].text)
    stationData.store('status', _tableRow.css('td')[9].text)
    stationData.store('mail', _tableRow.css('td')[10].text)
    stationData.store('comment', _tableRow.css('td')[11].inner_html)

    return stationData
end

if __FILE__ == $0
    # 善意の基準局のURL
    url = 'https://rtk.silentsystem.jp/'
    doc = Nokogiri.HTML(URI.open(url)) 
    table = doc.xpath("//tr")

    fileName = 'result.json'
    json = {}
    json.store("UpdateTime(JST)", Time.at(Time.now(), in: "+09:00").strftime("%Y-%m-%d %H:%M:%S"))
    json.store("ReferenceStationData", [])

    stationDatas = []
    table.each_with_index do |row, i|
        # ヘッダーを読み飛ばす
        if i == 0 
            then next 
        end
    
        json["ReferenceStationData"].push({'id' => i})
        json["ReferenceStationData"].last.update(ReadKijunkyokuTableRow(row))
    end

    # json形式へ変更
    File.open(fileName, 'w') do |file|
        file.puts(JSON.pretty_generate(json))
    end
end
