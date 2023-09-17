import numpy as np
from matplotlib import pyplot as plt
from utils.helper import get_train_data

def predict_data(x, w):
    index_list =  np.argmax(np.sum(np.dot(x, w), axis=2), axis=1)
    new_x = np.zeros((len(index_list), 14), dtype=np.float16)
    for i, index in enumerate(index_list):
        new_x[i, :] = x[i, index, :]
    return new_x

def compute_cost(x, y, w):
    """
    误差函数
    """
    return np.sum((predict_data(x, w) - y) ** 2) / (2 * len(x))

def compute_cost2(x, y, w):
  target_list = predict_data(x, w)
  count = 0
  for i, target in enumerate(target_list):
    is_right = np.count_nonzero(target == y[i]) == 14
    if is_right:
      count += 1
  return count

def compute_gradient(x, y, w):
    """
    梯度下降
    """
    dw = np.sum((predict_data(x, w)  - y) * predict_data(x, w), axis=0) / len(x)
    return np.array(dw).reshape(-1, 1)


def gradient_descent(x, y, w_in, alpha, num_iters, cost_function, gradient_function):
    """
    梯度下降算法
    """
    w = w_in
    J_history = [cost_function(x, y, w)]
    for i in range(num_iters):
        dw = gradient_function(x, y, w)
        w -= alpha * dw
        cost = cost_function(x, y, w)
        J_history.append(cost)
        print("w:{}, cost:{}, iter:{}".format(w, cost, i))

    return w, J_history  # return w and J,w history for graphing


x_train, y_train = get_train_data()
# initialize parameters
w_init = np.ones((14, 1))
# set alpha to a large value
iterations = 500
tmp_alpha = 1e-2
w_final, J_hist = gradient_descent(x_train, y_train, w_init, tmp_alpha,
                                                       iterations, compute_cost, compute_gradient)


print(w_final)

# new_w = np.array([
#    [1.5],
#   [1.5],
#   [1.5],
#   [1.5],
#   [1.5],
#   [0.5],
#   [0.5],
#   [0.5],
#   [0.5],
#   [0.5],
#   [0.5],
#   [0.5],
#   [0.5],
#   [0.5]
# ])

print( compute_cost2(x_train, y_train, w_final))
