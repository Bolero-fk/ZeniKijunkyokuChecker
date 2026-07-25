require 'minitest/autorun'
require 'json'
require 'tmpdir'
require_relative '../scraping_result_writer'

class ScrapingResultWriterTest < Minitest::Test
  # 新しいJSONが一時ファイルへ書き込まれた後、
  # 既存の出力ファイルを正常に置き換えられることを確認する。
  def test_replaces_output_file_after_writing_temp_file
    Dir.mktmpdir do |directory|
      output_path = File.join(directory, 'result.json')
      File.write(output_path, '{"old":true}')

      result = {
        'ReferenceStationData' => [
          {
            'id' => 1,
            'station_name' => 'サンプル基準局'
          }
        ]
      }

      ScrapingResultWriter.write(output_path, result)

      written_result = JSON.parse(
        File.read(output_path, encoding: 'UTF-8')
      )

      assert_equal result, written_result
      assert_empty Dir.glob(File.join(directory, '*.tmp'))
    end
  end

  # JSON生成に失敗した場合に、
  # 既存の出力ファイルが変更されないことを確認する。
  def test_preserves_output_file_when_json_generation_fails
    Dir.mktmpdir do |directory|
      output_path = File.join(directory, 'result.json')
      original_content = '{"old":true}'

      File.write(output_path, original_content)

      recursive_array = []
      recursive_array << recursive_array

      assert_raises(JSON::NestingError) do
        ScrapingResultWriter.write(output_path, recursive_array)
      end

      assert_equal(
        original_content,
        File.read(output_path, encoding: 'UTF-8')
      )
    end
  end
end