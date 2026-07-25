require 'open-uri'
require 'nokogiri'
require 'json'
require_relative 'reference_station_parser'

if __FILE__ == $0
    # 善意の基準局のURL
    URL = 'https://rtk.silentsystem.jp/'

    # 証明書ファイルの場所
    CERT_DIRECTORY = './cert/rtk_cacert.pem';

    # URLからHTMLを取得
    doc = Nokogiri.HTML(URI.open(URL, ssl_ca_cert: CERT_DIRECTORY))

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
        json['ReferenceStationData'] << { 'id' => i }.merge(ReferenceStationParser.parse_row(row))
    end

    # JSONファイルを出力
    File.open(file_name, 'w') do |file|
        file.puts(JSON.pretty_generate(json))
    end
end
