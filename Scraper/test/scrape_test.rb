require 'minitest/autorun'
require 'nokogiri'
require_relative '../scrape'

class ScrapeTest < Minitest::Test
  FIXTURE_PATH = File.expand_path(
    'fixtures/reference_stations/valid.html',
    __dir__
  )

  def setup
    html = File.read(FIXTURE_PATH, encoding: 'UTF-8')
    @document = Nokogiri::HTML(html)
  end

  # 正常な基準局一覧HTMLを読み込んだ場合に、
  # すべてのデータ行を基準局データとして解析できることを確認する。
  #
  # また、先頭行の各列が想定されたキーへ正しく対応していることを確認する。
  def test_reads_reference_station_rows
    rows = @document.xpath('//tr').drop(1)

    stations = rows.map do |row|
      read_kijunkyoku_table_row(row)
    end

    assert_equal 3, stations.length

    assert_equal(
      {
        'city_name' => 'テスト県サンプル市',
        'station_name' => 'サンプル基準局A',
        'latitude' => '35.123456',
        'longitude' => '139.123456',
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
    station = read_kijunkyoku_table_row(rows[1])

    assert_includes station['comment'], '<br>'
    assert_includes(
      station['comment'],
      '<a href="https://example.test/stations/sample-b">詳細</a>'
    )
  end
end