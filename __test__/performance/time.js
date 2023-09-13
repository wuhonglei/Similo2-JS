const timeJson = require('./time_consume.json');

/**
 * 指标：
 * 1. 单个网站,目标元素的平均匹配时间
 * 2. 所有网站,单个目标元素的平均匹配时间
 * 3. 单个网站,单个候选元素的平均匹配时间
 * 4. 所有网站,单个候选元素的平均匹配时间
 */

const total = {
  site: 0,
  candidateCount: [], // 单个网站的候选元素数量
  targetTime: [], // 单个网站的平均匹配时间
  candidateTime: [], // 单个网站候选元素的平均匹配时间
};

Object.values(timeJson).forEach((item) => {
  const { averagePerTargetTime, candidateCount } = item;
  if (!averagePerTargetTime) {
    return;
  }

  total.site += 1;
  total.targetTime.push(averagePerTargetTime);
  const averagePerCandidate = averagePerTargetTime / candidateCount;
  item.averagePerCandidateTime = averagePerCandidate;
  total.candidateTime.push(averagePerCandidate);
  total.candidateCount.push(candidateCount);

  // 用于统计单个目标匹配时间随候选元素数量变化的趋势
  console.info(`${candidateCount},${averagePerTargetTime}`);
});

function sum(numList) {
  return numList.reduce((a, b) => a + b, 0);
}

total.averagePerTargetTime = Math.floor(sum(total.targetTime) / total.site);
total.averagePerCandidateTime = sum(total.candidateTime) / total.site;
total.averagePerCandidateCount = Math.floor(sum(total.candidateCount) / total.site);

// console.info(total);

/**
 * {
  site: 34,
  candidateCount: [
    544, 367, 1769,  344, 802, 597, 816,
    502, 698, 1916,   81, 372, 372, 167,
    107, 314,  520,  185, 224, 157, 611,
    235, 552,  193, 1259,  84, 909, 125,
     68, 667,  423,  251, 159, 150
  ],
  targetTime: [
    939, 244, 1401, 132, 354, 734, 608,
    417, 905, 1875,  32, 229, 391, 122,
    103, 208, 1050, 103, 133, 107, 581,
    191, 533,  101, 495,  43, 497,  51,
     24, 573,  470, 114,  59, 122
  ],
  candidateTime: [
     1.7261029411764706,  0.6648501362397821,
     0.7919728660260034, 0.38372093023255816,
    0.44139650872817954,  1.2294807370184255,
     0.7450980392156863,  0.8306772908366534,
     1.2965616045845272,  0.9786012526096033,
     0.3950617283950617,  0.6155913978494624,
     1.0510752688172043,  0.7305389221556886,
     0.9626168224299065,  0.6624203821656051,
      2.019230769230769,  0.5567567567567567,
                0.59375,  0.6815286624203821,
     0.9509001636661211,  0.8127659574468085,
     0.9655797101449275,  0.5233160621761658,
     0.3931691818903892,  0.5119047619047619,
     0.5467546754675467,               0.408,
    0.35294117647058826,  0.8590704647676162,
     1.1111111111111112,  0.4541832669322709,
     0.3710691823899371,  0.8133333333333334
  ],
  averagePerTargetTime: 410,
  averagePerCandidateTime: 0.7773862371938323,
  averagePerCandidateCount: 486
}
 */
