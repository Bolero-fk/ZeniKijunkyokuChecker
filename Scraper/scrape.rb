require 'open-uri'
require 'nokogiri'
require_relative 'reference_station_scraper'

if __FILE__ == $0
  # 善意の基準局のURL
  URL = 'https://rtk.silentsystem.jp/'

  # 証明書ファイルの場所
  CERT_DIRECTORY = './cert/rtk_cacert.pem'

  # 出力するJSONファイル名
  OUTPUT_FILE = 'result.json'

  # URLからHTMLを取得
  document = Nokogiri.HTML(
    URI.open(URL, ssl_ca_cert: CERT_DIRECTORY)
  )

  # HTMLを解析し、検証済みの基準局データをJSONへ出力
  ReferenceStationScraper.run(document, OUTPUT_FILE)
end