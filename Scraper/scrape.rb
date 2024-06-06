require 'open-uri'
require 'nokogiri'
require 'json'

def read_kijunkyoku_table_row(table_row)
  {
    'city_name' => table_row.css('td')[0].text,
    'station_name' => table_row.css('td')[1].text,
    'latitude' => table_row.css('td')[2].text,
    'longitude' => table_row.css('td')[3].text,
    'geoid_height' => table_row.css('td')[4].text,
    'server_address' => table_row.css('td')[5].text,
    'port_number' => table_row.css('td')[6].text,
    'data_type' => table_row.css('td')[7].text,
    'connection_type' => table_row.css('td')[8].text,
    'status' => table_row.css('td')[9].text,
    'mail' => table_row.css('td')[10].text,
    'comment' => table_row.css('td')[11].inner_html
  }
end

if __FILE__ == $0
    # 善意の基準局のURL
    URL = 'https://rtk.silentsystem.jp/'

    # 証明書ファイルの場所
    CERT_DIRECOTRY = './cert/rtk_cacert.pem';

    # URLからHTMLを取得
    doc = Nokogiri.HTML(URI.open(URL, ssl_ca_cert: CERT_DIRECOTRY))

    # HTML内のtrタグを全て取得
    table_rows = doc.xpath('//tr')

    # 出力するJSONファイル名を指定
    file_name = 'result.json'

    # 出力するJSONデータの雛形を作成
    json = {
        'UpdateTime(JST)' => Time.now.strftime('%Y-%m-%d %H:%M:%S'),
        'ReferenceStationData' => []
    }

    # HTML内のtrタグからデータを取得してJSONに追加
    table_rows.drop(1).each.with_index(1) do |row, i|
        json['ReferenceStationData'] << { 'id' => i }.merge(read_kijunkyoku_table_row(row))
    end

    # JSONファイルを出力
    File.open(file_name, 'w') do |file|
        file.puts(JSON.pretty_generate(json))
    end
end
