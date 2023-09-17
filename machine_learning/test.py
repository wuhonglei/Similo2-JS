import numpy as np

x = np.array([
  [
    [1, 2],
    [3, 4],
    [1, 1]
  ],
  [
    [7, 8],
    [5, 6],
    [9, 10]
  ]
])

w = np.array([
  [1],
  [1]
])

# print(np.argmax(np.sum(np.dot(x, w), axis=2), axis=1))
# print(x[(0,0), (1,1)])

# print(np.array([
#   [1, 2],
#   [3, 4],
# ]) * np.array([
#   [3, 4],
#   [5, 6]
# ]))

print(np.dot(np.array([
  [1],
  [2],
  [3]
]).T ,  np.array([
  [1, 2],
  [3, 4],
  [4, 5]
])))

# print(np.sum( np.array([
#   [1, 2],
#   [3, 4]
# ]) *  np.array([
#   [1, 2],
#   [4, 5]
# ]), axis=0))

x = np.array([1, 2])
y = np.array([1, 2])

print(np.count_nonzero(x == y) == 2)
