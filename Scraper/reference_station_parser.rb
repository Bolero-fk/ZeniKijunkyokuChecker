module ReferenceStationParser
  EXPECTED_COLUMN_COUNT = 12

  class ParseError < StandardError
  end

  # 基準局一覧テーブルの1行を、公開用JSONに使用するデータへ変換する。
  def self.parse_row(table_row)
    cells = table_row.css('td')

    if cells.length != EXPECTED_COLUMN_COUNT
      raise ParseError,
            "基準局行の列数が不正です: expected=#{EXPECTED_COLUMN_COUNT}, actual=#{cells.length}"
    end

    {
      'city_name' => cells[0].text,
      'station_name' => cells[1].text,
      'latitude' => cells[2].text,
      'longitude' => cells[3].text,
      'geoid_height' => cells[4].text,
      'server_address' => cells[5].text,
      'port_number' => cells[6].text,
      'data_type' => cells[7].text,
      'connection_type' => cells[8].text,
      'status' => cells[9].text,
      'mail' => cells[10].text,
      'comment' => cells[11].inner_html
    }
  end
end