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

    latitude = parse_coordinate(
      cells[2].text,
      name: '緯度',
      range: -90.0..90.0
    )

    longitude = parse_coordinate(
      cells[3].text,
      name: '経度',
      range: -180.0..180.0
    )

    {
      'city_name' => cells[0].text,
      'station_name' => cells[1].text,
      'latitude' => latitude,
      'longitude' => longitude,
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

  def self.parse_coordinate(value, name:, range:)
    coordinate = Float(value)

    unless range.cover?(coordinate)
      raise ParseError,
            "#{name}が範囲外です: value=#{coordinate}, range=#{range}"
    end

    coordinate
  rescue ArgumentError, TypeError
    raise ParseError, "#{name}を数値へ変換できません: value=#{value.inspect}"
  end

  private_class_method :parse_coordinate
end