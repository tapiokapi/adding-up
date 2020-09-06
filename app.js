'use strict';

// FileSystem:ファイルを扱うためのモジュールを呼び出す
const fs = require('fs');
// readline:ファイルを一行ずつ読み込むためのモジュール
const readline = require('readline');
// Streamを生成する
const rs = fs.createReadStream('./popu-pref.csv');
// Streamをreadlineオブジェクトのinputとして設定し、rlオブジェクトを作成
const rl = readline.createInterface({ input: rs, output: {} });
const prefectureDataMap = new Map(); //key: 都道府県 value: 集計データのオブジェクト

// rlオブジェクトでlineというイベントが発生したら、無名関数を呼ぶ
rl.on('line', lineString => {
  const columns = lineString.split(',');
  const year = parseInt(columns[0]);
  const prefecture = columns[1];
  const popu = parseInt(columns[3]);
  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture);
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});
// closeイベントは、すべての行を読み込み終わった際に呼び出される。
rl.on('close', () => {
  // for-of構文 MapやArrayの中身を、ofの前で与えられた変数に代入してforループと同じことができる。
  for (let [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }
  const  rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });
  // map関数: Array要素それぞれを、与えられた関数を適用した内容に変換する
  const rankingStrings =  rankingArray.map(([key, value]) => {
    return (
      key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率:' + value.change
    );
  });
  console.log(rankingStrings);
});