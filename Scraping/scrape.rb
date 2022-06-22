require 'open-uri'
require 'nokogiri'
require 'json'

# 善意の基準局のURL
url = 'https://rtk.silentsystem.jp/'

doc = Nokogiri.HTML(URI.open(url)) 

# スクレイピング結果からデータを取り出す
rowCount = doc.xpath("//td").size / 12 - 1
table = []
for r in 1..rowCount do
    row = {}
    for c in 0..11 do
        index = r * 12 + c
        key = doc.xpath("//td")[index % 12].text
        value = doc.xpath("//td")[index].text
        row.store(key, value)
    end
    table.push(row)
end

fileName = 'result.json'
# json形式へ変更
File.open(fileName, 'w') do |file|
    file.puts(JSON.pretty_generate(table))
  end
  