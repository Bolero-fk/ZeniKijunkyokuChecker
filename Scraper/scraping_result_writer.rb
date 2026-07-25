require 'fileutils'
require 'json'
require 'tempfile'

module ScrapingResultWriter
  # JSONを一時ファイルへ完全に書き込んだ後、
  # 公開対象のファイルを置き換える。
  def self.write(output_path, result)
    output_path = File.expand_path(output_path)
    output_directory = File.dirname(output_path)
    json_text = JSON.pretty_generate(result)

    Tempfile.create(
      ['scraping-result', '.json.tmp'],
      output_directory
    ) do |temp_file|
      temp_file.write(json_text)
      temp_file.write("\n")
      temp_file.flush
      temp_file.close

      FileUtils.mv(temp_file.path, output_path, force: true)
    end
  end
end