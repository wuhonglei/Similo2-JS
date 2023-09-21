"""
使用缺一法分析特征的重要性
"""

import numpy as np
from matplotlib import pyplot as plt
from utils.helper import get_train_data
import json

x_train, y_train = get_train_data()
weight = np.ones(14)
weight = np.array(
    [0.52, 0.48, 0.48, 1, 0.57, 0.48, 0.57,
        0.48, 0.48, 0.48, 0.48, 0.52, 0.39, 0.52]
)


def is_equal(a, b):
    return np.sum(np.abs(a - b)) < 1e-6


errors = np.zeros(14, dtype=np.float16)
for m in range(1):
    new_weight = weight.copy()
    # new_weight[m] = 0
    new_x_train = x_train * new_weight

    index_list = np.argmax(np.sum(new_x_train, axis=2), axis=1)
    new_x = np.zeros((len(index_list), 14), dtype=np.float32)
    current_error = 0
    for i, index in enumerate(index_list):
        new_x[i, :] = x_train[i, index, :]
        if (not is_equal(x_train[i, index, :], y_train[i, :])):
            current_error += 1
    print(current_error)
    errors[m] = current_error

errors = np.round((errors / y_train.shape[0]) * 100, 0)
errors = np.round(errors / np.max(errors), 2)
# [0.6  0.45 0.45 1.   0.5  0.45 0.55 0.45 0.45 0.45 0.45 0.5  0.4  0.4 ]
print(json.dumps(np.round(errors * 100, 0,).tolist()))