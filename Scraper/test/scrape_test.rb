require 'minitest/autorun'
require 'nokogiri'
require_relative '../reference_station_parser'

class ScrapeTest < Minitest::Test
  VALID_FIXTURE_PATH = File.expand_path(
    'fixtures/reference_stations/valid.html',
    __dir__
  )

  MISSING_COLUMNS_FIXTURE_PATH = File.expand_path(
    'fixtures/reference_stations/missing_columns.html',
    __dir__
  )

  INVALID_COORDINATES_FIXTURE_PATH = File.expand_path(
    'fixtures/reference_stations/invalid_coordinates.html',
    __dir__
  )

  def setup
    html = File.read(VALID_FIXTURE_PATH, encoding: 'UTF-8')
    @document = Nokogiri::HTML(html)
  end

  # 正常な基準局一覧HTMLを読み込んだ場合に、
  # すべてのデータ行を基準局データとして解析できることを確認する。
  #
  # また、先頭行の各列が想定されたキーへ正しく対応していることを確認する。
  def test_reads_reference_station_rows
    rows = @document.xpath('//tr').drop(1)

    stations = rows.map do |row|
        ReferenceStationParser.parse_row(row)
    end

    assert_equal 3, stations.length

    assert_equal(
      {
        'city_name' => 'テスト県サンプル市',
        'station_name' => 'サンプル基準局A',
        'latitude' => 35.123456,
        'longitude' => 139.123456,
        'geoid_height' => '42.500',
        'server_address' => 'caster-a.example.test',
        'port_number' => '2101',
        'data_type' => 'RTCM3',
        'connection_type' => 'Ntrip',
        'status' => '公開',
        'mail' => '○',
        'comment' => 'テスト用の正常データ'
      },
      stations.first
    )
  end

  # コメント欄に改行タグやリンクが含まれている場合に、
  # テキストへ変換せずHTMLとして保持されることを確認する。
  #
  # 現行実装ではコメント欄だけinner_htmlを使用しているため、
  # リファクタリング後も同じ出力形式が維持されることを保証する。
  def test_preserves_html_in_comment
    rows = @document.xpath('//tr').drop(1)
    station = ReferenceStationParser.parse_row(rows[1])

    assert_includes station['comment'], '<br>'
    assert_includes(
      station['comment'],
      '<a href="https://example.test/stations/sample-b">詳細</a>'
    )
  end

  # 必要な12列を持たない基準局行を解析した場合に、
  # 不完全なデータを生成せず解析エラーになることを確認する。
  def test_raises_error_when_reference_station_row_has_missing_columns
    html = File.read(
      MISSING_COLUMNS_FIXTURE_PATH,
      encoding: 'UTF-8'
    )
    document = Nokogiri::HTML(html)
    row = document.xpath('//tr')[1]

    error = assert_raises(ReferenceStationParser::ParseError) do
      ReferenceStationParser.parse_row(row)
    end

    assert_includes error.message, 'expected=12'
    assert_includes error.message, 'actual=11'
  end

  # 緯度に数値として解釈できない文字列が含まれている場合に、
  # 不正な座標を出力せず解析エラーになることを確認する。
  def test_raises_error_when_latitude_is_not_numeric
    html = File.read(
      INVALID_COORDINATES_FIXTURE_PATH,
      encoding: 'UTF-8'
    )
    document = Nokogiri::HTML(html)
    row = document.xpath('//tr')[1]

    error = assert_raises(ReferenceStationParser::ParseError) do
      ReferenceStationParser.parse_row(row)
    end

    assert_includes error.message, '緯度を数値へ変換できません'
    assert_includes error.message, 'not-a-number'
  end

  # 緯度が許容範囲の-90度以上90度以下を超えている場合に、
  # 地理座標として不正なデータを検出できることを確認する。
  def test_raises_error_when_latitude_is_out_of_range
    html = File.read(VALID_FIXTURE_PATH, encoding: 'UTF-8')
    document = Nokogiri::HTML(html)
    row = document.xpath('//tr')[1]

    row.css('td')[2].content = '91.0'

    error = assert_raises(ReferenceStationParser::ParseError) do
      ReferenceStationParser.parse_row(row)
    end

    assert_includes error.message, '緯度が範囲外です'
    assert_includes error.message, 'value=91.0'
  end

  # 経度が許容範囲の-180度以上180度以下を超えている場合に、
  # 地理座標として不正なデータを検出できることを確認する。
  def test_raises_error_when_longitude_is_out_of_range
    html = File.read(VALID_FIXTURE_PATH, encoding: 'UTF-8')
    document = Nokogiri::HTML(html)
    row = document.xpath('//tr')[1]

    row.css('td')[3].content = '181.0'

    error = assert_raises(ReferenceStationParser::ParseError) do
      ReferenceStationParser.parse_row(row)
    end

    assert_includes error.message, '経度が範囲外です'
    assert_includes error.message, 'value=181.0'
  end

end