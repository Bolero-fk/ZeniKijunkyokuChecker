require_relative 'reference_station_parser'
require_relative 'scraping_result_writer'

module ReferenceStationScraper
  # HTMLを解析して出力用データを生成し、
  # すべての検証に成功した場合のみJSONファイルへ書き込む。
  def self.run(document, output_path, updated_at: Time.now)
    # HTMLから基準局一覧を解析し、検証済みの基準局データを取得
    reference_stations =
      ReferenceStationParser.parse_document(document)

    # 各基準局に1から始まる連番IDを付与
    station_data = reference_stations.map.with_index(1) do |station, id|
      {
        'id' => id
      }.merge(station)
    end

    # 出力するJSONデータを作成
    result = {
      'UpdateTime(JST)' => updated_at.strftime('%Y-%m-%d %H:%M:%S'),
      'ReferenceStationData' => station_data
    }

    # 検証済みのJSONデータを一時ファイル経由で安全に出力
    ScrapingResultWriter.write(output_path, result)

    result
  end
end