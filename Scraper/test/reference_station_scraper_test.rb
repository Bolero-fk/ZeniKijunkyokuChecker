require 'minitest/autorun'
require 'nokogiri'
require 'json'
require 'tmpdir'
require_relative '../reference_station_scraper'

class ReferenceStationScraperTest < Minitest::Test
  VALID_FIXTURE_PATH = File.expand_path(
    'fixtures/reference_stations/valid.html',
    __dir__
  )

  MISSING_COLUMNS_FIXTURE_PATH = File.expand_path(
    'fixtures/reference_stations/missing_columns.html',
    __dir__
  )

  FIXED_TIME = Time.new(
    2026,
    7,
    26,
    0,
    0,
    0,
    '+09:00'
  )

  # 正常なHTMLを処理した場合に、
  # 検証済みの基準局データが連番ID付きでJSONへ出力されることを確認する。
  def test_writes_valid_scraping_result
    document = load_fixture(VALID_FIXTURE_PATH)

    Dir.mktmpdir do |directory|
      output_path = File.join(directory, 'result.json')

      ReferenceStationScraper.run(
        document,
        output_path,
        updated_at: FIXED_TIME
      )

      result = JSON.parse(
        File.read(output_path, encoding: 'UTF-8')
      )

      assert_equal '2026-07-26 00:00:00', result['UpdateTime(JST)']
      assert_equal 3, result['ReferenceStationData'].length
      assert_equal(
        [1, 2, 3],
        result['ReferenceStationData'].map { |station| station['id'] }
      )
    end
  end

  # 基準局データの検証に失敗した場合に、
  # 既存の正常な出力ファイルが変更されないことを確認する。
  def test_preserves_existing_output_when_validation_fails
    document = load_fixture(MISSING_COLUMNS_FIXTURE_PATH)

    Dir.mktmpdir do |directory|
      output_path = File.join(directory, 'result.json')
      original_content = '{"existing":"valid data"}'

      File.write(output_path, original_content)

      assert_raises(ReferenceStationParser::ParseError) do
        ReferenceStationScraper.run(
          document,
          output_path,
          updated_at: FIXED_TIME
        )
      end

      assert_equal(
        original_content,
        File.read(output_path, encoding: 'UTF-8')
      )
    end
  end

  # UTCの取得日時がJSTへ変換され、
  # 日付をまたぐ場合も正しい日時になることを確認する。
  def test_converts_utc_updated_at_to_jst
    document = load_fixture(VALID_FIXTURE_PATH)
    updated_at = Time.utc(2026, 7, 27, 17, 1, 4)

    Dir.mktmpdir do |directory|
      output_path = File.join(directory, 'result.json')

      result = ReferenceStationScraper.run(
        document,
        output_path,
        updated_at: updated_at
      )

      assert_equal '2026-07-28 02:01:04', result['UpdateTime(JST)']
    end
  end

  private

  def load_fixture(path)
    html = File.read(path, encoding: 'UTF-8')
    Nokogiri::HTML(html)
  end
end