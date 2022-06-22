# URLにアクセスするためのライブラリの読み込み
require 'open-uri'
# Nokogiriライブラリの読み込み
require 'nokogiri'

# スクレイピング先のURL
url = 'https://rtk.silentsystem.jp/'

doc = Nokogiri.HTML(URI.open(url)) 

data = {}
table = []
for c in 0..11 do
    data.store(doc.xpath("//td")[c].text, [])
end

for r in 1..2 do
    for c in 0..11 do
        index = r * 12 + c
        row = {}
        key = doc.xpath("//td")[index % 11].text
        value = doc.xpath("//td")[index].text
        row.store(key, value)
        table.push(row)
    end
end